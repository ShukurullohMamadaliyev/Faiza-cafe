import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    cartTotal,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    productList,
    appliedPromo,
    applyPromoCode,
    setIsCheckoutOpen,
    setActiveTab,
    orderType,
    setOrderType,
    telegram
  } = useApp();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput);
  };

  return (
    <div className="pb-32 px-4 pt-4 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <h1 className="text-2xl font-serif font-black text-amber-400 tracking-wide">
          Savat
        </h1>

        {cart.length > 0 && (
          <button
            onClick={() => {
              telegram.triggerHaptic('medium');
              clearCart();
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold"
          >
            <Trash2 size={14} />
            <span>Tozalash</span>
          </button>
        )}
      </div>

      {/* Empty State matching Screenshot 4 */}
      {cart.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-[#2a070b]/90 border border-amber-500/20 flex items-center justify-center shadow-xl shadow-black/40">
            <ShoppingBag size={42} className="text-amber-400/80" strokeWidth={1.7} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-amber-300">
              Savat bo'sh
            </h2>
            <p className="text-xs text-stone-400 max-w-xs">
              Menyudan sevimli taomlaringizni tanlang
            </p>
          </div>

          <button
            onClick={() => {
              telegram.triggerHaptic('medium');
              setActiveTab('menu');
            }}
            className="mt-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition"
          >
            Menyuga o'tish
          </button>
        </div>
      ) : (
        /* Active Cart */
        <div className="space-y-3">
          {/* Order Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#27080b]/90 p-1.5 rounded-2xl border border-amber-500/15">
            <button
              onClick={() => {
                telegram.triggerHaptic('selection');
                setOrderType('delivery');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                orderType === 'delivery'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🚗 Yetkazib berish
            </button>
            <button
              onClick={() => {
                telegram.triggerHaptic('selection');
                setOrderType('takeaway');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                orderType === 'takeaway'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🛍 Olib ketish
            </button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2.5">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="bg-[#28080b]/90 border border-amber-500/15 rounded-2xl p-3 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#150305]"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-stone-100 truncate">
                      {item.product.name}
                    </h4>
                    {productList?.find((p) => p.id === item.product.id)?.isOutOfStock && (
                      <span className="text-[10px] text-red-400 font-bold block leading-tight mt-0.5">
                        Buguncha bu taomimiz tugadi 🚫
                      </span>
                    )}
                    <p className="text-[12px] font-extrabold text-amber-400 mt-0.5">
                      {item.totalPrice.toLocaleString('uz-UZ')} so‘m
                    </p>
                  </div>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-2 bg-[#150305] px-2 py-1 rounded-xl border border-amber-500/20 shrink-0">
                  <button
                    onClick={() => {
                      telegram.triggerHaptic('light');
                      updateCartItemQuantity(item.cartId, item.quantity - 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-white"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-black text-amber-300 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      telegram.triggerHaptic('light');
                      updateCartItemQuantity(item.cartId, item.quantity + 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-amber-400 hover:text-amber-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo code input */}
          <form onSubmit={handleApplyPromo} className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Promokod (masalan: IBROHIM10)"
                className="w-full bg-[#27080b] border border-amber-500/20 text-stone-100 placeholder-stone-500 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:border-amber-400"
              />
              <Tag size={14} className="absolute left-2.5 top-3 text-amber-400/60" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition"
            >
              Qo‘llash
            </button>
          </form>

          {appliedPromo && (
            <p className="text-xs text-amber-400 font-semibold">
              ✓ Promokod qo‘llandi: -{discountAmount.toLocaleString('uz-UZ')} so‘m
            </p>
          )}

          {/* Bill Summary */}
          <div className="bg-[#28080b]/90 border border-amber-500/15 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Taomlar narxi:</span>
              <span>{cartSubtotal.toLocaleString('uz-UZ')} so‘m</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Yetkazib berish:</span>
              <span className="text-amber-400 font-bold">BEPUL</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Chegirma:</span>
                <span>-{discountAmount.toLocaleString('uz-UZ')} so‘m</span>
              </div>
            )}
            <div className="h-px bg-white/10 my-1"></div>
            <div className="flex justify-between items-baseline text-sm font-black text-white">
              <span>Jami to‘lov:</span>
              <span className="text-lg font-serif text-amber-400">
                {cartTotal.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              telegram.triggerHaptic('medium');
              setIsCheckoutOpen(true);
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Buyurtmani rasmiylashtirish</span>
            <span>• {cartTotal.toLocaleString('uz-UZ')} so‘m</span>
          </button>
        </div>
      )}
    </div>
  );
}
