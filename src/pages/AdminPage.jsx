import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  ChefHat,
  Bike,
  CheckCircle2,
  RotateCcw,
  LogOut,
  Lock,
  Tag,
  DollarSign,
  UtensilsCrossed,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

const PRESET_IMAGES = [
  { label: 'Osh / Palov', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { label: 'Shashlik / Kabob', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Lavash / Donar', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pitsa', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
  { label: 'Choy / Choynak', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Somsa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { label: 'Salat', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' }
];

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    productList,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    resetMenuToDefault,
    isAdminAuth,
    loginAdmin,
    logoutAdmin,
    setActiveTab,
    telegram
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('menu'); // 'menu' | 'orders'
  const [pinInput, setPinInput] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal holatlari
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Tezkor narx o'zgartirish uchun (inline edit)
  const [inlinePriceEditId, setInlinePriceEditId] = useState(null);
  const [inlinePriceValue, setInlinePriceValue] = useState('');

  // Yangi taom formasi
  const [formData, setFormData] = useState({
    name: '',
    category: 'hotdishes',
    price: '',
    description: '',
    image: PRESET_IMAGES[0].url,
    badge: 'Yangi'
  });

  // Agar admin avtorizatsiyadan o'tmagan bo'lsa, PIN-kod ekrani
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#150305] text-amber-100 flex flex-col items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm bg-[#28080b]/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
            <Lock size={30} />
          </div>

          <div>
            <h2 className="font-serif font-black text-xl text-amber-300">
              Admin Panel
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Ibrohim Ota Choyxonasi boshqaruviga kirish uchun PIN-kodni kiriting
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginAdmin(pinInput);
            }}
            className="space-y-3 pt-2"
          >
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN-kod (Masalan: 7777)"
              className="w-full text-center text-lg tracking-widest font-black py-3 px-4 rounded-xl bg-[#150305] border border-amber-500/30 text-amber-300 placeholder-stone-600 focus:outline-none focus:border-amber-400"
              autoFocus
            />

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition"
            >
              Kirish
            </button>
          </form>

          <button
            onClick={() => setActiveTab('home')}
            className="text-xs text-stone-400 hover:text-amber-300 pt-2 block mx-auto"
          >
            ← Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // Filtrlangan menyu
  const filteredMenu = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: 'hotdishes',
      price: '',
      description: '',
      image: PRESET_IMAGES[0].url,
      badge: 'Yangi'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.price || Number(formData.price) <= 0) return;

    addProduct({
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      description: formData.description.trim(),
      image: formData.image.trim(),
      badge: formData.badge
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name.trim(),
      category: editingProduct.category,
      price: Number(editingProduct.price),
      description: (editingProduct.description || '').trim(),
      image: (editingProduct.image || '').trim(),
      badge: editingProduct.badge
    });

    setEditingProduct(null);
  };

  const handleSaveInlinePrice = (productId) => {
    const newPrice = Number(inlinePriceValue);
    if (newPrice > 0) {
      updateProduct(productId, { price: newPrice });
    }
    setInlinePriceEditId(null);
    setInlinePriceValue('');
  };

  return (
    <div className="pb-32 min-h-screen bg-[#150305] text-stone-100 select-none">
      {/* Top Header */}
      <div className="bg-[#1c0507] border-b border-amber-500/20 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              setActiveTab('home');
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/20 flex items-center justify-center text-amber-300"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h2 className="font-serif font-black text-sm text-amber-300 flex items-center gap-1.5">
              <span>Ibrohim Ota Admin</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                PRO
              </span>
            </h2>
            <p className="text-[10px] text-stone-400">Menyu va taomlar boshqaruvi</p>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="text-xs bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
        >
          <LogOut size={12} />
          <span>Chiqish</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#28080b]/90 border border-amber-500/20 p-3 rounded-2xl shadow-sm">
            <span className="text-[10px] text-stone-400 font-semibold block">Taomlar</span>
            <span className="text-base font-serif font-black text-amber-300">{productList.length} ta</span>
          </div>

          <div className="bg-[#28080b]/90 border border-amber-500/20 p-3 rounded-2xl shadow-sm">
            <span className="text-[10px] text-stone-400 font-semibold block">Yangi lid</span>
            <span className="text-base font-serif font-black text-amber-400">{newOrdersCount} ta</span>
          </div>

          <div className="bg-[#28080b]/90 border border-amber-500/20 p-3 rounded-2xl shadow-sm">
            <span className="text-[10px] text-stone-400 font-semibold block">Buyurtmalar</span>
            <span className="text-base font-serif font-black text-stone-100">{orders.length} ta</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#28080b]/90 p-1 rounded-2xl border border-amber-500/20 flex gap-1">
          <button
            onClick={() => setActiveAdminTab('menu')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeAdminTab === 'menu'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed size={14} />
            <span>Menyu & Taomlar ({productList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeAdminTab === 'orders'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Buyurtmalar ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: MENU & DISHES MANAGEMENT */}
        {activeAdminTab === 'menu' && (
          <div className="space-y-3.5">
            {/* Action Bar: Add Product & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 active:scale-98 transition"
              >
                <Plus size={16} />
                <span>Yangi taom qo‘shish</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Menyuni asl standart holatiga qaytarishni xohlaysizmi?")) {
                    resetMenuToDefault();
                  }
                }}
                title="Menyuni asl holiga qaytarish"
                className="w-11 h-11 rounded-2xl bg-[#28080b] border border-amber-500/20 text-stone-400 hover:text-amber-400 flex items-center justify-center transition"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-stone-500" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Taom nomini qidiring..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#28080b]/90 border border-amber-500/20 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition flex items-center gap-1 ${
                    categoryFilter === cat.id
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-[#28080b] text-stone-400 border border-amber-500/15 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Dish Cards List */}
            <div className="space-y-2.5">
              {filteredMenu.length === 0 ? (
                <div className="p-8 text-center text-stone-500 bg-[#28080b]/50 rounded-3xl border border-amber-500/15">
                  Taomlar topilmadi
                </div>
              ) : (
                filteredMenu.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-[#28080b]/90 border rounded-2xl p-3 space-y-2.5 shadow-md transition ${
                      product.isOutOfStock
                        ? 'border-red-500/30 opacity-75'
                        : 'border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-amber-500/20 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-amber-200 truncate">
                            {product.name}
                          </h4>
                          {product.badge && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-semibold shrink-0">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {product.description && (
                          <p className="text-[10px] text-stone-400 line-clamp-1">
                            {product.description}
                          </p>
                        )}

                        {/* Inline Price Edit or Display */}
                        {inlinePriceEditId === product.id ? (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <input
                              type="number"
                              value={inlinePriceValue}
                              onChange={(e) => setInlinePriceValue(e.target.value)}
                              placeholder={String(product.price)}
                              className="w-24 px-2 py-1 bg-[#150305] border border-amber-400 rounded-lg text-xs font-bold text-amber-300 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlinePrice(product.id)}
                              className="p-1 bg-amber-500 text-stone-950 rounded-lg text-xs font-bold"
                              title="Saqlash"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setInlinePriceEditId(null)}
                              className="p-1 text-stone-400 hover:text-white"
                              title="Bekor qilish"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-xs font-black text-amber-400">
                              {product.price.toLocaleString('uz-UZ')} so‘m
                            </span>
                            <button
                              onClick={() => {
                                setInlinePriceEditId(product.id);
                                setInlinePriceValue(String(product.price));
                              }}
                              className="text-[10px] text-stone-400 hover:text-amber-300 underline flex items-center gap-0.5"
                            >
                              <Edit2 size={10} />
                              <span>Narxni o'zgartirish</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      {/* Stock Button */}
                      <button
                        onClick={() => toggleProductStock(product.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          product.isOutOfStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.isOutOfStock ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                        <span>{product.isOutOfStock ? 'Tugagan (Stop-list)' : 'Sotuvda mavjud'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 rounded-xl text-[11px] font-bold flex items-center gap-1"
                        >
                          <Edit2 size={11} />
                          <span>Tahrirlash</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`"${product.name}" taomini menyudan o'chirishni tasdiqlaysizmi?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                          title="O'chirish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS DASHBOARD */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-stone-500 bg-[#28080b]/50 rounded-3xl border border-amber-500/15">
                Hozircha buyurtmalar yo'q
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#28080b]/90 border border-amber-500/20 rounded-2xl p-3.5 space-y-2.5 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif font-black text-sm text-amber-300">
                        Buyurtma #{order.id}
                      </span>
                      <span className="text-[11px] text-stone-400 block">{order.date}</span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {order.orderTypeName || order.orderType}
                    </span>
                  </div>

                  <div className="bg-[#150305]/70 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-stone-200">
                      {order.customer?.name} • {order.customer?.phone}
                    </div>
                    {order.customer?.address && (
                      <div className="text-[11px] text-stone-400">
                        📍 {order.customer.address}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-stone-300">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-bold text-amber-300">
                          {(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400">
                      Jami: {(order.total || 0).toLocaleString('uz-UZ')} so‘m
                    </span>
                    <span className="text-xs font-bold text-stone-400">
                      {order.paymentMethod || 'Naqd'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: YANGI TAOM QO'SHISH */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#24070a] border border-amber-500/30 text-white w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-serif font-black text-base text-amber-300">
                ➕ Yangi taom qo‘shish
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Taom nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Tandir kabob, Choyxona osh..."
                  className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Narxi (so‘m) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Masalan: 55000"
                    className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="hotdishes">🍲 Milliy taomlar</option>
                    <option value="shashlik">🥩 Shashliklar</option>
                    <option value="fastfood">🍔 Fastfud</option>
                    <option value="pizza">🍕 Pitsa</option>
                    <option value="drinks_dessert">☕ Ichimliklar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Tavsifi (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masalan: Qaynoq tandirda pishirilgan xushta'm go'sht..."
                  className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Tayyor rasmlardan tanlang:
                </label>
                <div className="grid grid-cols-4 gap-1.5 pb-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setFormData({ ...formData, image: img.url })}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square transition ${
                        formData.image === img.url
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-95'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center truncate px-0.5">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="text-[11px] text-stone-400 block mb-1">
                  Yoki rasm havolasi (URL):
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Nishon (Badge)
                </label>
                <div className="flex gap-2">
                  {['Yangi', 'Xit', 'Tavsiya', 'Achchiq'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setFormData({ ...formData, badge: b })}
                      className={`px-3 py-1 text-xs rounded-lg font-bold border transition ${
                        formData.badge === b
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                          : 'bg-[#150305] text-stone-400 border-white/10'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition"
                >
                  Menyuga saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3 bg-white/5 text-stone-300 text-xs font-bold rounded-xl"
                >
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAOM VA NARXNI TAHRIRLASH */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#24070a] border border-amber-500/30 text-white w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-serif font-black text-base text-amber-300">
                ✏️ Taomni tahrirlash
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Taom nomi *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Narxi (so‘m) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="hotdishes">🍲 Milliy taomlar</option>
                    <option value="shashlik">🥩 Shashliklar</option>
                    <option value="fastfood">🍔 Fastfud</option>
                    <option value="pizza">🍕 Pitsa</option>
                    <option value="drinks_dessert">☕ Ichimliklar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Tavsifi
                </label>
                <input
                  type="text"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Rasm havolasi (URL)
                </label>
                <input
                  type="url"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition"
                >
                  O‘zgarishlarni saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-3 bg-white/5 text-stone-300 text-xs font-bold rounded-xl"
                >
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
