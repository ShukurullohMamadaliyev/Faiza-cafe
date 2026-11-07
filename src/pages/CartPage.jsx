import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, Tag, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    discountAmount,
    cartTotal,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    appliedPromo,
    applyPromoCode,
    setIsCheckoutOpen,
    setActiveTab,
    orderType,
    setOrderType,
    selectedBranch,
    deliveryAddress,
    t,
    telegram
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [includeCutlery, setIncludeCutlery] = useState(true);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput);
  };

  return (
    <div className="pb-36 min-h-screen bg-[#F8FAF9]">
      {/* Header matching screenshot 8 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={() => {
            telegram.triggerHaptic('light');
            setActiveTab('home');
          }}
          className="flex items-center gap-2 font-black text-base text-[#0d3b2e]"
        >
          <ArrowLeft size={20} />
          <span>{t.yourCart}</span>
        </button>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 size={14} />
            <span>{t.clearCart}</span>
          </button>
        )}
      </div>

      {/* Empty State (Exact matching screenshot 8) */}
      {cart.length === 0 ? (
        <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-soft border border-gray-100 flex flex-col items-center space-y-4">
            {/* 3D Gold / Emerald Coin Emblem */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-amber-100 flex items-center justify-center text-3xl shadow-inner">
              🥗
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#0d3b2e]">
                {t.cartEmpty}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.cartEmptyDesc}
              </p>
            </div>

            <button
              onClick={() => {
                telegram.triggerHaptic('medium');
                setActiveTab('menu');
              }}
              className="w-full py-3 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-float transition"
            >
              {t.goToMenu}
            </button>
          </div>
        </div>
      ) : (
        /* Active Cart View */
        <div className="px-4 py-3 space-y-3">
          {/* Order Mode Summary Banner */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-gray-800">
                {orderType === 'delivery'
                  ? `Yetkazib berish: ${deliveryAddress}`
                  : orderType === 'takeaway'
                  ? `Olib ketish: ${selectedBranch.name}`
                  : 'Kafeda (Stolda buyurtma)'}
              </span>
            </div>
            <button
              onClick={() => {
                telegram.triggerHaptic('light');
                setActiveTab('home');
              }}
              className="text-emerald-700 font-bold hover:underline"
            >
              O'zgartirish
            </button>
          </div>

          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card space-y-4">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Tanlangan taomlar ({cartCount})
            </h4>

            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.cartId} className="py-3 flex items-start gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-gray-900 leading-snug">
                      {item.product.name}
                    </h5>

                    {/* Modifiers List */}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedModifiers.map((mod) => (
                          <div key={mod.id} className="text-[11px] text-gray-500 font-medium">
                            + {mod.name} ({mod.price.toLocaleString('uz-UZ')} so'm)
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs font-black text-emerald-800 mt-1.5">
                      {item.totalPrice.toLocaleString('uz-UZ')} so'm
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1 shrink-0 font-bold text-xs">
                    <button
                      onClick={() => updateCartItemQuantity(item.cartId, -1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-75 transition"
                    >
                      <Minus size={12} strokeWidth={2.5} />
                    </button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.cartId, 1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-75 transition"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cutlery Option */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🍴</span>
              <div>
                <div className="text-xs font-bold text-gray-800">Priborlar (qoshiq, vilka, salfetka)</div>
                <div className="text-[11px] text-gray-400">Buyurtmaga bepul qo'shiladi</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeCutlery}
              onChange={(e) => setIncludeCutlery(e.target.checked)}
              className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Promocode Input */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card">
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={appliedPromo ? `Faol: ${appliedPromo.code}` : t.promoCodePlaceholder}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-95 text-white text-xs font-bold rounded-xl transition"
              >
                {t.apply}
              </button>
            </form>

            {appliedPromo && (
              <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check size={14} />
                <span>{appliedPromo.label} faollashtirildi!</span>
              </div>
            )}
            <div className="mt-1.5 text-[10px] text-gray-400">
              Sinab ko'ring: <span className="font-mono text-emerald-700 font-bold">FAYZ10</span> (10% chegirma) yoki <span className="font-mono text-emerald-700 font-bold">FAYZ20K</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>{t.dishesPrice}</span>
              <span>{cartSubtotal.toLocaleString('uz-UZ')} so'm</span>
            </div>

            {orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600 font-medium">
                <span>{t.deliveryFee}</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">Bepul (150 mingdan ortiq)</span>
                  ) : (
                    `${deliveryFee.toLocaleString('uz-UZ')} so'm`
                  )}
                </span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{t.discount}</span>
                <span>-{discountAmount.toLocaleString('uz-UZ')} so'm</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-black text-gray-900">
              <span>{t.totalPay}</span>
              <span className="text-[#0d3b2e]">
                {cartTotal.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Action */}
      {cart.length > 0 && (
        <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md p-3 px-4 border-t border-gray-100 shadow-lg">
          <button
            onClick={() => {
              telegram.triggerHaptic('medium');
              setIsCheckoutOpen(true);
            }}
            className="w-full py-3.5 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-float transition flex items-center justify-between px-5"
          >
            <span>{t.checkoutBtn}</span>
            <span className="bg-emerald-800/80 px-2.5 py-1 rounded-xl text-xs">
              {cartTotal.toLocaleString('uz-UZ')} so'm
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
