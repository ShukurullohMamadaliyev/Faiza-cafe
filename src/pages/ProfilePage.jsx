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
  PhoneCall,
  Phone,
  X
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
    showToast,
    userPhone,
    userName,
    setUserName
  } = useApp();

  const [editNameVal, setEditNameVal] = useState(userName || telegram.user?.first_name || 'Mijoz');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const favProducts = productList.filter((p) => favorites.includes(p.id));

  // Faqat belgilangan admin (8340079081) uchungina admin imkoniyati
  const isAdmin =
    telegram.user?.id == 8340079081 ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === '8340079081');

  return (
    <div className="pb-28 min-h-screen bg-[#F8FAF9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={() => {
            telegram.triggerHaptic('light');
            setActiveTab('home');
          }}
          className="flex items-center gap-2 font-black text-base text-[#991b1b]"
        >
          <ArrowLeft size={20} />
          <span>{t.profileTitle}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#991b1b] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-red-400/30 overflow-hidden">
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
                    value={editNameVal}
                    onChange={(e) => setEditNameVal(e.target.value)}
                    className="text-sm font-bold border border-red-500 rounded-lg px-2 py-0.5 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setUserName(editNameVal);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('ibrohim_ota_user_name', editNameVal);
                      }
                      showToast(t.nameUpdated || 'Ism yangilandi');
                    }}
                    className="text-xs bg-[#991b1b] text-white px-2 py-1 rounded-md"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-900 leading-tight">
                    {userName || 'Mijoz'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditNameVal(userName);
                      setIsEditingName(true);
                    }}
                    className="text-gray-400 hover:text-red-700"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
              <span className="text-xs text-red-800 font-bold block mt-1 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200/60 inline-flex items-center gap-1">
                <span>📱</span>
                <span>{userPhone || '+998 90 377 30 00'}</span>
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center">
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
              <span className="text-xs font-bold text-gray-400">{favorites.length} {t.itemsInCart || 'ta'}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              showToast(t.addressesSaved || 'Manzillar saqlandi');
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
              showToast(t.promosAvailable || 'Mavjud promokodlar: IBROHIM10, IBROHIM20K');
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Tag size={17} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.myPromoCodes}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button
            onClick={() => {
              telegram.triggerHaptic('light');
              showToast(t.notificationsEnabled || 'Bildirishnomalar yoqilgan');
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

        {/* Language Switcher */}
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
                  showToast(item.id === 'ru' ? 'Язык изменен: RU' : item.id === 'en' ? 'Language switched: EN' : "Til o'zgartirildi: O'Z");
                }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  lang === item.id
                    ? 'bg-[#991b1b] text-white shadow-sm ring-2 ring-red-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Panel Access - Faqat Telegram ID 8340079081 bo'lganda ko'rinadi */}
        {isAdmin && (
          <div className="pt-2">
            <button
              onClick={() => {
                telegram.triggerHaptic('medium');
                setActiveTab('admin');
              }}
              className="w-full py-3.5 bg-gray-900 hover:bg-black active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} className="text-amber-400" />
              <span>🔐 {t.adminPanel}</span>
            </button>
          </div>
        )}

        {/* Support & Version with 2-number selector */}
        <div className="text-center pt-2 space-y-2">
          <p className="text-[11px] text-gray-400 font-medium">
            Ibrohim Ota Choyxonasi Telegram Mini App v1.0.0
          </p>
          <button
            onClick={() => {
              telegram.triggerHaptic('selection');
              setShowSupportModal(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-red-800 font-bold bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition active:scale-95"
          >
            <PhoneCall size={14} className="text-red-700" />
            <span>{t.supportService}</span>
          </button>
        </div>
      </div>

      {/* 2 ta Raqamli Qo'llab-quvvatlash Modali (Support Modal) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-slide-up border border-red-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#991b1b]">{t.callSupport}</h3>
                  <p className="text-[11px] text-gray-400">{t.callPrompt}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* 1-Raqam: +998 90 377 30 00 */}
              <a
                href="tel:+998903773000"
                onClick={() => telegram.triggerHaptic('medium')}
                className="p-3.5 bg-red-50/80 hover:bg-red-100 border border-red-200 rounded-2xl flex items-center justify-between transition group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500">{t.callLine1}</div>
                    <div className="text-sm font-black text-[#991b1b] tracking-wide">+998 90 377 30 00</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-red-100">
                  {t.call}
                </span>
              </a>

              {/* 2-Raqam: +998 98 571 00 67 */}
              <a
                href="tel:+998985710067"
                onClick={() => telegram.triggerHaptic('medium')}
                className="p-3.5 bg-red-50/80 hover:bg-red-100 border border-red-200 rounded-2xl flex items-center justify-between transition group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500">{t.callLine2}</div>
                    <div className="text-sm font-black text-[#991b1b] tracking-wide">+998 98 571 00 67</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-red-100">
                  {t.call}
                </span>
              </a>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#991b1b] flex items-center gap-2">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span>{t.favorites} ({favProducts.length})</span>
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
                {t.noFavoritesYet || "Hozircha sevimli taomlar yo'q"}
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
                    className="p-3 bg-gray-50 hover:bg-red-50 rounded-2xl flex items-center gap-3 cursor-pointer transition border border-gray-100"
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
                      <div className="text-xs font-black text-red-800">
                        {p.price.toLocaleString('uz-UZ')} {t.currency}
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
