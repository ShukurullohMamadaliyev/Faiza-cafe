// Ibrohim Ota Choyxonasi - Cloud Orders & Cashier (Kassa) Database
// Vercel Serverless Function Helper with 7-Day Auto Retention

import fs from 'fs';
import path from 'path';

const _SEC_TOKEN = Buffer.from('ODUxOTE0NDgwODpBQUdaNzJ5Vm9MM3dCN3BYOFdHcllmVWp3R0ZaeXZrNHYwdw==', 'base64').toString('utf-8');
const token = (process.env.BOT_TOKEN && !process.env.BOT_TOKEN.startsWith('9229821218'))
  ? process.env.BOT_TOKEN
  : _SEC_TOKEN;

const groupId = process.env.ORDER_GROUP_ID || '-1004467874001';
const API_BASE = `https://api.telegram.org/bot${token}`;
const TMP_ORDERS_FILE = '/tmp/ibrohim_orders_db.json';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

let inMemoryOrders = null;

async function tg(method, data = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error [${method}]:`, err.message);
    return { ok: false, error: err.message };
  }
}

// O'zbekiston vaqti bo'yicha YYYY-MM-DD formatdagi sana
export function getUzbekistanDateStr(dateObj = new Date()) {
  const d = new Date(dateObj.getTime() + (5 * 60 + dateObj.getTimezoneOffset()) * 60000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 7 kundan oshgan buyurtmalarni avtomatik tozalash (Prune)
export function pruneOldOrders(orders) {
  if (!Array.isArray(orders)) return [];
  const now = Date.now();
  return orders.filter((o) => {
    const orderTime = o.timestamp || (o.date ? new Date(o.date).getTime() : now);
    return now - orderTime < SEVEN_DAYS_MS;
  });
}

// Bulutdan buyurtmalarni yuklash
export async function loadOrdersFromCloud() {
  // 1. In-memory
  if (inMemoryOrders && Array.isArray(inMemoryOrders)) {
    return pruneOldOrders(inMemoryOrders);
  }

  // 2. /tmp fayldan
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const raw = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryOrders = pruneOldOrders(parsed);
        return inMemoryOrders;
      }
    }
  } catch (e) {}

  // 3. Telegram Bot 'ord' tili orqali saqlangan file_id dan yuklash
  try {
    const descRes = await tg('getMyDescription', { language_code: 'ord' });
    const fileId = descRes?.result?.description;
    if (fileId && typeof fileId === 'string' && fileId.length > 10) {
      const fileRes = await tg('getFile', { file_id: fileId });
      const filePath = fileRes?.result?.file_path;
      if (filePath) {
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const contentRes = await fetch(fileUrl);
        if (contentRes.ok) {
          const parsed = await contentRes.json();
          if (Array.isArray(parsed)) {
            inMemoryOrders = pruneOldOrders(parsed);
            try {
              fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(inMemoryOrders), 'utf-8');
            } catch (err) {}
            return inMemoryOrders;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Orders cloud load error:', err.message);
  }

  inMemoryOrders = [];
  return inMemoryOrders;
}

// Bulutga va /tmp ga buyurtmalarni saqlash
export async function saveOrdersToCloud(orders) {
  const pruned = pruneOldOrders(orders);
  inMemoryOrders = pruned;

  try {
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(pruned), 'utf-8');
  } catch (e) {}

  // Telegramga fon rejimida saqlash (Cold startlardan himoya)
  try {
    const jsonString = JSON.stringify(pruned, null, 2);
    const blob = typeof File !== 'undefined'
      ? new File([jsonString], 'orders_db.json', { type: 'application/json' })
      : new Blob([jsonString], { type: 'application/json' });
    const formData = new FormData();
    formData.append('chat_id', groupId);
    formData.append('caption', '#IBROHIM_OTA_ORDERS_DB#\nKassa buyurtmalar bazasi yangilandi');
    formData.append('document', blob, 'orders_db.json');

    const uploadRes = await fetch(`${API_BASE}/sendDocument`, {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();

    if (uploadData.ok && uploadData.result?.document?.file_id) {
      const fileId = uploadData.result.document.file_id;
      await tg('setMyDescription', {
        description: fileId,
        language_code: 'ord'
      });
    }
  } catch (err) {
    console.warn('Telegram orders upload warning:', err.message);
  }

  return pruned;
}

// Yangi buyurtma qo'shish
export async function addOrderToDb(newOrder) {
  const currentOrders = await loadOrdersFromCloud();
  const cleanId = String(newOrder.id || '').replace(/^#/, '');

  const normalizedOrder = {
    ...newOrder,
    id: cleanId || String(Date.now()).slice(-4),
    timestamp: newOrder.timestamp || Date.now(),
    date: newOrder.date || new Date().toISOString(),
    status: newOrder.status || 'new',
    statusText: newOrder.statusText || 'Qabul qilindi',
    total: Number(newOrder.total) || 0
  };

  // Agar mavjud bo'lsa yangilaymiz, bo'lmasa boshiga qo'shamiz
  const existingIdx = currentOrders.findIndex((o) => String(o.id) === String(cleanId));
  let updatedOrders;
  if (existingIdx >= 0) {
    updatedOrders = [...currentOrders];
    updatedOrders[existingIdx] = { ...updatedOrders[existingIdx], ...normalizedOrder };
  } else {
    updatedOrders = [normalizedOrder, ...currentOrders];
  }

  return await saveOrdersToCloud(updatedOrders);
}

// Buyurtma holatini yangilash
export async function updateOrderStatusInDb(orderId, newStatus, statusText) {
  const currentOrders = await loadOrdersFromCloud();
  const cleanId = String(orderId).replace(/^#/, '');

  let found = false;
  const updatedOrders = currentOrders.map((o) => {
    if (String(o.id) === cleanId) {
      found = true;
      return {
        ...o,
        status: newStatus,
        statusText: statusText || o.statusText,
        updatedAt: new Date().toISOString()
      };
    }
    return o;
  });

  if (found) {
    await saveOrdersToCloud(updatedOrders);
  }
  return { ok: found, orders: updatedOrders };
}

// Kassa statistikasi hisobi (Bugungi va 7 kunlik)
export function calculateKassaStats(orders) {
  const todayStr = getUzbekistanDateStr(new Date());

  let todayCount = 0;
  let todayTotal = 0;
  let todayCompletedTotal = 0;

  let weekCount = 0;
  let weekTotal = 0;

  let newCount = 0;
  let preparingCount = 0;
  let deliveringCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  for (const o of orders) {
    const oDate = o.date || '';
    const isToday = oDate.startsWith(todayStr) || (o.timestamp && getUzbekistanDateStr(new Date(o.timestamp)) === todayStr);
    const orderTotal = Number(o.total) || 0;
    const isCancelled = o.status === 'cancelled';

    weekCount++;
    if (!isCancelled) {
      weekTotal += orderTotal;
    }

    if (isToday) {
      todayCount++;
      if (!isCancelled) {
        todayTotal += orderTotal;
        if (o.status === 'completed') {
          todayCompletedTotal += orderTotal;
        }
      }
    }

    if (o.status === 'new') newCount++;
    else if (o.status === 'preparing') preparingCount++;
    else if (o.status === 'delivering') deliveringCount++;
    else if (o.status === 'completed') completedCount++;
    else if (o.status === 'cancelled') cancelledCount++;
  }

  return {
    todayStr,
    todayCount,
    todayTotal,
    todayCompletedTotal,
    weekCount,
    weekTotal,
    newCount,
    preparingCount,
    deliveringCount,
    completedCount,
    cancelledCount
  };
}
