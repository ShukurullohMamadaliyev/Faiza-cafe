import React from 'react';
import { Plus, Minus, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FoodCard({ product }) {
  const {
    setSelectedProduct,
    getProductCartCount,
    quickAddToCart,
    quickDecrement,
    favorites,
    toggleFavorite,
    t,
    telegram
  } = useApp();

  const isFavorite = favorites.includes(product.id);
  const cartCount = getProductCartCount(product.id);

  const handleCardClick = () => {
    telegram.triggerHaptic('light');
    setSelectedProduct(product);
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    quickAddToCart(product);
  };

  const handleMinus = (e) => {
    e.stopPropagation();
    quickDecrement(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl p-3 border border-gray-100/90 shadow-card flex flex-col justify-between cursor-pointer transition-all duration-200 active:scale-98 hover:shadow-soft relative overflow-hidden group"
    >
      {/* Top Bar: Badge & Favorite Button */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div>
          {product.badge && (
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white ${
                product.isSpicy
                  ? 'bg-red-500'
                  : product.isNew
                  ? 'bg-emerald-600'
                  : product.isPromo
                  ? 'bg-rose-600'
                  : 'bg-amber-500'
              } shadow-xs`}
            >
              {product.badge}
            </span>
          )}
        </div>

        <button
          onClick={(e) => toggleFavorite(product.id, e)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-80 ${
            isFavorite
              ? 'text-red-500 bg-red-50'
              : 'text-gray-300 hover:text-red-400 bg-gray-50'
          }`}
          aria-label="Sevimlilar"
        >
          <Heart size={15} fill={isFavorite ? '#ef4444' : 'none'} strokeWidth={2} />
        </button>
      </div>

      {/* Food Image */}
      <div className="relative w-full aspect-square max-h-[140px] flex items-center justify-center mb-2 overflow-hidden rounded-2xl bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold rounded-2xl">
            {t.outOfStock}
          </div>
        )}
      </div>

      {/* Info & Pricing */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-black text-gray-900 tracking-tight">
            {product.price.toLocaleString('uz-UZ')} {t.currency}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              {product.oldPrice.toLocaleString('uz-UZ')}
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">
          {product.name}
        </h4>

        {product.weight && (
          <p className="text-[11px] text-gray-400 font-medium">
            {product.weight}
          </p>
        )}
      </div>

      {/* Add / Qty Control Button (Exact layout as screenshots) */}
      <div className="mt-2.5 pt-1 border-t border-gray-50 flex items-center justify-end">
        {cartCount > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-[#991b1b] text-white px-2.5 py-1.5 rounded-full shadow-xs text-xs font-bold"
          >
            <button
              onClick={handleMinus}
              className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-75 transition"
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>
            <span className="min-w-[14px] text-center">{cartCount}</span>
            <button
              onClick={handlePlus}
              className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-75 transition"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={handlePlus}
            disabled={product.isOutOfStock}
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-600 hover:text-white text-red-800 border border-red-200/60 flex items-center justify-center active:scale-90 transition-all shadow-xs"
            aria-label={t.addToCart}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
