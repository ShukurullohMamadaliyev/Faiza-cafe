// Vercel Serverless Function: /api/menu
// Ibrohim Ota Choyxonasi - Dinamik menyu va narxlar sinxronizatsiyasi

const token = process.env.BOT_TOKEN || '9229821218:AAGEk0sZA4W27UIw5Sbh4E2bADK6IpQZ6G8';
const groupId = process.env.ORDER_GROUP_ID || '-5370487830';
const API_BASE = `https://api.telegram.org/bot${token}`;

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
    return { ok: false, error: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Eng so'nggi menyuni olish
  if (req.method === 'GET') {
    if (inMemoryMenu) {
      return res.status(200).json({ ok: true, source: 'cache', products: inMemoryMenu });
    }

    try {
      // Telegram guruhidagi pinned xabardan menyu o'zgarishlarini tekshiramiz
      const chatInfo = await tg('getChat', { chat_id: groupId });
      const pinned = chatInfo?.result?.pinned_message?.text;
      if (pinned && pinned.startsWith('[IBROHIM_OTA_MENU_DATA]:')) {
        const jsonStr = pinned.replace('[IBROHIM_OTA_MENU_DATA]:', '').trim();
        const parsed = JSON.parse(jsonStr);
        inMemoryMenu = parsed;
        return res.status(200).json({ ok: true, source: 'telegram_db', products: parsed });
      }
    } catch (e) {
      console.warn('Telegram DB read error:', e.message);
    }

    return res.status(200).json({ ok: true, source: 'default', products: null });
  }

  // POST: Menyu va narxlarni saqlash
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const products = body.products;

      if (!Array.isArray(products)) {
        return res.status(400).json({ ok: false, error: 'products array required' });
      }

      inMemoryMenu = products;

      // Muhim o'zgarishlar (qo'shilgan/o'zgartirilgan taomlar) haqida guruhga ham xabar berish
      if (body.actionSummary) {
        await tg('sendMessage', {
          chat_id: groupId,
          text: `⚙️ *MENYU YANGILANDI:*\n${body.actionSummary}`,
          parse_mode: 'Markdown'
        });
      }

      return res.status(200).json({
        ok: true,
        message: 'Menyu muvaffaqiyatli saqlandi',
        count: products.length
      });
    } catch (err) {
      console.error('Menu save error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
