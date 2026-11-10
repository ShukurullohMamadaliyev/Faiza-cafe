import React from 'react';
import { MapPin, Navigation, X, Loader2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LocationPromptModal() {
  const {
    showLocationPrompt,
    setShowLocationPrompt,
    isDetectingLocation,
    detectAndSetLocation,
    deliveryAddress,
    t,
    telegram
  } = useApp();

  if (!showLocationPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-slide-up border border-red-100">
        {/* Header icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center shadow-inner">
            <Navigation size={30} className={isDetectingLocation ? 'animate-spin text-red-600' : 'text-red-700'} />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[#991b1b] tracking-tight">
            {t.locationPromptTitle || 'Yetkazib berish manzilini aniqlash 📍'}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {t.locationPromptDesc || 'Taomlaringizni tez va to‘g‘ri yetkazib berishimiz uchun joriy joylashuvingizni (GPS) aniqlashga ruxsat bering.'}
          </p>
        </div>

        {/* Current address preview if already detected */}
        {deliveryAddress && deliveryAddress !== 'Rishton tumani (Joriy joylashuv)' && (
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200/80 text-left text-xs space-y-1">
            <span className="text-[10px] text-red-800 font-extrabold uppercase tracking-wider block">
              {t.detectedAddressLabel || 'Aniqlangan manzil:'}
            </span>
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <Check size={14} className="text-red-600 shrink-0" />
              <span className="truncate">{deliveryAddress}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => detectAndSetLocation()}
            disabled={isDetectingLocation}
            className="w-full py-3.5 bg-[#991b1b] hover:bg-red-900 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-float transition flex items-center justify-center gap-2"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 size={16} className="animate-spin text-red-300" />
                <span>{t.gpsDetecting || 'GPS orqali aniqlanmoqda...'}</span>
              </>
            ) : (
              <>
                <Navigation size={15} />
                <span>{t.detectLocationBtn || '📍 Joriy joylashuvimni aniqlash'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              setShowLocationPrompt(false);
            }}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-600 font-bold text-xs rounded-xl transition"
          >
            {t.enterManuallyBtn || 'Qo‘lda kiritaman'}
          </button>
        </div>
      </div>
    </div>
  );
}
