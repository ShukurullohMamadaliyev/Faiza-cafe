import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall, Check, X, ArrowRight } from 'lucide-react';

export default function PhoneRequiredModal() {
  const { userPhone, setUserPhone, telegram, t } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [error, setError] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  // Agar telefon raqam allaqachon mavjud bo'lsa yoki foydalanuvchi "Keyinroq"ni tanlagan bo'lsa, chiqarmaymiz
  const hasPhone = Boolean(
    userPhone &&
    userPhone !== '+998 90 377 30 00' &&
    userPhone !== '+998903773000' &&
    userPhone !== '+998 20 000 01 49' &&
    userPhone.length >= 9
  );

  if (hasPhone || isDismissed) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.length < 9) {
      setError('Iltimos, to‘g‘ri telefon raqam kiriting (masalan: +998 90 123 45 67)');
      return;
    }
    
    let formatted = cleaned;
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }

    telegram.triggerHaptic('success');
    if (typeof window !== 'undefined') {
      localStorage.setItem('ibrohim_ota_user_phone', formatted);
    }
    if (setUserPhone) {
      setUserPhone(formatted);
    }
    setIsDismissed(true);
  };

  const handleReturnToBot = () => {
    telegram.triggerHaptic('medium');
    if (telegram?.tg?.close) {
      telegram.tg.close();
    } else {
      window.location.href = 'https://t.me/ibrohim_ota_bot?start=auth';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl space-y-4 border border-red-100 relative">
        {/* Yopish tugmasi (Mijoz menyuni ko'ra olishi uchun) */}
        <button
          onClick={() => {
            telegram.triggerHaptic('light');
            setIsDismissed(true);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
          aria-label="Yopish"
        >
          <X size={16} />
        </button>

        <div className="w-14 h-14 mx-auto bg-red-50 text-[#991b1b] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-red-200">
          📱
        </div>

        <div className="space-y-1">
          <h3 className="font-black text-lg text-[#991b1b]">
            Xush kelibsiz! 👋
          </h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Ibrohim Ota Choyxonasidan buyurtma berish va yetkazib berish holatini kuzatish uchun telefon raqamingizni kiriting:
          </p>
        </div>

        {/* Tezkor Telefon Kiritish Formasi */}
        <form onSubmit={handlePhoneSubmit} className="space-y-3 pt-1">
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setError('');
                setPhoneNumber(e.target.value);
              }}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-3 text-center text-sm font-bold tracking-wider text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white transition"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#991b1b] hover:bg-red-900 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Tasdiqlash va Davom etish</span>
          </button>
        </form>

        <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => {
              telegram.triggerHaptic('light');
              setIsDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-600 font-semibold"
          >
            Menyuni ko‘rish
          </button>

          <button
            type="button"
            onClick={handleReturnToBot}
            className="text-red-700 hover:text-red-800 font-bold flex items-center gap-1"
          >
            <span>Bot orqali ochish</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
