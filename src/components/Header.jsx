import React, { useState } from 'react';
import { Bike, ShoppingBag, UtensilsCrossed, ChevronDown, MapPin, Search, X, Clock } from 'lucide-react';
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

  return (
    <div className="bg-white px-4 pt-3 pb-3 space-y-3 border-b border-gray-100 shadow-xs">
      {/* Brand Hero Bar: Logo + Brand + Branch / Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#0d3b2e] p-1 flex items-center justify-center shadow-sm border border-emerald-900/10">
            <img
              src="/logo.png"
              alt="Faiza Cafe Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[16px] font-black tracking-tight text-[#0d3b2e] leading-none flex items-center gap-1.5">
              FAIZA CAFE
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ESTD 2024
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1 font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <Clock size={11} className="text-emerald-600" />
                10:00 – 23:00
              </span>
              <span>•</span>
              <span className="text-gray-400">Halol</span>
            </div>
          </div>
        </div>

        {/* Cafe Status Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ochiq
        </div>
      </div>

      {/* Mode Location Selector Pill (Clickable) */}
      <button
        onClick={() => {
          telegram.triggerHaptic('selection');
          setIsBranchModalOpen(true);
        }}
        className="w-full flex items-center justify-between bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/70 rounded-2xl px-3 py-2 text-left transition group active:scale-99"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin size={15} />
          </div>
          <div className="leading-tight truncate">
            <div className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">
              {orderType === 'delivery'
                ? 'Yetkazib berish manzili'
                : orderType === 'takeaway'
                ? 'Olib ketish filiali'
                : 'Kafedagi stol'}
            </div>
            <div className="text-xs font-bold text-gray-900 truncate">
              {orderType === 'delivery'
                ? deliveryAddress
                : orderType === 'takeaway'
                ? selectedBranch.name
                : `${tableNumber}-stol (Zalda)`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-brand-700 pl-2 shrink-0">
          <span>O'zgartirish</span>
          <ChevronDown size={14} className="text-brand-600 group-hover:translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* Order Mode Switcher (Delivery 🛵 / Takeaway 🛍️ / Dine-In 🍽️) */}
      <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => handleOrderTypeChange('delivery')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'delivery'
              ? 'bg-[#0d3b2e] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bike size={15} className={orderType === 'delivery' ? 'text-emerald-300' : 'text-gray-400'} />
          <span className="truncate">{t.delivery}</span>
        </button>

        <button
          onClick={() => handleOrderTypeChange('takeaway')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'takeaway'
              ? 'bg-[#0d3b2e] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={15} className={orderType === 'takeaway' ? 'text-emerald-300' : 'text-gray-400'} />
          <span className="truncate">{t.takeaway}</span>
        </button>

        <button
          onClick={() => handleOrderTypeChange('dineIn')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
            orderType === 'dineIn'
              ? 'bg-[#0d3b2e] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UtensilsCrossed size={14} className={orderType === 'dineIn' ? 'text-emerald-300' : 'text-gray-400'} />
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
            className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200/80 text-sm font-medium text-gray-800 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 transition"
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
              <h3 className="font-bold text-base text-[#0d3b2e]">
                {orderType === 'delivery'
                  ? 'Yetkazib berish manzilini kiriting'
                  : orderType === 'takeaway'
                  ? 'Fayz Cafe filialini tanlang'
                  : 'Stol raqamini tanlang'}
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
                <label className="text-xs font-semibold text-gray-500">Yetkazish manzilingiz:</label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Shahar, ko‘cha, xonadon, qavat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  onClick={() => {
                    setDeliveryAddress(tempAddress);
                    setIsBranchModalOpen(false);
                    telegram.triggerHaptic('medium');
                  }}
                  className="w-full py-3 bg-[#0d3b2e] hover:bg-emerald-900 active:scale-98 text-white font-bold rounded-xl text-sm transition shadow-md"
                >
                  Manzilni saqlash
                </button>
              </div>
            )}

            {orderType === 'takeaway' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">Buyurtmangizni qaysi filialdan olib ketmoqchisiz?</p>
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
                        ? 'border-emerald-600 bg-emerald-50/70'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#0d3b2e]">{branch.name}</div>
                      <div className="text-xs text-gray-500">{branch.address}</div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {branch.distance}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {orderType === 'dineIn' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Kafedagi stolingizdagi raqamni tanlang:</p>
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
                          ? 'border-emerald-600 bg-[#0d3b2e] text-white shadow-xs'
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
