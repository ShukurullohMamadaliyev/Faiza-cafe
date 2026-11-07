import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'https://faiza-cafe.vercel.app';

if (!token) {
  console.error("Xatolik: .env faylida BOT_TOKEN ko'rsatilmagan!");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;

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

// Bosh Reply Keyboard
function getMainKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '🍽 Menyu va Buyurtma berish',
          web_app: { url: webAppUrl }
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
    ],
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

// Xabarlarni boshqarish
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'Hurmatli mehmon';

  // 1. Mini App'dan buyurtma kelganda (web_app_data)
  if (msg.web_app_data) {
    try {
      const order = JSON.parse(msg.web_app_data.data);
      const confirmText =
`✅ **Buyurtmangiz muvaffaqiyatli qabul qilindi!** 🎉

🔢 **Buyurtma kodi:** #${order.id || 'FC-NEW'}
💰 **Jami to‘lov:** ${order.total?.toLocaleString('uz-UZ') || 0} so‘m
🛵 **Yetkazib berish:** ${order.orderType === 'delivery' ? 'Manzilingizga bepul yetkaziladi' : 'Olib ketish'}
⏳ **Kutilayotgan vaqt:** 25-35 daqiqa ichida

Oshpazlarimiz taomni tayyorlashni boshlashdi. Rahmat! 🍔✨`;

      await tg('sendMessage', {
        chat_id: chatId,
        text: confirmText,
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard()
      });
    } catch (e) {
      console.error('Web App data parse error:', e);
    }
    return;
  }

  // 2. /start
  if (text.startsWith('/start')) {
    const welcomeText =
`Assalomu alaykum, *${firstName}*! 👋

Xush kelibsiz **"FAIZA CAFE"**ning rasmiy buyurtma botiga! ✨🍽️

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
📞 **Aloqa:** +998 90 377 30 00 | +998 98 571 00 67
━━━━━━━━━━━━━━━━━━━━

👇 Buyurtma berish uchun quyidagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard()
    });
    return;
  }

  // 3. /menu yoki Menyu so'rovi
  if (text === '/menu') {
    await tg('sendMessage', {
      chat_id: chatId,
      text: '👇 Quyidagi tugma orqali to‘liq interaktiv menyuni oching:',
      reply_markup: getInlineActionKeyboard()
    });
    return;
  }

  // 4. Manzil va Mo'ljal
  if (text === '/location' || text.includes('Manzil')) {
    const locText =
`📍 **Bizning Manzilimiz:**
Farg‘ona viloyati, Rishton tumani.

🏢 **Mo‘ljal:** Milliy bank ro‘parasi.
🚖 **Yetkazib berish:** Rishton bo‘ylab yetkazib berish mutlaqo **BEPUL**!

📞 Telefon orqali bog‘lanish:
+998 90 377 30 00
+998 98 571 00 67`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: locText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🍽 Menyuni ochish', web_app: { url: webAppUrl } }
          ],
          [
            { text: '📞 Qo‘ng‘iroq qilish', url: 'tel:+998903773000' }
          ]
        ]
      }
    });
    return;
  }

  // 5. Aloqa / Telefon
  if (text === '/contact' || text.includes('Aloqa') || text.includes('Telefon')) {
    const contactText =
`📞 **Faiza Cafe bilan bog‘lanish:**

Har qanday savol yoki to‘g‘ridan-to‘g‘ri telefon orqali buyurtma berish uchun:
📱 +998 (90) 377-30-00
📱 +998 (98) 571-00-67

⏰ **Ish vaqti:** Har kuni 08:00 dan 03:00 gacha
🚖 **Yetkazib berish:** Rishton bo‘ylab BEPUL!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: contactText,
      parse_mode: 'Markdown',
      reply_markup: getInlineActionKeyboard()
    });
    return;
  }

  // 6. Ish vaqti
  if (text.includes('Ish vaqti')) {
    const hoursText =
`⏰ **Ish vaqtimiz:**
Har kuni ertalab **08:00** dan tungi **03:00** gacha dam olish kunlarisiz xizmatingizdamiz! 🌙🍽️

Keling yoki bepul yetkazib berishga buyurtma bering!`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: hoursText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard()
    });
    return;
  }

  // 7. Biz haqimizda
  if (text === '/about' || text.includes('Biz haqimizda')) {
    const aboutText =
`ℹ️ **FAIZA CAFE haqida:**

2024-yilda ochilgan zamonaviy va shinam **"Faiza Cafe"** o‘zining lazzatli, halol va toza taomlari bilan Rishton ahlini va mehmonlarini xursand qilib kelmoqda.

Bizda:
✨ Oliy sifatli mol va tovuq go‘shti
✨ Faqat barra va yangi sabzavotlar
✨ O‘zgacha italyancha va sharqona retseptlar
✨ Bepul va chaqqon yetkazib berish xizmati

📍 Manzil: Rishton tumani, Milliy bank ro‘parasi
📞 +998 90 377 30 00`;

    await tg('sendMessage', {
      chat_id: chatId,
      text: aboutText,
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard()
    });
    return;
  }

  // Boshqa har qanday xabar kelganda
  await tg('sendMessage', {
    chat_id: chatId,
    text: `Buyurtma berish uchun pastdagi **"🍽 Menyu va Buyurtma berish"** tugmasini bosing yoki kerakli bo‘limni tanlang:`,
    parse_mode: 'Markdown',
    reply_markup: getMainKeyboard()
  });
}

// Long Polling Loop
let lastUpdateId = 0;
let isPolling = true;

async function startPolling() {
  console.log("==================================================");
  console.log("   FAIZA CAFE TELEGRAM BOTI ISHGA TUSHDI!        ");
  console.log("   Bot: @faizacafe_rishton_bot                    ");
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
            handleMessage(update.message).catch(e => console.error("Message handling error:", e));
          }
        }
      } else {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error("Polling loop error:", err.message);
      await new Promise(r => setTimeout(r, 3000));
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
