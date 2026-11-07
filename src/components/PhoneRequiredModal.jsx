import React from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall } from 'lucide-react';

export default function PhoneRequiredModal() {
  const { userPhone, telegram, t } = useApp();

  const isPhoneMissing = !userPhone || userPhone === '+998 90 377 30 00' || userPhone === '+998903773000';

  if (!isPhoneMissing) return null;

  const handleReturnToBot = () => {
    telegram.triggerHaptic('medium');
    if (telegram.isInTelegram && telegram.tg?.close) {
      telegram.tg.close();
    } else {
      window.location.href = 'https://t.me/faizacafe_rishton_bot?start=auth';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-5 select-none animate-fade-in">
      <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl space-y-4 border border-emerald-100">
        <div className="w-16 h-16 mx-auto bg-emerald-50 text-[#0d3b2e] rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-emerald-200">
          📱
        </div>

        <div className="space-y-1.5">
          <h3 className="font-black text-lg text-[#0d3b2e]">
            {t.phoneRequiredTitle || "Telefon raqam tasdiqlanmagan"}
          </h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {t.phoneRequiredDesc || "Faiza Cafe'dan buyurtma berish va yetkazib berish xizmatidan foydalanish uchun, iltimos, avval Telegram botimizda telefon raqamingizni tasdiqlang!"}
          </p>
        </div>

        <button
          onClick={handleReturnToBot}
          className="w-full py-3.5 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-float transition flex items-center justify-center gap-2"
        >
          <PhoneCall size={16} />
          <span>{t.phoneRequiredBtn || "Botga qaytib raqamni yuborish"}</span>
        </button>

        <p className="text-[11px] text-gray-400">
          {t.phoneRequiredSub || "Bu sizning buyurtmangizni tez va aniq yetkazib berish uchun kerak 🚖"}
        </p>
      </div>
    </div>
  );
}
