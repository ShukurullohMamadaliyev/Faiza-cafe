// Fayz Cafe - Rasmiy Instagram Menyusidan to'liq o'qib olingan taomlar bazasi
import menuItemsJson from './menu.json';

// Modifikatorlar shablonlari
const FASTFOOD_MODIFIERS = [
  { id: 'm-cheese', name: 'Qo‘shimcha Pishloq', price: 4000 },
  { id: 'm-meat', name: 'Qo‘shimcha go‘sht (50g)', price: 10000 },
  { id: 'm-jalapeno', name: 'Jalapeno achchiq qalampiri', price: 3000 },
  { id: 'm-sauce', name: 'Fayz maxsus sousi', price: 3000 }
];

const PIZZA_MODIFIERS = [
  { id: 'm-crust-cheese', name: 'Bortikda pishloq (Cheesy crust)', price: 12000 },
  { id: 'm-extra-cheese', name: 'Qo‘shimcha Motsarella', price: 8000 },
  { id: 'm-jalapeno', name: 'Jalapeno qalampiri', price: 3000 }
];

const SET_MODIFIERS = [
  { id: 'm-bread', name: 'Issiq tandir non', price: 4000 },
  { id: 'm-sauce-extra', name: 'Qo‘shimcha sous', price: 3000 },
  { id: 'm-drink', name: 'Pepsi 0.5L qo‘shish', price: 8000 }
];

export const MENU_ITEMS = menuItemsJson.map((item) => {
  let modifiers = [];
  if (item.category === 'fastfood') {
    modifiers = FASTFOOD_MODIFIERS;
  } else if (item.category === 'pizza') {
    modifiers = PIZZA_MODIFIERS;
  } else if (item.category === 'hotdishes' || item.category === 'shashlik') {
    modifiers = SET_MODIFIERS;
  }

  return {
    ...item,
    modifiers,
    isPopular: item.badge === 'Xit' || item.price > 70000,
    isNew: item.badge === 'Katta' || item.badge === 'Premium' || item.badge === 'Yangi',
    isSpicy: item.badge === 'Achchiq'
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
