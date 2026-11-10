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
  const adminIdsStr = process.env.ADMIN_IDS || '8340079081';
  let orderGroupId = process.env.ORDER_GROUP_ID || null;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const cfgPath = path.resolve(process.cwd(), 'group_config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg?.groupId && String(cfg.groupId) !== '-1003577268173') {
        orderGroupId = cfg.groupId;
      }
    }
  } catch (e) {}

  // /tmp dagi eng so'nggi biriktirilgan guruhni ham tekshiramiz
  try {
    const fs = await import('fs');
    if (fs.existsSync('/tmp/current_group.json')) {
      const liveCfg = JSON.parse(fs.readFileSync('/tmp/current_group.json', 'utf-8'));
      if (liveCfg?.groupId) orderGroupId = liveCfg.groupId;
    }
  } catch (e) {}

  const recipients = [];
  if (orderGroupId && String(orderGroupId) !== '-1003577268173') {
    recipients.push(String(orderGroupId));
  }

  // Agar guruh hali biriktirilmagan bo'lsa, zaxira sifatida adminga yuboramiz
  if (recipients.length === 0) {
    adminIdsStr
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .forEach((id) => {
        if (!recipients.includes(id)) recipients.push(id);
      });
  }

  try {
    const order = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order data required' });
    }

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
      : 'Web-mijoz';
    const custChatId = tgUser.id || 0;

    const coords = order.coords || customerInfo.coords;
    const lat = coords?.lat || coords?.latitude;
    const lon = coords?.lon || coords?.longitude;
    const hasCoords = Boolean(lat && lon);

    let addressInfo =
      order.orderType === 'delivery'
        ? `🚗 *Yetkazib berish:* ${customerInfo.address || 'Rishton'}`
        : order.orderType === 'takeaway'
        ? `🛍 *Olib ketish:* ${customerInfo.branch || 'Ibrohim Ota Choyxonasi'}`
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

    // Admin boshqaruv tugmalari (Inline Buttons)
    const inline_keyboard = [];

    // Agar aniq lokatsiya bo'lsa xaritada ochish tugmasini yuqoriga qo'shamiz
    if (order.orderType === 'delivery' && hasCoords) {
      inline_keyboard.push([
        { text: '🗺 Xaritada ochish (Navigatsiya)', url: `https://maps.google.com/?q=${lat},${lon}` }
      ]);
    }

    inline_keyboard.push(
      [
        { text: '👨‍🍳 Qabul qilish', callback_data: `st:prep:${order.id}:${custChatId}` },
        { text: '🍳 Tayyorlanmoqda', callback_data: `st:cook:${order.id}:${custChatId}` }
      ],
      [
        { text: '🛵 Yetkazilmoqda', callback_data: `st:delv:${order.id}:${custChatId}` },
        { text: '✅ Yetkazildi', callback_data: `st:comp:${order.id}:${custChatId}` }
      ],
      [
        { text: '❌ Bekor qilish', callback_data: `st:canc:${order.id}:${custChatId}` }
      ]
    );

    // Guruh va adminga buyurtma bildirishnomasini yuborish
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

    // Agar yetkazib berish va GPS mavjud bo'lsa, Telegram orqali xaritadagi lokatsiya pinini jo'natamiz
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
      orderId: order.id,
      adminNotified: results.map((r) => ({ ok: r.ok, message_id: r.result?.message_id }))
    });
  } catch (error) {
    console.error('API /api/order error:', error);
    return res.status(500).json({ error: error.message });
  }
}
