import React from 'react';
import { Home, Utensils, ShoppingBasket, ReceiptText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, cartCount, t, telegram } = useApp();

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'menu', label: t.menu, icon: Utensils },
    { id: 'cart', label: t.cart, icon: ShoppingBasket, badge: cartCount },
    { id: 'orders', label: t.orders, icon: ReceiptText },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const handleNav = (tabId) => {
    telegram.triggerHaptic('selection');
    setActiveTab(tabId);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#121816]/95 backdrop-blur-md text-white border-t border-emerald-950/40 safe-area-bottom select-none">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative group active:scale-95`}
            >
              <div
                className={`flex items-center justify-center rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-emerald-600 text-white px-4 py-1.5 shadow-sm'
                    : 'text-gray-400 group-hover:text-gray-200 py-1'
                }`}
              >
                <Icon size={isActive ? 20 : 19} strokeWidth={isActive ? 2.5 : 2} />

                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#121816]">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-semibold transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
