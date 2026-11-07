import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Receipt,
  Heart,
  MapPin,
  Tag,
  Bell,
  Globe,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const {
    telegram,
    lang,
    setLang,
    t,
    setActiveTab,
    favorites,
    productList,
    setSelectedProduct,
    showToast
  } = useApp();

  const [userName, setUserName] = useState(telegram.user?.first_name || 'Sherzodbek');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const favProducts = productList.filter((p) => favorites.includes(p.id));

  return (
    <div className="pb-28 min-h-screen bg-[#F8FAF9]">
      {/* Header matching screenshot 11 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={() => {
            telegram.triggerHaptic('light');
            setActiveTab('home');
          }}
          className="flex items-center gap-2 font-black text-base text-[#0d3b2e]"
        >
          <ArrowLeft size={20} />
          <span>{t.profileTitle}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* User Card matching screenshot 11 */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0d3b2e] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-emerald-400/30 overflow-hidden">
              <img
                src="/logo.png"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-sm font-bold border border-emerald-500 rounded-lg px-2 py-0.5 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      showToast('Ism yangilandi');
                    }}
                    className="text-xs bg-[#0d3b2e] text-white px-2 py-1 rounded-md"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-900 leading-tight">
                    {userName}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-emerald-700"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
              <span className="text-xs text-gray-400 font-medium block mt-0.5">
                +998 90 123 45 67
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Menu list "Ma'lumotlarim" */}
        <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-card divide-y divide-gray-100">
          <div className="px-4 py-2.5 text-xs font-black text-gray-400 uppercase tracking-wider">
            {t.myInfo}
          </div>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              setActiveTab('orders');
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.orderHistory}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              setShowFavoritesModal(true);
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <Heart size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.favorites}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">{favorites.length} ta</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              showToast('Manzillar saqlandi');
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MapPin size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.deliveryAddresses}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              showToast('Mavjud promokodlar: FAYZ10, FAYZ20K');
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Tag size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.myPromoCodes}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              showToast('Bildirishnomalar yoqilgan');
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bell size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.notifications}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>

        {/* Language Switcher matching screenshot 11 */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card space-y-2.5">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
            {t.language}
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ru', label: 'RU' },
              { id: 'uz', label: "O'Z" },
              { id: 'en', label: 'EN' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  telegram.triggerHaptic('selection');
                  setLang(item.id);
                  showToast(`Til o'zgartirildi: ${item.label}`);
                }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  lang === item.id
                    ? 'bg-[#0d3b2e] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Panel Access */}
        <div className="pt-2">
          <button
            onClick={() => {
              telegram.triggerHaptic('medium');
              setActiveTab('admin');
            }}
            className="w-full py-3.5 bg-gray-900 hover:bg-black active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            <ShieldAlert size={16} className="text-amber-400" />
            <span>Admin Panel (Kafedra boshqaruvi)</span>
          </button>
        </div>

        {/* Support & Version */}
        <div className="text-center pt-2 space-y-1">
          <p className="text-[11px] text-gray-400 font-medium">
            Fayz Cafe Telegram Mini App v1.0.0
          </p>
          <a
            href="tel:+998712000000"
            className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold hover:underline"
          >
            <PhoneCall size={12} />
            <span>Qo'llab-quvvatlash xizmati</span>
          </a>
        </div>
      </div>

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#0d3b2e] flex items-center gap-2">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span>Sevimlilar ({favProducts.length})</span>
              </h3>
              <button
                onClick={() => setShowFavoritesModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {favProducts.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">
                Hozircha sevimli taomlar qo'shilmagan
              </p>
            ) : (
              <div className="space-y-2">
                {favProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowFavoritesModal(false);
                    }}
                    className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-2xl flex items-center gap-3 cursor-pointer transition border border-gray-100"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs font-black text-emerald-800">
                        {p.price.toLocaleString('uz-UZ')} so'm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
