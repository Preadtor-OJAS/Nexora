'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCircle, 
  Package, 
  Ticket, 
  Coins, 
  Star, 
  CreditCard, 
  MapPin, 
  Heart, 
  Gift, 
  Bell, 
  LogOut,
  Shield,
  Store
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'admin', icon: Shield, label: 'Admin Dashboard', href: '/admin' },
  { id: 'seller', icon: Store, label: 'Become a Seller', href: '/become-seller' },
  { id: 'profile', icon: UserCircle, label: 'My Profile', action: 'profile' },
  { id: 'orders', icon: Package, label: 'Orders', href: '/orders' },
  { id: 'coupons', icon: Ticket, label: 'Coupons', href: '#' },
  { id: 'rewards', icon: Coins, label: 'Nexora Rewards', href: '#' },
  { id: 'plus', icon: Star, label: 'Nexora Pro', href: '#' },
  { id: 'wallet', icon: CreditCard, label: 'Saved Cards & Wallet', href: '#' },
  { id: 'addresses', icon: MapPin, label: 'Saved Addresses', href: '/addresses' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { id: 'giftcards', icon: Gift, label: 'Gift Cards', href: '#' },
  { id: 'notifications', icon: Bell, label: 'Notifications', href: '#' },
];

export default function ProfileDropdown() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const seller = useQuery(api.sellers.getSellerByClerkId, user ? { clerkId: user.id } : 'skip');
  const isSeller = seller && seller.status === 'approved';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-surface p-1 pr-3 rounded-full transition-all group"
      >
        <img 
          src={user.imageUrl} 
          alt={user.fullName || 'User'} 
          className="w-8 h-8 rounded-full ring-2 ring-white/10 group-hover:ring-violet-500/50 transition-all"
        />
        <span className="hidden lg:block text-sm font-medium text-foreground">
          {user.firstName || 'Profile'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-64 bg-elevated/95 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-border overflow-hidden z-50 py-2"
          >
            <div className="px-4 py-2 border-b border-border mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Your Account
              </span>
            </div>

            <div className="flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar">
              {MENU_ITEMS.map((item) => {
                // Check admin permission
                if (item.id === 'admin') {
                  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
                  const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
                  if (!adminEmails.includes(userEmail)) return null;
                }

                const currentItem = { ...item };
                if (currentItem.id === 'seller' && isSeller) {
                  currentItem.label = 'Seller Dashboard';
                  currentItem.href = '/seller-dashboard';
                }

                const content = (
                  <>
                    <currentItem.icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-secondary group-hover:text-foreground transition-colors">{currentItem.label}</span>
                  </>
                );
                
                const className = "flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors w-full text-left group";

                if (currentItem.action === 'profile') {
                  return (
                    <button key={currentItem.id} onClick={() => { setIsOpen(false); openUserProfile(); }} className={className}>
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={currentItem.id} href={currentItem.href} onClick={() => setIsOpen(false)} className={className}>
                    {content}
                  </Link>
                );
              })}

              <div className="border-t border-border mt-1 pt-1">
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors w-full text-left group"
                >
                  <LogOut className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                  <span className="text-sm text-red-400">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
