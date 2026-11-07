import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { BANNERS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setActiveTab, setSelectedCategory, telegram } = useApp();

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[currentSlide];

  const handleBannerClick = () => {
    telegram.triggerHaptic('medium');
    setSelectedCategory('promos');
    setActiveTab('menu');
  };

  return (
    <div className="px-4 py-2 select-none">
      <div
        onClick={handleBannerClick}
        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0d3b2e] to-[#044c3a] text-white shadow-soft cursor-pointer transition-transform active:scale-98"
      >
        <div className="flex flex-row items-center p-4 min-h-[145px]">
          {/* Left Text Content */}
          <div className="flex-1 z-10 pr-2 space-y-1.5">
            <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-200 border border-emerald-400/20">
              <Sparkles size={11} className="text-gold-400" />
              <span>{banner.badge}</span>
            </div>

            <h3 className="text-lg font-black tracking-tight leading-snug drop-shadow-xs">
              {banner.title}
            </h3>

            <p className="text-[11px] text-white/80 line-clamp-1">
              {banner.subtitle}
            </p>

            {/* Price badge matching screenshot */}
            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-base font-black text-gold-300">
                {banner.price} so'm
              </span>
              {banner.oldPrice && (
                <span className="text-xs text-white/50 line-through">
                  {banner.oldPrice} so'm
                </span>
              )}
            </div>
          </div>

          {/* Right Image */}
          <div className="w-[125px] h-[115px] relative shrink-0">
            <div className="absolute inset-0 bg-radial from-white/20 to-transparent rounded-full filter blur-md"></div>
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover rounded-2xl shadow-lg border-2 border-white/20"
            />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-4 flex items-center gap-1.5 z-10">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                telegram.triggerHaptic('light');
                setCurrentSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
