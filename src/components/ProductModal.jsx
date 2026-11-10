import React, { useState, useEffect, useMemo } from 'react';
import { X, Heart, Plus, Minus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    favorites,
    toggleFavorite,
    t,
    telegram
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedMods, setSelectedMods] = useState([]);

  // Reset state when a product is opened
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setSelectedMods([]);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isFavorite = favorites.includes(selectedProduct.id);

  // Toggle modifier
  const handleToggleMod = (mod) => {
    telegram.triggerHaptic('selection');
    setSelectedMods((prev) => {
      const exists = prev.some((m) => m.id === mod.id);
      if (exists) {
        return prev.filter((m) => m.id !== mod.id);
      } else {
        return [...prev, mod];
      }
    });
  };

  // Calculate unit price and total price
  const unitPrice = selectedProduct.price + selectedMods.reduce((acc, m) => acc + m.price, 0);
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(selectedProduct, selectedMods, quantity);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden shadow-sheet max-h-[90vh] flex flex-col animate-slide-up z-10">
        {/* Top Floating Controls */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id, e);
            }}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-700 pointer-events-auto active:scale-90 transition"
          >
            <Heart
              size={18}
              fill={isFavorite ? '#ef4444' : 'none'}
              strokeWidth={2}
              className={isFavorite ? 'text-red-500' : 'text-gray-600'}
            />
          </button>

          <button
            onClick={() => setSelectedProduct(null)}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center text-gray-700 pointer-events-auto active:scale-90 transition"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto no-scrollbar pb-24">
          {/* Big Food Image */}
          <div className="w-full h-64 bg-gray-100 relative">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5 space-y-4">
            {/* Title & Weight */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              {selectedProduct.weight && (
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {selectedProduct.weight}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Modifiers List */}
            {selectedProduct.modifiers && selectedProduct.modifiers.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">
                  {t.modifiers || "Qo'shimcha modifikatorlar"}
                </h4>

                <div className="space-y-2">
                  {selectedProduct.modifiers.map((mod) => {
                    const isChecked = selectedMods.some((m) => m.id === mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleMod(mod)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                            : 'bg-gray-50/70 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check size={13} strokeWidth={3} />}
                          </div>
                          <span className="text-xs font-semibold text-gray-800">
                            + {mod.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-red-600">
                          + {mod.price.toLocaleString('uz-UZ')} {t.currency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 safe-area-bottom shadow-lg flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 truncate max-w-[140px]">
              {selectedProduct.name} • {selectedProduct.weight || '1 dona'}
            </div>
            <div className="text-base font-black text-gray-900">
              {totalPrice.toLocaleString('uz-UZ')} {t.currency}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Controller */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-2 py-1.5 font-bold text-sm">
              <button
                onClick={() => {
                  telegram.triggerHaptic('light');
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 transition"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center">{quantity}</span>
              <button
                onClick={() => {
                  telegram.triggerHaptic('light');
                  setQuantity((q) => q + 1);
                }}
                className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 active:scale-90 transition"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Qo'shish Button */}
            <button
              onClick={handleAdd}
              className="py-3 px-6 bg-[#991b1b] hover:bg-red-900 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-float transition flex items-center gap-2"
            >
              <span>{t.add || "Qo'shish"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
