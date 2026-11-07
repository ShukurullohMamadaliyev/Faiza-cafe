// Vercel Serverless Function: /api/bot (Telegram Webhook Handler)
// 24/7 Cloud Bot for Faiza Cafe (100% Autonomous, no laptop required)

import fs from 'fs';
import path from 'path';
import { SEED_USERS } from './usersDb.js';

const token = process.env.BOT_TOKEN || '9141727536:AAGkeeNUQGbsD3WBtMciA17UxhBkFhPLWx0';
const webAppUrl = process.env.WEBAPP_URL || 'https://faiza-cafe.vercel.app';
const ADMIN_IDS = (process.env.ADMIN_IDS || '8340079081').split(',').map((id) => id.trim()).filter(Boolean);
const ORDER_GROUP_ID = process.env.ORDER_GROUP_ID || '-1003577268173';
const API_BASE = `https://api.telegram.org/bot${token}`;

const TMP_USERS_FILE = '/tmp/faiza_users.json';
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
      { text: '⏰ Ish vaqti' }
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
  if (user && user.phone) {
    const sep = appUrl.includes('?') ? '&' : '?';
    appUrl = `${appUrl}${sep}phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name || '')}`;
  }

  return {
    inline_keyboard: [
      [
        {
          text: '🍕 Menyuni ochish (Mini App)',
          web_app: { url: appUrl }
        }
      ],
      [
        { text: '📞 +998 90 377 30 00', url: 'tel:+998903773000' },
        { text: '📞 +998 98 571 00 67', url: 'tel:+998985710067' }
      ]
    ]
  };
}

// Guruhga yangi buyurtmani yuborish
async function sendOrderToGroup(order, custChatId = 0) {
  const itemsText = (order.items || [])
    .map(
      (it) =>
        `• *${it.quantity}x ${it.name}* — ${(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m`
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
      ? `🚗 *Yetkazib berish:* ${customerInfo.address || 'Rishton'}`
      : order.orderType === 'takeaway'
      ? `🛍 *Olib ketish:* ${customerInfo.branch || 'Faiza Cafe Rishton'}`
      : `🍽 *Kafeda:* ${customerInfo.table || '1'}-stol`;

  if (order.orderType === 'delivery' && hasCoords) {
    addressInfo += `\n📍 *GPS koordinatalar:* \`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}\`\n🗺 *Navigatsiya:* [Google Maps orqali ochish](https://maps.google.com/?q=${lat},${lon})`;
  }

  const messageText = `🔔 *YANGI BUYURTMA! #${order.id}*
━━━━━━━━━━━━━━━━━━━━
👤 *Mijoz:* ${customerInfo.name || 'Mijoz'} (${userTag})
📞 *Telefon:* \`${customerInfo.phone || 'Nomaʼlum'}\`
${addressInfo}
💬 *Izoh:* ${customerInfo.note ? `_${customerInfo.note}_` : 'Mavjud emas'}

📋 *Taomlar ro‘yxati:*
${itemsText || '• Taomlar ko‘rsatilmadi'}

💰 *Jami to‘lov:* *${(order.total || 0).toLocaleString('uz-UZ')} so‘m*
💳 *To‘lov turi:* ${order.paymentMethod || 'Naqd pul'}
🕒 *Vaqt:* ${order.date || new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
📌 *Holati:* 🟡 *Yangi (Kutilmoqda)*`;

  const inline_keyboard = [];
  if (order.orderType === 'delivery' && hasCoords) {
    inline_keyboard.push([
      { text: '🗺 Xaritada ochish (Navigatsiya)', url: `https://maps.google.com/?q=${lat},${lon}` }
    ]);
  }

  inline_keyboard.push(
    [
      { text: '👨‍🍳 Qabul qilish', callback_data: `st:prep:${order.id}:${validCustChatId}` },
      { text: '🍳 Tayyorlanmoqda', callback_data: `st:cook:${order.id}:${validCustChatId}` }
    ],
    [
      { text: '🛵 Yetkazilmoqda', callback_data: `st:delv:${order.id}:${validCustChatId}` },
      { text: '✅ Yetkazildi', callback_data: `st:comp:${order.id}:${validCustChatId}` }
    ],
    [
      { text: '❌ Bekor qilish', callback_data: `st:canc:${order.id}:${validCustChatId}` }
    ]
  );

  const targetChatId = ORDER_GROUP_ID;

  await tg('sendMessage', {
    chat_id: targetChatId,
    text: messageText,
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard }
  });

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
    const isOwner = ADMIN_IDS.includes(String(msg.from?.id));
    const isAuthorizedGroup = String(chatId) === String(ORDER_GROUP_ID);

    if (msg.new_chat_members) {
      const botAdded = msg.new_chat_members.some((m) => m.is_bot && (m.id === 9141727536 || m.username === 'faizacafe_rishton_bot'));
      if (botAdded) {
        if (isOwner || isAuthorizedGroup) {
          await tg('sendMessage', {
            chat_id: chatId,
            text: `🎉 *FAIZA CAFE — BUYURTMALAR GURUHI BIRIKTIRILDI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${msg.chat.title}\n🆔 *Guruh ID:* \`${chatId}\`\n\n✅ Yangi buyurtmalar avtomatik ravishda ushbu guruhga yuboriladi!`
          });
        } else {
          // Begona guruhdan chiqib ketish (Anti-leak)
          await tg('sendMessage', {
            chat_id: chatId,
            text: '⛔ *Xavfsizlik tizimi:* Ushbu bot faqat "Faiza Cafe" rasmiy xodimlari uchun mo‘ljallangan. Ruxsatsiz guruhdan avtomatik chiqilmoqda...'
          });
          await tg('leaveChat', { chat_id: chatId });
        }
        return;
      }
    }

    if (text.startsWith('/id') || text.startsWith('/setgroup') || text.startsWith('/group')) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: `📌 *Guruh:* ${msg.chat.title}\n🆔 *Guruh ID:* \`${chatId}\`\n\n${isAuthorizedGroup ? '✅ Ushbu guruh rasmiy buyurtmalar guruhi sifatida faol ishlamoqda!' : '⚠️ Ushbu guruh ID raqamini biriktirish uchun adminga murojaat qiling.'}`
      });
      return;
    }

    if (!isAuthorizedGroup && !isOwner) {
      await tg('leaveChat', { chat_id: chatId });
      return;
    }

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

Endi siz uchun barcha imkoniyatlar ochildi! Pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing va o‘zingiz yoqtirgan lazzatli taomlarga buyurtma bering! 👇`;

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

🔢 **Buyurtma kodi:** #${order.id || 'FC-NEW'}
💰 **Jami to‘lov:** ${(order.total || 0).toLocaleString('uz-UZ')} so‘m
🛵 **Yetkazib berish:** ${order.orderType === 'delivery' ? 'Manzilingizga bepul yetkaziladi' : 'Olib ketish'}
⏳ **Kutilayotgan vaqt:** 25-35 daqiqa ichida

Oshpazlarimiz taomni tayyorlashni boshlashdi. Rahmat! 🍔✨`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: confirmText,
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });

      await sendOrderToGroup(order, chatId);
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
    user.phone !== '+998903773000'
  );

  let userAppUrl = webAppUrl;
  if (hasPhone) {
    userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name || firstName)}`;
  }

  // Telegram pastki Menyu tugmasini har doim faol qilib qo'yish (hech qachon o'chirilmaydi)
  await tg('setChatMenuButton', {
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: '🍽 Menyu',
      web_app: { url: userAppUrl }
    }
  }).catch(() => {});

  if (!hasPhone) {
    const askPhoneText = `Assalomu alaykum, *${firstName}*! 👋

Xush kelibsiz *"FAIZA CAFE"*ning rasmiy buyurtma botiga! ✨🍽️

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
    const phoneInfo = `\n📱 *Sizning raqamingiz:* \`${user.phone}\``;

    const welcomeText = `Assalomu alaykum, *${user.name || firstName}*! 👋

Xush kelibsiz **"FAIZA CAFE"**ning rasmiy buyurtma botiga! ✨🍽️${phoneInfo}

Rishton tumanidagi eng mazali va sifatli taomlar maskani:
🍔 **Fastfud:** 20 dan ortiq lavash, tandir lavash, burger, shaurma va xot-doglar
🍕 **Pitsa:** 6 xil o‘zgacha pitsa (Pepperoni, Qazili, Palermo, Assorti...)
🥩 **Issiq taomlar & Shashlik:** Kotletlar Chiz, Syrniy Beyti, Doner tarelka
🥗 **Salatlar:** Sezar, Mujskoy kapriz, Olivye, Grecheskiy
☕ **Ichimliklar:** Fresh limonad, San-Sebastian chizkeyk va qahvalar

━━━━━━━━━━━━━━━━━━━━
⏰ **Ish vaqti:** 08:00 – 03:00 (tungi 3 gacha)
🚖 **Yetkazib berish:** BUTUNLAY BEPUL!
📍 **Manzil:** Rishton tumani, Milliy bank ro‘parasi
📞 **Aloqa:** +998 90 377 30 00 | +998 98 571 00 67`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard(chatId)
    });
    return;
  }

  // 4. Manzilimiz
  if (text.includes('Manzilimiz') || text === '/location') {
    const locationText = `📍 **"FAIZA CAFE" Manzili:**

🏛 **Viloyat:** Farg'ona viloyati
🏙 **Tuman:** Rishton tumani
🏢 **Mo'ljal:** Milliy bank ro'parasi

🚗 Kafemiz qulay joylashuvga ega bo'lib, keng avtoturargoh va shinam oilaviy xonalarga ega.

Xaritada ko'rish yoki yetkazib berish manzilini belgilash uchun Mini App'dan foydalaning!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: locationText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 5. Aloqa / Telefon
  if (text.includes('Aloqa') || text === '/contact') {
    const contactText = `📞 **FAIZA CAFE bilan bog'lanish:**

Biz har doim sizning xizmatingizdamiz! Savollaringiz, takliflaringiz yoki maxsus buyurtmalaringiz bo'lsa, quyidagi raqamlarga qo'ng'iroq qiling:

📞 **1-aloqa liniyasi:** \`+998903773000\`
📞 **2-aloqa liniyasi:** \`+998985710067\`

🛵 Yetkazib berish xizmati: **BEPUL**`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: contactText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard(chatId)
    });
    return;
  }

  // 6. Ish vaqti
  if (text.includes('Ish vaqti') || text === '/hours') {
    const hoursText = `⏰ **FAIZA CAFE Ish Vaqti:**

Har kuni: **08:00 dan 03:00 gacha** (tungi 3 gacha)

🌙 Tungi vaqtda ham mazali fastfud, issiq pitsa va shashliklarga buyurtma berishingiz mumkin!
Yetkazib berish xizmatimiz soat 03:00 gacha faol.`;

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
    const aboutText = `ℹ️ **"FAIZA CAFE" Haqida:**

"Faiza Cafe" — Rishton tumanidagi eng shinam, zamonaviy va shirin taomlar maskani!

Bizda:
✅ Faqat 100% Halol va sara go'sht mahsulotlari
✅ Har kuni yangi pishirilgan xamir va non mahsulotlari
✅ O'zbek milliy taomlari va zamonaviy yevropa fastfudi
✅ Tezkor va butunlay bepul yetkazib berish xizmati`;

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
      prep: { key: 'preparing', label: '👨‍🍳 Qabul qilindi', statusText: 'Qabul qilindi' },
      cook: { key: 'preparing', label: '🍳 Oshxonada tayyorlanmoqda', statusText: 'Oshxonada tayyorlanmoqda' },
      delv: { key: 'delivering', label: '🛵 Yetkazilmoqda (Kuryer yo‘lda)', statusText: 'Yetkazilmoqda' },
      comp: { key: 'completed', label: '✅ Yetkazildi (Yakunlangan)', statusText: 'Yetkazildi' },
      canc: { key: 'cancelled', label: '❌ Bekor qilindi', statusText: 'Bekor qilindi' }
    };

    const statusObj = statusMap[action] || statusMap.comp;

    await tg('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Buyurtma #${orderId}: ${statusObj.statusText} (${senderName})`
    });

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

    const updatedKeyboard = [];
    if (message?.reply_markup?.inline_keyboard?.[0]?.[0]?.url) {
      updatedKeyboard.push([message.reply_markup.inline_keyboard[0][0]]);
    }

    updatedKeyboard.push(
      [
        {
          text: action === 'prep' ? '• 👨‍🍳 Qabul qilindi •' : '👨‍🍳 Qabul qilish',
          callback_data: `st:prep:${orderId}:${custChatId}`
        },
        {
          text: action === 'cook' ? '• 🍳 Tayyorlanmoqda •' : '🍳 Tayyorlanmoqda',
          callback_data: `st:cook:${orderId}:${custChatId}`
        }
      ],
      [
        {
          text: action === 'delv' ? '• 🛵 Yetkazilmoqda •' : '🛵 Yetkazilmoqda',
          callback_data: `st:delv:${orderId}:${custChatId}`
        },
        {
          text: action === 'comp' ? '• ✅ Yetkazildi •' : '✅ Yetkazildi',
          callback_data: `st:comp:${orderId}:${custChatId}`
        }
      ],
      [
        {
          text: action === 'canc' ? '• ❌ Bekor qilindi •' : '❌ Bekor qilish',
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

    if (custChatId && custChatId > 0) {
      const customerMsgMap = {
        prep: `👨‍🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz oshxonaga qabul qilindi.`,
        cook: `🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz tayyorlanmoqda!`,
        delv: `🛵 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz kuryerga topshirildi va manzil tomon yo‘lga chiqdi!`,
        comp: `🎉 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz muvaffaqiyatli yetkazildi! Yoqimli ishtaha! ✨`,
        canc: `❌ *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz bekor qilindi. Savollar bo‘lsa: +998 90 377 30 00`
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
      status: 'Faiza Cafe Telegram Bot Webhook Active',
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
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
