import React from 'react';
import FoodCard from '../components/FoodCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

export default function MenuPage() {
  const { productList, searchQuery, selectedCategory, setSelectedCategory, telegram } = useApp();

  const categories = CATEGORIES.filter((c) => c.id !== 'all');
  const activeCategory = selectedCategory === 'all' ? categories[0]?.id || 'hotdishes' : selectedCategory;

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && product.category === activeCategory;
  });

  const handleTabClick = (catId) => {
    telegram.triggerHaptic('selection');
    setSelectedCategory(catId);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {/* Title matching Screenshot 3 */}
      <h1 className="text-2xl font-serif font-black text-amber-400 tracking-wide">
        Menyu
      </h1>

      {/* Horizontal Pill Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar bg-[#27080b]/90 p-1.5 rounded-2xl border border-amber-500/15">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Category Heading in gold serif */}
      <div className="pt-1">
        <h2 className="text-lg font-serif font-bold text-amber-300">
          {currentCategory.name}
        </h2>
      </div>

      {/* 2-Column Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => (
            <FoodCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-400 space-y-2">
          <p className="text-sm font-serif text-amber-300">Bu bo‘limda hozircha taomlar yo‘q</p>
        </div>
      )}
    </div>
  );
}
