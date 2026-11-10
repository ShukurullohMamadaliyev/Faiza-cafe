import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, setSelectedCategory, cartCount, t, telegram } = useApp();

  const navItems = [
    { id: 'home', label: t.home || 'Asosiy', icon: Home },
    { id: 'menu', label: t.menu || 'Menyu', icon: LayoutGrid },
    { id: 'cart', label: t.cart || 'Savat', icon: ShoppingBag, badge: cartCount },
    { id: 'profile', label: t.profile || 'Profil', icon: User },
  ];

  const handleNav = (tabId) => {
    telegram.triggerHaptic('selection');
    if (tabId === 'home') {
      setSelectedCategory('all');
    }
    setActiveTab(tabId);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#170406]/95 backdrop-blur-md text-white border-t border-amber-500/15 safe-area-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'orders');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 relative active:scale-95 ${
                isActive ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-stone-400'}
                />

                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#170406] shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 font-medium transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-stone-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
