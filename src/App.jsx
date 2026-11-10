import React from 'react';
import { useApp } from './context/AppContext';
import TelegramHeader from './components/TelegramHeader';
import BottomNav from './components/BottomNav';
import FloatingCartPill from './components/FloatingCartPill';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { activeTab, toastMessage, cart } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'menu':
        return <MenuPage />;
      case 'cart':
        return <CartPage />;
      case 'orders':
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  const shouldShowBottomNav = activeTab !== 'admin' && !(activeTab === 'cart' && cart.length > 0);

  return (
    <div className="min-h-screen choyxona-bg text-stone-100 flex justify-center selection:bg-amber-500 selection:text-black">
      {/* Mobile container constraint for preview on wide desktop screens */}
      <div className="w-full max-w-md choyxona-bg min-h-screen shadow-2xl relative flex flex-col border-x border-amber-500/10">
        {/* Telegram Top Bar (Shows when viewed outside Telegram) */}
        <TelegramHeader />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
            <div className="bg-[#24070a] text-amber-300 text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-amber-500/40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-x-hidden">
          {renderActiveTab()}
        </main>

        {/* Floating Cart Indicator */}
        <FloatingCartPill />

        {/* Bottom Navigation */}
        {shouldShowBottomNav && <BottomNav />}

        {/* Modals & Overlays */}
        <ProductModal />
        <CheckoutModal />
        <OrderSuccessModal />
      </div>
    </div>
  );
}
