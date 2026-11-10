import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const token = process.env.BOT_TOKEN;
const myBotId = token ? Number(token.split(':')[0]) : null;
const webAppUrl = process.env.WEBAPP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://faiza-cafe.vercel.app');
const ADMIN_IDS = (process.env.ADMIN_IDS || '8340079081').split(',').map((id) => id.trim()).filter(Boolean);

if (!token) {
  console.error("Xatolik: .env faylida BOT_TOKEN ko'rsatilmagan!");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;
const DB_FILE = path.resolve('orders_db.json');
const USERS_DB_FILE = path.resolve('users_db.json');
const GROUP_CONFIG_FILE = path.resolve('group_config.json');

// Admin tekshiruvi
function isAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

// Guruh konfiguratsiyasini boshqarish
function getGroupConfig() {
  try {
    if (fs.existsSync(GROUP_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(GROUP_CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading group_config.json:', e);
  }
  if (process.env.ORDER_GROUP_ID) {
    return { groupId: process.env.ORDER_GROUP_ID, groupTitle: 'Ibrohim Ota Choyxonasi Guruh' };
  }
  return null;
}

function saveGroupConfig(config) {
  try {
    fs.writeFileSync(GROUP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing group_config.json:', e);
  }
}

// ==========================================
// 1. Foydalanuvchilar Bazasi (Users Database)
// ==========================================
function getUsersDb() {
  try {
    if (fs.existsSync(USERS_DB_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading users_db.json:', e);
  }
  return {};
}

function getUserFromDb(userId) {
  const users = getUsersDb();
  return users[String(userId)] || null;
}

function saveUserToDb(userId, userData) {
  try {
    const users = getUsersDb();
    users[String(userId)] = {
      ...(users[String(userId)] || {}),
      ...userData,
      userId: String(userId),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing users_db.json:', e);
  }
}

// ==========================================
// 2. Buyurtmalar Bazasi (Orders Database)
// ==========================================
function getOrdersDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading orders_db.json:', e);
  }
  return [];
}

function saveOrderToDb(order) {
  try {
    const list = getOrdersDb();
    const existingIdx = list.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...order };
    } else {
      list.unshift(order);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(list.slice(0, 100), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing orders_db.json:', e);
  }
}

function updateOrderStatusInDb(orderId, newStatus) {
  try {
    const list = getOrdersDb();
    const cleanId = String(orderId).replace(/^#/, '');
    const match = list.find((o) => String(o.id).replace(/^#/, '') === cleanId);
    if (match) {
      match.status = newStatus;
      match.updatedAt = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error updating status in orders_db.json:', e);
  }
}

// Telegram API Helper
async function tg(method, data = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error on [${method}]:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Bosh Reply Keyboard - Foydalanuvchi ma'lumotlari bilan shaxsiylashtirilgan WebApp URL
function getMainKeyboard(userId) {
  const user = getUserFromDb(userId);
  let appUrl = webAppUrl;
  const queryParts = [];

  if (user && user.phone) {
    queryParts.push(`phone=${encodeURIComponent(user.phone)}`);
    if (user.name) {
      queryParts.push(`name=${encodeURIComponent(user.name)}`);
    }
  }

  if (isAdmin(userId)) {
    queryParts.push(`admin=8340079081`);
  }

  if (queryParts.length > 0) {
    const sep = appUrl.includes('?') ? '&' : '?';
    appUrl = `${appUrl}${sep}${queryParts.join('&')}`;
  }

  const keyboard = [
    [
      {
        text: 'рџЌЅ Menyu va Buyurtma berish',
        web_app: { url: appUrl }
      }
    ],
    [
      { text: 'рџ“Ќ Manzilimiz va MoвЂljal' },
      { text: 'рџ“ћ Aloqa / Telefon' }
    ],
    [
      { text: 'в„№пёЏ Biz haqimizda' },
      { text: 'вЏ° Ish vaqti' }
    ]
  ];

  return {
    keyboard,
    resize_keyboard: true,
    is_persistent: true
  };
}

// Inline Keyboard
function getInlineActionKeyboard(userId = 0) {
  const user = getUserFromDb(userId);
  let appUrl = webAppUrl;
  if (user && user.phone) {
    const sep = appUrl.includes('?') ? '&' : '?';
    appUrl = `${appUrl}${sep}phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name || '')}`;
  }

  return {
    inline_keyboard: [
      [
        {
          text: 'рџЌ• Menyuni ochish (Mini App)',
          web_app: { url: appUrl }
        }
      ],
      [
        { text: 'рџ“ћ +998 90 377 30 00', url: 'tel:+998903773000' },
        { text: 'рџ“ћ +998 98 571 00 67', url: 'tel:+998985710067' }
      ]
    ]
  };
}

// Adminlarga yangi buyurtma haqida bildirishnoma yuborish
async function notifyAdminsAboutOrder(order, custChatId = 0) {
  saveOrderToDb({ ...order, customerChatId: custChatId, createdAt: new Date().toISOString() });

  const itemsText = (order.items || [])
    .map(
      (it) =>
        `вЂў *${it.quantity}x ${it.name}* вЂ” ${(it.price * it.quantity).toLocaleString('uz-UZ')} soвЂm`
    )
    .join('\n');

  const customerInfo = order.customer || {};
  const tgUser = order.telegramUser || {};
  const userTag = tgUser.username
    ? `@${tgUser.username}`
    : tgUser.id
    ? `ID: ${tgUser.id}`
    : 'Web';
  const validCustChatId = custChatId || tgUser.id || 0;

  const coords = order.coords || customerInfo.coords;
  const lat = coords?.lat || coords?.latitude;
  const lon = coords?.lon || coords?.longitude;
  const hasCoords = Boolean(lat && lon);

  let addressInfo =
    order.orderType === 'delivery'
      ? `рџљ— *Yetkazib berish:* ${customerInfo.address || 'Rishton'}`
      : order.orderType === 'takeaway'
      ? `рџ›Ќ *Olib ketish:* ${customerInfo.branch || 'Ibrohim Ota Choyxonasi (Markaz)'}`
      : `рџЌЅ *Kafeda:* ${customerInfo.table || '1'}-stol`;

  if (order.orderType === 'delivery' && hasCoords) {
    addressInfo += `\nрџ“Ќ *GPS koordinatalar:* \`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}\`\nрџ—є *Navigatsiya:* [Google Maps orqali ochish](https://maps.google.com/?q=${lat},${lon})`;
  }

  const messageText = `рџ”” *YANGI BUYURTMA! #${order.id}*
в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
рџ‘¤ *Mijoz:* ${customerInfo.name || 'Mijoz'} (${userTag})
рџ“ћ *Telefon:* \`${customerInfo.phone || 'NomaКјlum'}\`
${addressInfo}
рџ’¬ *Izoh:* ${customerInfo.note ? `_${customerInfo.note}_` : 'Mavjud emas'}

рџ“‹ *Taomlar roвЂyxati:*
${itemsText || 'вЂў Taomlar koвЂrsatilmadi'}

рџ’° *Jami toвЂlov:* *${(order.total || 0).toLocaleString('uz-UZ')} soвЂm*
рџ’і *ToвЂlov turi:* ${order.paymentMethod || 'Naqd pul'}
рџ•’ *Vaqt:* ${order.date || new Date().toLocaleString()}
в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
рџ“Њ *Holati:* рџџЎ *Yangi (Kutilmoqda)*`;

  const inline_keyboard = [];
  if (order.orderType === 'delivery' && hasCoords) {
    inline_keyboard.push([
      { text: 'рџ—є Xaritada ochish (Navigatsiya)', url: `https://maps.google.com/?q=${lat},${lon}` }
    ]);
  }

  inline_keyboard.push(
    [
      { text: 'рџ‘ЁвЂЌрџЌі Qabul qilish', callback_data: `st:prep:${order.id}:${validCustChatId}` },
      { text: 'рџЌі Tayyorlanmoqda', callback_data: `st:cook:${order.id}:${validCustChatId}` }
    ],
    [
      { text: 'рџ›µ Yetkazilmoqda', callback_data: `st:delv:${order.id}:${validCustChatId}` },
      { text: 'вњ… Yetkazildi', callback_data: `st:comp:${order.id}:${validCustChatId}` }
    ],
    [
      { text: 'вќЊ Bekor qilish', callback_data: `st:canc:${order.id}:${validCustChatId}` }
    ]
  );

  const groupConfig = getGroupConfig();
  const recipients = [];
  if (groupConfig?.groupId) {
    // Agar guruh ulangan bo'lsa, buyurtma bildirishnomasi va lokatsiya FAQAT guruhga yuboriladi
    recipients.push(String(groupConfig.groupId));
  } else {
    // Guruh belgilanmagan bo'lsagina zaxira sifatida adminga yuboriladi
    for (const adminId of ADMIN_IDS) {
      if (!recipients.includes(String(adminId))) {
        recipients.push(String(adminId));
      }
    }
  }

  for (const targetId of recipients) {
    await tg('sendMessage', {
      chat_id: targetId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });

    // Aniq GPS nuqtani xarita pin sifatida yuborish
    if (order.orderType === 'delivery' && hasCoords) {
      try {
        await tg('sendLocation', {
          chat_id: targetId,
          latitude: Number(lat),
          longitude: Number(lon)
        });
      } catch (locErr) {
        console.warn('sendLocation error in bot:', locErr);
      }
    }
  }
}

// Xabarlarni boshqarish
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'Hurmatli mehmon';

  // 0. Guruh xabarlari (group yoki supergroup)
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const isOwner = ADMIN_IDS.includes(String(msg.from?.id));
    const groupConfig = getGroupConfig();
    const isCurrentConnectedGroup = groupConfig?.groupId && String(groupConfig.groupId) === String(chatId);

    // 0.1 Yangi a'zolar qo'shilganda (bot guruhga qo'shilganda)
    if (msg.new_chat_members) {
      const botAdded = msg.new_chat_members.some((m) => m.is_bot && (m.id === myBotId || m.is_bot));
      if (botAdded) {
        if (isOwner) {
          saveGroupConfig({
            groupId: chatId,
            groupTitle: msg.chat.title || 'Ibrohim Ota Choyxonasi Guruh',
            connectedBy: msg.from.id,
            connectedAt: new Date().toISOString()
          });
          await tg('sendMessage', {
            chat_id: chatId,
            text: `рџЋ‰ *Ibrohim Ota Choyxonasi вЂ” BUYURTMALAR GURUHI BIRIKTIRILDI!*
в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
Assalomu alaykum! Ushbu guruh muvaffaqiyatli buyurtmalar qabul qilish guruhi sifatida ulandi!

рџ“Њ *Guruh nomi:* ${msg.chat.title}
рџ†” *Guruh ID:* \`${chatId}\`

вњ… *Endi mijozlar bergan barcha yangi buyurtmalar toвЂgвЂridan-toвЂgвЂri shu guruhga yuboriladi!*
рџ‘Ґ Guruhdagi barcha xodimlar buyurtmalarni koвЂrib, tugmalar orqali holatini (Oshxona, Yetkazish, Yakun) boshqarishlari mumkin.`
          });
        } else {
          // Begona odam o'z guruhiga qo'shgan bo'lsa - chiqib ketish (Anti-leak security)
          await tg('sendMessage', {
            chat_id: chatId,
            text: 'в›” *Xavfsizlik tizimi:* Ushbu bot faqat "Ibrohim Ota Choyxonasi" rasmiy xodimlari uchun moвЂljallangan. Ruxsatsiz guruhdan avtomatik chiqilmoqda...'
          });
          await tg('leaveChat', { chat_id: chatId });
        }
        return;
      }
    }

    // 0.2 Guruhda /id, /setgroup yoki /group komandasi yuborilganda
    if (text.startsWith('/id') || text.startsWith('/setgroup') || text.startsWith('/group')) {
      if (isOwner) {
        saveGroupConfig({
          groupId: chatId,
          groupTitle: msg.chat.title || 'Ibrohim Ota Choyxonasi Guruh',
          connectedBy: msg.from.id,
          connectedAt: new Date().toISOString()
        });
        await tg('sendMessage', {
          chat_id: chatId,
          text: `вњ… *Ushbu guruh buyurtmalar guruhi sifatida saqlandi!*
в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
рџ“Њ *Guruh:* ${msg.chat.title}
рџ†” *Guruh ID:* \`${chatId}\`

Barcha yangi buyurtmalar, GPS lokatsiyalar va boshqaruv tugmalari shu guruhga yuboriladi.`
        });
      } else {
        await tg('sendMessage', {
          chat_id: chatId,
          text: `в„№пёЏ Ushbu guruh ID raqami: \`${chatId}\`\n(Faqat bot egasi buyurtmalar guruhini biriktirishi mumkin)`
        });
      }
      return;
    }

    // 0.3 Begona guruh xavfsizlik tekshiruvi:
    // Agar bot boshqa biror ruxsatsiz guruhda bo'lsa va egasi u yerda bo'lmasa:
    if (!isCurrentConnectedGroup && !isOwner) {
      await tg('leaveChat', { chat_id: chatId });
      return;
    }

    return; // Guruhdagi boshqa oddiy suhbatlarga bot aralashmaydi
  }

  // 1. Telefon raqam ulashilganda (request_contact orqali)
  if (msg.contact) {
    let phone = (msg.contact.phone_number || '').trim();
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }
    const name = msg.contact.first_name || firstName;
    const userData = {
      phone,
      name,
      username: msg.from?.username || '',
      registeredAt: new Date().toISOString()
    };
    saveUserToDb(chatId, userData);

    // Vercel Serverless API ga ham yuboramiz
    try {
      fetch(`${webAppUrl}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: chatId, ...userData })
      }).catch(() => {});
    } catch (e) {}

    // Endi Telegram chat menyu tugmasini WebApp menyu qilib sozlaymiz
    const userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
    tg('setChatMenuButton', {
      chat_id: chatId,
      menu_button: {
        type: 'web_app',
        text: 'рџЌЅ Menyu',
        web_app: { url: userAppUrl }
      }
    }).catch(() => {});

    const successRegText = `вњ… *Raqamingiz muvaffaqiyatli saqlandi!*

рџ‘¤ *Mijoz:* ${name}
рџ“± *Telefon:* \`${phone}\`

Endi siz uchun barcha imkoniyatlar ochildi! Pastdagi **"рџЌЅ Menyu va Buyurtma berish"** tugmasini bosing va oвЂzingiz yoqtirgan lazzatli taomlarga buyurtma bering! рџ‘‡`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: successRegText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // 2. Mini App'dan buyurtma kelganda (web_app_data)
  if (msg.web_app_data) {
    try {
      const order = JSON.parse(msg.web_app_data.data);
      const confirmText = `вњ… **Buyurtmangiz muvaffaqiyatli qabul qilindi!** рџЋ‰

рџ”ў **Buyurtma kodi:** #${order.id || 'FC-NEW'}
рџ’° **Jami toвЂlov:** ${(order.total || 0).toLocaleString('uz-UZ')} soвЂm
рџ›µ **Yetkazib berish:** ${order.orderType === 'delivery' ? 'Manzilingizga bepul yetkaziladi' : 'Olib ketish'}
вЏі **Kutilayotgan vaqt:** 25-35 daqiqa ichida

Oshpazlarimiz taomni tayyorlashni boshlashdi. Rahmat! рџЌ”вњЁ`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: confirmText,
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });

      // Admin (8340079081)ga bildirishnoma yuborish
      await notifyAdminsAboutOrder(order, chatId);
    } catch (e) {
      console.error('Web App data parse error:', e);
    }
    return;
  }

  const user = getUserFromDb(chatId);
  const hasPhone = Boolean(
    user &&
    user.phone &&
    user.phone !== '+998 90 377 30 00' &&
    user.phone !== '+998903773000'
  );

  // AGAR TELEFON RAQAM YUBORILMAGAN BO'LSA - BUTUNLAY TO'SIQ (GATE)
  if (!hasPhone) {
    // 1. Telegram pastki Menu tugmasini oddiy holatga o'tkazamiz (Mini App ochilmasligi uchun)
    tg('setChatMenuButton', {
      chat_id: chatId,
      menu_button: { type: 'default' }
    }).catch(() => {});

    const askPhoneText = `Assalomu alaykum, *${firstName}*! рџ‘‹

Xush kelibsiz **"Ibrohim Ota Choyxonasi"**ning rasmiy buyurtma botiga! вњЁрџЌЅпёЏ

Buyurtma berish, menyuni koвЂrish va bepul yetkazib berish xizmatidan foydalanish uchun, iltimos, pastdagi **"рџ“± Telefon raqamimni yuborish"** tugmasini bosing:`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: askPhoneText,
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [
            {
              text: 'рџ“± Telefon raqamimni yuborish',
              request_contact: true
            }
          ]
        ],
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }

  // 3. /start (Faqat raqami saqlangan mijozlar uchun)
  if (text.startsWith('/start')) {
    const phoneInfo = `\nрџ“± *Sizning raqamingiz:* \`${user.phone}\``;

    const welcomeText = `Assalomu alaykum, *${user.name || firstName}*! рџ‘‹

Xush kelibsiz **"Ibrohim Ota Choyxonasi"**ning rasmiy buyurtma botiga! вњЁрџЌЅпёЏ${phoneInfo}

Rishton tumanidagi eng mazali va sifatli taomlar maskani:
рџЌ” **Fastfud:** 20 dan ortiq lavash, tandir lavash, burger, shaurma va xot-doglar
рџЌ• **Pitsa:** 6 xil oвЂzgacha pitsa (Pepperoni, Qazili, Palermo, Assorti...)
рџҐ© **Issiq taomlar & Shashlik:** Kotletlar Chiz, Syrniy Beyti, Doner tarelka
рџҐ— **Salatlar:** Sezar, Mujskoy kapriz, Olivye, Grecheskiy
в• **Ichimliklar:** Fresh limonad, San-Sebastian chizkeyk va qahvalar

в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
вЏ° **Ish vaqti:** 08:00 вЂ“ 03:00 (tungi 3 gacha)
рџљ– **Yetkazib berish:** BUTUNLAY BEPUL!
рџ“Ќ **Manzil:** Rishton tumani, Milliy bank roвЂparasi
рџ“ћ **Aloqa:** +998 90 377 30 00 | +998 98 571 00 67`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // 4. Admin Panel (Faqat 8340079081 uchun)
  if (text === 'рџ›  Admin Panel' || text.startsWith('/admin')) {
    if (!isAdmin(chatId)) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: 'в›” *Kechirasiz, sizda Admin paneliga kirish huquqi mavjud emas.*',
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });
      return;
    }

    const orders = getOrdersDb();
    const activeCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;

    const adminDashboardText = `рџ”ђ *Ibrohim Ota Choyxonasi вЂ” BOSHQARUV PANELI*
в”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ
Assalomu alaykum, *Bosh Administrator*! рџ‘‹
рџ†” *Sizning ID:* \`${chatId}\`

рџ“Љ *Buyurtmalar statistikasi:*
вЂў рџ“Ґ Jami buyurtmalar: *${orders.length} ta*
вЂў вЏі Faol / Kutilmoqda: *${activeCount} ta*
вЂў вњ… Yetkazilgan: *${completedCount} ta*

Kerakli boвЂlimni tanlang:`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: adminDashboardText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'рџЊђ Web Admin Panelni ochish',
              web_app: { url: `${webAppUrl}?admin=8340079081` }
            }
          ],
          [
            { text: 'рџ“‹ Barcha buyurtmalar', callback_data: 'adm_orders' },
            { text: 'рџџЎ Faol buyurtmalar', callback_data: 'adm_active' }
          ]
        ]
      }
    });
    return;
  }

  // 5. Buyurtmalar ro'yxati (Faqat admin uchun)
  if (text === 'рџ“Љ Buyurtmalar' || text === 'рџ“Љ Buyurtmalar roвЂyxati' || text.startsWith('/orders')) {
    if (isAdmin(chatId)) {
      const orders = getOrdersDb();
      if (orders.length === 0) {
        await tg('sendMessage', {
          chat_id: chatId,
          text: 'рџ“‹ Hozircha yangi buyurtmalar kelib tushmagan.',
          reply_markup: getMainKeyboard(chatId)
        });
        return;
      }

      let listText = `рџ“‹ *SoвЂnggi 10 ta buyurtma roвЂyxati:*\nв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ\n`;
      orders.slice(0, 10).forEach((o, idx) => {
        const statusEmoji = o.status === 'completed' ? 'вњ…' : o.status === 'delivering' ? 'рџ›µ' : 'вЏі';
        listText += `${idx + 1}. *#${o.id}* вЂ” ${statusEmoji} ${o.status || 'Yangi'}\nрџ‘¤ Mijoz: ${o.customer?.name || 'Mijoz'} | рџ“ћ ${o.customer?.phone || '-'}\nрџ’° Jami: ${(o.total || 0).toLocaleString('uz-UZ')} soвЂm\n\n`;
      });

      await tg('sendMessage', {
        chat_id: chatId,
        text: listText,
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });
      return;
    }
  }

  // 6. Manzilimiz va Mo'ljal
  if (text.includes('Manzilimiz') || text === '/location') {
    const locationText = `рџ“Ќ **"Ibrohim Ota Choyxonasi" Manzili:**

рџЏ› **Viloyat:** Farg'ona viloyati
рџЏ™ **Tuman:** Rishton tumani
рџЏў **Mo'ljal:** Milliy bank ro'parasi

рџљ— Kafemiz qulay joylashuvga ega bo'lib, keng avtoturargoh va shinam oilaviy xonalarga ega.

Xaritada ko'rish yoki yetkazib berish manzilini belgilash uchun Mini App'dan foydalaning!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: locationText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 7. Aloqa / Telefon
  if (text.includes('Aloqa') || text === '/contact') {
    const contactText = `рџ“ћ **Ibrohim Ota Choyxonasi bilan bog'lanish:**

Biz har doim sizning xizmatingizdamiz! Savollaringiz, takliflaringiz yoki maxsus buyurtmalaringiz bo'lsa, quyidagi raqamlarga qo'ng'iroq qiling:

рџ“ћ **1-aloqa liniyasi:** \`+998903773000\`
рџ“ћ **2-aloqa liniyasi:** \`+998985710067\`

рџ›µ Yetkazib berish xizmati: **BEPUL**`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: contactText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 8. Ish vaqti
  if (text.includes('Ish vaqti') || text === '/hours') {
    const hoursText = `вЏ° **Ibrohim Ota Choyxonasi Ish Vaqti:**

Har kuni: **08:00 dan 03:00 gacha** (tungi 3 gacha)

рџЊ™ Tungi vaqtda ham mazali fastfud, issiq pitsa va shashliklarga buyurtma berishingiz mumkin!
Yetkazib berish xizmatimiz soat 03:00 gacha faol.`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: hoursText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 9. Biz haqimizda
  if (text.includes('Biz haqimizda') || text === '/about') {
    const aboutText = `в„№пёЏ **"Ibrohim Ota Choyxonasi" Haqida:**

"Ibrohim Ota Choyxonasi" вЂ” Rishton tumanidagi eng shinam, zamonaviy va shirin taomlar maskani!

Bizda:
вњ… Faqat 100% Halol va sara go'sht mahsulotlari
вњ… Har kuni yangi pishirilgan xamir va non mahsulotlari
вњ… O'zbek milliy taomlari va zamonaviy yevropa fastfudi
вњ… Tezkor va butunlay bepul yetkazib berish xizmati`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: aboutText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // Boshqa har qanday xabar kelganda
  await tg('sendMessage', {
    chat_id: chatId,
    text: `Buyurtma berish uchun pastdagi **"рџЌЅ Menyu va Buyurtma berish"** tugmasini bosing yoki kerakli boвЂlimni tanlang:`,
    parse_mode: 'Markdown',
    reply_markup: getMainKeyboard(chatId)
  });
}

// Inline Callback Queries (Admin va Guruh xodimlari tugmalari bosilganda)
async function handleCallbackQuery(query) {
  const data = query.data || '';
  const message = query.message;
  const targetChatId = message?.chat?.id;
  const messageId = message?.message_id;
  const senderName = query.from?.first_name || query.from?.username || 'Xodim';
  const senderTag = query.from?.username ? `@${query.from.username}` : senderName;

  // 1. Buyurtma holatini o'zgartirish (st:prep:ID:CUST_ID, st:comp:ID:CUST_ID va h.k.)
  if (data.startsWith('st:')) {
    const parts = data.split(':');
    const action = parts[1];
    const orderId = parts[2];
    const custChatId = parts[3] ? parseInt(parts[3], 10) : 0;

    const statusMap = {
      prep: { key: 'preparing', label: 'рџ‘ЁвЂЌрџЌі Qabul qilindi', statusText: 'Qabul qilindi' },
      cook: { key: 'preparing', label: 'рџЌі Oshxonada tayyorlanmoqda', statusText: 'Oshxonada tayyorlanmoqda' },
      delv: { key: 'delivering', label: 'рџ›µ Yetkazilmoqda (Kuryer yoвЂlda)', statusText: 'Yetkazilmoqda' },
      comp: { key: 'completed', label: 'вњ… Yetkazildi (Yakunlangan)', statusText: 'Yetkazildi' },
      canc: { key: 'cancelled', label: 'вќЊ Bekor qilindi', statusText: 'Bekor qilindi' }
    };

    const statusObj = statusMap[action] || statusMap.comp;
    updateOrderStatusInDb(orderId, statusObj.key);

    // Tugmani bosgan xodimga darhol popup bildirishnoma
    await tg('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Buyurtma #${orderId}: ${statusObj.statusText} (${senderName})`
    });

    // Guruh/Admin xabari matnini yangilash
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const oldText = message?.text || '';

    let updatedText = oldText;
    const operatorInfo = `\nрџ‘¤ *Xodim:* ${senderTag} (рџ•’ ${timeStr})`;
    if (updatedText.includes('рџ“Њ Holati:')) {
      updatedText = updatedText.replace(/рџ“Њ Holati:[\s\S]*?(?=(\n\n|$))/m, `рџ“Њ Holati: ${statusObj.label}${operatorInfo}`);
    } else {
      updatedText += `\n\nрџ“Њ *Holati:* ${statusObj.label}${operatorInfo}`;
    }

    // Tugmalarni faol holat bilan yangilash (Xarita navigatsiya tugmasini saqlab qolgan holda)
    const updatedKeyboard = [];
    if (message?.reply_markup?.inline_keyboard?.[0]?.[0]?.url) {
      updatedKeyboard.push([message.reply_markup.inline_keyboard[0][0]]);
    }

    updatedKeyboard.push(
      [
        {
          text: action === 'prep' ? 'вЂў рџ‘ЁвЂЌрџЌі Qabul qilindi вЂў' : 'рџ‘ЁвЂЌрџЌі Qabul qilish',
          callback_data: `st:prep:${orderId}:${custChatId}`
        },
        {
          text: action === 'cook' ? 'вЂў рџЌі Tayyorlanmoqda вЂў' : 'рџЌі Tayyorlanmoqda',
          callback_data: `st:cook:${orderId}:${custChatId}`
        }
      ],
      [
        {
          text: action === 'delv' ? 'вЂў рџ›µ Yetkazilmoqda вЂў' : 'рџ›µ Yetkazilmoqda',
          callback_data: `st:delv:${orderId}:${custChatId}`
        },
        {
          text: action === 'comp' ? 'вЂў вњ… Yetkazildi вЂў' : 'вњ… Yetkazildi',
          callback_data: `st:comp:${orderId}:${custChatId}`
        }
      ],
      [
        {
          text: action === 'canc' ? 'вЂў вќЊ Bekor qilindi вЂў' : 'вќЊ Bekor qilish',
          callback_data: `st:canc:${orderId}:${custChatId}`
        }
      ]
    );

    await tg('editMessageText', {
      chat_id: targetChatId,
      message_id: messageId,
      text: updatedText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: updatedKeyboard }
    });

    // 2. Mijozga (agar Telegram ID ma'lum bo'lsa) darhol xabar yuborish
    if (custChatId && custChatId > 0) {
      const customerMsgMap = {
        prep: `рџ‘ЁвЂЌрџЌі *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz ma'muriyat tomonidan qabul qilindi. Tez orada oshxonaga topshiriladi.`,
        cook: `рџЌі *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz oshxonamizda mehr bilan tayyorlanmoqda!`,
        delv: `рџ›µ *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz kuryerga topshirildi va manzil tomon yoвЂlga chiqdi! Kuryerimiz tez orada eshigingizda boвЂladi.`,
        comp: `рџЋ‰ *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz muvaffaqiyatli yetkazildi! Ibrohim Ota Choyxonasi taomlaridan bahramand boвЂling. Yoqimli ishtaha! вњЁ`,
        canc: `вќЊ *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz bekor qilindi. Savollar boвЂlsa: +998 90 377 30 00`
      };

      await tg('sendMessage', {
        chat_id: custChatId,
        text: customerMsgMap[action] || `Buyurtmangiz (#${orderId}) holati: ${statusObj.statusText}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'рџ“¦ Buyurtma holatini koвЂrish (Mini App)',
                web_app: {
                  url: `${webAppUrl}?tab=orders&updateOrder=${orderId}&status=${statusObj.key}`
                }
              }
            ]
          ]
        }
      });
    }
    return;
  }

  // 2. Admin paneldan so'rovlar
  if (data === 'adm_orders' || data === 'adm_active') {
    const orders = getOrdersDb();
    const filtered = data === 'adm_active'
      ? orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
      : orders;

    if (filtered.length === 0) {
      await tg('answerCallbackQuery', {
        callback_query_id: query.id,
        text: 'Buyurtmalar topilmadi'
      });
      return;
    }

    let summaryText = `рџ“‹ *${data === 'adm_active' ? 'Faol buyurtmalar' : 'SoвЂnggi buyurtmalar'}:*\nв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓв”Ѓ\n`;
    filtered.slice(0, 8).forEach((o, idx) => {
      const statusEmoji = o.status === 'completed' ? 'вњ…' : o.status === 'delivering' ? 'рџ›µ' : 'вЏі';
      summaryText += `${idx + 1}. *#${o.id}* вЂ” ${statusEmoji} ${o.status || 'Yangi'}\nрџ‘¤ Mijoz: ${o.customer?.name || 'Mijoz'} | рџ“ћ ${o.customer?.phone || '-'}\nрџ’° Jami: ${(o.total || 0).toLocaleString('uz-UZ')} soвЂm\n\n`;
    });

    await tg('sendMessage', {
      chat_id: adminChatId,
      text: summaryText,
      parse_mode: 'Markdown'
    });

    await tg('answerCallbackQuery', { callback_query_id: query.id });
  }
}

// Long Polling Loop
let lastUpdateId = 0;
let isPolling = true;

async function startPolling() {
  console.log("==================================================");
  console.log("   Ibrohim Ota Choyxonasi TELEGRAM BOTI ISHGA TUSHDI!        ");
  console.log("   Bot: @ibrohim_ota_bot                    ");
  console.log(`   Admin IDs: ${ADMIN_IDS.join(', ')}             `);
  console.log(`   WebApp URL: ${webAppUrl}                     `);
  console.log("==================================================");

  while (isPolling) {
    try {
      const updates = await tg('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 25
      });

      if (updates.ok && Array.isArray(updates.result)) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            handleMessage(update.message).catch((e) => console.error("Message handling error:", e));
          } else if (update.callback_query) {
            handleCallbackQuery(update.callback_query).catch((e) => console.error("Callback query error:", e));
          }
        }
      } else {
        await new Promise((r) => setTimeout(r, 2500));
      }
    } catch (err) {
      console.error("Polling loop error:", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startPolling();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("\nBot toвЂxtatilmoqda...");
  isPolling = false;
  process.exit(0);
});

