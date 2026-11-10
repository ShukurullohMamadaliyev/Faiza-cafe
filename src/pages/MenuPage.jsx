import React from 'react';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import FoodCard from '../components/FoodCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

export default function MenuPage() {
  const { productList, searchQuery, selectedCategory, t } = useApp();

  // Noto'g'ri toifa tushib qolmasligi uchun himoya
  const validCategoryIds = ['fastfood', 'pizza', 'hotdishes', 'shashlik', 'drinks_dessert'];
  const activeCategory = validCategoryIds.includes(selectedCategory) ? selectedCategory : 'all';

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && product.category === activeCategory;
  });

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const translatedCatName = t.categories?.[currentCategory.id] || currentCategory.name;

  return (
    <div className="pb-28">
      {/* Top Header */}
      <Header showSearch={true} />

      {/* Sticky Category Chips */}
      <div className="sticky top-12 z-30 bg-white shadow-xs">
        <CategoryChips />
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Category Heading Banner */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentCategory.icon}</span>
            <h2 className="text-lg font-black text-[#991b1b]">
              {searchQuery ? `"${searchQuery}"` : translatedCatName}
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {filteredProducts.length} {t.dishesCount}
          </span>
        </div>

        {/* 2-Column Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <p className="font-bold text-gray-800 text-sm">{t.cartEmpty}</p>
            <p className="text-xs text-gray-400">
              {t.cartEmptyDesc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
