import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FoodCard({ product }) {
  const {
    setSelectedProduct,
    getProductCartCount,
    quickAddToCart,
    t,
    telegram
  } = useApp();

  const cartCount = getProductCartCount(product.id);

  const handleCardClick = () => {
    telegram.triggerHaptic('light');
    setSelectedProduct(product);
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    telegram.triggerHaptic('medium');
    quickAddToCart(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#28080b]/90 border border-amber-500/15 rounded-3xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 active:scale-[0.98] hover:border-amber-500/30 shadow-lg shadow-black/30 relative overflow-hidden group"
    >
      {/* Food Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#1a0507]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg text-white bg-red-700/90 border border-amber-400/30 shadow-sm backdrop-blur-xs">
            {product.badge}
          </span>
        )}

        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold rounded-2xl">
            {t.outOfStock || 'Mavjud emas'}
          </div>
        )}
      </div>

      {/* Info & Title */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-stone-100 line-clamp-1 leading-snug">
          {product.name}
        </h4>
      </div>

      {/* Pricing & Add Button row */}
      <div className="flex items-center justify-between pt-2 mt-auto">
        <div className="flex flex-col">
          <span className="text-[13px] font-extrabold text-amber-400 tracking-tight">
            {product.price.toLocaleString('uz-UZ')} so‘m
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-stone-400 line-through">
              {product.oldPrice.toLocaleString('uz-UZ')}
            </span>
          )}
        </div>

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
      </div>
    </div>
  );
}
