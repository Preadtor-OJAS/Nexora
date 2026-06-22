// Utility function for merging class names
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number with commas
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format relative time
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Truncate text
export function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate order ID
export function generateOrderId() {
  return 'NXR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

// Calculate discount percentage
export function calcDiscount(originalPrice, salePrice) {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Debounce function
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Order status config
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'warning', icon: 'clock' },
  confirmed: { label: 'Confirmed', color: 'info', icon: 'check' },
  processing: { label: 'Processing', color: 'brand', icon: 'refresh' },
  shipped: { label: 'Shipped', color: 'accent', icon: 'truck' },
  delivered: { label: 'Delivered', color: 'success', icon: 'package' },
  cancelled: { label: 'Cancelled', color: 'danger', icon: 'x' },
  rejected: { label: 'Rejected', color: 'danger', icon: 'x-circle' },
};

// Product categories
export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '💻', color: '#06B6D4' },
  { id: 'fashion', name: 'Fashion', icon: '👗', color: '#A855F7' },
  { id: 'home', name: 'Home & Living', icon: '🏠', color: '#10B981' },
  { id: 'beauty', name: 'Beauty', icon: '✨', color: '#F59E0B' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#EF4444' },
  { id: 'books', name: 'Books', icon: '📚', color: '#3B82F6' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8B5CF6' },
  { id: 'food', name: 'Food & Grocery', icon: '🛒', color: '#F97316' },
];

// Navigation links
export const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=electronics', label: 'Electronics' },
  { href: '/shop?category=fashion', label: 'Fashion' },
  { href: '/shop?category=home', label: 'Home' },
];
