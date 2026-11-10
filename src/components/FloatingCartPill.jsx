import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FloatingCartPill() {
  const { cartCount, cartTotal, setActiveTab, activeTab, telegram } = useApp();

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
        className="flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 pl-3.5 pr-4 py-2.5 rounded-full shadow-xl shadow-amber-500/30 border border-amber-300 transition-all group font-black"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-stone-900">
            {cartCount}
          </span>
        </div>

        <div className="flex flex-col text-left leading-none pr-1">
          <span className="text-[10px] text-stone-800 font-bold uppercase tracking-wider">
            Savat
          </span>
          <span className="text-sm font-black text-stone-950">
            {cartTotal.toLocaleString('uz-UZ')} so‘m
          </span>
        </div>

        <ChevronRight size={16} className="text-stone-900 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
