import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, Bike, ShoppingBag, RotateCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    orderType,
    setOrderType,
    selectedBranch,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    cartTotal,
    cartSubtotal,
    discountAmount,
    submitOrder,
    telegram,
    userPhone,
    userName,
    secondaryPhone,
    userCoords,
    detectAndSetLocation,
    isDetectingLocation,
    showToast
  } = useApp();

  const [name, setName] = useState(userName || telegram.user?.first_name || 'Mijoz');
  const [phone, setPhone] = useState(userPhone || '');
  const [secPhone, setSecPhone] = useState(secondaryPhone || '');
  const [address, setAddress] = useState(deliveryAddress);
  const [table, setTable] = useState(tableNumber);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd');

  useEffect(() => {
    if (userName) setName(userName);
  }, [userName]);

  useEffect(() => {
    if (userPhone) setPhone(userPhone);
  }, [userPhone]);

  useEffect(() => {
    if (secondaryPhone) setSecPhone(secondaryPhone);
  }, [secondaryPhone]);

  useEffect(() => {
    if (deliveryAddress) setAddress(deliveryAddress);
  }, [deliveryAddress]);

  const handleRefreshGps = async () => {
    telegram.triggerHaptic('medium');
    const res = await detectAndSetLocation(false);
    if (res?.address) {
      setAddress(res.address);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Iltimos, ismingizni kiriting');
      return;
    }
    if (!phone.trim()) {
      showToast('Iltimos, telefon raqamingizni kiriting');
      return;
    }

    telegram.triggerHaptic('success');
    submitOrder({
      name: name.trim(),
      phone: phone.trim(),
      secondaryPhone: secPhone.trim() || undefined,
      address: orderType === 'delivery' ? address.trim() : undefined,
      table: orderType === 'dineIn' ? table : undefined,
      note: note.trim(),
      paymentMethod
    });
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 select-none animate-fade-in">
      <div className="bg-[#24070a] border border-amber-500/25 text-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="font-serif font-black text-base text-amber-400">
              Buyurtmani tasdiqlash
            </h3>
            <p className="text-[11px] text-stone-400">
              Ma'lumotlarni tekshiring va tasdiqlang
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Order Type */}
          <div className="grid grid-cols-2 gap-2 bg-[#150305] p-1 rounded-2xl border border-amber-500/15">
            <button
              type="button"
              onClick={() => {
                telegram.triggerHaptic('selection');
                setOrderType('delivery');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                orderType === 'delivery'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🚗 Yetkazib berish
            </button>
            <button
              type="button"
              onClick={() => {
                telegram.triggerHaptic('selection');
                setOrderType('takeaway');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                orderType === 'takeaway'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              🛍 Olib ketish
            </button>
          </div>

          {/* Customer Name & Primary Phone */}
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Ismingiz *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#150305] border border-amber-500/20 text-sm font-semibold text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Asosiy telefon raqamingiz *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#150305] border border-amber-500/20 text-sm font-semibold text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Qo'shimcha telefon raqami (Ixtiyoriy) */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1 flex items-center justify-between">
                <span>Qo‘shimcha telefon raqami</span>
                <span className="text-[10px] text-amber-400 font-normal">Ixtiyoriy</span>
              </label>
              <input
                type="tel"
                value={secPhone}
                onChange={(e) => setSecPhone(e.target.value)}
                placeholder="+998 90 123 45 67 (Yaqinlar yoki 2-raqam)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#150305] border border-amber-500/20 text-sm font-semibold text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Delivery Address & GPS */}
            {orderType === 'delivery' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-300">
                    Yetkazib berish manzili *
                  </label>
                  <button
                    type="button"
                    onClick={handleRefreshGps}
                    disabled={isDetectingLocation}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <RotateCw size={11} className={isDetectingLocation ? 'animate-spin' : ''} />
                    <span>{isDetectingLocation ? 'GPS tekshirilmoqda...' : 'GPS yangilash (2x)'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ko'cha, uy raqami yoki mo'ljal"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-[#150305] border border-amber-500/20 text-sm font-semibold text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                  <MapPin size={16} className="absolute left-3 top-3 text-amber-400" />
                </div>

                {userCoords && (
                  <p className="text-[10px] text-emerald-400 font-mono">
                    📍 GPS koordinatalar biriktirildi (2x tekshirilgan)
                  </p>
                )}
              </div>
            )}

            {orderType === 'takeaway' && (
              <div className="p-3 bg-[#150305] rounded-xl border border-amber-500/20 text-xs text-stone-300">
                <span className="font-bold text-amber-300 block">Olib ketish manzili:</span>
                <span>{selectedBranch?.name || 'Ibrohim Ota Choyxonasi'} ({selectedBranch?.address || "Rishton tumani, Milliy bank ro'parasi"})</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Izoh yoki istaklar (Ixtiyoriy)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masalan: non qo'shimcha bo'lsin, salat alohida..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#150305] border border-amber-500/20 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-stone-300 block">
              To‘lov turi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Naqd')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'Naqd'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-[#150305] text-stone-400'
                }`}
              >
                <span>💵 Naqd pul</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Karta')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'Karta'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-[#150305] text-stone-400'
                }`}
              >
                <span>💳 Karta orqali</span>
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#150305] p-3.5 rounded-2xl border border-amber-500/15 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Taomlar:</span>
              <span>{cartSubtotal.toLocaleString('uz-UZ')} so‘m</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Yetkazib berish:</span>
              <span className="text-amber-400 font-bold">BEPUL</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Chegirma:</span>
                <span>-{discountAmount.toLocaleString('uz-UZ')} so‘m</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-white/10 flex justify-between items-baseline text-sm font-black text-white">
              <span>Jami:</span>
              <span className="text-base font-serif text-amber-400 font-bold">
                {cartTotal.toLocaleString('uz-UZ')} so‘m
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition"
          >
            Buyurtmani tasdiqlash • {cartTotal.toLocaleString('uz-UZ')} so‘m
          </button>
        </form>
      </div>
    </div>
  );
}
