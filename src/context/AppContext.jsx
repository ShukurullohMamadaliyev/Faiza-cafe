import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PRODUCTS, BRANCHES, INITIAL_ORDERS } from '../data/mockData';
import { translations } from '../data/translations';
import { useTelegram } from '../hooks/useTelegram';
import { getCurrentCoordinates, reverseGeocode } from '../utils/geoUtils';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  const telegram = useTelegram();
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('faiza_cafe_lang') || 'uz';
    }
    return 'uz';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('faiza_cafe_lang', newLang);
    }
  };

  const t = translations[lang] || translations.uz;

  // User Profile: Telefon raqami va Ism
  const [userPhone, setUserPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('phone');
      if (p) {
        localStorage.setItem('faiza_cafe_user_phone', p);
        return p;
      }
      return localStorage.getItem('faiza_cafe_user_phone') || '';
    }
    return '';
  });

  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      const n = new URLSearchParams(window.location.search).get('name');
      if (n) {
        localStorage.setItem('faiza_cafe_user_name', n);
        return n;
      }
      const stored = localStorage.getItem('faiza_cafe_user_name');
      if (stored) return stored;
    }
    return telegram.user?.first_name || 'Mijoz';
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState('home');

  // Order Delivery Settings
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway' | 'dineIn'
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [tableNumber, setTableNumber] = useState('5');

  // Geolocation & Delivery Address
  const savedAddress = typeof window !== 'undefined' ? localStorage.getItem('faiza_cafe_address') : null;
  const savedCoords = typeof window !== 'undefined' && localStorage.getItem('faiza_cafe_coords')
    ? JSON.parse(localStorage.getItem('faiza_cafe_coords'))
    : null;

  const [deliveryAddress, setDeliveryAddress] = useState(savedAddress || "Rishton tumani (Joriy joylashuv)");
  const [userCoords, setUserCoords] = useState(savedCoords);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(!savedAddress);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart: [{ cartId, product, selectedModifiers, quantity, unitPrice, totalPrice }]
  const [cart, setCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(['ff-lavash-tandir', 'pz-qazi-med']);

  // Modals & Bottom Sheets
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Orders State - LocalStorage bilan doimiy sinxronlash
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('faiza_cafe_orders');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse orders:', e);
      }
    }
    return INITIAL_ORDERS;
  });

  // Orders o'zgarganda LocalStorage ga saqlash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('faiza_cafe_orders', JSON.stringify(orders));
      } catch (e) {
        console.warn('Failed to save orders:', e);
      }
    }
  }, [orders]);

  // Admin Products state
  const [productList, setProductList] = useState(PRODUCTS);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // GPS orqali manzilni aniqlash funksiyasi
  const detectAndSetLocation = async (silent = false) => {
    setIsDetectingLocation(true);
    if (!silent) telegram.triggerHaptic('medium');

    try {
      const coords = await getCurrentCoordinates();
      const geoResult = await reverseGeocode(coords.latitude, coords.longitude);

      const detectedAddr = geoResult.formattedAddress;
      setDeliveryAddress(detectedAddr);
      setUserCoords(geoResult.coords);

      if (typeof window !== 'undefined') {
        localStorage.setItem('faiza_cafe_address', detectedAddr);
        localStorage.setItem('faiza_cafe_coords', JSON.stringify(geoResult.coords));
      }

      setShowLocationPrompt(false);
      telegram.triggerHaptic('success');
      showToast(`📍 Manzilingiz aniqlandi: ${detectedAddr}`);
      return { success: true, address: detectedAddr };
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
        localStorage.setItem('faiza_cafe_user_phone', phoneParam);
      }
      if (nameParam) {
        setUserName(nameParam);
        localStorage.setItem('faiza_cafe_user_name', nameParam);
      }

      // Admin tekshiruvi (8340079081)
      if (adminParam === '8340079081' || telegram.user?.id == 8340079081) {
        if (adminParam === '8340079081') {
          setActiveTab('admin');
        }
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
            localStorage.setItem('faiza_cafe_user_phone', data.user.phone);
          }
          if (data?.user?.name) {
            setUserName(data.user.name);
            localStorage.setItem('faiza_cafe_user_name', data.user.name);
          }
        })
        .catch(() => {});
    }

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

  // Faiza Cafe'da Rishton bo'ylab yetkazib berish BEPUL!
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
    if (cleanCode === 'FAYZ10' || cleanCode === 'XUSH_KELIBSIZ') {
      setAppliedPromo({ code: cleanCode, type: 'percent', value: 10, label: '10% chegirma' });
      showToast('10% lik maxsus chegirma qo‘llanildi! 🎉');
      return { success: true, message: '10% chegirma qo‘llandi!' };
    } else if (cleanCode === 'FAYZ20K') {
      setAppliedPromo({ code: cleanCode, type: 'fixed', value: 20000, label: '20 000 so‘m' });
      showToast('20 000 so‘m chegirma qo‘llanildi! 🎉');
      return { success: true, message: '20 000 so‘m chegirma!' };
    } else {
      showToast('Bunday promokod topilmadi');
      return { success: false, message: 'Yaroqsiz promokod' };
    }
  };

  const submitOrder = (customerDetails) => {
    telegram.triggerHaptic('success');
    const newOrderId = `FC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: newOrderId,
      date: dateStr,
      status: 'new',
      statusText: 'Qabul qilindi',
      orderType,
      orderTypeName: orderType === 'delivery' ? 'Yetkazib berish' : orderType === 'takeaway' ? 'Olib ketish' : 'Stolda',
      telegramUser: {
        id: telegram.user?.id || null,
        first_name: telegram.user?.first_name || '',
        username: telegram.user?.username || ''
      },
      customer: {
        name: customerDetails.name || userName || telegram.user.first_name || 'Mijoz',
        phone: customerDetails.phone || userPhone || '+998 90 377 30 00',
        address: orderType === 'delivery' ? customerDetails.address || deliveryAddress : undefined,
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

    // Serverless API orqali Admin (8340079081)ga buyurtma yuborish
    try {
      fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(err => console.warn('Order API error:', err));
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

  const toggleProductStock = (productId) => {
    setProductList(prev => prev.map(p => {
      if (p.id === productId) {
        const isOutOfStock = !p.isOutOfStock;
        showToast(`${p.name} - ${isOutOfStock ? 'Tugagan deb belgilandi' : 'Sotuvda mavjud'}`);
        return { ...p, isOutOfStock };
      }
      return p;
    }));
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
        userCoords,
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
        submitOrder,
        updateOrderStatus,
        productList,
        toggleProductStock,
        toastMessage,
        showToast,
        userPhone,
        setUserPhone,
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
