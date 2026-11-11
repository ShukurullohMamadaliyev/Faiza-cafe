import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const token = process.env.BOT_TOKEN || '8519144808:AAGZ72yVoL3wB7pX8WGrYfUjwGFZyvk4v0w';
const myBotId = token ? Number(token.split(':')[0]) : null;
const webAppUrl = process.env.WEBAPP_URL || 'https://ibrohimota-choyxonasi.vercel.app';
const ADMIN_IDS = (process.env.ADMIN_IDS || '7048168954,8340079081').split(',').map((id) => id.trim()).filter(Boolean);

if (!token) {
  console.error("Xatolik: .env faylida BOT_TOKEN ko'rsatilmagan!");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;
const DB_FILE = path.resolve('orders_db.json');
const USERS_DB_FILE = path.resolve('users_db.json');
const GROUP_CONFIG_FILE = path.resolve('group_config.json');

function isAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

function getGroupConfig() {
  try {
    if (fs.existsSync(GROUP_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(GROUP_CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading group_config.json:', e);
  }
  if (process.env.ORDER_GROUP_ID) {
    return { groupId: process.env.ORDER_GROUP_ID, groupTitle: 'Dastafka buyurtmalar' };
  }
  return { groupId: '-5370487830', groupTitle: 'Dastafka buyurtmalar' };
}

function saveGroupConfig(config) {
  try {
    fs.writeFileSync(GROUP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing group_config.json:', e);
  }
}

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
    list.unshift(order);
    fs.writeFileSync(DB_FILE, JSON.stringify(list.slice(0, 500), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving order to orders_db.json:', e);
  }
}

function updateOrderStatusInDb(orderId, newStatus) {
  try {
    const list = getOrdersDb();
    const match = list.find((o) => String(o.id) === String(orderId));
    if (match) {
      match.status = newStatus;
      match.updatedAt = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error updating status in orders_db.json:', e);
  }
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
  const user = getUserFromDb(userId);
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

async function notifyAdminsAboutOrder(order, custChatId = 0) {
  saveOrderToDb({ ...order, customerChatId: custChatId, createdAt: new Date().toISOString() });

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
      ? `🛍 *Olib ketish:* ${customerInfo.branch || 'Ibrohim Ota Choyxonasi (Markaz)'}`
      : `🍽 *Kafeda:* ${customerInfo.table || '1'}-stol`;

  if (order.orderType === 'delivery' && hasCoords) {
    addressInfo += `\n📍 *GPS koordinatalar:* \`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}\`\n🗺 *Navigatsiya:* [Google Maps orqali ochish](https://maps.google.com/?q=${lat},${lon})`;
  }

  const phoneLine = customerInfo.secondaryPhone
    ? `📞 *Telefon:* \`${customerInfo.phone || 'Nomaʼlum'}\`\n📱 *Qo‘shimcha tel:* \`${customerInfo.secondaryPhone}\``
    : `📞 *Telefon:* \`${customerInfo.phone || 'Nomaʼlum'}\``;

  const messageText = `🔔 *YANGI BUYURTMA! #${order.id}*
━━━━━━━━━━━━━━━━━━━━
👤 *Mijoz:* ${customerInfo.name || 'Mijoz'} (${userTag})
${phoneLine}
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
      { text: '🍳 Oshxonada', callback_data: `st:cook:${order.id}:${validCustChatId}` }
    ],
    [
      { text: '🛵 Yetkazilmoqda', callback_data: `st:delv:${order.id}:${validCustChatId}` },
      { text: '✅ Yetkazildi', callback_data: `st:comp:${order.id}:${validCustChatId}` }
    ],
    [
      { text: '❌ Bekor qilish', callback_data: `st:canc:${order.id}:${validCustChatId}` }
    ]
  );

  const groupConfig = getGroupConfig();
  const recipients = [];

  if (groupConfig?.groupId) {
    recipients.push(String(groupConfig.groupId));
  } else {
    ADMIN_IDS.forEach((id) => recipients.push(id));
  }

  for (const chatId of recipients) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });

    if (order.orderType === 'delivery' && hasCoords) {
      try {
        await tg('sendLocation', {
          chat_id: chatId,
          latitude: Number(lat),
          longitude: Number(lon)
        });
      } catch (e) {}
    }
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'Hurmatli mehmon';

  // 0. Guruh xabarlari
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const isOwner = ADMIN_IDS.includes(String(msg.from?.id));
    const groupConfig = getGroupConfig();
    const isCurrentConnectedGroup = groupConfig?.groupId && String(groupConfig.groupId) === String(chatId);

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
            text: `🎉 *IBROHIM OTA CHOYXONASI — BUYURTMALAR GURUHI BIRIKTIRILDI!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${msg.chat.title}\n🆔 *Guruh ID:* \`${chatId}\`\n\n✅ Yangi buyurtmalar avtomatik ravishda ushbu guruhga tushadi!`
          });
        } else {
          await tg('sendMessage', {
            chat_id: chatId,
            text: '⛔ *Xavfsizlik tizimi:* Ushbu bot faqat "Ibrohim Ota Choyxonasi" maʼmuriyati uchun mo‘ljallangan.'
          });
          await tg('leaveChat', { chat_id: chatId });
        }
        return;
      }
    }

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
          text: `✅ *Ushbu guruh buyurtmalar guruhi sifatida saqlandi!*\n━━━━━━━━━━━━━━━━━━━━\n📌 *Guruh:* ${msg.chat.title}\n🆔 *Guruh ID:* \`${chatId}\`\n\nBarcha yangi buyurtmalar, GPS lokatsiyalar shu guruhga yuboriladi.`
        });
      } else {
        await tg('sendMessage', {
          chat_id: chatId,
          text: `ℹ️ Ushbu guruh ID raqami: \`${chatId}\`\n(Faqat bot egasi buyurtmalar guruhini biriktirishi mumkin)`
        });
      }
      return;
    }

    if (!isCurrentConnectedGroup && !isOwner) {
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
    saveUserToDb(chatId, userData);

    try {
      fetch(`${webAppUrl}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: chatId, ...userData })
      }).catch(() => {});
    } catch (e) {}

    const userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
    tg('setChatMenuButton', {
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

Dasturxoningiz to‘kin bo‘lsin! Pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing va o‘zingiz yoqtirgan taomlarga buyurtma bering! 👇`;

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
    user.phone !== '+998903773000' &&
    user.phone !== '+998 20 000 01 49'
  );

  let userAppUrl = webAppUrl;
  if (hasPhone) {
    userAppUrl = `${webAppUrl}?phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name || firstName)}`;
  }

  // Mini App tugmasini doimiy ulash
  tg('setChatMenuButton', {
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
      prep: { key: 'preparing', label: '👨‍🍳 Qabul qilindi', statusText: 'Qabul qilindi' },
      cook: { key: 'preparing', label: '🍳 Oshxonada tayyorlanmoqda', statusText: 'Oshxonada tayyorlanmoqda' },
      delv: { key: 'delivering', label: '🛵 Yetkazilmoqda (Yo‘lda)', statusText: 'Yetkazilmoqda' },
      comp: { key: 'completed', label: '✅ Yetkazildi (Yakunlandi)', statusText: 'Yetkazildi' },
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
          text: action === 'cook' ? '• 🍳 Oshxonada •' : '🍳 Oshxonada',
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

// Bot boshlanganda avtomatik Telegram parametrlarini o'rnatish
async function initBotSettings() {
  try {
    console.log("-> Telegram sozlamalari yangilanmoqda...");

    // 1. Description (Startdan oldin)
    await tg('setMyDescription', {
      description: `Assalomu alaykum va xush kelibsiz! 🫖✨\n\n"Ibrohim Ota Choyxonasi" — Rishton tumanidagi eng fayzli milliy taomlar, tandir kabob va shashliklar maskani!\n\nBu bot orqali:\n🍽 Taomlar va ichimliklar menyusini ko‘rishingiz\n🔥 Qaynoq tandir shashliklariga buyurtma berishingiz\n🚗 O‘zingiz turgan manzilga tezkor yetkazishni tanlashingiz mumkin.\n\nBoshlash uchun pastdagi "Start" tugmasini bosing! 👇`
    });

    // 2. Short Description (Bio)
    await tg('setMyShortDescription', {
      short_description: `Milliy taomlar, tandir shashliklar va yetkazib berish xizmati! 🫖🔥 Buyurtma: +998 20 000 01 49`
    });

    // 3. Mini App Menu Button
    await tg('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🍽 Menyu',
        web_app: { url: webAppUrl }
      }
    });

    // 4. Commands
    await tg('setMyCommands', {
      commands: [
        { command: 'start', description: '🫖 Botni ishga tushirish va asosiy menyu' },
        { command: 'menu', description: '🍽 Taomlar menyusini ochish (Mini App)' },
        { command: 'aloqa', description: '📞 Aloqa va telefon raqamimiz' },
        { command: 'manzil', description: '📍 Joylashuv va mo‘ljal' },
        { command: 'ishvaqti', description: '🕒 Ish vaqti ma’lumotlari' }
      ]
    });

    console.log("-> Telegram sozlamalari (Bio, Mini App, Description) o'rnatildi!");
  } catch (e) {
    console.error("initBotSettings error:", e);
  }
}

let lastUpdateId = 0;
let isPolling = true;

async function startPolling() {
  console.log("==================================================");
  console.log("   Ibrohim Ota Choyxonasi TELEGRAM BOTI ISHGA TUSHDI!        ");
  console.log(`   Admin IDs: ${ADMIN_IDS.join(', ')}             `);
  console.log(`   WebApp URL: ${webAppUrl}                     `);
  console.log("==================================================");

  await initBotSettings();

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

process.on('SIGINT', () => {
  console.log("\nBot to‘xtatilmoqda...");
  isPolling = false;
  process.exit(0);
});
