import React, { useState } from 'react';
import { Bike, ShoppingBag, UtensilsCrossed, ChevronDown, MapPin, Search, X, Clock, Navigation, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BRANCHES } from '../data/mockData';

export default function Header({ showSearch = true }) {
  const {
    t,
    orderType,
    setOrderType,
    selectedBranch,
    setSelectedBranch,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    setDeliveryAddress,
    isDetectingLocation,
    detectAndSetLocation,
    searchQuery,
    setSearchQuery,
    telegram
  } = useApp();

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(deliveryAddress);

  const handleOrderTypeChange = (type) => {
    telegram.triggerHaptic('light');
    setOrderType(type);
  };

  const handleGpsClick = async (e) => {
    e.stopPropagation();
    await detectAndSetLocation();
  };

  return (
    <div className="bg-white px-4 pt-3 pb-3 space-y-3 border-b border-gray-100 shadow-xs">
      {/* Brand Hero Bar: Logo + Brand + Branch / Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-950 p-1 flex items-center justify-center shadow-md border border-red-900/30">
            <img
              src="/logo.svg"
              alt="Ibrohim Ota Choyxonasi Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[17px] font-black tracking-tight text-[#991b1b] leading-none flex items-center gap-1.5">
              IBROHIM OTA
              <span className="text-[9px] font-extrabold text-red-700 bg-red-100/90 px-1.5 py-0.5 rounded border border-red-200">
                CHOYXONA
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1 font-medium">
              <span className="flex items-center gap-1 text-red-700 font-semibold">
                <Clock size={11} className="text-red-600" />
                08:00 – 23:00
              </span>
              <span>•</span>
              <span className="text-gray-400">{t.halal || 'Halol'}</span>
            </div>
          </div>
        </div>

        {/* Cafe Status Badge */}
        <div className="flex items-center gap-1.5 bg-red-50 text-red-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-red-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          {t.open || 'Ochiq'}
        </div>
      </div>

      {/* Mode Location Selector Pill (Clickable) */}
      <div className="w-full flex items-center justify-between bg-red-50/60 hover:bg-red-50 border border-red-200/70 rounded-2xl px-3 py-2 text-left transition group">
        <button
          onClick={() => {
            telegram.triggerHaptic('selection');
            setTempAddress(deliveryAddress);
            setIsBranchModalOpen(true);
          }}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin size={15} />
          </div>
          <div className="leading-tight truncate pr-1">
            <div className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">
              {orderType === 'delivery'
                ? (t.deliveryAddressLabel || 'Yetkazib berish manzili')
                : orderType === 'takeaway'
                ? (t.takeawayBranchLabel || 'Olib ketish filiali')
                : (t.tableLabel || 'Kafedagi stol')}
            </div>
            <div className="text-xs font-bold text-gray-900 truncate">
              {orderType === 'delivery'
                ? deliveryAddress
                : orderType === 'takeaway'
                ? selectedBranch.name
                : `${tableNumber}-stol`}
            </div>
          </div>
        </button>

        {/* Quick GPS auto-detect button inside header */}
        {orderType === 'delivery' && (
          <button
            onClick={handleGpsClick}
            disabled={isDetectingLocation}
            title={t.detectGps}
            className="flex items-center gap-1 bg-white hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs shrink-0 active:scale-95 transition"
          >
            {isDetectingLocation ? (
              <Loader2 size={13} className="animate-spin text-red-600" />
            ) : (
              <Navigation size={12} className="text-red-700" />
            )}
            <span>GPS</span>
          </button>
        )}

        <button
          onClick={() => {
            telegram.triggerHaptic('selection');
            setTempAddress(deliveryAddress);
            setIsBranchModalOpen(true);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-brand-700 pl-2 shrink-0 cursor-pointer"
        >
          <span>{t.change || "O'zgartirish"}</span>
          <ChevronDown size={14} className="text-brand-600 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Order Mode Switcher (Delivery 🛵 / Takeaway 🛍️ / Dine-In 🍽️) */}
      <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => handleOrderTypeChange('delivery')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'delivery'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bike size={15} className={orderType === 'delivery' ? 'text-amber-300' : 'text-gray-400'} />
          <span className="truncate">{t.delivery}</span>
        </button>

        <button
          onClick={() => handleOrderTypeChange('takeaway')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'takeaway'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={15} className={orderType === 'takeaway' ? 'text-amber-300' : 'text-gray-400'} />
          <span className="truncate">{t.takeaway}</span>
        </button>

        <button
          onClick={() => handleOrderTypeChange('dineIn')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'dineIn'
              ? 'bg-[#991b1b] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UtensilsCrossed size={14} className={orderType === 'dineIn' ? 'text-amber-300' : 'text-gray-400'} />
          <span className="truncate">{t.dineIn}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      {showSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200/80 text-sm font-medium text-gray-800 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                telegram.triggerHaptic('light');
                setSearchQuery('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Location / Branch Selector Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-[#991b1b]">
                {orderType === 'delivery'
                  ? (t.deliveryAddressLabel || 'Yetkazib berish manzili')
                  : orderType === 'takeaway'
                  ? (t.selectBranch || 'Filialni tanlang')
                  : (t.tableNumber || 'Stol raqami')}
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-3">
                {/* GPS orqali bir bosishda aniqlash tugmasi */}
                <button
                  type="button"
                  onClick={async () => {
                    const res = await detectAndSetLocation();
                    if (res?.success) {
                      setTempAddress(res.address);
                      setIsBranchModalOpen(false);
                    }
                  }}
                  disabled={isDetectingLocation}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 active:scale-98 border border-red-300 text-red-900 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-red-700" />
                      <span>{t.gpsDetecting || 'GPS orqali joylashuv aniqlanmoqda...'}</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={15} className="text-red-700" />
                      <span>📍 {t.detectGps || 'Mening joriy joylashuvimni aniqlash (GPS)'}</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="shrink mx-2 text-[11px] text-gray-400 font-medium">
                    {t.orEnterManually || 'yoki qo‘lda kiriting'}
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    {t.address || 'Aniq manzil yoki mo‘ljal:'}
                  </label>
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder={t.addressInputPlaceholder || "Masalan: Rishton, Mustaqillik ko‘chasi, 15-uy..."}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium"
                  />
                </div>

                {/* Rishton tezkor manzillar */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    {t.popularLandmarks || 'Ommabop mo‘ljallar:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Rishton markaz, Milliy bank ro‘parasi',
                      'Rishton buyum bozori',
                      'Rishton kulollar markazi',
                      'Rashidov ko‘chasi'
                    ].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setTempAddress(loc)}
                        className="text-[11px] font-semibold bg-gray-100 hover:bg-red-50 hover:text-red-800 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 transition"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryAddress(tempAddress);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('ibrohim_ota_address', tempAddress);
                    }
                    setIsBranchModalOpen(false);
                    telegram.triggerHaptic('medium');
                  }}
                  className="w-full py-3 bg-[#991b1b] hover:bg-red-900 active:scale-98 text-white font-bold rounded-xl text-sm transition shadow-md"
                >
                  {t.saveAddress || 'Manzilni saqlash'}
                </button>
              </div>
            )}

            {orderType === 'takeaway' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">{t.selectBranch || 'Buyurtmangizni qaysi filialdan olib ketmoqchisiz?'}</p>
                {BRANCHES.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsBranchModalOpen(false);
                      telegram.triggerHaptic('medium');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedBranch.id === branch.id
                        ? 'border-red-600 bg-red-50/70'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#991b1b]">{branch.name}</div>
                      <div className="text-xs text-gray-500">{branch.address}</div>
                    </div>
                    <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      {branch.distance}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {orderType === 'dineIn' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">{t.tableNumber || 'Kafedagi stolingizdagi raqamni tanlang:'}</p>
                <div className="grid grid-cols-4 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', 'VIP 1', 'VIP 2'].map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => {
                        setTableNumber(tbl);
                        setIsBranchModalOpen(false);
                        telegram.triggerHaptic('medium');
                      }}
                      className={`py-2.5 rounded-xl font-bold text-sm border transition ${
                        tableNumber === tbl
                          ? 'border-red-600 bg-[#991b1b] text-white shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
