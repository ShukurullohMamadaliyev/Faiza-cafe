import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, RotateCcw, MapPin, ChefHat, Bike } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrdersPage() {
  const { orders, setActiveTab, addToCart, t, telegram } = useApp();
  const [orderTab, setOrderTab] = useState('active'); // 'active' | 'completed'

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  const currentList = orderTab === 'active' ? activeOrders : completedOrders;

  const handleReorder = (order) => {
    telegram.triggerHaptic('medium');
    order.items.forEach((item) => {
      // Find item details
      addToCart(
        { id: item.id, name: item.name, price: item.price, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
        item.selectedModifiers || [],
        item.quantity
      );
    });
    setActiveTab('cart');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return { label: 'Qabul qilindi', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'preparing':
        return { label: 'Oshxonada tayyorlanmoqda', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'delivering':
        return { label: 'Yetkazilmoqda (Kuryerda)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'completed':
        return { label: 'Yetkazildi', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="pb-28 min-h-screen bg-[#F8FAF9]">
      {/* Header matching screenshot 10 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={() => {
            telegram.triggerHaptic('light');
            setActiveTab('home');
          }}
          className="flex items-center gap-2 font-black text-base text-[#0d3b2e]"
        >
          <ArrowLeft size={20} />
          <span>{t.orderHistory}</span>
        </button>
      </div>

      {/* Tabs matching screenshot 10 (Faol / Yakunlangan) */}
      <div className="p-4">
        <div className="bg-gray-200/80 p-1 rounded-2xl flex items-center">
          <button
            onClick={() => {
              telegram.triggerHaptic('selection');
              setOrderTab('active');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              orderTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.activeOrders} ({activeOrders.length})
          </button>
          <button
            onClick={() => {
              telegram.triggerHaptic('selection');
              setOrderTab('completed');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              orderTab === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.completedOrders} ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Orders List / Empty State */}
      <div className="px-4 space-y-3">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 text-center flex flex-col items-center space-y-3 mt-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
              🪙
            </div>
            <h4 className="font-black text-base text-gray-900">
              {orderTab === 'active' ? t.noActiveOrders : 'Yakunlangan buyurtmalar mavjud emas'}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs">
              {t.noActiveDesc}
            </p>
          </div>
        ) : (
          currentList.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card space-y-3"
              >
                {/* Header of order */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-black text-[#0d3b2e]">
                      #{order.id}
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      {order.date}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Progress bar for active orders */}
                {orderTab === 'active' && (
                  <div className="py-1">
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      <div className="h-1.5 rounded-full bg-emerald-500"></div>
                      <div className={`h-1.5 rounded-full ${order.status === 'preparing' || order.status === 'delivering' || order.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1.5 rounded-full ${order.status === 'delivering' || order.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-0.5">
                      <span>Qabul</span>
                      <span>Oshxona</span>
                      <span>Yetkazish</span>
                      <span>Yakun</span>
                    </div>
                  </div>
                )}

                {/* Ordered Items summary */}
                <div className="space-y-1 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-semibold text-gray-900">
                        {(it.price * it.quantity).toLocaleString('uz-UZ')} so'm
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer with total & actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Jami to'lov:</span>
                    <span className="text-sm font-black text-[#0d3b2e]">
                      {order.total.toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-[#0d3b2e] rounded-xl text-xs font-bold transition border border-emerald-200"
                  >
                    <RotateCcw size={13} />
                    <span>{t.reorder}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
