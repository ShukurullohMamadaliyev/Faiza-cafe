// Vercel Serverless Function: /api/menu
// Ibrohim Ota Choyxonasi - Global Bulutli Menyu va Narxlar Sinxronizatsiyasi
// Barcha mijozlar va adminlar uchun 100% sinxron, doimiy saqlash

import fs from 'fs';
import path from 'path';

const token = process.env.BOT_TOKEN || '9229821218:AAGEk0sZA4W27UIw5Sbh4E2bADK6IpQZ6G8';
const groupId = process.env.ORDER_GROUP_ID || '-5370487830';
const API_BASE = `https://api.telegram.org/bot${token}`;
const TMP_FILE = '/tmp/ibrohim_menu_db.json';

let inMemoryMenu = null;

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

async function loadMenuFromCloud() {
  // 1. In-memory tekshirish
  if (inMemoryMenu && Array.isArray(inMemoryMenu) && inMemoryMenu.length > 0) {
    return inMemoryMenu;
  }

  // 2. /tmp fayldan tekshirish
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryMenu = parsed;
        return inMemoryMenu;
      }
    }
  } catch (e) {}

  // 3. Telegram Bot metadata ('db' til kodi) orqali saqlangan file_id dan yuklash
  try {
    const descRes = await tg('getMyDescription', { language_code: 'db' });
    const fileId = descRes?.result?.description;
    if (fileId && typeof fileId === 'string' && fileId.length > 10) {
      const fileRes = await tg('getFile', { file_id: fileId });
      const filePath = fileRes?.result?.file_path;
      if (filePath) {
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const contentRes = await fetch(fileUrl);
        if (contentRes.ok) {
          const parsed = await contentRes.json();
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryMenu = parsed;
            try {
              fs.writeFileSync(TMP_FILE, JSON.stringify(parsed), 'utf-8');
            } catch (err) {}
            return inMemoryMenu;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Cloud menu load error:', err.message);
  }

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Eng so'nggi menyuni barcha mijozlarga tarqatish
  if (req.method === 'GET') {
    try {
      const products = await loadMenuFromCloud();
      return res.status(200).json({
        ok: true,
        source: products ? 'cloud' : 'default',
        products: products || null
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST: Admin tomonidan menyu va narxlarni bulutga saqlash
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const products = body?.products;

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ ok: false, error: 'products array required' });
      }

      inMemoryMenu = products;

      // /tmp ga saqlash
      try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(products), 'utf-8');
      } catch (e) {}

      // Telegram Document sifatida yuklash (Bulutli zaxira)
      let fileId = null;
      let uploadData = null;
      try {
        const jsonString = JSON.stringify(products, null, 2);
        const blob = typeof File !== 'undefined'
          ? new File([jsonString], 'menu_db.json', { type: 'application/json' })
          : new Blob([jsonString], { type: 'application/json' });
        const formData = new FormData();
        formData.append('chat_id', groupId);
        formData.append('caption', '#IBROHIM_OTA_MENU_DB#\nBulutli menyu bazasi yangilandi');
        formData.append('document', blob, 'menu_db.json');

        const uploadRes = await fetch(`${API_BASE}/sendDocument`, {
          method: 'POST',
          body: formData
        });
        uploadData = await uploadRes.json();

        if (uploadData.ok && uploadData.result?.document?.file_id) {
          fileId = uploadData.result.document.file_id;
          // Bot metadatasiga ('db' language_code) file_id ni doimiy saqlab qo'yamiz
          await tg('setMyDescription', {
            description: fileId,
            language_code: 'db'
          });
        }
      } catch (uploadErr) {
        console.warn('Telegram cloud document upload warning:', uploadErr.message);
        uploadData = { error: uploadErr.message };
      }

      // Agar guruhga izoh yuborish kerak bo'lsa
      if (body.actionSummary) {
        await tg('sendMessage', {
          chat_id: groupId,
          text: `⚙️ *MENYU YANGILANDI:*\n${body.actionSummary}`,
          parse_mode: 'Markdown'
        }).catch(() => {});
      }

      return res.status(200).json({
        ok: true,
        message: 'Menyu muvaffaqiyatli bulutga saqlandi',
        count: products.length,
        fileId: fileId || undefined,
        uploadDebug: uploadData || null
      });
    } catch (err) {
      console.error('Menu save error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
