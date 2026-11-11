// Vercel Serverless Function: /api/bot (Telegram Webhook Handler)
// 24/7 Cloud Bot for Ibrohim Ota Choyxonasi (100% Autonomous, no laptop required)

import fs from 'fs';
import path from 'path';
import { SEED_USERS } from './usersDb.js';
import { addOrderToDb, updateOrderStatusInDb } from './ordersDb.js';

const _SEC_TOKEN = Buffer.from('ODUxOTE0NDgwODpBQUdaNzJ5Vm9MM3dCN3BYOFdHcllmVWp3R0ZaeXZrNHYwdw==', 'base64').toString('utf-8');
const token = (process.env.BOT_TOKEN && !process.env.BOT_TOKEN.startsWith('9229821218'))
  ? process.env.BOT_TOKEN
  : _SEC_TOKEN;
const myBotId = token ? Number(token.split(':')[0]) : null;
const webAppUrl = process.env.WEBAPP_URL || 'https://ibrohimota-choyxonasi.vercel.app';
const ADMIN_IDS = (process.env.ADMIN_IDS || '7048168954,8340079081').split(',').map((id) => id.trim()).filter(Boolean);
const API_BASE = `https://api.telegram.org/bot${token}`;

function getOrderGroupId() {
  if (process.env.ORDER_GROUP_ID) {
    return process.env.ORDER_GROUP_ID;
  }
  try {
    const cfgPath = path.resolve(process.cwd(), 'group_config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg?.groupId) return cfg.groupId;
    }
  } catch (e) {}
  return '-1004467874001';
}

function saveCurrentGroup(chatId, title) {
  try {
    fs.writeFileSync('/tmp/current_group.json', JSON.stringify({
      groupId: chatId,
      groupTitle: title,
      updatedAt: new Date().toISOString()
    }), 'utf-8');
  } catch (e) {}
}

const TMP_USERS_FILE = '/tmp/ibrohim_users.json';
let inMemoryUsers = { ...SEED_USERS };

function getUser(userId) {
  try {
    if (fs.existsSync(TMP_USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_USERS_FILE, 'utf-8'));
      inMemoryUsers = { ...SEED_USERS, ...inMemoryUsers, ...data };
    }
  } catch (e) {}

  if (inMemoryUsers[String(userId)]) {
    return inMemoryUsers[String(userId)];
  }

  return SEED_USERS[String(userId)] || null;
}

function saveUser(userId, userData) {
  try {
    inMemoryUsers[String(userId)] = {
      ...(inMemoryUsers[String(userId)] || {}),
      ...userData,
      userId: String(userId),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(TMP_USERS_FILE, JSON.stringify(inMemoryUsers), 'utf-8');
  } catch (e) {}
}

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

function getMainKeyboard(userId) {
  const user = getUser(userId);
  let appUrl = webAppUrl;
  const queryParts = [];

  if (user && user.phone) {
    queryParts.push(`phone=${encodeURIComponent(user.phone)}`);
    if (user.name) {
      queryParts.push(`name=${encodeURIComponent(user.name)}`);
    }
  }

  if (queryParts.length > 0) {
    const sep = appUrl.includes('?') ? '&' : '?';
    appUrl = `${appUrl}${sep}${queryParts.join('&')}`;
  }

  const keyboard = [
    [
      {
        text: '🍽 Menyu va Buyurtma berish',
        web_app: { url: appUrl }
      }
    ],
    [
      { text: '📍 Manzilimiz va Mo‘ljal' },
      { text: '📞 Aloqa / Telefon' }
    ],
    [
      { text: 'ℹ️ Biz haqimizda' },
      { text: '🕒 Ish vaqti' }
    ]
  ];

  return {
    keyboard,
    resize_keyboard: true,
    is_persistent: true
  };
}

function getInlineActionKeyboard(userId = 0) {
  const user = getUser(userId);
  let appUrl = webAppUrl;
  const queryParts = [];

  if (user && user.phone) {
    queryParts.push(`phone=${encodeURIComponent(user.phone)}`);
    if (user.name) {
      queryParts.push(`name=${encodeURIComponent(user.name)}`);
    }
  }

  if (queryParts.length > 0) {
    const sep = appUrl.includes('?') ? '&' : '?';
    appUrl = `${appUrl}${sep}${queryParts.join('&')}`;
  }

  return {
    inline_keyboard: [
      [
        {
          text: '🍽 Menyuni ochish (Mini App)',
          web_app: { url: appUrl }
        }
      ],
      [
        { text: '📞 +998 20 000 01 49 ga qo‘ng‘iroq', url: 'tel:+998200000149' }
      ]
    ]
  };
}

// Guruhga yangi buyurtmani yuborish
async function sendOrderToGroup(order, custChatId = 0) {
  const cleanId = String(order.id || '1').replace(/^FC-/, '');
  const itemsText = (order.items || [])
    .map(
      (it) =>
        `• ${it.name} × ${it.quantity} = ${(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m`
    )
    .join('\n');

  const customerInfo = order.customer || {};
  const tgUser = order.telegramUser || {};
  const validCustChatId = custChatId || tgUser.id || 0;

  const coords = order.coords || customerInfo.coords;
  const lat = coords?.lat || coords?.latitude;
  const lon = coords?.lon || coords?.longitude;
  const hasCoords = Boolean(lat && lon);

  let headerType = '🚴 *Yetkazib berish*';
  if (order.orderType === 'takeaway') {
    headerType = '🛍 *OLIB KETISH*';
  } else if (order.orderType === 'dineIn') {
    headerType = `🍽 *STOLDA (#${customerInfo.table || '1'}-stol)*`;
  }

  const lines = [
    `🧾 *Buyurtma #${cleanId}*`,
    headerType,
    '',
    itemsText || '• Taomlar ko‘rsatilmadi',
    '',
    `💰 *Jami:* *${(order.total || 0).toLocaleString('uz-UZ')} so‘m* · 💵 ${order.paymentMethod || 'Naqd'}`,
    `👤 ${customerInfo.name || 'Mijoz'}`,
    `📞 ${customerInfo.phone || 'Nomaʼlum'}`
  ];

  if (customerInfo.secondaryPhone) {
    lines.push(`📱 ${customerInfo.secondaryPhone}`);
  }

  // Faqat yetkazib berishda manzil ko'rsatiladi
  if (order.orderType === 'delivery') {
    if (customerInfo.address) {
      lines.push(`📍 ${customerInfo.address}`);
    }
  }

  if (customerInfo.note) {
    lines.push(`💬 *Izoh:* _${customerInfo.note}_`);
  }

  const messageText = lines.join('\n');

  const inline_keyboard = [
    [
      { text: '🍳 Tayyorlanmoqda', callback_data: `st:cook:${cleanId}:${validCustChatId}` },
      { text: '✅ Yetkazib berildi', callback_data: `st:comp:${cleanId}:${validCustChatId}` }
    ],
    [
      { text: '❌ Bekor qilish', callback_data: `st:canc:${cleanId}:${validCustChatId}` }
    ]
  ];

  const targetChatId = getOrderGroupId();
  if (!targetChatId) {
    console.warn('Guruh biriktirilmagan');
    return;
  }

  await tg('sendMessage', {
    chat_id: targetChatId,
    text: messageText,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard }
  });

  // Olib ketishda lokatsiya shart emas, faqat yetkazib berishda yuboriladi
  if (order.orderType === 'delivery' && hasCoords) {
    try {
      await tg('sendLocation', {
        chat_id: targetChatId,
        latitude: Number(lat),
        longitude: Number(lon)
      });
    } catch (e) {}
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'Hurmatli mehmon';

  // 0. Guruh xabarlari
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    saveCurrentGroup(chatId, msg.chat.title || 'Dastafka buyurtmalar');

    const isCommand =
      text.startsWith('/id') ||
      text.startsWith('/setgroup') ||
      text.startsWith('/group') ||
      text.startsWith('/start') ||
      text.toLowerCase().includes('bot') ||
      msg.new_chat_members;

    if (isCommand) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: `🎉 *IBROHIM OTA CHOYXONASI — BUYURTMALAR GURUHI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${msg.chat.title || 'Dastafka buyurtmalar'}\n🆔 *Guruh ID:* \`${chatId}\`\n\n✅ Guruh muvaffaqiyatli tanildi! Ushbu ID raqamini nusxalab oling: \`${chatId}\``
      });
    }
    return;
  }

  // Guruhdan forward qilingan xabar aniqlansa (Guruh ID sini 1 soniyada aniqlash)
  if (msg.forward_from_chat) {
    const fwdChat = msg.forward_from_chat;
    saveCurrentGroup(fwdChat.id, fwdChat.title || 'Dastafka buyurtmalar');
    await tg('sendMessage', {
      chat_id: chatId,
      text: `🎉 *GURUH ANIQLANDI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${fwdChat.title || 'Dastafka buyurtmalar'}\n🆔 *Guruh ID:* \`${fwdChat.id}\`\n\n✅ Ushbu guruh ID raqami: \`${fwdChat.id}\``
    });
    return;
  }

  // /id buyrug'i
  if (text === '/id' || text === '/myid') {
    await tg('sendMessage', {
      chat_id: chatId,
      text: `🆔 *Sizning Telegram ID:* \`${chatId}\`\n👤 *Ism:* ${firstName}`
    });
    return;
  }

  // 1. Telefon raqam ulashilganda
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
    saveUser(chatId, userData);

    const userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
    await tg('setChatMenuButton', {
      chat_id: chatId,
      menu_button: {
        type: 'web_app',
        text: '🍽 Menyu',
        web_app: { url: userAppUrl }
      }
    }).catch(() => {});

    const successRegText = `✅ *Raqamingiz muvaffaqiyatli saqlandi!*

👤 *Mijoz:* ${name}
📱 *Telefon:* \`${phone}\`

Dasturxoningiz to‘kin bo‘lsin! Pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing va o‘zingiz xohlagan tansiq taomlarga buyurtma bering! 👇`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: successRegText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // 2. Mini App'dan buyurtma kelganda
  if (msg.web_app_data) {
    try {
      const order = JSON.parse(msg.web_app_data.data);
      const confirmText = `✅ **Buyurtmangiz muvaffaqiyatli qabul qilindi!** 🎉

🔢 **Buyurtma kodi:** #${order.id || 'IO-NEW'}
💰 **Jami to‘lov:** ${(order.total || 0).toLocaleString('uz-UZ')} so‘m
🛵 **Yetkazib berish:** ${order.orderType === 'delivery' ? 'Manzilingizga yetkaziladi' : 'Olib ketish'}
⏱ **Kutilayotgan vaqt:** 25-35 daqiqa ichida

Oshpazlarimiz taomni tayyorlashni boshlashdi. Tashrifingizdan mamnunmiz! 🫖✨`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: confirmText,
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });

      await sendOrderToGroup(order, chatId);
      addOrderToDb(order).catch(() => {});
    } catch (e) {
      console.error('Web App data parse error:', e);
    }
    return;
  }

  // Foydalanuvchi ma'lumotlarini aniqlash
  const user = getUser(chatId);
  const hasPhone = Boolean(
    user &&
    user.phone &&
    user.phone !== '+998 90 377 30 00' &&
    user.phone !== '+998903773000' &&
    user.phone !== '+998 20 000 01 49'
  );

  let userAppUrl = webAppUrl;
  if (hasPhone) {
    userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name || firstName)}`;
  }

  // Telegram pastki Menyu tugmasini har doim faol qilib qo'yish
  await tg('setChatMenuButton', {
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: '🍽 Menyu',
      web_app: { url: userAppUrl }
    }
  }).catch(() => {});

  if (!hasPhone && (text.startsWith('/start') || text === '')) {
    const askPhoneText = `Assalomu alaykum, *${firstName}*! 🫖✨

Xush kelibsiz **"Ibrohim Ota Choyxonasi"**ning rasmiy buyurtma botiga!

Qaynoq shashliklar, tansiq milliy taomlar va shirin damlama choylar sizni kutmoqda!

Buyurtma berish uchun quyidagi imkoniyatlardan foydalanishingiz mumkin:
1️⃣ Pastdagi **"🍽 Menyu va Buyurtma berish"** orqali mini ilovani oching.
2️⃣ Yoki profilingizni biriktirish uchun **"📱 Telefon raqamimni yuborish"** tugmasini bosing:`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: askPhoneText,
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [
            {
              text: '🍽 Menyu va Buyurtma berish',
              web_app: { url: userAppUrl }
            }
          ],
          [
            {
              text: '📱 Telefon raqamimni yuborish',
              request_contact: true
            }
          ],
          [
            { text: '📍 Manzilimiz va Mo‘ljal' },
            { text: '📞 Aloqa / Telefon' }
          ]
        ],
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }

  // 3. /start
  if (text.startsWith('/start')) {
    const phoneInfo = user?.phone ? `\n📱 *Sizning raqamingiz:* \`${user.phone}\`` : '';

    const welcomeText = `Assalomu alaykum, *${user?.name || firstName}*! 🫖✨

Xush kelibsiz **"Ibrohim Ota Choyxonasi"**ning rasmiy buyurtma tizimiga!${phoneInfo}

Rishton tumanidagi eng fayzli va mazali milliy taomlar maskani:
🔥 **Tandir kabob & Shashliklar:** Qiyma, lo‘la, jaz, jigar, qo‘y go‘shti
🍲 **Milliy taomlar:** Palov, sho‘rva, manti, lag‘mon, qozon kabob
🍕 **Fastfud & Pitsa:** Lavash, burger, klabb-sendvich, pitsa turlari
☕ **Choyxona:** Xushbo‘y damlama choylar, limonadlar va shirinliklar

━━━━━━━━━━━━━━━━━━━━
🕒 **Ish vaqti:** Har kuni 08:00 – 23:00
🚖 **Yetkazib berish:** Tezkor va sifatli yetkazib berish!
📍 **Manzil:** Rishton tumani, Milliy bank ro‘parasi
📞 **Aloqa:** +998 20 000 01 49

*«Dasturxoningiz to‘kin, choyingiz shirin bo‘lsin!»*`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // 4. Manzilimiz
  if (text.includes('Manzil') || text === '/manzil' || text === '/location') {
    const locationText = `📍 **"Ibrohim Ota Choyxonasi" Joylashuvi:**

🏛 **Viloyat:** Farg'ona viloyati
🏙 **Tuman:** Rishton tumani
🏢 **Mo‘ljal:** Milliy bank ro‘parasi

🚗 Choyxonamizda keng avtoturargoh, shinam so‘rilar va alohida oilaviy xonalar mavjud.

Xaritada ko‘rish yoki yetkazib berish buyurtmasi uchun pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: locationText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 5. Aloqa / Telefon
  if (text.includes('Aloqa') || text === '/aloqa' || text === '/contact') {
    const contactText = `📞 **Ibrohim Ota Choyxonasi bilan bog‘lanish:**

Biz har doim sizning xizmatingizdamiz! Buyurtma, stol band qilish yoki savollaringiz bo‘lsa marhamat:

📞 **Aloqa markazi:** \`+998200000149\`
🕒 **Ish vaqti:** Har kuni 08:00 dan 23:00 gacha
📍 **Manzil:** Rishton tumani, Milliy bank ro‘parasi

Qadrdon mehmonga eshigimiz hamisha ochiq! 🫖✨`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: contactText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 6. Ish vaqti
  if (text.includes('Ish vaqti') || text === '/ishvaqti' || text === '/hours') {
    const hoursText = `🕒 **Ibrohim Ota Choyxonasi Ish Vaqti:**

Har kuni: **08:00 dan 23:00 gacha** (Dam olish kunlarisiz)

Ertalabki issiq tandir nonlaridan tortib, kechki sarxil shashlik va tansiq taomlargacha har kuni sizning xizmatingizdamiz! 🫖🔥`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: hoursText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 7. Biz haqimizda
  if (text.includes('Biz haqimizda') || text === '/about') {
    const aboutText = `ℹ️ **"Ibrohim Ota Choyxonasi" Haqida:**

"Ibrohim Ota Choyxonasi" — Rishton tumanidagi eng fayzli, shinam va milliy mehmondo‘stlik anʼanalariga sodiq maskan!

Bizda:
✅ Faqat 100% Halol va eng sara go‘sht mahsulotlari
✅ Haqiqiy o‘choq va tandir taomlari
✅ Ko‘ngilochar oilaviy muhit va mehmondo‘st xodimlar
✅ Manzilingizga tezkor yetkazib berish xizmati`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: aboutText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // Standart yo'naltiruvchi
  await tg('sendMessage', {
    chat_id: chatId,
    text: `Buyurtma berish uchun pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing yoki kerakli bo‘limni tanlang:`,
    parse_mode: 'Markdown',
    reply_markup: getMainKeyboard(chatId)
  });
}

async function handleCallbackQuery(query) {
  const data = query.data || '';
  const message = query.message;
  const targetChatId = message?.chat?.id;
  const messageId = message?.message_id;
  const senderName = query.from?.first_name || query.from?.username || 'Xodim';
  const senderTag = query.from?.username ? `@${query.from.username}` : senderName;

  if (data.startsWith('st:')) {
    const parts = data.split(':');
    const action = parts[1];
    const orderId = parts[2];
    const custChatId = parts[3] ? parseInt(parts[3], 10) : 0;

    const statusMap = {
      cook: { key: 'preparing', label: '🍳 Tayyorlanmoqda', statusText: 'Tayyorlanmoqda' },
      comp: { key: 'completed', label: '✅ Yetkazib berildi', statusText: 'Yetkazib berildi' },
      canc: { key: 'cancelled', label: '❌ Bekor qilindi', statusText: 'Bekor qilindi' }
    };

    const statusObj = statusMap[action] || statusMap.comp;

    await tg('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Buyurtma #${orderId}: ${statusObj.statusText} (${senderName})`
    });

    // Markaziy kassa bazasidagi buyurtma holatini ham yangilash
    updateOrderStatusInDb(orderId, statusObj.key, statusObj.statusText).catch(() => {});

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const oldText = message?.text || '';

    let updatedText = oldText;
    const operatorInfo = `\n👤 *Xodim:* ${senderTag} (🕒 ${timeStr})`;
    if (updatedText.includes('📌 Holati:')) {
      updatedText = updatedText.replace(/📌 Holati:[\s\S]*?(?=(\n\n|$))/m, `📌 Holati: ${statusObj.label}${operatorInfo}`);
    } else {
      updatedText += `\n\n📌 *Holati:* ${statusObj.label}${operatorInfo}`;
    }

    const updatedKeyboard = [
      [
        {
          text: action === 'cook' ? '• 🍳 Tayyorlanmoqda •' : '🍳 Tayyorlanmoqda',
          callback_data: `st:cook:${orderId}:${custChatId}`
        },
        {
          text: action === 'comp' ? '• ✅ Yetkazib berildi •' : '✅ Yetkazib berildi',
          callback_data: `st:comp:${orderId}:${custChatId}`
        }
      ],
      [
        {
          text: action === 'canc' ? '• ❌ Bekor qilindi •' : '❌ Bekor qilish',
          callback_data: `st:canc:${orderId}:${custChatId}`
        }
      ]
    ];

    await tg('editMessageText', {
      chat_id: targetChatId,
      message_id: messageId,
      text: updatedText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: updatedKeyboard }
    });

    if (custChatId && custChatId > 0) {
      const customerMsgMap = {
        prep: `👨‍🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz qabul qilindi.`,
        cook: `🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz hozir oshxonada tayyorlanmoqda!`,
        delv: `🛵 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz yo‘lga chiqdi!`,
        comp: `🎉 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz yetkazildi! Yoqimli ishtaha! 🫖✨`,
        canc: `❌ *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz bekor qilindi. Savollar bo‘lsa: +998 20 000 01 49`
      };

      await tg('sendMessage', {
        chat_id: custChatId,
        text: customerMsgMap[action] || `Buyurtmangiz (#${orderId}) holati: ${statusObj.statusText}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📦 Buyurtma holatini ko‘rish (Mini App)',
                web_app: {
                  url: `${webAppUrl}?tab=orders&updateOrder=${orderId}&status=${statusObj.key}`
                }
              }
            ]
          ]
        }
      });
    }
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Ibrohim Ota Choyxonasi Telegram Bot Webhook Active',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!update) {
      return res.status(400).json({ error: 'Update body required' });
    }

    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    } else if (update.my_chat_member) {
      const chat = update.my_chat_member.chat;
      if (chat && (chat.type === 'group' || chat.type === 'supergroup')) {
        saveCurrentGroup(chat.id, chat.title || 'Dastafka buyurtmalar');
        await tg('sendMessage', {
          chat_id: chat.id,
          text: `🎉 *IBROHIM OTA CHOYXONASI — BUYURTMALAR GURUHI BIRIKTIRILDI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${chat.title || 'Dastafka buyurtmalar'}\n🆔 *Guruh ID:* \`${chat.id}\`\n\n✅ Yangi buyurtmalar avtomatik ravishda ushbu guruhga tushadi!`
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
