import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  RotateCw,
  Receipt,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const {
    telegram,
    t,
    userName,
    setUserName,
    userPhone,
    setUserPhone,
    secondaryPhone,
    updateSecondaryPhone,
    deliveryAddress,
    updateDeliveryAddress,
    userCoords,
    detectAndSetLocation,
    isDetectingLocation,
    orders,
    showToast,
    setActiveTab,
    isAdmin
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

  const [isEditingPrimaryPhone, setIsEditingPrimaryPhone] = useState(false);
  const [primaryPhoneInput, setPrimaryPhoneInput] = useState(userPhone || '');

  const [isEditingSecPhone, setIsEditingSecPhone] = useState(false);
  const [secPhoneInput, setSecPhoneInput] = useState(secondaryPhone || '');

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(deliveryAddress || '');

  const handleSaveAddress = () => {
    if (!addressInput.trim()) {
      showToast("Iltimos, manzilni kiriting");
      return;
    }
    updateDeliveryAddress(addressInput.trim());
    showToast("Manzil saqlandi");
    setIsEditingAddress(false);
  };

  // Profil ochilganda GPS manzilni avtomatik ravishda 2 martalab tekshirib olish
  useEffect(() => {
    // Agar manzil hali aniqlanmagan yoki standart bo'lsa, o'zi avtomatik 2x aniqlaydi
    if (!userCoords || !deliveryAddress || deliveryAddress.includes('(Joriy joylashuv)')) {
      detectAndSetLocation(true);
    }
  }, []);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('ibrohim_ota_user_name', nameInput.trim());
      }
      showToast('Ism saqlandi');
    }
    setIsEditingName(false);
  };

  const handleSavePrimaryPhone = () => {
    if (primaryPhoneInput.trim()) {
      setUserPhone(primaryPhoneInput.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('ibrohim_ota_user_phone', primaryPhoneInput.trim());
      }
      showToast('Asosiy telefon saqlandi');
    }
    setIsEditingPrimaryPhone(false);
  };

  const handleSaveSecPhone = () => {
    updateSecondaryPhone(secPhoneInput.trim());
    showToast(secPhoneInput.trim() ? "Qo'shimcha telefon saqlandi" : "Qo'shimcha telefon o'chirildi");
    setIsEditingSecPhone(false);
  };

  const handleLocationRefresh = async () => {
    telegram.triggerHaptic('medium');
    await detectAndSetLocation(false);
  };

  // Ruxsat etilgan admin Telegram ID'lari (7048168954)
  const ADMIN_IDS = ['7048168954', '8340079081'];

  // window.Telegram.WebApp.initDataUnsafe.user.id orqali qat'iy tekshirish
  const currentTelegramId = typeof window !== 'undefined'
    ? String(
        window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
        telegram?.user?.id ||
        new URLSearchParams(window.location.search).get('admin') ||
        ''
      )
    : '';

  const isAuthorizedAdmin = Boolean(currentTelegramId && ADMIN_IDS.includes(currentTelegramId));

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 min-h-screen">
      {/* User Card matching Screenshot 5 */}
      <div className="bg-[#28080b]/90 border border-amber-500/20 rounded-3xl p-4 shadow-xl shadow-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#1c0507] border border-amber-400/40 flex items-center justify-center font-serif text-xl font-black text-amber-400 shrink-0 shadow-md">
            {(telegram.user?.first_name || userName || 'M').charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-[#150305] border border-amber-400 text-amber-200 text-xs rounded-lg px-2 py-1 focus:outline-none w-32"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="bg-amber-500 text-stone-950 px-2 py-1 rounded-lg text-xs font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-amber-300 truncate">
                  {telegram.user?.first_name || userName || 'Mehmon'}
                </h2>
                <button
                  onClick={() => {
                    setNameInput(telegram.user?.first_name || userName || '');
                    setIsEditingName(true);
                  }}
                  className="text-stone-400 hover:text-amber-400"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}

            {/* Asosiy Telefon raqam */}
            {isEditingPrimaryPhone ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={primaryPhoneInput}
                  onChange={(e) => setPrimaryPhoneInput(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="bg-[#150305] border border-amber-400 text-amber-200 text-xs rounded-lg px-2 py-1 focus:outline-none w-36"
                  autoFocus
                />
                <button
                  onClick={handleSavePrimaryPhone}
                  className="bg-amber-500 text-stone-950 px-2 py-1 rounded-lg text-xs font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-stone-300 font-medium truncate">
                  {userPhone || 'Telefon kiritilmagan'}
                </span>
                <button
                  onClick={() => {
                    setPrimaryPhoneInput(userPhone || '');
                    setIsEditingPrimaryPhone(true);
                  }}
                  className="text-stone-400 hover:text-amber-400"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Qo'shimcha Telefon Raqami (Ixtiyoriy) */}
      <div className="bg-[#28080b]/90 border border-amber-500/20 rounded-3xl p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Phone size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-200">
                Qo‘shimcha telefon raqami
              </h3>
              <p className="text-[10px] text-stone-400">
                Ixtiyoriy (yaqinlar yoki ikkinchi raqam uchun)
              </p>
            </div>
          </div>

          {!isEditingSecPhone && (
            <button
              onClick={() => {
                setSecPhoneInput(secondaryPhone || '');
                setIsEditingSecPhone(true);
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              {secondaryPhone ? "O'zgartirish" : "Qo'shish"}
            </button>
          )}
        </div>

        {isEditingSecPhone ? (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={secPhoneInput}
              onChange={(e) => setSecPhoneInput(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="flex-1 bg-[#150305] border border-amber-400 text-stone-100 placeholder-stone-500 text-xs rounded-xl px-3 py-2 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveSecPhone}
              className="px-3.5 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
            >
              Saqlash
            </button>
            <button
              onClick={() => setIsEditingSecPhone(false)}
              className="px-2.5 py-2 text-stone-400 hover:text-white text-xs"
            >
              Bekor
            </button>
          </div>
        ) : (
          secondaryPhone && (
            <div className="flex items-center justify-between bg-[#150305]/70 p-2.5 rounded-xl border border-amber-500/10">
              <span className="text-xs font-bold text-stone-200">{secondaryPhone}</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-md">Biriktirilgan</span>
            </div>
          )
        )}
      </div>

      {/* Yetkazib berish manzili (GPS yoki qo'lda kiritish) */}
      <div className="bg-[#28080b]/90 border border-amber-500/20 rounded-3xl p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-200">
                Yetkazib berish manzili
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                {userCoords ? (
                  <>
                    <CheckCircle2 size={11} />
                    <span>GPS aniqlangan</span>
                  </>
                ) : (
                  <span className="text-stone-400">Qo'lda kiritilgan yoki aniqlanmoqda</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditingAddress && (
              <button
                onClick={() => {
                  setAddressInput(deliveryAddress || '');
                  setIsEditingAddress(true);
                }}
                className="text-xs font-bold text-stone-300 hover:text-white bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10"
              >
                O'zgartirish
              </button>
            )}

            <button
              onClick={handleLocationRefresh}
              disabled={isDetectingLocation}
              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20 active:scale-95 transition"
              title="GPS orqali avtomatik aniqlash"
            >
              <RotateCw size={12} className={isDetectingLocation ? 'animate-spin' : ''} />
              <span>{isDetectingLocation ? 'GPS...' : 'GPS'}</span>
            </button>
          </div>
        </div>

        {isEditingAddress ? (
          <div className="space-y-2 pt-1">
            <div className="relative">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Masalan: Rishton, Yangi hayot MFY, 15-uy..."
                className="w-full bg-[#150305] border border-amber-400 text-stone-100 placeholder-stone-500 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAddress}
                className="flex-1 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md text-center"
              >
                Saqlash
              </button>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="px-3 py-2 text-stone-400 hover:text-white text-xs"
              >
                Bekor
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#150305]/80 p-3 rounded-2xl border border-amber-500/10 space-y-1.5">
            <p className="text-xs font-bold text-stone-100 leading-relaxed">
              {deliveryAddress || "Manzil belgilanmagan. 'O'zgartirish' yoki 'GPS' tugmasini bosing."}
            </p>

            {userCoords && (
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-white/5">
                <span>GPS: {Number(userCoords.lat || userCoords.latitude).toFixed(5)}, {Number(userCoords.lon || userCoords.longitude).toFixed(5)}</span>
                <a
                  href={`https://maps.google.com/?q=${userCoords.lat || userCoords.latitude},${userCoords.lon || userCoords.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buyurtmalarim Section matching Screenshot 5 */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2">
          <Receipt size={17} className="text-amber-400" />
          <h3 className="font-serif text-base font-bold text-amber-300">
            Buyurtmalarim
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#28080b]/90 border border-amber-500/15 rounded-3xl p-8 text-center space-y-1 shadow-md">
            <p className="text-sm font-serif text-stone-300">
              Hozircha buyurtmalar yo'q
            </p>
            <p className="text-xs text-stone-500">
              Menyudan taom tanlang va buyurtma bering
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                className="bg-[#28080b]/90 border border-amber-500/15 rounded-2xl p-3.5 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">#{ord.id}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    ord.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : ord.status === 'delivering'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {ord.statusText || ord.status || 'Kutilmoqda'}
                  </span>
                </div>

                <div className="text-xs text-stone-300 space-y-0.5">
                  {(ord.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.name}</span>
                      <span>{(it.price * it.quantity).toLocaleString('uz-UZ')} so‘m</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-white/5">
                  <span className="text-stone-400">{ord.date}</span>
                  <span className="text-amber-400 font-extrabold font-serif text-sm">
                    {(ord.total || 0).toLocaleString('uz-UZ')} so‘m
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aloqa Markazi Card */}
      <div className="bg-[#28080b]/90 border border-amber-500/20 rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-300">
              Ibrohim Ota Choyxonasi
            </h4>
            <p className="text-[11px] text-stone-400">
              Milliy taomlar, tandir kabob va shashlik
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Aloqa
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-amber-400 shrink-0" />
            <span>Ish vaqti: 08:00 dan 23:00 gacha</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-amber-400 shrink-0" />
            <span>Manzil: Rishton tumani, Milliy bank ro‘parasi</span>
          </div>
        </div>

        <a
          href="tel:+998200000149"
          onClick={() => telegram.triggerHaptic('medium')}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <PhoneCall size={14} />
          <span>Qo‘ng‘iroq qilish: +998 20 000 01 49</span>
        </a>
      </div>

      {/* Admin Panel tugmasi - faqat tasdiqlangan Adminlar (7048168954) uchun ko'rinadi */}
      {isAuthorizedAdmin && (
        <button
          onClick={() => {
            telegram.triggerHaptic('medium');
            setActiveTab('admin');
          }}
          className="w-full py-3.5 bg-gradient-to-r from-[#28080b] to-[#1c0507] hover:from-[#350a0f] hover:to-[#24070a] border border-amber-500/30 text-amber-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition"
        >
          <ShieldAlert size={16} className="text-amber-400" />
          <span>👑 Admin Panel (Taomlar va Narxlar)</span>
        </button>
      )}
    </div>
  );
}
