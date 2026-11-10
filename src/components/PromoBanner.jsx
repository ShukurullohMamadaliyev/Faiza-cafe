import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { BANNERS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, setSelectedProduct, setSelectedCategory, setActiveTab, telegram } = useApp();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto slide har 4.5 soniyada
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[currentSlide] || BANNERS[0];

  const handleBannerClick = () => {
    telegram.triggerHaptic('medium');

    // 1. Kategoriyani bannerning o'z haqiqiy toifasiga o'tkazish (masalan: 'hotdishes', 'shashlik', 'fastfood')
    const targetCat = banner.category || 'all';
    setSelectedCategory(targetCat);

    // 2. Bannerdagi aynan usha taomni topib, to'g'ridan-to'g'ri ochib berish
    if (banner.productId && productList && productList.length > 0) {
      const targetDish = productList.find((p) => p.id === banner.productId);
      if (targetDish) {
        setSelectedProduct(targetDish);
        return;
      }
    }

    // Agar taom topilmasa, menyu sahifasiga to'g'ri toifa bilan o'tish
    setActiveTab('menu');
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    telegram.triggerHaptic('selection');
    setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    telegram.triggerHaptic('selection');
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  };

  // Barmoq bilan surish (Swipe)
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Chapga surildi -> Keyingi slayd
      telegram.triggerHaptic('selection');
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    } else if (diff < -45) {
      // O'ngga surildi -> Oldingi slayd
      telegram.triggerHaptic('selection');
      setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="px-4 py-2 select-none">
      <div
        onClick={handleBannerClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          background: banner.bgGradient || 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
          boxShadow: `0 12px 30px -8px ${banner.glowColor || 'rgba(153, 27, 27, 0.45)'}`
        }}
        className="relative overflow-hidden rounded-[26px] text-white cursor-pointer transition-all duration-500 active:scale-98 group border border-white/15"
      >
        {/* Dekorativ orqa fon yoritgichlari (Glow effect) */}
        <div
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full filter blur-3xl opacity-40 pointer-events-none transition-colors duration-700"
          style={{ background: banner.glowColor || 'rgba(239, 68, 68, 0.6)' }}
        />
        <div
          className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full filter blur-3xl opacity-25 pointer-events-none transition-colors duration-700"
          style={{ background: banner.glowColor || 'rgba(239, 68, 68, 0.4)' }}
        />

        {/* Asosiy Banner Konteyniri */}
        <div className="relative z-10 flex flex-row items-center p-4 min-h-[148px]">
          {/* Chap Qism: Matnlar va Narx */}
          <div className="flex-1 pr-3 space-y-1.5 animate-fade-in key={banner.id}">
            {/* Yorliq (Badge) */}
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-xs ${
                  banner.badgeColor || 'bg-white/20 text-white border-white/30'
                }`}
              >
                <Sparkles size={11} className="animate-pulse" />
                <span>{banner.badge}</span>
              </span>
              {banner.tag && (
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  • {banner.tag}
                </span>
              )}
            </div>

            {/* Sarlavha */}
            <h3 className="text-lg font-black tracking-tight leading-snug text-white drop-shadow-md">
              {banner.title}
            </h3>

            {/* Tavsif */}
            <p className="text-[11px] text-white/85 line-clamp-1 font-medium leading-relaxed drop-shadow-xs">
              {banner.subtitle}
            </p>

            {/* Narx va Ko'rish tugmasi */}
            <div className="pt-1.5 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-amber-400 text-gray-950 font-black text-xs shadow-md flex items-center gap-1">
                <span>{banner.price} so'm</span>
              </div>

              {banner.oldPrice && (
                <span className="text-[11px] text-white/55 line-through font-semibold">
                  {banner.oldPrice} so'm
                </span>
              )}

              <div className="ml-auto pr-1">
                <span className="text-[10px] font-extrabold text-white/95 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 transition shadow-xs">
                  <ShoppingBag size={11} />
                  <span>Tanlash</span>
                </span>
              </div>
            </div>
          </div>

          {/* O'ng Qism: 3D Taom Rasmi */}
          <div className="w-[124px] h-[116px] relative shrink-0">
            {/* Rasm orqasidagi porlash */}
            <div
              className="absolute inset-0 rounded-2xl filter blur-md opacity-70 transition-all duration-700"
              style={{ background: banner.glowColor || 'rgba(16, 185, 129, 0.4)' }}
            />

            <img
              key={banner.image}
              src={banner.image}
              alt={banner.title}
              className="relative z-10 w-full h-full object-cover rounded-2xl shadow-xl border-2 border-white/30 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Pastki Navigatsiya: Indikator nuqtalar va Strelkalar */}
        <div className="relative z-10 px-4 pb-2.5 flex items-center justify-between">
          {/* Indikatorlar */}
          <div className="flex items-center gap-1.5">
            {BANNERS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  telegram.triggerHaptic('light');
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-white shadow-xs' : 'w-1.5 bg-white/35 hover:bg-white/60'
                }`}
                aria-label={`Slayd ${idx + 1}`}
              />
            ))}
          </div>

          {/* Kichik strelkalar */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition"
              aria-label="Oldingi aksiya"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition"
              aria-label="Keyingi aksiya"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
