import React from 'react';
import { X, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TelegramHeader() {
  const { telegram } = useApp();

  return (
    <div className="sticky top-0 z-40 bg-[#0d3b2e] text-white px-4 py-2.5 flex items-center justify-between select-none shadow-md">
      <button
        onClick={() => telegram.onClose()}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 active:scale-95 transition"
        aria-label="Yopish"
      >
        <X size={17} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Faiza Cafe"
          className="h-7 w-auto object-contain rounded-md"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-[14px] text-white tracking-tight">FAIZA CAFE</span>
            <span className="text-[10px] text-gold-400 font-bold bg-white/10 px-1.5 py-0.5 rounded-full border border-gold-400/30">
              MINI APP
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
            <ShieldCheck size={11} className="text-emerald-400" />
            Rasmiy buyurtma boti
          </span>
        </div>
      </div>

      <button
        onClick={() => telegram.triggerHaptic('selection')}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 active:scale-95 transition"
        aria-label="Qo'shimcha"
      >
        <MoreHorizontal size={17} strokeWidth={2.5} />
      </button>
    </div>
  );
}
