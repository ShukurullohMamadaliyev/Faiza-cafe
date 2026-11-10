import React from 'react';
import FoodCard from '../components/FoodCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { Search, X } from 'lucide-react';

export default function HomePage() {
  const {
    productList,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    userName,
    setActiveTab,
    telegram
  } = useApp();

  const categories = CATEGORIES.filter((c) => c.id !== 'all');

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && product.category === selectedCategory;
  });

  const popularProducts = filteredProducts.filter((p) => p.isPopular || p.badge === 'Xit').slice(0, 10);
  const displayProducts = popularProducts.length > 0 ? popularProducts : filteredProducts.slice(0, 12);

  const handleCategoryClick = (catId) => {
    telegram.triggerHaptic('selection');
    setSelectedCategory(catId);
    setActiveTab('menu');
  };

  return (
    <div className="pb-28 px-4 pt-3 space-y-4">
      {/* Top Header matching Screenshot 1 */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-13 h-13 rounded-2xl bg-[#2a070b] border border-amber-400/40 p-1 flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
          <img
            src="/logo.svg"
            alt="Ibrohim Ota Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <p className="text-amber-200/80 text-xs font-serif italic truncate">
            Assalomu alaykum, {userName || 'Mehmon'}
          </p>
          <h1 className="text-2xl font-serif font-black text-amber-400 tracking-wide leading-tight">
            Ibrohim Ota
          </h1>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Taom yoki ichimlik qidirish..."
          className="w-full bg-[#27080b]/90 border border-amber-500/20 text-stone-100 placeholder-stone-400 text-xs rounded-2xl pl-10 pr-9 py-2.5 focus:outline-none focus:border-amber-400 transition shadow-inner"
        />
        <Search size={16} className="absolute left-3.5 top-3 text-amber-400/70" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Categories Section matching Screenshot 1 */}
      {!searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-amber-400/60 w-12"></div>
            <h3 className="font-serif text-amber-300 text-sm font-semibold tracking-wide">
              Kategoriyalar
            </h3>
            <div className="h-px bg-gradient-to-l from-transparent via-amber-400/30 to-amber-400/60 w-12"></div>
          </div>

          <div className="flex items-start gap-3 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex flex-col items-center flex-shrink-0 group active:scale-95 transition"
                  style={{ width: '68px' }}
                >
                  <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-[#2a070b] p-0.5 shadow-md transition ${
                    isSelected ? 'ring-2 ring-amber-400 border border-amber-300' : 'border border-amber-500/20 group-hover:border-amber-400/50'
                  }`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>

                  <span className="text-[11px] font-medium text-amber-100/90 text-center mt-1.5 leading-tight line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mashhur taomlar Section matching Screenshot 1 & 2 */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-amber-400/60 w-12"></div>
          <h3 className="font-serif text-amber-300 text-sm font-semibold tracking-wide">
            {searchQuery ? 'Qidiruv natijalari' : 'Mashhur taomlar'}
          </h3>
          <div className="h-px bg-gradient-to-l from-transparent via-amber-400/30 to-amber-400/60 w-12"></div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {displayProducts.map((product) => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <p className="text-sm font-serif text-amber-300">Taom topilmadi</p>
            <p className="text-xs">Boshqa so‘z bilan qidirib ko‘ring</p>
          </div>
        )}
      </div>
    </div>
  );
}
