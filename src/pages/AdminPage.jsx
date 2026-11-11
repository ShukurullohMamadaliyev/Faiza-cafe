import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  RotateCcw,
  LogOut,
  Lock,
  UtensilsCrossed,
  Upload,
  Camera,
  Sparkles,
  Loader2,
  Crop,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { compressImage, formatFileSize } from '../utils/imageUtils';
import ImageCropperModal from '../components/ImageCropperModal';

export default function AdminPage() {
  const {
    orders,
    productList,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    resetMenuToDefault,
    isAdmin,
    isAdminAuth,
    loginAdmin,
    logoutAdmin,
    setActiveTab,
    showToast,
    telegram
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('menu'); // 'menu' | 'orders'
  const [pinInput, setPinInput] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal holatlari
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Rasm qirqish va o'lchamini to'g'rilash holati (Cropper)
  const [isCompressing, setIsCompressing] = useState(false);
  const [cropperState, setCropperState] = useState({
    isOpen: false,
    imageSrc: '',
    isEditing: false
  });
  const [addCompressInfo, setAddCompressInfo] = useState(null);
  const [editCompressInfo, setEditCompressInfo] = useState(null);

  // Tezkor narx o'zgartirish uchun (inline edit)
  const [inlinePriceEditId, setInlinePriceEditId] = useState(null);
  const [inlinePriceValue, setInlinePriceValue] = useState('');

  // Yangi taom formasi
  const [formData, setFormData] = useState({
    name: '',
    category: 'hotdishes',
    price: '',
    description: '',
    image: '',
    badge: 'Yangi'
  });

  // Agar umuman ruxsatsiz foydalanuvchi bo'lsa (faqat botga start bosgan berilgan Telegram ID'lar kirishi mumkin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#150305] text-amber-100 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg">
          <Lock size={32} />
        </div>
        <h2 className="font-serif font-black text-lg text-amber-300">
          Kirish taqiqlangan! 🚫
        </h2>
        <p className="text-xs text-stone-400 max-w-xs">
          Ushbu boshqaruv paneli faqat Ibrohim Ota Choyxonasi maʼmuriyatiga ruxsat berilgan.
        </p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition"
        >
          ← Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

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

  // Galereyadan rasm tanlash va qirqish oynasini ochish
  const handleImageFileSelect = (e, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    telegram.triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setCropperState({
          isOpen: true,
          imageSrc: dataUrl,
          isEditing
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Qirqilgan va to'g'rilangan rasmni qabul qilish
  const handleCropperApply = (croppedDataUrl, infoText) => {
    if (cropperState.isEditing) {
      setEditingProduct((prev) => ({ ...prev, image: croppedDataUrl }));
      setEditCompressInfo(infoText);
    } else {
      setFormData((prev) => ({ ...prev, image: croppedDataUrl }));
      setAddCompressInfo(infoText);
    }
    setCropperState({ isOpen: false, imageSrc: '', isEditing: false });
    telegram.triggerHaptic('success');
    showToast('Rasm o‘lchami muvaffaqiyatli moslashtirildi! ✨');
  };

  // Mavjud rasm o'lchamini qayta to'g'rilash (Cropper ni qayta ochish)
  const handleReopenCropper = (imageSrc, isEditing = false) => {
    if (!imageSrc) return;
    setCropperState({
      isOpen: true,
      imageSrc,
      isEditing
    });
    telegram.triggerHaptic('light');
  };

  // Filtrlangan menyu
  const filteredMenu = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: 'hotdishes',
      price: '',
      description: '',
      image: '',
      badge: 'Yangi'
    });
    setAddCompressInfo(null);
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
      badge: editingProduct.badge,
      isOutOfStock: Boolean(editingProduct.isOutOfStock)
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
                  if (window.confirm('Menyuni asl standart holatiga qaytarishni xohlaysizmi?')) {
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

            {/* Quick Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>Jami: <b className="text-amber-300">{filteredMenu.length}</b> ta taom</span>
              {productList.some((p) => p.isOutOfStock) && (
                <span className="text-red-400 font-bold flex items-center gap-1 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span>{productList.filter((p) => p.isOutOfStock).length} ta taom tugagan</span>
                </span>
              )}
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
                    className={`border rounded-2xl p-3 space-y-2.5 shadow-md transition ${
                      product.isOutOfStock
                        ? 'bg-[#220609] border-red-500/50 shadow-red-950/20'
                        : 'bg-[#28080b]/90 border-amber-500/20'
                    }`}
                  >
                    {/* Buguncha tugagan ogohlantirish banneri */}
                    {product.isOutOfStock && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          <span>Buguncha bu taomimiz tugadi</span>
                        </span>
                        <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-wider shadow-sm">
                          Tugagan
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-16 h-16 rounded-xl object-cover border shrink-0 transition ${
                          product.isOutOfStock
                            ? 'border-red-500/30 grayscale brightness-75'
                            : 'border-amber-500/20'
                        }`}
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${product.isOutOfStock ? 'text-stone-400 line-through decoration-red-500/60' : 'text-amber-200'}`}>
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
                              <span>Narxni o‘zgartirish</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      {/* Tugadi / Sotuvda bor qilish Button */}
                      <button
                        type="button"
                        onClick={() => toggleProductStock(product.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-sm ${
                          product.isOutOfStock
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 ring-2 ring-emerald-500/20'
                            : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/35 hover:border-red-500/50'
                        }`}
                        title={product.isOutOfStock ? "Sotuvda mavjud deb belgilash" : "Ushbu taomni buguncha tugadi deb belgilash"}
                      >
                        {product.isOutOfStock ? (
                          <>
                            <Check size={13} strokeWidth={3} className="text-white" />
                            <span>Sotuvda bor qilish</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            <span>Tugadi</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditCompressInfo(null);
                          }}
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
                      <div className="text-[11px] text-stone-400">📍 {order.customer.address}</div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-stone-300">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
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
          <div className="bg-[#24070a] border border-amber-500/30 text-white w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
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

            <form onSubmit={handleSaveNewProduct} className="space-y-3.5">
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
                    <option value="drinks_dessert">☕ Ichimliklar</option>
                    <option value="salads">🥗 Salatlar va Non</option>
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

              {/* Rasm qo'shish qismi: Galereyadan yuklash + Smart siqish */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Taom rasmi *</span>
                  {isCompressing && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse">
                      <Loader2 size={11} className="animate-spin" />
                      <span>Sifatli siqilmoqda...</span>
                    </span>
                  )}
                </label>

                {/* Tanlangan rasm ko'rinishi */}
                {formData.image ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#150305] aspect-video flex items-center justify-center shadow-inner">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end justify-between p-2.5">
                        {addCompressInfo ? (
                          <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                            <Sparkles size={11} />
                            <span>{addCompressInfo}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-300 bg-black/60 px-2 py-0.5 rounded-md">
                            Tanlangan rasm
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReopenCropper(formData.image, false)}
                            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition"
                            title="Barmog'ingiz bilan surish va yaqinlashtirish"
                          >
                            <Crop size={13} />
                            <span>Moslash</span>
                          </button>

                          <label className="cursor-pointer text-xs font-bold bg-stone-900/90 hover:bg-stone-900 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition">
                            <Camera size={13} />
                            <span>Boshqa rasm</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileSelect(e, false)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-400/80 flex items-center gap-1 px-1">
                      <span>💡 <b>«Moslash»</b> tugmasi orqali rasmni qo'lda surib, yaqinlashtirib to'g'rilashingiz mumkin</span>
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-[#150305]/60 hover:bg-[#150305] transition active:scale-98">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Upload size={22} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-amber-300 block">
                        📷 Telefon galereyasidan rasm tanlang
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Tanlangandan so'ng barmog'ingiz bilan surib, to'g'rilashingiz mumkin
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileSelect(e, false)}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Galereyadan yangi rasm tanlash tugmasi */}
                <label className="w-full py-2.5 px-3 bg-[#150305] hover:bg-[#1c0507] border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 shadow-sm">
                  <Camera size={15} />
                  <span>Galereyadan yangi rasm yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileSelect(e, false)}
                    className="hidden"
                  />
                </label>
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
                  disabled={isCompressing}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50"
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
          <div className="bg-[#24070a] border border-amber-500/30 text-white w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
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

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5">
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
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="hotdishes">🍲 Milliy taomlar</option>
                    <option value="shashlik">🥩 Shashliklar</option>
                    <option value="fastfood">🍔 Fastfud</option>
                    <option value="drinks_dessert">☕ Ichimliklar</option>
                    <option value="salads">🥗 Salatlar va Non</option>
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
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#150305] border border-amber-500/20 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Taom holati: Sotuvda mavjud yoki Buguncha tugagan */}
              <div className="pt-1">
                <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                  Taom holati
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, isOutOfStock: false })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      !editingProduct.isOutOfStock
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-[#150305] border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Sotuvda mavjud</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, isOutOfStock: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      editingProduct.isOutOfStock
                        ? 'bg-red-500/25 border-red-500/60 text-red-300 shadow-sm'
                        : 'bg-[#150305] border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>Buguncha tugadi</span>
                  </button>
                </div>
              </div>

              {/* Rasm tahrirlash: Galereyadan yuklash */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Taom rasmi</span>
                  {isCompressing && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse">
                      <Loader2 size={11} className="animate-spin" />
                      <span>Sifatli siqilmoqda...</span>
                    </span>
                  )}
                </label>

                {editingProduct.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#150305] aspect-video flex items-center justify-center">
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end justify-between p-2.5">
                      {editCompressInfo && (
                        <span className="text-[10px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>{editCompressInfo}</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleReopenCropper(editingProduct.image, true)}
                          className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition"
                          title="Barmog'ingiz bilan surish va yaqinlashtirish"
                        >
                          <Crop size={13} />
                          <span>Moslash</span>
                        </button>

                        <label className="cursor-pointer text-xs font-bold bg-stone-900/90 hover:bg-stone-900 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition">
                          <Camera size={13} />
                          <span>Almashtirish</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileSelect(e, true)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <label className="w-full py-2.5 px-3 bg-[#150305] hover:bg-[#1c0507] border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 shadow-sm">
                  <Camera size={15} />
                  <span>Galereyadan yangi rasm yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileSelect(e, true)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50"
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

      {/* Interaktiv rasm qirqish, surish va yaqinlashtirish oynasi (Cropper Modal) */}
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        onApply={handleCropperApply}
        onCancel={() => setCropperState({ isOpen: false, imageSrc: '', isEditing: false })}
        aspectRatio={16 / 9}
      />
    </div>
  );
}
