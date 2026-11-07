import React from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderSuccessModal() {
  const { placedOrder, setPlacedOrder, setActiveTab, t, telegram } = useApp();

  if (!placedOrder) return null;

  const handleTrack = () => {
    telegram.triggerHaptic('medium');
    setPlacedOrder(null);
    setActiveTab('orders');
  };

  const handleClose = () => {
    telegram.triggerHaptic('light');
    setPlacedOrder(null);
    setActiveTab('home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-scale-up border border-emerald-100">
        {/* Animated Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce-short">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#0d3b2e] tracking-tight">
            {t.orderSuccessTitle}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {t.orderSuccessDesc}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
            <span className="text-gray-500 font-semibold">{t.orderNumber}:</span>
            <span className="font-black text-[#0d3b2e] bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
              #{placedOrder.id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Clock size={14} className="text-emerald-700 shrink-0" />
            <span>{t.estTime}: <strong className="text-gray-900">{placedOrder.estimatedTime}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <MapPin size={14} className="text-emerald-700 shrink-0" />
            <span className="truncate">
              {placedOrder.orderType === 'delivery'
                ? placedOrder.customer.address
                : placedOrder.orderType === 'takeaway'
                ? placedOrder.customer.branch
                : `${placedOrder.customer.table}-stol`}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-emerald-100 text-gray-900 font-bold">
            <span>{t.orderTotalLabel || 'Jami summa:'}</span>
            <span className="text-sm font-black text-[#0d3b2e]">
              {placedOrder.total.toLocaleString('uz-UZ')} {t.currency}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleTrack}
            className="w-full py-3 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-float transition flex items-center justify-center gap-1.5"
          >
            <span>{t.trackOrder}</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 font-bold text-xs rounded-xl transition"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
}
