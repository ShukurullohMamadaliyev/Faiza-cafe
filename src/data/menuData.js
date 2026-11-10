// Ibrohim Ota Choyxonasi - Rasmiy Instagram Menyusidan to'liq o'qib olingan taomlar bazasi
import menuItemsJson from './menu.json';

// Modifikatorlar shablonlari
const FASTFOOD_MODIFIERS = [
  { id: 'm-cheese', name: 'Qo‘shimcha Pishloq', price: 4000 },
  { id: 'm-meat', name: 'Qo‘shimcha go‘sht (50g)', price: 10000 },
  { id: 'm-jalapeno', name: 'Jalapeno achchiq qalampiri', price: 3000 },
  { id: 'm-sauce', name: 'Choyxona maxsus sousi', price: 3000 }
];

const SET_MODIFIERS = [
  { id: 'm-bread', name: 'Issiq tandir non', price: 4000 },
  { id: 'm-sauce-extra', name: 'Qo‘shimcha sous', price: 3000 },
  { id: 'm-salad-extra', name: 'Qo‘shimcha Shakarob', price: 6000 }
];

export const MENU_ITEMS = menuItemsJson.map((item) => {
  let modifiers = [];
  if (item.category === 'fastfood') {
    modifiers = FASTFOOD_MODIFIERS;
  } else if (item.category === 'hotdishes' || item.category === 'shashlik') {
    modifiers = SET_MODIFIERS;
  }

  return {
    ...item,
    modifiers,
    isPopular: item.badge?.includes('Xit') || item.badge?.includes('Bosh') || item.price > 30000,
    isNew: item.badge === 'Katta' || item.badge === 'Yangi',
    isSpicy: item.badge?.includes('Achchiq')
  };
});

export const getItemsByCategory = (category) => {
  if (category === 'all') return MENU_ITEMS;
  return MENU_ITEMS.filter((item) => item.category === category);
};

export const getItemById = (id) => {
  return MENU_ITEMS.find((item) => item.id === id);
};

export default MENU_ITEMS;
