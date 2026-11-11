import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FoodCard({ product }) {
  const {
    setSelectedProduct,
    getProductCartCount,
    quickAddToCart,
    showToast,
    t,
    telegram
  } = useApp();

  const cartCount = getProductCartCount(product.id);
  const isOutOfStock = Boolean(product.isOutOfStock);

  const handleCardClick = () => {
    telegram.triggerHaptic('light');
    setSelectedProduct(product);
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      telegram.triggerHaptic('warning');
      showToast(`Kechirasiz, "${product.name}" buguncha tugadi! 😔`);
      return;
    }
    telegram.triggerHaptic('medium');
    quickAddToCart(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[#28080b]/90 border rounded-3xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg shadow-black/30 relative overflow-hidden group ${
        isOutOfStock
          ? 'border-red-500/35 opacity-90'
          : 'border-amber-500/15 hover:border-amber-500/30'
      }`}
    >
      {/* Food Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#1a0507]">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isOutOfStock
              ? 'grayscale contrast-75 brightness-75'
              : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {product.badge && !isOutOfStock && (
          <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg text-white bg-red-700/90 border border-amber-400/30 shadow-sm backdrop-blur-xs">
            {product.badge}
          </span>
        )}

        {/* Tugadi - Buguncha bu taomimiz tugadi banneri */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center select-none z-10">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md mb-1 animate-pulse">
              Tugadi
            </span>
            <span className="text-[10px] font-bold text-amber-200 leading-tight">
              Buguncha bu taomimiz tugadi
            </span>
          </div>
        )}
      </div>

      {/* Info & Title */}
      <div className="pt-2">
        <h4 className={`text-xs font-bold line-clamp-1 leading-snug ${isOutOfStock ? 'text-stone-400' : 'text-stone-100'}`}>
          {product.name}
        </h4>
        {isOutOfStock && (
          <p className="text-[10px] text-red-400 font-bold line-clamp-1 mt-0.5">
            Buguncha tugadi
          </p>
        )}
      </div>

      {/* Pricing & Add Button row */}
      <div className="flex items-center justify-between pt-2 mt-auto">
        <div className="flex flex-col">
          <span className={`text-[13px] font-extrabold tracking-tight ${isOutOfStock ? 'text-stone-500' : 'text-amber-400'}`}>
            {product.price.toLocaleString('uz-UZ')} so‘m
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-stone-500 line-through">
              {product.oldPrice.toLocaleString('uz-UZ')}
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <button
            type="button"
            onClick={handlePlus}
            className="px-2.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 font-extrabold text-[10px] flex items-center gap-1 shadow-sm active:scale-95 transition"
            title="Buguncha bu taomimiz tugadi"
          >
            <span>Tugadi</span>
          </button>
        ) : (
          <button
            onClick={handlePlus}
            className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-90 text-stone-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20 transition relative"
            aria-label="Savatga qo‘shish"
          >
            {cartCount > 0 ? (
              <span className="text-xs font-black">{cartCount}</span>
            ) : (
              <Plus size={18} strokeWidth={3} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
