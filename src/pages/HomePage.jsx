import React from 'react';
import Header from '../components/Header';
import PromoBanner from '../components/PromoBanner';
import CategoryChips from '../components/CategoryChips';
import FoodCard from '../components/FoodCard';
import { useApp } from '../context/AppContext';
import { Flame, Sparkles, Tag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { productList, searchQuery, selectedCategory, setActiveTab, setSelectedCategory, t, telegram } = useApp();

  // Noto'g'ri toifa tushib qolmasligi uchun himoya (agar noma'lum toifa kelsa, 'all' deb oladi)
  const validCategoryIds = ['fastfood', 'pizza', 'hotdishes', 'shashlik', 'drinks_dessert'];
  const activeCategory = validCategoryIds.includes(selectedCategory) ? selectedCategory : 'all';

  // Filter products by search query or active category
  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && product.category === activeCategory;
  });

  // Featured sections when viewing all and no search query active
  const isDefaultView = !searchQuery && activeCategory === 'all';
  const hitProducts = productList.filter((p) => p.isPopular).slice(0, 4);
  const newProducts = productList.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="pb-28">
      {/* Top Header & Delivery Switcher */}
      <Header showSearch={true} />

      {/* Promo Banner Slider (Hidden if search is active) */}
      {!searchQuery && <PromoBanner />}

      {/* Horizontal Category Chips */}
      <CategoryChips />

      <div className="px-4 pt-3 space-y-6">
        {/* If user is searching or has picked a category */}
        {!isDefaultView ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-base text-[#0d3b2e]">
                {searchQuery ? `"${searchQuery}"` : (t.categories?.[activeCategory] || t.allDishes)}
              </h3>
              <span className="text-xs text-gray-500 font-semibold">
                {filteredProducts.length} {t.dishesCount}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <FoodCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm font-semibold">{t.cartEmpty}</p>
                <p className="text-xs mt-1">{t.cartEmptyDesc}</p>
              </div>
            )}
          </div>
        ) : (
          /* Default Rich Multi-Section Layout */
          <>
            {/* Section 1: Hit Taomlar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                    <Flame size={16} className="text-amber-600 fill-amber-500" />
                  </div>
                  <h3 className="font-black text-base text-[#0d3b2e] tracking-tight">
                    {t.hitSales}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    telegram.triggerHaptic('light');
                    setSelectedCategory('all');
                    setActiveTab('menu');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>{t.seeAll}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {hitProducts.map((product) => (
                  <FoodCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Section 2: Yangiliklar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Sparkles size={16} className="text-emerald-600" />
                  </div>
                  <h3 className="font-black text-base text-[#0d3b2e] tracking-tight">
                    {t.newItems}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {newProducts.map((product) => (
                  <FoodCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Section 3: Aksiyalar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
                    <Tag size={15} className="text-red-600" />
                  </div>
                  <h3 className="font-black text-base text-[#0d3b2e] tracking-tight">
                    {t.promoDiscounts}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {promoProducts.map((product) => (
                  <FoodCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
