import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FloatingCartPill() {
  const { cartCount, cartTotal, setActiveTab, activeTab, t, telegram } = useApp();

  // Only show if items exist and not already on cart tab or checkout
  if (cartCount === 0 || activeTab === 'cart' || activeTab === 'admin') {
    return null;
  }

  const handleClick = () => {
    telegram.triggerHaptic('medium');
    setActiveTab('cart');
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 animate-bounce-short select-none">
      <button
        onClick={handleClick}
        className="flex items-center gap-2.5 bg-[#991b1b] hover:bg-red-900 active:scale-95 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-float border border-red-400/30 transition-all group"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-red-700/80 flex items-center justify-center text-white">
            <ShoppingBag size={16} />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {cartCount}
          </span>
        </div>

        <div className="flex flex-col text-left leading-none pr-1">
          <span className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">
            {t.cart}
          </span>
          <span className="text-sm font-black text-white">
            {cartTotal.toLocaleString('uz-UZ')} {t.currency}
          </span>
        </div>

        <ChevronRight size={16} className="text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
