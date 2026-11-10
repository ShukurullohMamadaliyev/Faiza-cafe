import React from 'react';
import { CheckCircle2, Clock, MapPin, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderSuccessModal() {
  const { placedOrder, setPlacedOrder, setActiveTab, telegram } = useApp();

  if (!placedOrder) return null;

  const handleTrack = () => {
    telegram.triggerHaptic('medium');
    setPlacedOrder(null);
    setActiveTab('profile');
  };

  const handleClose = () => {
    telegram.triggerHaptic('light');
    setPlacedOrder(null);
    setActiveTab('home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="bg-[#24070a] border border-amber-500/30 text-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-scale-up">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-serif font-black text-amber-300 tracking-tight">
            Buyurtmangiz qabul qilindi!
          </h3>
          <p className="text-xs text-stone-300">
            Oshpazlarimiz taomni tayyorlashni boshlashdi
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#150305] border border-amber-500/20 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-stone-400 font-medium">Buyurtma kodi:</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
              #{placedOrder.id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <Clock size={14} className="text-amber-400 shrink-0" />
            <span>Kutilayotgan vaqt: <strong className="text-white">{placedOrder.estimatedTime}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <MapPin size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">
              {placedOrder.orderType === 'delivery'
                ? placedOrder.customer?.address
                : 'Ibrohim Ota Choyxonasidan olib ketish'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-stone-400">Jami to‘lov:</span>
            <span className="font-serif font-bold text-amber-400 text-sm">
              {(placedOrder.total || 0).toLocaleString('uz-UZ')} so‘m
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleTrack}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            Buyurtmani kuzatish (Profil)
          </button>
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-400 font-bold text-xs rounded-xl transition"
          >
            Asosiy sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}
