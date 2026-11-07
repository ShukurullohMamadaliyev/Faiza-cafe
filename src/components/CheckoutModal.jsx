import React, { useState } from 'react';
import { X, Check, CreditCard, Banknote, MapPin, Bike, ShoppingBag, UtensilsCrossed } from 'lucide-react';
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
    telegram
  } = useApp();

  const [name, setName] = useState(telegram.user?.first_name || 'Sherzodbek');
  const [phone, setPhone] = useState('+998 90 123 45 67');
  const [address, setAddress] = useState(deliveryAddress);
  const [table, setTable] = useState(tableNumber);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd'); // 'Naqd' | 'Payme' | 'Click' | 'Uzum'

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitOrder({
      name,
      phone,
      address,
      table,
      note,
      paymentMethod
    });
  };

  const paymentOptions = [
    { id: 'Naqd', label: t.payCash, icon: Banknote, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'Payme', label: t.payPayme, icon: CreditCard, color: 'text-cyan-700 bg-cyan-50' },
    { id: 'Click', label: t.payClick, icon: CreditCard, color: 'text-blue-700 bg-blue-50' },
    { id: 'Uzum', label: t.payUzum, icon: CreditCard, color: 'text-purple-700 bg-purple-50' },
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
              Fayz Cafe • {orderType === 'delivery' ? t.delivery : orderType === 'takeaway' ? t.takeaway : t.dineIn}
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
              Mijoz ma'lumotlari
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
              Qabul qilish tartibi
            </h4>

            {orderType === 'delivery' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {t.address}
                </label>
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
              </div>
            )}

            {orderType === 'takeaway' && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <ShoppingBag size={20} className="text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Filialdan olib ketish</div>
                  <div className="text-xs text-emerald-700 font-medium">{selectedBranch.name} ({selectedBranch.address})</div>
                </div>
              </div>
            )}

            {orderType === 'dineIn' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Stol raqami
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
                {t.orderNote} (ixtiyoriy)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Masalan: Achchiq sous alohida idishda bo'lsin"
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
                const isSelected = paymentMethod === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      telegram.triggerHaptic('selection');
                      setPaymentMethod(opt.id);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-2xl border transition text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${opt.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>{t.dishesPrice}</span>
              <span>{cartSubtotal.toLocaleString('uz-UZ')} so'm</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600 font-medium">
                <span>{t.deliveryFee}</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">Bepul</span>
                  ) : (
                    `${deliveryFee.toLocaleString('uz-UZ')} so'm`
                  )}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{t.discount}</span>
                <span>-{discountAmount.toLocaleString('uz-UZ')} so'm</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
              <span>{t.totalPay}</span>
              <span className="text-[#0d3b2e]">
                {cartTotal.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-float transition"
          >
            {t.confirmOrder} • {cartTotal.toLocaleString('uz-UZ')} so'm
          </button>
        </form>
      </div>
    </div>
  );
}
