// Vercel Serverless Function: /api/setup
// Ibrohim Ota Choyxonasi - Botni 1-klikda to'liq avtomatik sozlash (Cloud setup)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  const token = process.env.BOT_TOKEN || '9229821218:AAGEk0sZA4W27UIw5Sbh4E2bADK6IpQZ6G8';
  if (!token) {
    return res.status(500).json({ ok: false, error: 'BOT_TOKEN topilmadi' });
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'faiza-cafe.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const currentBaseUrl = `${proto}://${host}`;
  const webAppUrl = process.env.WEBAPP_URL || currentBaseUrl;
  const webhookUrl = `${currentBaseUrl}/api/bot`;

  const API_BASE = `https://api.telegram.org/bot${token}`;

  async function callTg(method, body = {}) {
    try {
      const response = await fetch(`${API_BASE}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  const results = {};

  // 1. Bot haqida ma'lumot (getMe)
  results.getMe = await callTg('getMe');

  // 2. Kirishda /start bosishdan oldin chiqadigan tavsif (Description)
  const descriptionText = `Assalomu alaykum va xush kelibsiz! 🫖✨

"Ibrohim Ota Choyxonasi" — Rishton tumanidagi eng fayzli milliy taomlar, tandir kabob va shashliklar maskani!

Bu bot orqali:
🍽 Taomlar va ichimliklar menyusini ko‘rishingiz
🔥 Qaynoq tandir shashliklariga buyurtma berishingiz
🚗 O‘zingiz turgan manzilga tezkor yetkazishni tanlashingiz
📍 Choyxonamiz joylashuvi va ish vaqtini bilib olishingiz mumkin.

Boshlash uchun pastdagi "Start" tugmasini bosing! 👇`;

  results.setDescription = await callTg('setMyDescription', {
    description: descriptionText
  });

  // 3. Bot Biosi (Short Description)
  const shortDescriptionText = `Ibrohim Ota Choyxonasi rasmiy boti. Milliy taomlar, tandir shashliklar va yetkazib berish xizmati! 🫖🔥 Tel: +998 20 000 01 49`;

  results.setShortDescription = await callTg('setMyShortDescription', {
    short_description: shortDescriptionText
  });

  // 4. Pastki chap burchakdagi Telegram Mini App menyu tugmasi
  results.setChatMenuButton = await callTg('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🍽 Menyu',
      web_app: { url: webAppUrl }
    }
  });

  // 5. Bot buyruqlar menyusi (Commands)
  results.setMyCommands = await callTg('setMyCommands', {
    commands: [
      { command: 'start', description: '🫖 Botni ishga tushirish va asosiy menyu' },
      { command: 'menu', description: '🍽 Taomlar menyusini ochish (Mini App)' },
      { command: 'aloqa', description: '📞 Aloqa va telefon raqamimiz' },
      { command: 'manzil', description: '📍 Joylashuv va mo‘ljal' },
      { command: 'ishvaqti', description: '🕒 Ish vaqti ma’lumotlari' }
    ]
  });

  // 6. Webhookni Vercel serverless manziliga ulash
  results.setWebhook = await callTg('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query']
  });

  return res.status(200).json({
    ok: true,
    message: "Ibrohim Ota Choyxonasi boti muvaffaqiyatli sozlandi!",
    config: {
      botUser: results.getMe?.result?.username || null,
      webAppUrl,
      webhookUrl
    },
    results
  });
}
