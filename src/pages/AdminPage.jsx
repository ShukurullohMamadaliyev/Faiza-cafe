import React, { useState, useEffect } from 'react';
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
  PhoneCall,
  RefreshCw,
  TrendingUp,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { compressImage, formatFileSize } from '../utils/imageUtils';
import ImageCropperModal from '../components/ImageCropperModal';

export default function AdminPage() {
  const {
    orders,
    adminOrders,
    adminKassaStats,
    isLoadingAdminOrders,
    fetchAdminOrders,
    updateAdminOrderStatus,
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
  const [orderPeriodFilter, setOrderPeriodFilter] = useState('today'); // 'today' | 'week' | 'all'
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
              placeholder="PIN-kod (Masalan: 2020)"
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

  // O'zbekiston vaqti bo'yicha bugungi sana (YYYY-MM-DD)
  const todayDateStr = (() => {
    const d = new Date();
    const uz = new Date(d.getTime() + (5 * 60 + d.getTimezoneOffset()) * 60000);
    return `${uz.getFullYear()}-${String(uz.getMonth() + 1).padStart(2, '0')}-${String(uz.getDate()).padStart(2, '0')}`;
  })();

  // Barcha mijozlarning buyurtmalari ro'yxati (Markaziy kassa bazasi, 7 kunlik)
  const allOrdersList = Array.isArray(adminOrders) && adminOrders.length > 0 ? adminOrders : orders;

  const todayOrders = allOrdersList.filter((o) => {
    const oDate = o.date || '';
    if (oDate.startsWith(todayDateStr)) return true;
    if (o.timestamp) {
      const d = new Date(o.timestamp);
      const uz = new Date(d.getTime() + (5 * 60 + d.getTimezoneOffset()) * 60000);
      const uzStr = `${uz.getFullYear()}-${String(uz.getMonth() + 1).padStart(2, '0')}-${String(uz.getDate()).padStart(2, '0')}`;
      return uzStr === todayDateStr;
    }
    return false;
  });

  const weekOrders = allOrdersList;

  const displayedOrders =
    orderPeriodFilter === 'today'
      ? todayOrders
      : orderPeriodFilter === 'week'
      ? weekOrders
      : allOrdersList;

  const currentPeriodTotal = displayedOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const todayKassaSum = adminKassaStats?.todayTotal || todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const weekKassaSum = adminKassaStats?.weekTotal || weekOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const newOrdersCount = allOrdersList.filter((o) => o.status === 'new').length;

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
        {/* KPI Cards: Taomlar, Bugungi Kassa, 7 Kunlik Kassa */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#28080b]/90 border border-amber-500/20 p-2.5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 font-semibold block">Taomlar</span>
            <span className="text-sm font-serif font-black text-amber-300 mt-1">{productList.length} ta</span>
            <span className="text-[9px] text-stone-500 block mt-0.5">Sotuvda faol</span>
          </div>

          <div className="bg-[#28080b]/90 border border-amber-500/25 p-2.5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-amber-300 font-semibold block">Bugungi Kassa</span>
            <span className="text-xs font-serif font-black text-amber-400 mt-1 truncate">
              {todayKassaSum.toLocaleString('uz-UZ')} so‘m
            </span>
            <span className="text-[9px] text-amber-300/80 font-bold block mt-0.5">
              {todayOrders.length} ta buyurtma
            </span>
          </div>

          <div className="bg-[#28080b]/90 border border-amber-500/20 p-2.5 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 font-semibold block">7 kunlik Kassa</span>
            <span className="text-xs font-serif font-black text-stone-100 mt-1 truncate">
              {weekKassaSum.toLocaleString('uz-UZ')} so‘m
            </span>
            <span className="text-[9px] text-stone-400 block mt-0.5">
              {weekOrders.length} ta buyurtma
            </span>
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
            onClick={() => {
              setActiveAdminTab('orders');
              fetchAdminOrders();
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeAdminTab === 'orders'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Kassa & Buyurtmalar ({todayOrders.length})</span>
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

        {/* TAB 2: ORDERS & CASHIER (KASSA) DASHBOARD */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Period Filters & Refresh Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-[#28080b]/90 border border-amber-500/20 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrderPeriodFilter('today')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    orderPeriodFilter === 'today'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Bugun ({todayOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderPeriodFilter('week')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    orderPeriodFilter === 'week'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Oxirgi 7 kun ({weekOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderPeriodFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    orderPeriodFilter === 'all'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Barchasi
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  telegram.triggerHaptic('light');
                  fetchAdminOrders();
                }}
                disabled={isLoadingAdminOrders}
                className="p-2.5 bg-[#28080b] hover:bg-[#340c10] text-amber-300 border border-amber-500/25 rounded-2xl active:scale-95 transition flex items-center justify-center shrink-0 shadow-sm"
                title="Yangilash"
              >
                <RefreshCw size={15} className={isLoadingAdminOrders ? 'animate-spin text-amber-400' : ''} />
              </button>
            </div>

            {/* Kassa Dashboard Summary Card */}
            <div className="bg-gradient-to-br from-[#30090d] via-[#24070a] to-[#1a0406] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-sm text-amber-300">
                      {orderPeriodFilter === 'today' ? 'Bugungi Kassa Tushumi' : '7 Kunlik Kassa Tushumi'}
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      {orderPeriodFilter === 'today' ? 'Bugun amalga oshirilgan buyurtmalar' : 'Oxirgi 1 haftalik barcha buyurtmalar'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-stone-400 block">Kassa summasi</span>
                  <span className="text-sm font-serif font-black text-amber-400">
                    {currentPeriodTotal.toLocaleString('uz-UZ')} so‘m
                  </span>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className="bg-[#150305]/70 border border-amber-500/15 rounded-xl p-1.5">
                  <span className="text-stone-400 block">Jami</span>
                  <span className="font-black text-stone-100 text-xs">{displayedOrders.length} ta</span>
                </div>
                <div className="bg-[#150305]/70 border border-amber-500/15 rounded-xl p-1.5">
                  <span className="text-amber-400 block">Oshxona</span>
                  <span className="font-black text-amber-300 text-xs">
                    {displayedOrders.filter((o) => o.status === 'preparing' || o.status === 'new').length} ta
                  </span>
                </div>
                <div className="bg-[#150305]/70 border border-emerald-500/20 rounded-xl p-1.5">
                  <span className="text-emerald-400 block">Yetkazildi</span>
                  <span className="font-black text-emerald-300 text-xs">
                    {displayedOrders.filter((o) => o.status === 'completed').length} ta
                  </span>
                </div>
                <div className="bg-[#150305]/70 border border-red-500/20 rounded-xl p-1.5">
                  <span className="text-red-400 block">Bekor</span>
                  <span className="font-black text-red-300 text-xs">
                    {displayedOrders.filter((o) => o.status === 'cancelled').length} ta
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                <span>⏱ 7 kundan keyin eski buyurtmalar avtomatik tozalanadi</span>
                <span className="text-amber-400/80 font-bold">Ibrohim Ota Kassa tizimi</span>
              </div>
            </div>

            {/* Orders Cards List */}
            {displayedOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-[#28080b]/50 rounded-3xl border border-amber-500/15 space-y-2">
                <span className="text-3xl block">🧾</span>
                <p className="text-xs font-bold text-amber-300">
                  {orderPeriodFilter === 'today' ? 'Bugun hali buyurtmalar tushmadi' : 'Buyurtmalar topilmadi'}
                </p>
                <p className="text-[11px] text-stone-500">
                  Mijozlar buyurtma berishi bilan bu yerda kassa hisob-kitobi va chek ko‘rinishida chiqadi.
                </p>
              </div>
            ) : (
              displayedOrders.map((order) => {
                const statusStyles = {
                  new: { label: '🟡 Yangi qabul qilindi', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                  preparing: { label: '🍳 Oshxonada tayyorlanmoqda', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
                  delivering: { label: '🛵 Yetkazilmoqda (Kuryer)', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
                  completed: { label: '✅ Yetkazildi', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                  cancelled: { label: '❌ Bekor qilindi', bg: 'bg-red-500/15 text-red-400 border-red-500/30' }
                };
                const currentStatus = statusStyles[order.status] || statusStyles.new;
                const phone = order.customer?.phone || '';

                return (
                  <div
                    key={order.id}
                    className="bg-[#28080b]/90 border border-amber-500/20 rounded-3xl p-4 space-y-3 shadow-md hover:border-amber-500/35 transition"
                  >
                    {/* Order Top: ID, Date & Type */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-sm text-amber-300">
                            Buyurtma #{order.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {order.orderTypeName || order.orderType}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{order.date}</span>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-1 rounded-xl border ${currentStatus.bg}`}>
                        {currentStatus.label}
                      </span>
                    </div>

                    {/* Customer Info Card with Direct Call Button */}
                    <div className="bg-[#150305]/75 p-3 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-100 block">
                            👤 {order.customer?.name || 'Mijoz'}
                          </span>
                          {phone && (
                            <span className="text-xs text-amber-300 font-mono block mt-0.5">
                              📞 {phone}
                            </span>
                          )}
                        </div>

                        {phone && (
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            onClick={() => telegram.triggerHaptic('medium')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition"
                          >
                            <PhoneCall size={13} />
                            <span>Qo‘ng‘iroq</span>
                          </a>
                        )}
                      </div>

                      {order.customer?.address && (
                        <div className="text-[11px] text-stone-300 flex items-start gap-1 pt-1 border-t border-white/5">
                          <MapPin size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          <span className="flex-1">{order.customer.address}</span>
                          {order.mapsUrl && (
                            <a
                              href={order.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 underline shrink-0 ml-1"
                            >
                              Xarita ↗
                            </a>
                          )}
                        </div>
                      )}

                      {order.customer?.table && (
                        <div className="text-[11px] text-amber-300 font-bold">
                          🍽 Stol: #{order.customer.table}-stol
                        </div>
                      )}

                      {order.customer?.note && (
                        <div className="text-[10px] text-stone-400 italic">
                          💬 Izoh: {order.customer.note}
                        </div>
                      )}
                    </div>

                    {/* Items List (Receipt) */}
                    <div className="space-y-1.5 text-xs bg-[#150305]/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Taomlar:
                      </span>
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-stone-300">
                          <span className="truncate pr-2">
                            <b className="text-amber-300">{it.quantity}x</b> {it.name}
                          </span>
                          <span className="font-bold text-amber-400 shrink-0">
                            {(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Payment method */}
                    <div className="pt-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Jami to‘lov:</span>
                        <span className="text-sm font-black text-amber-300">
                          {(order.total || 0).toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">To‘lov turi:</span>
                        <span className="text-xs font-bold text-stone-200">
                          💵 {order.paymentMethod || 'Naqd'}
                        </span>
                      </div>
                    </div>

                    {/* Status Action Buttons for Quick Change */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => updateAdminOrderStatus(order.id, 'preparing', 'Oshxonada tayyorlanmoqda')}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                          order.status === 'preparing'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400/30'
                            : 'bg-white/5 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        🍳 Oshxona
                      </button>

                      <button
                        type="button"
                        onClick={() => updateAdminOrderStatus(order.id, 'delivering', 'Yetkazilmoqda (Kuryerda)')}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                          order.status === 'delivering'
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400/30'
                            : 'bg-white/5 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        🛵 Kuryerda
                      </button>

                      <button
                        type="button"
                        onClick={() => updateAdminOrderStatus(order.id, 'completed', 'Yetkazildi')}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                          order.status === 'completed'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                            : 'bg-white/5 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        ✅ Yetkazildi
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Buyurtma #${order.id} ni bekor qilishni tasdiqlaysizmi?`)) {
                            updateAdminOrderStatus(order.id, 'cancelled', 'Bekor qilindi');
                          }
                        }}
                        className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition shrink-0 ${
                          order.status === 'cancelled'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        ❌ Bekor
                      </button>
                    </div>
                  </div>
                );
              })
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
