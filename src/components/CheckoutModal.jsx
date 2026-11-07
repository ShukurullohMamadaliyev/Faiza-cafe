import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, Banknote, MapPin, Bike, ShoppingBag, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    orderType,
    setOrderType,
    selectedBranch,
    tableNumber,
    deliveryAddress,
    cartTotal,
    cartSubtotal,
    deliveryFee,
    discountAmount,
    submitOrder,
    t,
    telegram,
    userPhone,
    userName,
    userCoords,
    detectAndSetLocation,
    isDetectingLocation,
    showToast
  } = useApp();

  const [name, setName] = useState(userName || telegram.user?.first_name || 'Mijoz');
  const [phone, setPhone] = useState(userPhone || '+998 90 377 30 00');
  const [address, setAddress] = useState(deliveryAddress);
  const [table, setTable] = useState(tableNumber);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd');
  const [isVerifyingGps, setIsVerifyingGps] = useState(false);

  // Foydalanuvchi ma'lumotlari yoki manzil yangilanganda state ni yangilash
  useEffect(() => {
    if (userName) setName(userName);
  }, [userName]);

  useEffect(() => {
    if (userPhone) setPhone(userPhone);
  }, [userPhone]);

  useEffect(() => {
    if (deliveryAddress) setAddress(deliveryAddress);
  }, [deliveryAddress]);

  // Har safar buyurtma oynasi ochilganda aniq GPS koordinatasini avtomatik yangilash
  useEffect(() => {
    if (isCheckoutOpen && orderType === 'delivery') {
      detectAndSetLocation(true).then((res) => {
        if (res?.address) {
          setAddress(res.address);
        }
      });
    }
  }, [isCheckoutOpen, orderType]);

  const handleRefreshGps = async () => {
    setIsVerifyingGps(true);
    const res = await detectAndSetLocation(false);
    if (res?.address) {
      setAddress(res.address);
    }
    setIsVerifyingGps(false);
  };

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentCoords = userCoords;
    if (orderType === 'delivery' && !currentCoords) {
      setIsVerifyingGps(true);
      const res = await detectAndSetLocation(true);
      if (res?.coords) {
        currentCoords = res.coords;
      }
      setIsVerifyingGps(false);
    }

    submitOrder({
      name,
      phone,
      address,
      table,
      note,
      paymentMethod,
      coords: currentCoords
    });
  };

  const paymentOptions = [
    {
      id: 'Naqd',
      label: t.payCash || 'Naqd pul orqali',
      icon: Banknote,
      color: 'text-emerald-700 bg-emerald-50',
      active: true
    },
    {
      id: 'Payme',
      label: 'Payme',
      icon: CreditCard,
      color: 'text-cyan-700 bg-cyan-50',
      active: false,
      badge: t.comingSoon || 'Tez kunda'
    },
    {
      id: 'Click',
      label: 'Click',
      icon: CreditCard,
      color: 'text-blue-700 bg-blue-50',
      active: false,
      badge: t.comingSoon || 'Tez kunda'
    },
    {
      id: 'Uzum',
      label: 'Uzum Bank',
      icon: CreditCard,
      color: 'text-purple-700 bg-purple-50',
      active: false,
      badge: t.comingSoon || 'Tez kunda'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <div
        className="absolute inset-0"
        onClick={() => setIsCheckoutOpen(false)}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-sheet max-h-[92vh] flex flex-col animate-slide-up z-10">
        {/* Header */}
        <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-black text-lg text-[#0d3b2e]">
              {t.checkoutTitle}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Faiza Cafe • {orderType === 'delivery' ? t.delivery : orderType === 'takeaway' ? t.takeaway : t.dineIn}
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t.clientInfo || "Mijoz ma'lumotlari"}
            </h4>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                {t.phone}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Delivery / Takeaway Details */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t.receiveType || "Qabul qilish tartibi"}
            </h4>

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 block">
                    {t.address}
                  </label>
                  <button
                    type="button"
                    onClick={handleRefreshGps}
                    disabled={isDetectingLocation || isVerifyingGps}
                    className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw
                      size={12}
                      className={isDetectingLocation || isVerifyingGps ? 'animate-spin text-emerald-700' : 'text-emerald-700'}
                    />
                    <span>
                      {isDetectingLocation || isVerifyingGps ? 'GPS aniqlanmoqda...' : 'GPS lokatsiyani yangilash'}
                    </span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                  <MapPin size={16} className="absolute left-3 top-3 text-emerald-600" />
                </div>

                {/* Live GPS badge indicator */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-950 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {userCoords ? (
                      <span className="font-mono text-[11px]">
                        📍 GPS: {(userCoords.lat || userCoords.latitude)?.toFixed(4)}, {(userCoords.lon || userCoords.longitude)?.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-600">GPS koordinata aniqlanmoqda...</span>
                    )}
                  </div>
                  {userCoords && (
                    <a
                      href={`https://maps.google.com/?q=${userCoords.lat || userCoords.latitude},${userCoords.lon || userCoords.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-0.5"
                    >
                      <span>Xaritada tekshirish</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {orderType === 'takeaway' && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <ShoppingBag size={20} className="text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">{t.takeaway}</div>
                  <div className="text-xs text-emerald-700 font-medium">{selectedBranch.name} ({selectedBranch.address})</div>
                </div>
              </div>
            )}

            {orderType === 'dineIn' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {t.tableNumber || "Stol raqami"}
                </label>
                <input
                  type="text"
                  required
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                {t.orderNote}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.orderNotePlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t.paymentMethod}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id && opt.active;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (!opt.active) {
                        telegram.triggerHaptic('warning');
                        showToast(
                          t.cashOnlyNotice ||
                            `${opt.label} tez kunda ishga tushadi! Hozircha faqat naqd pulda to‘lov qabul qilinadi.`
                        );
                        return;
                      }
                      telegram.triggerHaptic('selection');
                      setPaymentMethod(opt.id);
                    }}
                    className={`relative flex items-center justify-between p-3 rounded-2xl border transition text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-600/30 shadow-xs'
                        : opt.active
                        ? 'border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300'
                        : 'border-dashed border-gray-200 bg-gray-50/70 text-gray-400 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          opt.active ? opt.color : 'text-gray-400 bg-gray-100'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-xs truncate">{opt.label}</span>
                    </div>

                    {!opt.active && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60 shrink-0">
                        {opt.badge}
                      </span>
                    )}

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>{t.dishesPrice}</span>
              <span>{cartSubtotal.toLocaleString('uz-UZ')} {t.currency}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600 font-medium">
                <span>{t.deliveryFee}</span>
                <span className="text-emerald-700 font-bold">
                  {t.freeDelivery || "Bepul 🚖"}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{t.discount}</span>
                <span>-{discountAmount.toLocaleString('uz-UZ')} {t.currency}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
              <span>{t.totalPay}</span>
              <span className="text-[#0d3b2e]">
                {cartTotal.toLocaleString('uz-UZ')} {t.currency}
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-float transition"
          >
            {t.confirmOrder} • {cartTotal.toLocaleString('uz-UZ')} {t.currency}
          </button>
        </form>
      </div>
    </div>
  );
}
