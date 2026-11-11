import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    t,
    telegram
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedMods, setSelectedMods] = useState([]);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setSelectedMods([]);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

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

  const unitPrice = selectedProduct.price + selectedMods.reduce((acc, m) => acc + m.price, 0);
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    telegram.triggerHaptic('success');
    addToCart(selectedProduct, selectedMods, quantity);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={() => setSelectedProduct(null)}
      />

      <div className="relative w-full max-w-md bg-[#24070a] border-t border-amber-500/25 text-white rounded-t-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-slide-up z-10">
        {/* Top close button */}
        <div className="absolute top-3.5 right-4 z-20">
          <button
            onClick={() => setSelectedProduct(null)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-stone-200 flex items-center justify-center hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar pb-24">
          {/* Big Food Image */}
          <div className="w-full h-56 bg-[#150305] relative">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className={`w-full h-full object-cover ${
                selectedProduct.isOutOfStock ? 'grayscale contrast-75 brightness-75' : ''
              }`}
            />

            {/* Tugadi - Buguncha bu taomimiz tugadi overlay */}
            {selectedProduct.isOutOfStock && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10 select-none">
                <div className="w-12 h-12 rounded-2xl bg-red-600/90 text-white flex items-center justify-center text-xl shadow-lg mb-2">
                  🚫
                </div>
                <h3 className="text-base font-black text-red-300 uppercase tracking-wider">
                  Tugadi
                </h3>
                <p className="text-sm font-bold text-amber-200 mt-1 max-w-xs leading-snug">
                  Buguncha bu taomimiz tugadi!
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Ertaga yana xizmatimizda bo‘ladi
                </p>
              </div>
            )}
          </div>

          <div className="p-4.5 space-y-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-black text-amber-300">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.isOutOfStock ? (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-red-600 text-white border border-red-400/40 shadow-sm">
                    Buguncha tugadi
                  </span>
                ) : (
                  selectedProduct.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {selectedProduct.badge}
                    </span>
                  )
                )}
              </div>

              {selectedProduct.weight && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {selectedProduct.weight}
                </p>
              )}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Modifiers List */}
            {selectedProduct.modifiers && selectedProduct.modifiers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-amber-200">
                  Qo‘shimcha tanlovlar:
                </h4>

                <div className="space-y-1.5">
                  {selectedProduct.modifiers.map((mod) => {
                    const isChecked = selectedMods.some((m) => m.id === mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleToggleMod(mod)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                          isChecked
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-[#150305] border-white/10 text-stone-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-500'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span>{mod.name}</span>
                        </div>
                        <span className="font-bold text-amber-400">
                          +{mod.price.toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 bg-[#1a0507]/95 backdrop-blur-md border-t border-white/10 flex items-center gap-3">
          {selectedProduct.isOutOfStock ? (
            <div className="w-full py-3.5 bg-red-950/80 border border-red-500/40 text-red-300 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg text-center select-none">
              <span>🚫 Buguncha bu taomimiz tugadi</span>
            </div>
          ) : (
            <>
              {/* Quantity Counter */}
              <div className="flex items-center gap-2 bg-[#150305] px-2.5 py-2 rounded-xl border border-amber-500/20">
                <button
                  onClick={() => {
                    telegram.triggerHaptic('light');
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-white"
                >
                  <Minus size={15} />
                </button>
                <span className="text-xs font-black text-amber-300 w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    telegram.triggerHaptic('light');
                    setQuantity((q) => q + 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center text-amber-400 hover:text-amber-300"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-between px-4"
              >
                <span>Savatga qo‘shish</span>
                <span>{totalPrice.toLocaleString('uz-UZ')} so‘m</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
