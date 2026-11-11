import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS, BRANCHES, INITIAL_ORDERS } from '../data/mockData';
import { translations } from '../data/translations';
import { useTelegram } from '../hooks/useTelegram';
import { getCurrentCoordinates, reverseGeocode } from '../utils/geoUtils';
import confetti from 'canvas-confetti';

export const ADMIN_IDS = ['7048168954', '8340079081'];

const AppContext = createContext();

export function AppProvider({ children }) {
  const telegram = useTelegram();
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ibrohim_ota_lang') || 'uz';
    }
    return 'uz';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibrohim_ota_lang', newLang);
    }
  };

  const t = translations[lang] || translations.uz;

  // User Profile: Telefon raqami va Ism
  const [userPhone, setUserPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('phone');
      if (p && p !== '+998 90 377 30 00' && p !== '+998903773000') {
        localStorage.setItem('ibrohim_ota_user_phone', p);
        return p;
      }
      const stored = localStorage.getItem('ibrohim_ota_user_phone');
      if (stored === '+998 90 377 30 00' || stored === '+998903773000') {
        localStorage.removeItem('ibrohim_ota_user_phone');
        return '';
      }
      return stored || '';
    }
    return '';
  });

  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      const n = new URLSearchParams(window.location.search).get('name');
      if (n) {
        localStorage.setItem('ibrohim_ota_user_name', n);
        return n;
      }
      const stored = localStorage.getItem('ibrohim_ota_user_name');
      if (stored) return stored;
    }
    return telegram.user?.first_name || 'Mijoz';
  });

  // Qo'shimcha telefon raqami (Ixtiyoriy)
  const [secondaryPhone, setSecondaryPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ibrohim_ota_secondary_phone') || '';
    }
    return '';
  });

  const updateSecondaryPhone = (phone) => {
    setSecondaryPhone(phone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibrohim_ota_secondary_phone', phone);
    }
  };

  // Active view tab
  const [activeTab, setActiveTab] = useState('home');

  // Order Delivery Settings
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway' | 'dineIn'
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [tableNumber, setTableNumber] = useState('5');

  // Geolocation & Delivery Address
  const savedAddress = typeof window !== 'undefined' ? localStorage.getItem('ibrohim_ota_address') : null;
  const savedCoords = typeof window !== 'undefined' && localStorage.getItem('ibrohim_ota_coords')
    ? JSON.parse(localStorage.getItem('ibrohim_ota_coords'))
    : null;

  const [deliveryAddress, setDeliveryAddress] = useState(savedAddress || "");
  const [userCoords, setUserCoords] = useState(savedCoords);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const updateDeliveryAddress = (newAddr, newCoords = null) => {
    const trimmed = (newAddr || '').trim();
    setDeliveryAddress(trimmed);
    if (newCoords) {
      setUserCoords(newCoords);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibrohim_ota_address', trimmed);
      if (newCoords) {
        localStorage.setItem('ibrohim_ota_coords', JSON.stringify(newCoords));
      }
    }
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart: [{ cartId, product, selectedModifiers, quantity, unitPrice, totalPrice }]
  const [cart, setCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(['hd-osh-choyxona', 'sh-polvon-qiyma']);

  // Modals & Bottom Sheets
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Orders State - LocalStorage bilan doimiy sinxronlash (mock ma'lumotlarsiz)
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ibrohim_ota_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (o) => o.id !== 'FC-9142' && o.id !== 'FC-8851' && o.customer?.name !== 'Sherzodbek'
            );
            return cleaned;
          }
        }
      } catch (e) {
        console.warn('Failed to parse orders:', e);
      }
    }
    return [];
  });

  // Orders o'zgarganda LocalStorage ga saqlash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ibrohim_ota_orders', JSON.stringify(orders));
      } catch (e) {
        console.warn('Failed to save orders:', e);
      }
    }
  }, [orders]);

  // Admin Kassa & Barcha mijozlar buyurtmalari (Markaziy bulutli baza, 7 kunlik doimiy saqlash)
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminKassaStats, setAdminKassaStats] = useState({
    todayCount: 0,
    todayTotal: 0,
    todayCompletedTotal: 0,
    weekCount: 0,
    weekTotal: 0,
    newCount: 0
  });
  const [isLoadingAdminOrders, setIsLoadingAdminOrders] = useState(false);

  const fetchAdminOrders = useCallback(async () => {
    try {
      setIsLoadingAdminOrders(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.ok && Array.isArray(data.orders)) {
        setAdminOrders(data.orders);
        if (data.stats) setAdminKassaStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch admin orders:', err);
    } finally {
      setIsLoadingAdminOrders(false);
    }
  }, []);

  const updateAdminOrderStatus = async (orderId, newStatus, statusText) => {
    telegram.triggerHaptic('medium');
    setAdminOrders((prev) =>
      prev.map((o) =>
        String(o.id) === String(orderId) ? { ...o, status: newStatus, statusText: statusText || newStatus } : o
      )
    );
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId, status: newStatus, statusText })
      });
      const data = await res.json();
      if (data.ok && data.stats) {
        setAdminKassaStats(data.stats);
      }
    } catch (e) {}
    if (newStatus === 'returned' || newStatus === 'vozvrat') {
      showToast(`Buyurtma #${orderId} vozvrat qilindi va kassadan ayrildi 🔄`);
    } else {
      showToast(`Buyurtma #${orderId} holati: ${statusText || newStatus}`);
    }
  };

  // Admin Products state (LocalStorage va Cloud Menu bilan)
  const [productList, setProductList] = useState(() => {
    let list = PRODUCTS;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ibrohim_ota_menu_custom');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        }
      } catch (e) {}
    }
    // Yangi tabiiy taom rasmlarini avtomatik biriktirish
    return list.map((item) => {
      const defaultMatch = PRODUCTS.find((p) => p.id === item.id);
      if (defaultMatch && (!item.image || item.image.includes('unsplash.com') || !item.image.startsWith('/images/'))) {
        return { ...item, image: defaultMatch.image };
      }
      return item;
    });
  });

  // Admin tekshiruvi: faqat ruxsat etilgan Telegram ID'lar (7048168954 va 8340079081)
  const isAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const currentUserId = String(
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
      telegram.user?.id ||
      ''
    );
    return Boolean(currentUserId && ADMIN_IDS.includes(currentUserId));
  }, [telegram.user?.id]);

  // Admin autentifikatsiyasi
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    if (typeof window === 'undefined') return false;
    const currentId = String(
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
      telegram.user?.id ||
      ''
    );
    return Boolean(currentId && ADMIN_IDS.includes(currentId));
  });

  const loginAdmin = (pin) => {
    if (!isAdmin) {
      showToast("Sizda admin ruxsati mavjud emas! 🚫");
      return false;
    }
    const cleanPin = (pin || '').trim();
    if (cleanPin === '2020' || cleanPin === '7777' || cleanPin === '1234' || ADMIN_IDS.includes(cleanPin)) {
      setIsAdminAuth(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ibrohim_is_admin', 'true');
      }
      telegram.triggerHaptic('success');
      showToast('Admin panelga xush kelibsiz! 👑');
      return true;
    }
    telegram.triggerHaptic('warning');
    showToast("Noto‘g‘ri PIN-kod! (PIN: 2020)");
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuth(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ibrohim_is_admin');
    }
    setActiveTab('home');
    showToast('Admin paneldan chiqildi');
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // GPS orqali manzilni tezkor va aniq aniqlash funksiyasi
  const detectAndSetLocation = async (silent = false) => {
    setIsDetectingLocation(true);
    if (!silent) telegram.triggerHaptic('medium');

    try {
      const coords = await getCurrentCoordinates();
      const geoResult = await reverseGeocode(coords.latitude, coords.longitude);

      const detectedAddr = geoResult.formattedAddress;
      const normalizedCoords = {
        lat: Number(coords.latitude),
        lon: Number(coords.longitude),
        latitude: Number(coords.latitude),
        longitude: Number(coords.longitude)
      };

      setDeliveryAddress(detectedAddr);
      setUserCoords(normalizedCoords);

      if (typeof window !== 'undefined') {
        localStorage.setItem('ibrohim_ota_address', detectedAddr);
        localStorage.setItem('ibrohim_ota_coords', JSON.stringify(normalizedCoords));
      }

      setShowLocationPrompt(false);
      telegram.triggerHaptic('success');
      showToast(`📍 Manzil aniqlandi: ${detectedAddr}`);
      return { success: true, address: detectedAddr, coords: normalizedCoords };
    } catch (err) {
      console.warn("GPS xatoligi:", err);
      if (!silent) {
        telegram.triggerHaptic('warning');
        showToast(err.message || "GPS orqali manzilni aniqlab bo'lmadi");
      }
      return { success: false, error: err.message };
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Ilova ochilganda URL parametrlari (admin, tab, order status) va GPS tekshirish
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const adminParam = params.get('admin');
      const phoneParam = params.get('phone');
      const nameParam = params.get('name');
      const updateOrderId = params.get('updateOrder') || params.get('orderId');
      const updateStatus = params.get('status');

      if (phoneParam) {
        setUserPhone(phoneParam);
        localStorage.setItem('ibrohim_ota_user_phone', phoneParam);
      }
      if (nameParam) {
        setUserName(nameParam);
        localStorage.setItem('ibrohim_ota_user_name', nameParam);
      }

      if (!isAdmin) {
        localStorage.removeItem('ibrohim_is_admin');
      }

      if (tabParam) {
        setActiveTab(tabParam);
      }

      // Agar buyurtma holati URL orqali yangilansa (masalan: Yetkazildi)
      if (updateOrderId && updateStatus) {
        const cleanId = updateOrderId.replace(/^#/, '');
        setOrders((prev) => {
          return prev.map((ord) => {
            const matchId = (ord.id || '').replace(/^#/, '');
            if (matchId === cleanId) {
              const statusTextMap = {
                preparing: 'Oshxonada tayyorlanmoqda',
                delivering: 'Yetkazilmoqda (Kuryerda)',
                completed: 'Yetkazildi',
                cancelled: 'Bekor qilindi'
              };
              return {
                ...ord,
                status: updateStatus,
                statusText: statusTextMap[updateStatus] || updateStatus
              };
            }
            return ord;
          });
        });

        if (tabParam === 'orders' || !tabParam) {
          setActiveTab('orders');
        }

        showToast(
          `Buyurtma #${cleanId}: ${updateStatus === 'completed' ? 'Yetkazildi ✅' : updateStatus}`
        );
      }
    }

    // Agar Telegram ID bo'lsa va raqam hali yuklanmagan bo'lsa, serverdan tekshirish
    if (telegram.user?.id && !userPhone) {
      fetch(`/api/user?id=${telegram.user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.user?.phone) {
            setUserPhone(data.user.phone);
            localStorage.setItem('ibrohim_ota_user_phone', data.user.phone);
          }
          if (data?.user?.name) {
            setUserName(data.user.name);
            localStorage.setItem('ibrohim_ota_user_name', data.user.name);
          }
        })
        .catch(() => {});
    }

    // Bulutli menyu bazasini serverdan (/api/menu) yuklash - har bir mijoz uchun eng yangi menyu
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.products) && data.products.length > 0) {
          const cleanProducts = data.products.map((item) => {
            const defaultMatch = PRODUCTS.find((p) => p.id === item.id);
            if (defaultMatch && (!item.image || item.image.includes('unsplash.com') || !item.image.startsWith('/images/'))) {
              return { ...item, image: defaultMatch.image };
            }
            return item;
          });
          setProductList(cleanProducts);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ibrohim_ota_menu_custom', JSON.stringify(cleanProducts));
            } catch (e) {}
          }
        }
      })
      .catch((err) => {
        console.warn('Bulutli menyuni yuklashda xatolik:', err);
      });

    // Markaziy kassa buyurtmalarini yuklash
    fetchAdminOrders();

    if (!savedAddress) {
      // Birinchi marta kirganda 500ms kutib avtomatik GPS ruxsatini so'raymiz
      const timer = setTimeout(() => {
        detectAndSetLocation(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Ibrohim Ota Choyxonasi'da Rishton bo'ylab yetkazib berish BEPUL!
  const deliveryFee = 0;

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') {
      return Math.round((cartSubtotal * appliedPromo.value) / 100);
    }
    return appliedPromo.value || 0;
  }, [appliedPromo, cartSubtotal]);

  const cartTotal = useMemo(() => {
    const raw = cartSubtotal + deliveryFee - discountAmount;
    return raw > 0 ? raw : 0;
  }, [cartSubtotal, deliveryFee, discountAmount]);

  // Cart Actions
  const addToCart = (product, selectedModifiers = [], quantity = 1) => {
    if (product.isOutOfStock) {
      telegram.triggerHaptic('warning');
      showToast(`Kechirasiz, "${product.name}" buguncha tugadi! 😔`);
      return;
    }
    telegram.triggerHaptic('medium');
    const modifiersTotal = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = product.price + modifiersTotal;
    const sortedModIds = [...selectedModifiers].map(m => m.id).sort().join('_');
    const cartItemId = `${product.id}-${sortedModIds}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice
        };
        return next;
      } else {
        return [
          ...prev,
          {
            cartId: cartItemId,
            product,
            selectedModifiers,
            unitPrice,
            quantity,
            totalPrice: quantity * unitPrice
          }
        ];
      }
    });

    showToast(`"${product.name}" savatga qo'shildi!`);
  };

  const updateCartItemQuantity = (cartId, delta) => {
    telegram.triggerHaptic('light');
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeCartItem = (cartId) => {
    telegram.triggerHaptic('warning');
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    telegram.triggerHaptic('warning');
    setCart([]);
    setAppliedPromo(null);
  };

  const getProductCartCount = (productId) => {
    return cart
      .filter(item => item.product.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const quickAddToCart = (product) => {
    if (product.isOutOfStock) {
      telegram.triggerHaptic('warning');
      showToast(`Kechirasiz, "${product.name}" buguncha tugadi! 😔`);
      return;
    }
    if (product.modifiers && product.modifiers.length > 0) {
      setSelectedProduct(product);
    } else {
      addToCart(product, [], 1);
    }
  };

  const quickDecrement = (productId) => {
    telegram.triggerHaptic('light');
    setCart(prev => {
      const match = prev.find(item => item.product.id === productId);
      if (!match) return prev;
      if (match.quantity <= 1) {
        return prev.filter(item => item.cartId !== match.cartId);
      }
      return prev.map(item => {
        if (item.cartId === match.cartId) {
          const newQty = item.quantity - 1;
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        }
        return item;
      });
    });
  };

  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation();
    telegram.triggerHaptic('selection');
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'IBROHIM10' || cleanCode === 'XUSH_KELIBSIZ') {
      setAppliedPromo({ code: cleanCode, type: 'percent', value: 10, label: '10% chegirma' });
      showToast('10% lik maxsus chegirma qo‘llanildi! 🎉');
      return { success: true, message: '10% chegirma qo‘llandi!' };
    } else if (cleanCode === 'IBROHIM20K') {
      setAppliedPromo({ code: cleanCode, type: 'fixed', value: 20000, label: '20 000 so‘m' });
      showToast('20 000 so‘m chegirma qo‘llanildi! 🎉');
      return { success: true, message: '20 000 so‘m chegirma!' };
    } else {
      showToast('Bunday promokod topilmadi');
      return { success: false, message: 'Yaroqsiz promokod' };
    }
  };

  const submitOrder = (customerDetails) => {
    // Tugagan taomlar savatda qolib ketgan bo'lsa tekshirish
    const outOfStockItem = cart.find((item) => {
      const live = productList.find((p) => p.id === item.product.id);
      return (live && live.isOutOfStock) || item.product.isOutOfStock;
    });

    if (outOfStockItem) {
      telegram.triggerHaptic('warning');
      showToast(`Kechirasiz, "${outOfStockItem.product.name}" tugab qolgan! Iltimos, savatdan o'chiring.`);
      return false;
    }

    telegram.triggerHaptic('success');

    let nextNum = 1;
    try {
      const storedCount = localStorage.getItem('ibrohim_ota_order_seq');
      if (storedCount) {
        nextNum = parseInt(storedCount, 10) + 1;
      } else if (orders && orders.length > 0) {
        nextNum = orders.length + 1;
      }
    } catch (e) {
      nextNum = (orders && orders.length > 0) ? orders.length + 1 : 1;
    }
    try {
      localStorage.setItem('ibrohim_ota_order_seq', String(nextNum));
    } catch (e) {}

    const newOrderId = String(nextNum);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const finalCoords = customerDetails.coords || userCoords;
    const lat = finalCoords?.lat || finalCoords?.latitude;
    const lon = finalCoords?.lon || finalCoords?.longitude;
    const validCoords = (lat && lon) ? {
      lat: Number(lat),
      lon: Number(lon),
      latitude: Number(lat),
      longitude: Number(lon)
    } : null;
    const mapsUrl = validCoords ? `https://maps.google.com/?q=${validCoords.lat},${validCoords.lon}` : null;

    const newOrder = {
      id: newOrderId,
      date: dateStr,
      status: 'new',
      statusText: 'Qabul qilindi',
      orderType,
      orderTypeName: orderType === 'delivery' ? 'Yetkazib berish' : orderType === 'takeaway' ? 'Olib ketish' : 'Stolda',
      coords: validCoords,
      mapsUrl,
      telegramUser: {
        id: telegram.user?.id || null,
        first_name: telegram.user?.first_name || '',
        username: telegram.user?.username || ''
      },
      customer: {
        name: customerDetails.name || userName || telegram.user?.first_name || 'Mijoz',
        phone: customerDetails.phone || userPhone || '',
        secondaryPhone: customerDetails.secondaryPhone || secondaryPhone || undefined,
        address: orderType === 'delivery' ? customerDetails.address || deliveryAddress : undefined,
        coords: validCoords,
        mapsUrl,
        branch: orderType === 'takeaway' ? selectedBranch.name : undefined,
        table: orderType === 'dineIn' ? customerDetails.table || tableNumber : undefined,
        note: customerDetails.note || ''
      },
      paymentMethod: customerDetails.paymentMethod || 'Naqd',
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.unitPrice,
        selectedModifiers: item.selectedModifiers
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      discount: discountAmount,
      total: cartTotal,
      estimatedTime: '25-35 daqiqa'
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setIsCheckoutOpen(false);
    clearCart();

    // Serverless API orqali Admin (8340079081)ga buyurtma yuborish va kassa bazasiga saqlash
    try {
      fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch((err) => console.warn('Order API error:', err));

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', order: newOrder })
      }).catch(() => {});
    } catch (e) {
      console.warn('Order API fetch error:', e);
    }

    // Telegram botga WebApp orqali buyurtma yuborish (agar bot klaviaturadan ochilgan bo'lsa)
    if (telegram.tg?.sendData) {
      try {
        telegram.tg.sendData(JSON.stringify(newOrder));
      } catch (e) {
        console.warn("Telegram sendData xatoligi:", e);
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti not available', e);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    telegram.triggerHaptic('medium');
    const statusLabels = {
      new: 'Qabul qilindi',
      preparing: 'Oshxonada tayyorlanmoqda',
      delivering: 'Yetkazilmoqda',
      completed: 'Yakunlandi',
      cancelled: 'Bekor qilindi'
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusText: statusLabels[newStatus] || newStatus
        };
      }
      return o;
    }));
    showToast(`Buyurtma #${orderId} holati: ${statusLabels[newStatus]}`);
  };

  const syncMenuToServer = (newMenu, actionSummary = '') => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ibrohim_ota_menu_custom', JSON.stringify(newMenu));
      } catch (e) {}
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newMenu, actionSummary })
      }).catch(() => {});
    }
  };

  const addProduct = (productData) => {
    const newId = `dish-${Date.now()}`;
    const product = {
      id: newId,
      name: productData.name.trim(),
      category: productData.category || 'hotdishes',
      price: Number(productData.price) || 0,
      description: (productData.description || '').trim(),
      image: (productData.image || '').trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      badge: productData.badge || 'Yangi',
      isOutOfStock: false,
      isNew: true,
      modifiers: []
    };

    setProductList(prev => {
      const updated = [product, ...prev];
      syncMenuToServer(updated, `➕ *Yangi taom qo'shildi:* "${product.name}" (${product.price.toLocaleString('uz-UZ')} so'm)`);
      return updated;
    });

    telegram.triggerHaptic('success');
    showToast(`"${product.name}" menyuga qo'shildi! 🎉`);
    return product;
  };

  const updateProduct = (productId, updatedFields) => {
    setProductList(prev => {
      let changedName = '';
      const updated = prev.map(p => {
        if (p.id === productId) {
          changedName = updatedFields.name || p.name;
          return {
            ...p,
            ...updatedFields,
            price: updatedFields.price !== undefined ? Number(updatedFields.price) : p.price
          };
        }
        return p;
      });
      syncMenuToServer(updated, `✏️ *Taom tahrirlandi:* "${changedName}"`);
      return updated;
    });

    telegram.triggerHaptic('success');
    showToast("Taom muvaffaqiyatli saqlandi! ✅");
  };

  const deleteProduct = (productId) => {
    setProductList(prev => {
      const target = prev.find(p => p.id === productId);
      const updated = prev.filter(p => p.id !== productId);
      syncMenuToServer(updated, `🗑 *Taom o'chirildi:* "${target?.name || productId}"`);
      return updated;
    });

    telegram.triggerHaptic('medium');
    showToast("Taom menyudan o'chirildi");
  };

  const toggleProductStock = (productId) => {
    telegram.triggerHaptic('medium');
    setProductList(prev => {
      let targetName = '';
      let nextState = false;
      const updated = prev.map(p => {
        if (p.id === productId) {
          nextState = !p.isOutOfStock;
          targetName = p.name;
          return { ...p, isOutOfStock: nextState };
        }
        return p;
      });

      if (nextState) {
        showToast(`🚫 "${targetName}" buguncha tugadi deb belgilandi!`);
      } else {
        showToast(`✅ "${targetName}" yana sotuvga chiqarildi!`);
      }

      syncMenuToServer(
        updated,
        nextState
          ? `🚫 *Taom tugadi:* "${targetName}" (Buguncha sotuvdan to'xtatildi)`
          : `✅ *Taom qayta sotuvda:* "${targetName}"`
      );
      return updated;
    });
  };

  const resetMenuToDefault = () => {
    setProductList(PRODUCTS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ibrohim_ota_menu_custom');
    }
    syncMenuToServer(PRODUCTS, '🔄 *Menyu asl holatiga qaytarildi*');
    telegram.triggerHaptic('success');
    showToast('Menyu asl holatiga qaytarildi');
  };

  return (
    <AppContext.Provider
      value={{
        telegram,
        lang,
        setLang,
        t,
        activeTab,
        setActiveTab,
        orderType,
        setOrderType,
        selectedBranch,
        setSelectedBranch,
        tableNumber,
        setTableNumber,
        deliveryAddress,
        setDeliveryAddress,
        updateDeliveryAddress,
        userCoords,
        setUserCoords,
        isDetectingLocation,
        detectAndSetLocation,
        showLocationPrompt,
        setShowLocationPrompt,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        discountAmount,
        cartTotal,
        appliedPromo,
        applyPromoCode,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        getProductCartCount,
        quickAddToCart,
        quickDecrement,
        favorites,
        toggleFavorite,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        placedOrder,
        setPlacedOrder,
        orders,
        adminOrders,
        adminKassaStats,
        isLoadingAdminOrders,
        fetchAdminOrders,
        updateAdminOrderStatus,
        submitOrder,
        updateOrderStatus,
        productList,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        resetMenuToDefault,
        isAdmin,
        ADMIN_IDS,
        isAdminAuth,
        loginAdmin,
        logoutAdmin,
        toastMessage,
        showToast,
        userPhone,
        setUserPhone,
        secondaryPhone,
        setSecondaryPhone,
        updateSecondaryPhone,
        userName,
        setUserName
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
