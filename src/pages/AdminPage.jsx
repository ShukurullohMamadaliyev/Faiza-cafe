import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Bike, CheckCircle2, Clock, PackageCheck, AlertCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    productList,
    toggleProductStock,
    setActiveTab,
    telegram
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'menu'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'new' | 'preparing' | 'delivering' | 'completed'
  const [menuSearch, setMenuSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const filteredMenu = productList.filter((p) =>
    p.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="pb-28 min-h-screen bg-slate-900 text-slate-100">
      {/* Admin Top Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              setActiveTab('home');
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-black text-sm text-white flex items-center gap-1.5">
              <span>Ibrohim Ota Choyxonasi Admin</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                v1.0
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Buyurtmalar va Oshxona boshqaruvi</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
        >
          Mijoz ko'rinishi
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-semibold block">Yangi</span>
            <span className="text-lg font-black text-amber-400">{newOrdersCount}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-semibold block">Jami</span>
            <span className="text-lg font-black text-white">{orders.length}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-semibold block">Tushum</span>
            <span className="text-xs font-black text-red-400 truncate block mt-1">
              {(totalRevenue / 1000).toFixed(0)}k so'm
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-800 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeAdminTab === 'orders'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buyurtmalar ({orders.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('menu')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeAdminTab === 'menu'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Menyu va Mahsulotlar ({productList.length})
          </button>
        </div>

        {/* TAB 1: ORDERS DASHBOARD */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'new', label: 'Yangi' },
                { id: 'preparing', label: 'Oshxonada' },
                { id: 'delivering', label: 'Yo‘lda' },
                { id: 'completed', label: 'Yakunlangan' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    orderFilter === f.id
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders Cards List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-800/40 rounded-3xl border border-slate-800">
                  Ushbu statusda buyurtmalar yo'q
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">#{order.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                            {order.orderTypeName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{order.date}</span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          order.status === 'new'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : order.status === 'preparing'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : order.status === 'delivering'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {order.statusText}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div className="bg-slate-900/70 p-3 rounded-2xl text-xs space-y-1">
                      <div className="font-bold text-slate-200">
                        {order.customer.name} • {order.customer.phone}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {order.orderType === 'delivery'
                          ? `📍 ${order.customer.address}`
                          : order.orderType === 'takeaway'
                          ? `🛍️ ${order.customer.branch}`
                          : `🍽️ ${order.customer.table}-stol`}
                      </div>
                      {order.customer.note && (
                        <div className="text-amber-400 text-[11px] font-medium">
                          Izoh: "{order.customer.note}"
                        </div>
                      )}
                      {(order.coords || order.customer?.coords || order.mapsUrl) && (
                        <div className="pt-1.5 flex items-center gap-2">
                          <a
                            href={
                              order.mapsUrl ||
                              `https://maps.google.com/?q=${(order.coords || order.customer?.coords)?.lat || (order.coords || order.customer?.coords)?.latitude},${(order.coords || order.customer?.coords)?.lon || (order.coords || order.customer?.coords)?.longitude}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-[11px] font-bold transition"
                          >
                            <span>🗺️ Xaritada ko‘rish (GPS Navigatsiya)</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-bold text-white">
                            {(it.price * it.quantity).toLocaleString('uz-UZ')} so'm
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons to advance status */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-red-400">
                        Jami: {order.total.toLocaleString('uz-UZ')} so'm
                      </span>

                      <div className="flex gap-1.5">
                        {order.status === 'new' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <ChefHat size={13} />
                            <span>Oshxonaga</span>
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivering')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <Bike size={13} />
                            <span>Yetkazishga</span>
                          </button>
                        )}

                        {order.status === 'delivering' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Yakunlash</span>
                          </button>
                        )}

                        {order.status === 'completed' && (
                          <span className="text-[11px] text-slate-500 font-semibold py-1">
                            ✓ Bajarilgan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MENU & STOCK MANAGEMENT */}
        {activeAdminTab === 'menu' && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Taom nomini qidiring..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              {filteredMenu.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800/90 border border-slate-700/60 p-3 rounded-2xl flex items-center justify-between gap-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">
                      {product.name}
                    </h5>
                    <span className="text-xs font-semibold text-red-400">
                      {product.price.toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>

                  {/* Stock Toggle Button */}
                  <button
                    onClick={() => toggleProductStock(product.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      product.isOutOfStock
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <span>{product.isOutOfStock ? 'Tugagan' : 'Mavjud'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
