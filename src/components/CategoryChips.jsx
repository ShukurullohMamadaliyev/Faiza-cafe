import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CategoryChips() {
  const { selectedCategory, setSelectedCategory, t, telegram } = useApp();

  const handleSelect = (catId) => {
    telegram.triggerHaptic('selection');
    setSelectedCategory(catId);
  };

  return (
    <div className="py-2.5 px-4 bg-white border-b border-gray-100 select-none">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const translatedName = t.categories?.[cat.id] || cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-[#0d3b2e] text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200/80 active:scale-95'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{translatedName}</span>
              {cat.badge && (
                <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
