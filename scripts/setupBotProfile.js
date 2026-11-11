import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'https://faiza-cafe.vercel.app';

if (!token) {
  console.error("Xatolik: .env faylida BOT_TOKEN topilmadi!");
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;

async function callApi(method, data) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    return result;
  } catch (err) {
    console.error(`API Error on ${method}:`, err);
    return { ok: false, description: err.message };
  }
}

async function setup() {
  console.log("==================================================");
  console.log("   FAIZA CAFE - TELEGRAM BOT PROFILE SOZLANMOQDA  ");
  console.log("==================================================");

  // 1. Bot Nomi saqlanadi (o'zgartirilmaydi)

  // 2. Short Description (Bio / About - Botga kirmasdan oldin ko'rinadigan qism)
  const shortDesc = "Faiza Cafe (Rishton) — Mazali fastfud, pitsa, shashlik va bepul yetkazib berish! ⏰ 08:00 - 03:00 | 📞 90 377 30 00";
  const shortDescRes = await callApi('setMyShortDescription', {
    short_description: shortDesc
  });
  console.log('2. Bot Bio / Qisqa tavsifi o‘rnatildi:', shortDescRes.ok ? '✅ OK' : shortDescRes.description);

  // 3. Full Description (Start bosishdan oldingi katta ekran tavsifi)
  const fullDesc = `Xush kelibsiz! Faiza Cafe — Rishton tumanidagi eng mazali va fayzli go‘sha! 🍽️✨\n\nBu yerda siz:\n🔥 Qaynoq tandir lavashlar va sersuv burgerlar\n🍕 6 xil o‘zgacha pitsa (shu jumladan haqiqiy Qazili pitsa!)\n🥩 Cho‘g‘da pishgan shashlik va lazzatli beyti setlari\n🚖 Bepul yetkazib berish xizmati\n\n⏰ Ish vaqti: 08:00 dan tungi 03:00 gacha\n📍 Rishton tumani, Milliy bank ro‘parasi\n\n👇 Buyurtma berish uchun quyidagi Start tugmasini bosing!`;
  const descRes = await callApi('setMyDescription', {
    description: fullDesc
  });
  console.log('3. Start oldi ekran matni o‘rnatildi:', descRes.ok ? '✅ OK' : descRes.description);

  // 4. Bot Buyruqlari (Commands)
  const commandsRes = await callApi('setMyCommands', {
    commands: [
      { command: 'start', description: 'Bosh menyu va buyurtma berish 🍽' },
      { command: 'menu', description: 'Taomlar menyusi (Mini App) 📱' },
      { command: 'location', description: 'Manzil va lokatsiya 📍' },
      { command: 'contact', description: 'Aloqa va yetkazib berish 📞' },
      { command: 'about', description: 'Faiza Cafe haqida ℹ️' }
    ]
  });
  console.log('4. Bot komandalari o‘rnatildi:', commandsRes.ok ? '✅ OK' : commandsRes.description);

  // 5. Chat Menu Button (Doimiy pastki chapdagi WebApp menyu tugmasi)
  if (webAppUrl && webAppUrl.startsWith('https://')) {
    const menuBtnRes = await callApi('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🍽 Menyu',
        web_app: { url: webAppUrl }
      }
    });
    console.log('5. Telegram WebApp Menyu tugmasi ulandi:', menuBtnRes.ok ? '✅ OK' : menuBtnRes.description);
  } else {
    console.log('5. WebApp URL https bo‘lishi kerak (Hozirgi:', webAppUrl, ')');
  }

  console.log("==================================================");
  console.log("   SOZLASH YAKUNLANDI! @faizacafe_rishton_bot     ");
  console.log("==================================================");
}

setup();
