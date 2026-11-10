// Vercel Serverless Function: /api/order
// Ibrohim Ota Choyxonasi - Telegram Admin Alert

export default async function handler(req, res) {
  // CORS sozlamalari
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.BOT_TOKEN || '9229821218:AAGEk0sZA4W27UIw5Sbh4E2bADK6IpQZ6G8';
  let orderGroupId = process.env.ORDER_GROUP_ID || '-5370487830';

  try {
    const fs = await import('fs');
    const path = await import('path');
    const cfgPath = path.resolve(process.cwd(), 'group_config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg?.groupId) {
        orderGroupId = cfg.groupId;
      }
    }
  } catch (e) {}

  // Buyurtmalar FAQAT guruhning o'ziga yuboriladi
  const recipients = [String(orderGroupId)];

  try {
    const order = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order data required' });
    }

    const cleanId = String(order.id).replace(/^FC-/, '');

    // Taomlar ro‘yxati (qisqa va lo‘nda, × va = belgisi bilan)
    const itemsText = (order.items || [])
      .map(
        (it) =>
          `• ${it.name} × ${it.quantity} = ${(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m`
      )
      .join('\n');

    const customerInfo = order.customer || {};
    const tgUser = order.telegramUser || {};
    const custChatId = tgUser.id || 0;

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

    // Yetkazib berish bo'lsa manzilni qo'shamiz (Olib ketishda lokatsiya shart emas)
    if (order.orderType === 'delivery') {
      if (customerInfo.address) {
        lines.push(`📍 ${customerInfo.address}`);
      }
    }

    if (customerInfo.note) {
      lines.push(`💬 *Izoh:* _${customerInfo.note}_`);
    }

    const messageText = lines.join('\n');

    // Guruh boshqaruv tugmalari (Faqat 3 ta asosiy tugma)
    const inline_keyboard = [
      [
        { text: '🍳 Tayyorlanmoqda', callback_data: `st:cook:${cleanId}:${custChatId}` },
        { text: '✅ Yetkazib berildi', callback_data: `st:comp:${cleanId}:${custChatId}` }
      ],
      [
        { text: '❌ Bekor qilish', callback_data: `st:canc:${cleanId}:${custChatId}` }
      ]
    ];

    // Buyurtma bildirishnomasini FAQAT guruhga yuborish
    const sendPromises = recipients.map((targetId) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetId,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard }
        })
      }).then((r) => r.json())
    );

    const results = await Promise.all(sendPromises);

    // Agar yetkazib berish va GPS mavjud bo'lsa, xaritadagi lokatsiya pinini jo'natamiz (Olib ketishda shart emas)
    if (order.orderType === 'delivery' && hasCoords) {
      for (const targetId of recipients) {
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendLocation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetId,
              latitude: Number(lat),
              longitude: Number(lon)
            })
          });
        } catch (locErr) {
          console.warn('sendLocation error:', locErr);
        }
      }
    }

    return res.status(200).json({
      success: true,
      orderId: cleanId,
      adminNotified: results.map((r) => ({ ok: r.ok, message_id: r.result?.message_id }))
    });
  } catch (error) {
    console.error('API /api/order error:', error);
    return res.status(500).json({ error: error.message });
  }
}
