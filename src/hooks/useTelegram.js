import { useEffect, useState, useCallback } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(() => (typeof window !== 'undefined' ? window.Telegram?.WebApp || null : null));
  const [user, setUser] = useState(() => (typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user || null : null));
  const [colorScheme, setColorScheme] = useState(() => (typeof window !== 'undefined' ? window.Telegram?.WebApp?.colorScheme || 'light' : 'light'));

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp;
      setTg(telegram);
      telegram.ready();
      telegram.expand();

      if (telegram.initDataUnsafe?.user) {
        setUser(telegram.initDataUnsafe.user);
      }

      if (telegram.colorScheme) {
        setColorScheme(telegram.colorScheme);
      }

      // Sync header color with dark theme
      if (telegram.setHeaderColor) {
        telegram.setHeaderColor('#150305');
      }
      if (telegram.setBackgroundColor) {
        telegram.setBackgroundColor('#150305');
      }
    }
  }, []);

  const triggerHaptic = useCallback((type = 'light') => {
    if (tg?.HapticFeedback) {
      try {
        if (type === 'success' || type === 'warning' || type === 'error') {
          tg.HapticFeedback.notificationOccurred(type);
        } else if (type === 'selection') {
          tg.HapticFeedback.selectionChanged();
        } else {
          tg.HapticFeedback.impactOccurred(type); // 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
        }
      } catch (e) {
        console.warn('Haptics failed', e);
      }
    }
  }, [tg]);

  const showMainButton = useCallback((text, onClick) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.enable();
      tg.MainButton.onClick(onClick);
    }
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  }, [tg]);

  const onClose = useCallback(() => {
    if (tg?.close) {
      tg.close();
    }
  }, [tg]);

  const effectiveUser =
    user ||
    (typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user || null : null);

  return {
    tg,
    user: effectiveUser,
    colorScheme,
    isInsideTelegram: Boolean(tg?.initData),
    triggerHaptic,
    showMainButton,
    hideMainButton,
    onClose
  };
}
