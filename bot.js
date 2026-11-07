import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const token = process.env.BOT_TOKEN || '9141727536:AAGkeeNUQGbsD3WBtMciA17UxhBkFhPLWx0';
const webAppUrl = process.env.WEBAPP_URL || 'https://faiza-cafe.vercel.app';
const ADMIN_IDS = (process.env.ADMIN_IDS || '8340079081').split(',').map((id) => id.trim()).filter(Boolean);

if (!token) {
  console.error("Xatolik: .env faylida BOT_TOKEN ko'rsatilmagan!");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;
const DB_FILE = path.resolve('orders_db.json');

// Admin tekshiruvi
function isAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

// Local Orders Database
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

// Bosh Reply Keyboard - Admin (8340079081) bo'lsa Admin Panel tugmasi chiqadi
function getMainKeyboard(userId) {
  const keyboard = [
    [
      {
        text: '🍽 Menyu va Buyurtma berish',
        web_app: { url: webAppUrl }
      }
    ]
  ];

  // Faqat adminga ko'rinadigan tugmalar
  if (isAdmin(userId)) {
    keyboard.push([
      { text: '🛠 Admin Panel' },
      { text: '📊 Buyurtmalar' }
    ]);
  }

  keyboard.push(
    [
      { text: '📍 Manzilimiz va Mo‘ljal' },
      { text: '📞 Aloqa / Telefon' }
    ],
    [
      { text: 'ℹ️ Biz haqimizda' },
      { text: '⏰ Ish vaqti' }
    ]
  );

  return {
    keyboard,
    resize_keyboard: true,
    is_persistent: true
  };
}

// Inline Keyboard
function getInlineActionKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🍕 Menyuni ochish (Mini App)',
          web_app: { url: webAppUrl }
        }
      ],
      [
        { text: '📞 +998 90 377 30 00', url: 'tel:+998903773000' },
        { text: '📞 +998 98 571 00 67', url: 'tel:+998985710067' }
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

  const addressInfo =
    order.orderType === 'delivery'
      ? `🚗 *Yetkazib berish:* ${customerInfo.address || 'Rishton'}`
      : order.orderType === 'takeaway'
      ? `🛍 *Olib ketish:* ${customerInfo.branch || 'Faiza Cafe (Markaz)'}`
      : `🍽 *Kafeda:* ${customerInfo.table || '1'}-stol`;

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

  const inline_keyboard = [
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
  ];

  for (const adminId of ADMIN_IDS) {
    await tg('sendMessage', {
      chat_id: adminId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });
  }
}

// Xabarlarni boshqarish
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'Hurmatli mehmon';

  // 1. Mini App'dan buyurtma kelganda (web_app_data)
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

      // Admin (8340079081)ga bildirishnoma yuborish
      await notifyAdminsAboutOrder(order, chatId);
    } catch (e) {
      console.error('Web App data parse error:', e);
    }
    return;
  }

  // 2. /start
  if (text.startsWith('/start')) {
    const adminGreeting = isAdmin(chatId)
      ? `\n\n⭐ *Siz tizimda Bosh Administrator (8340079081) sifatida aniqlandingiz.* Admin panelidan buyurtmalarni boshqarishingiz mumkin.`
      : '';

    const welcomeText = `Assalomu alaykum, *${firstName}*! 👋

Xush kelibsiz **"FAIZA CAFE"**ning rasmiy buyurtma botiga! ✨🍽️
${adminGreeting}

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

  // 3. Admin Panel (Faqat 8340079081 uchun)
  if (text === '🛠 Admin Panel' || text.startsWith('/admin')) {
    if (!isAdmin(chatId)) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: '⛔ *Kechirasiz, sizda Admin paneliga kirish huquqi mavjud emas.*',
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard(chatId)
      });
      return;
    }

    const orders = getOrdersDb();
    const activeCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;

    const adminDashboardText = `🔐 *FAIZA CAFE — BOSHQARUV PANELI*
━━━━━━━━━━━━━━━━━━━━
Assalomu alaykum, *Bosh Administrator*! 👋
🆔 *Sizning ID:* \`${chatId}\`

📊 *Buyurtmalar statistikasi:*
• 📥 Jami buyurtmalar: *${orders.length} ta*
• ⏳ Faol / Kutilmoqda: *${activeCount} ta*
• ✅ Yetkazilgan: *${completedCount} ta*

Kerakli bo‘limni tanlang:`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: adminDashboardText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Web Admin Panelni ochish',
              web_app: { url: `${webAppUrl}?admin=8340079081` }
            }
          ],
          [
            { text: '📋 Barcha buyurtmalar', callback_data: 'adm_orders' },
            { text: '🟡 Faol buyurtmalar', callback_data: 'adm_active' }
          ]
        ]
      }
    });
    return;
  }

  // 4. Buyurtmalar ro'yxati (Faqat admin uchun)
  if (text === '📊 Buyurtmalar' || text === '📊 Buyurtmalar ro‘yxati' || text.startsWith('/orders')) {
    if (isAdmin(chatId)) {
      const orders = getOrdersDb();
      if (orders.length === 0) {
        await tg('sendMessage', {
          chat_id: chatId,
          text: '📋 Hozircha yangi buyurtmalar kelib tushmagan.',
          reply_markup: getMainKeyboard(chatId)
        });
        return;
      }

      let listText = `📋 *So‘nggi 10 ta buyurtma ro‘yxati:*\n━━━━━━━━━━━━━━━━━━━━\n`;
      orders.slice(0, 10).forEach((o, idx) => {
        const statusEmoji = o.status === 'completed' ? '✅' : o.status === 'delivering' ? '🛵' : '⏳';
        listText += `${idx + 1}. *#${o.id}* — ${statusEmoji} ${o.status || 'Yangi'}\n👤 Mijoz: ${o.customer?.name || 'Mijoz'} | 📞 ${o.customer?.phone || '-'}\n💰 Jami: ${(o.total || 0).toLocaleString('uz-UZ')} so‘m\n\n`;
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

  // 5. Manzilimiz va Mo'ljal
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
      reply_markup: getInlineActionKeyboard()
    });
    return;
  }

  // 6. Aloqa / Telefon
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
      reply_markup: getInlineActionKeyboard()
    });
    return;
  }

  // 7. Ish vaqti
  if (text.includes('Ish vaqti') || text === '/hours') {
    const hoursText = `⏰ **FAIZA CAFE Ish Vaqti:**

Har kuni: **08:00 dan 03:00 gacha** (tungi 3 gacha)

🌙 Tungi vaqtda ham mazali fastfud, issiq pitsa va shashliklarga buyurtma berishingiz mumkin!
Yetkazib berish xizmatimiz soat 03:00 gacha faol.`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: hoursText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard()
    });
    return;
  }

  // 8. Biz haqimizda
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

  // Boshqa har qanday xabar kelganda
  await tg('sendMessage', {
    chat_id: chatId,
    text: `Buyurtma berish uchun pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing yoki kerakli bo‘limni tanlang:`,
    parse_mode: 'Markdown',
    reply_markup: getMainKeyboard(chatId)
  });
}

// Inline Callback Queries (Admin tugmalari bosilganda)
async function handleCallbackQuery(query) {
  const data = query.data || '';
  const message = query.message;
  const adminChatId = message?.chat?.id;
  const messageId = message?.message_id;

  // 1. Buyurtma holatini o'zgartirish (st:prep:ID:CUST_ID, st:comp:ID:CUST_ID va h.k.)
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
    updateOrderStatusInDb(orderId, statusObj.key);

    // Adminga darhol popup bildirishnoma
    await tg('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Buyurtma #${orderId} holati: ${statusObj.label}`
    });

    // Admin xabari matnini yangilash
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const oldText = message?.text || '';

    // Holat qatorini almashtiramiz
    let updatedText = oldText;
    if (updatedText.includes('📌 Holati:')) {
      updatedText = updatedText.replace(/📌 Holati:.*$/m, `📌 Holati: ${statusObj.label} (🕒 ${timeStr})`);
    } else {
      updatedText += `\n\n📌 *Holati:* ${statusObj.label} (🕒 ${timeStr})`;
    }

    // Tugmalarni faol holat bilan yangilash
    const updatedKeyboard = [
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
    ];

    await tg('editMessageText', {
      chat_id: adminChatId,
      message_id: messageId,
      text: updatedText,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: updatedKeyboard }
    });

    // 2. Mijozga (agar Telegram ID ma'lum bo'lsa) darhol xabar yuborish
    if (custChatId && custChatId > 0) {
      const customerMsgMap = {
        prep: `👨‍🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz ma'muriyat tomonidan qabul qilindi. Tez orada oshxonaga topshiriladi.`,
        cook: `🍳 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz oshxonamizda mehr bilan tayyorlanmoqda!`,
        delv: `🛵 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz kuryerga topshirildi va manzil tomon yo‘lga chiqdi! Kuryerimiz tez orada eshigingizda bo‘ladi.`,
        comp: `🎉 *Hurmatli mijoz!* Sizning *#${orderId}* raqamli buyurtmangiz muvaffaqiyatli yetkazildi! Faiza Cafe taomlaridan bahramand bo‘ling. Yoqimli ishtaha! ✨`,
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

    let summaryText = `📋 *${data === 'adm_active' ? 'Faol buyurtmalar' : 'So‘nggi buyurtmalar'}:*\n━━━━━━━━━━━━━━━━━━━━\n`;
    filtered.slice(0, 8).forEach((o, idx) => {
      const statusEmoji = o.status === 'completed' ? '✅' : o.status === 'delivering' ? '🛵' : '⏳';
      summaryText += `${idx + 1}. *#${o.id}* — ${statusEmoji} ${o.status || 'Yangi'}\n👤 Mijoz: ${o.customer?.name || 'Mijoz'} | 📞 ${o.customer?.phone || '-'}\n💰 Jami: ${(o.total || 0).toLocaleString('uz-UZ')} so‘m\n\n`;
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
  console.log("   FAIZA CAFE TELEGRAM BOTI ISHGA TUSHDI!        ");
  console.log("   Bot: @faizacafe_rishton_bot                    ");
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
  console.log("\nBot to‘xtatilmoqda...");
  isPolling = false;
  process.exit(0);
});
