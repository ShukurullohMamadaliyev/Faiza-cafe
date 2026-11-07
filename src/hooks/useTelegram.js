import { useEffect, useState, useCallback } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [colorScheme, setColorScheme] = useState('light');

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

      // Sync header color with theme
      if (telegram.setHeaderColor) {
        telegram.setHeaderColor('#F8F9FA');
      }
      if (telegram.setBackgroundColor) {
        telegram.setBackgroundColor('#F8F9FA');
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

  return {
    tg,
    user: user || {
      first_name: 'Fayz',
      last_name: 'Mehmoni',
      username: 'fayz_mehmon',
      id: 998901234
    },
    colorScheme,
    isInsideTelegram: Boolean(tg?.initData),
    triggerHaptic,
    showMainButton,
    hideMainButton,
    onClose
  };
}
