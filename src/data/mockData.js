// Ibrohim Ota Choyxonasi - Mock Data & Categories
import { MENU_ITEMS } from './menuData';

export const CATEGORIES = [
  { id: 'all', name: 'Barchasi', icon: '🍽️', image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=300&q=80' },
  { id: 'hotdishes', name: 'Milliy taomlar', icon: '🍲', image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=300&q=80' },
  { id: 'shashlik', name: 'Shashliklar', icon: '🥩', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
  { id: 'fastfood', name: 'Fastfud', icon: '🍔', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300&q=80' },
  { id: 'drinks_dessert', name: 'Ichimliklar', icon: '☕', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80' },
  { id: 'salads', name: 'Salatlar va Non', icon: '🥗', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=300&q=80' }
];

export const BANNERS = [
  {
    id: 'b1',
    title: 'Choyxona To‘y Oshi',
    subtitle: 'Devzira guruch, mayin go‘sht, sariq sabzi va no‘xat',
    price: '35 000',
    oldPrice: '40 000',
    badge: '🔥 Bosh Taom',
    tag: 'Choyxona Xiti',
    category: 'hotdishes',
    productId: 'hd-osh-choyxona',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #451a03 100%)',
    badgeColor: 'bg-amber-400/25 text-amber-100 border-amber-400/40',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
  },
  {
    id: 'b2',
    title: 'Polvon Qiyma Shashlik',
    subtitle: 'Ko‘mir cho‘g‘ida pishirilgan ulkan va shirali go‘sht kabobi',
    price: '22 000',
    oldPrice: '26 000',
    badge: '🥩 Maxsus Kabob',
    tag: 'Tavsiya',
    category: 'shashlik',
    productId: 'sh-polvon-qiyma',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
    badgeColor: 'bg-red-400/25 text-red-100 border-red-400/40',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    btnColor: 'bg-red-600 hover:bg-red-500 text-white font-bold'
  },
  {
    id: 'b3',
    title: 'Go‘shtli Tandir Somsa',
    subtitle: 'Tandirdan uzilgan qarsildoq xamir va shira to‘la mol go‘shti',
    price: '12 000',
    oldPrice: '15 000',
    badge: '🥟 Tandir Xit',
    tag: 'Qaynoq',
    category: 'hotdishes',
    productId: 'hd-tandir-somsa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #713f12 0%, #a16207 50%, #422006 100%)',
    badgeColor: 'bg-yellow-400/25 text-yellow-100 border-yellow-400/40',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    btnColor: 'bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-bold'
  },
  {
    id: 'b4',
    title: 'Katta Shirali Lavash',
    subtitle: 'Yupqa xamirda saralangan go‘sht, sabzavotlar va maxsus sous',
    price: '34 000',
    oldPrice: '38 000',
    badge: '🌯 To‘yimli Fastfud',
    tag: 'Sevimli',
    category: 'fastfood',
    productId: 'ff-lavash-katta',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
    badgeColor: 'bg-indigo-400/25 text-indigo-100 border-indigo-400/40',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white font-bold'
  }
];

export const BRANCHES = [
  { id: 'br1', name: 'Ibrohim Ota Choyxonasi', address: "Rishton tumani, Milliy bank ro'parasi (Tel: +998 20 000 01 49)", distance: '0.1 km' }
];

export const PRODUCTS = MENU_ITEMS;

export const INITIAL_ORDERS = [];
