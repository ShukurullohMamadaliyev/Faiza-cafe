// Ibrohim Ota Choyxonasi - Mock Data & Categories
import { MENU_ITEMS } from './menuData';

export const CATEGORIES = [
  { id: 'all', name: 'Barchasi', icon: '🍽️', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80' },
  { id: 'hotdishes', name: 'Milliy taomlar', icon: '🍲', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80' },
  { id: 'shashlik', name: 'Shashliklar', icon: '🥩', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
  { id: 'fastfood', name: 'Fastfud', icon: '🍔', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300&q=80' },
  { id: 'pizza', name: 'Pitsa', icon: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
  { id: 'drinks_dessert', name: 'Ichimliklar', icon: '☕', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80' },
];

export const BANNERS = [
  {
    id: 'b1',
    title: 'Kotletlar Chiz Seti',
    subtitle: 'Pishloqli kotlet + Fri + 2 xil salat + Sous',
    price: '57 000',
    oldPrice: '68 000',
    badge: '🔥 To‘liq Set',
    tag: 'Xit Taom',
    category: 'hotdishes',
    productId: 'hd-kotlet-cheese',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
    badgeColor: 'bg-red-400/25 text-red-100 border-red-400/40',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    btnColor: 'bg-red-600 hover:bg-red-500 text-white'
  },
  {
    id: 'b2',
    title: 'Pepperoni Mega Pitsa',
    subtitle: 'Do‘stlar davrasi uchun 40 sm ulkan mazali pitsa',
    price: '101 000',
    oldPrice: '120 000',
    badge: '🍕 Mega 40 sm',
    tag: 'Aksiya',
    category: 'pizza',
    productId: 'pz-pepperoni-mega',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #450a0a 100%)',
    badgeColor: 'bg-red-400/25 text-red-100 border-red-400/40',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    btnColor: 'bg-red-500 hover:bg-red-400 text-white'
  },
  {
    id: 'b3',
    title: 'Pitsa bilan Qazi',
    subtitle: 'Haqiqiy milliy qazi va mayin motsarella',
    price: '90 000',
    oldPrice: '105 000',
    badge: '⭐ Milliy Xit',
    tag: 'Yangi',
    category: 'pizza',
    productId: 'pz-qazi-med',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #451a03 100%)',
    badgeColor: 'bg-amber-400/25 text-amber-100 border-amber-400/40',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    btnColor: 'bg-amber-500 hover:bg-amber-400 text-white'
  },
  {
    id: 'b4',
    title: 'Tandir Lavash & Fri Set',
    subtitle: 'Issiq tandir xamirida qarsildoq go‘sht va fri',
    price: '38 000',
    oldPrice: '45 000',
    badge: '🌯 Super Fastfud',
    tag: 'Chegirma',
    category: 'fastfood',
    productId: 'ff-lavash-tandir',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
    badgeColor: 'bg-indigo-400/25 text-indigo-100 border-indigo-400/40',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white'
  }
];

export const BRANCHES = [
  { id: 'br1', name: 'Ibrohim Ota Choyxonasi', address: "Rishton tumani, Milliy bank ro'parasi (Tel: +998 20 000 01 49)", distance: '0.1 km' }
];

export const PRODUCTS = MENU_ITEMS;

export const INITIAL_ORDERS = [];
