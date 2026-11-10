import React from 'react';
import { useApp } from './context/AppContext';
import TelegramHeader from './components/TelegramHeader';
import BottomNav from './components/BottomNav';
import FloatingCartPill from './components/FloatingCartPill';
import ProductModal from './components/ProductModal';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import LocationPromptModal from './components/LocationPromptModal';
import PhoneRequiredModal from './components/PhoneRequiredModal';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
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
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  // Savatchada taomlar bo'lganda, pastki navigatsiya paneli o'rniga to'liq "Buyurtmani rasmiylashtirish" tugmasi chiqadi
  const shouldShowBottomNav = activeTab !== 'admin' && !(activeTab === 'cart' && cart.length > 0);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-900 flex justify-center selection:bg-red-600 selection:text-white">
      {/* Mobile container constraint for preview on wide desktop screens */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        {/* Telegram Top Bar (Faqat tashqi brauzerda chiqadi, mobil Telegram ichida ortiqcha dublikat bo'lmasligi uchun yashiriladi) */}
        <TelegramHeader />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
            <div className="bg-[#991b1b] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-red-400/40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
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
        <LocationPromptModal />
        <PhoneRequiredModal />
      </div>
    </div>
  );
}
