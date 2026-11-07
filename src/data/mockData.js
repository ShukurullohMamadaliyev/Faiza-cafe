// Fayz Cafe - Mock Data & Categories
import { MENU_ITEMS } from './menuData';

export const CATEGORIES = [
  { id: 'all', name: 'Barchasi', icon: '🍽️', color: 'from-amber-400 to-amber-600' },
  { id: 'fastfood', name: 'Fastfud', icon: '🍔', color: 'from-orange-400 to-amber-500' },
  { id: 'pizza', name: 'Pitsa', icon: '🍕', color: 'from-amber-500 to-orange-600' },
  { id: 'hotdishes', name: 'Issiq Taomlar & Salatlar', icon: '🍲', color: 'from-emerald-500 to-teal-600' },
  { id: 'shashlik', name: 'Shashlik Setlari', icon: '🥩', color: 'from-rose-500 to-red-600' },
  { id: 'drinks_dessert', name: 'Ichimlik & Desert', icon: '☕', color: 'from-blue-400 to-indigo-600' },
];

export const BANNERS = [
  {
    id: 'b1',
    title: 'Pitsa bilan Qazi',
    subtitle: 'Haqiqiy milliy qazi va mayin motsarella',
    price: '90 000',
    oldPrice: '105 000',
    badge: 'Xit Pitsa',
    tag: 'Foydali taklif',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80',
    bgColor: 'from-emerald-800 to-emerald-950'
  },
  {
    id: 'b2',
    title: 'Kotletlar Chiz Seti',
    subtitle: 'Pishloqli kotlet + Fri + 2 xil salat + Sous',
    price: '57 000',
    oldPrice: '68 000',
    badge: 'To‘liq Set',
    tag: 'Oshxona taklifi',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    bgColor: 'from-amber-600 to-amber-800'
  },
  {
    id: 'b3',
    title: 'Pepperoni Mega Pitsa',
    subtitle: 'Do‘stlar davrasi uchun 40 sm ulkan pitsa',
    price: '101 000',
    oldPrice: '120 000',
    badge: 'Mega O‘lcham',
    tag: '40 sm',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80',
    bgColor: 'from-red-600 to-rose-700'
  }
];

export const BRANCHES = [
  { id: 'br1', name: 'Faiza Cafe Rishton', address: 'Rishton tumani, Milliy bank ro‘parasi (Tel: +998 90 377 30 00)', distance: '0.1 km' }
];

export const PRODUCTS = MENU_ITEMS;

export const INITIAL_ORDERS = [];
