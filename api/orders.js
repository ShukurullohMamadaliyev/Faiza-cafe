// Vercel Serverless Function: /api/orders
// Ibrohim Ota Choyxonasi - Centralized Orders & Kassa Management API

import {
  loadOrdersFromCloud,
  saveOrdersToCloud,
  addOrderToDb,
  updateOrderStatusInDb,
  calculateKassaStats
} from './ordersDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Barcha 7 kunlik buyurtmalar va kassa statistikasini olish
  if (req.method === 'GET') {
    try {
      const orders = await loadOrdersFromCloud();
      const stats = calculateKassaStats(orders);
      return res.status(200).json({
        ok: true,
        orders,
        stats
      });
    } catch (err) {
      console.error('GET /api/orders error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST: Buyurtma holatini yangilash yoki yangi buyurtma qo'shish
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const action = body?.action || 'update_status';

      if (action === 'update_status') {
        const { orderId, status, statusText } = body;
        if (!orderId || !status) {
          return res.status(400).json({ ok: false, error: 'orderId and status required' });
        }
        const result = await updateOrderStatusInDb(orderId, status, statusText);
        const stats = calculateKassaStats(result.orders);
        return res.status(200).json({
          ok: true,
          message: 'Holat yangilandi',
          orders: result.orders,
          stats
        });
      }

      if (action === 'create') {
        const order = body?.order;
        if (!order || !order.id) {
          return res.status(400).json({ ok: false, error: 'order object required' });
        }
        const updatedOrders = await addOrderToDb(order);
        const stats = calculateKassaStats(updatedOrders);
        return res.status(200).json({
          ok: true,
          message: 'Buyurtma saqlandi',
          orders: updatedOrders,
          stats
        });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    } catch (err) {
      console.error('POST /api/orders error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
