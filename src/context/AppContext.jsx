import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PRODUCTS, BRANCHES, INITIAL_ORDERS } from '../data/mockData';
import { translations } from '../data/translations';
import { useTelegram } from '../hooks/useTelegram';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  const telegram = useTelegram();
  const [lang, setLang] = useState('uz');
  const t = translations[lang] || translations.uz;

  // Active view tab
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'menu' | 'cart' | 'orders' | 'profile' | 'admin'

  // Order Delivery Settings
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway' | 'dineIn'
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [tableNumber, setTableNumber] = useState('5');
  const [deliveryAddress, setDeliveryAddress] = useState('Chilonzor tumani, 9-mavze, 14-uy');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart: [{ cartId, product, selectedModifiers, quantity, unitPrice, totalPrice }]
  const [cart, setCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(['ff-1', 'pz-1']);

  // Modals & Bottom Sheets
  const [selectedProduct, setSelectedProduct] = useState(null); // for bottom sheet
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // for success screen

  // Orders State (for client and admin)
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Admin Products state (so admin can toggle availability or edit)
  const [productList, setProductList] = useState(PRODUCTS);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (orderType !== 'delivery') return 0;
    if (cartSubtotal >= 150000) return 0; // Free delivery over 150k
    return cartSubtotal > 0 ? 12000 : 0;
  }, [orderType, cartSubtotal]);

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
    
    // Calculate unit price: product.price + sum(modifiers)
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

  // Helper to check if simple product is in cart and get its count
  const getProductCartCount = (productId) => {
    return cart
      .filter(item => item.product.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  // Quick increment/decrement from food card
  const quickAddToCart = (product) => {
    // If product has modifiers, better open modal for customization
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

  // Favorites
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

  // Apply Promocode
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

  // Place Order
  const submitOrder = (customerDetails) => {
    telegram.triggerHaptic('success');
    const newOrderId = `FC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: newOrderId,
      date: dateStr,
      status: 'new', // 'new' | 'preparing' | 'delivering' | 'completed'
      statusText: 'Qabul qilindi',
      orderType,
      orderTypeName: orderType === 'delivery' ? 'Yetkazib berish' : orderType === 'takeaway' ? 'Olib ketish' : 'Stolda',
      customer: {
        name: customerDetails.name || telegram.user.first_name || 'Mijoz',
        phone: customerDetails.phone || '+998 90 000 00 00',
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
      estimatedTime: orderType === 'delivery' ? '30-40 daqiqa' : '15-20 daqiqa'
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setIsCheckoutOpen(false);
    clearCart();

    // Trigger confetti
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

  // Admin order status update
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

  // Admin Product availability toggle
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
        showToast
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
