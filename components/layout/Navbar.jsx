'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Heart, Menu, X, Zap, Compass, Check, MapPin, CreditCard, Package, Sun, Moon } from 'lucide-react';
import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import ProfileDropdown from './ProfileDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/layout/NotificationBell';

const CATEGORIES = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?category=electronics', label: 'Electronics' },
  { href: '/shop?category=fashion', label: 'Fashion' },
  { href: '/shop?category=home', label: 'Home & Living' },
  { href: '/shop?category=beauty', label: 'Beauty' },
  { href: '/shop?category=sports', label: 'Sports' },
  { href: '/shop?category=gaming', label: 'Gaming' },
  { href: '/shop?sort=newest', label: 'New Arrivals' },
  { href: '/shop?featured=true', label: 'Featured' },
];

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Package },
];

export default function Navbar({ checkoutStep = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const cart = useQuery(
    api.wishlistAndCart.getCart,
    isSignedIn ? { userId: user?.id } : 'skip'
  );

  const wishlist = useQuery(
    api.wishlistAndCart.getWishlist,
    isSignedIn ? { userId: user?.id } : 'skip'
  );

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.productIds?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-lg transition-all duration-300">
        {/* Top Row - Main Header */}
        <div className="bg-background border-b border-border">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
              
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 group-hover:scale-110 transition-transform duration-300" />
                  <Zap className="absolute inset-0 m-auto w-4 h-4 text-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight hidden sm:block">
                  <span className="gradient-text">Nexora</span>
                </span>
              </Link>

              {/* Desktop Search Bar & Browse OR Checkout Steps */}
              {pathname === '/checkout' && checkoutStep !== null ? (
                <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-4 lg:px-8">
                  <div className="flex items-center justify-between w-full max-w-lg">
                    {STEPS.map((s, i) => {
                      const Icon = s.icon;
                      const active = i === checkoutStep;
                      const done = i < checkoutStep;
                      return (
                        <div key={s.id} className="flex items-center gap-0 flex-1 last:flex-none">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{
                                background: done ? 'linear-gradient(135deg, #10B981, #059669)' : active ? 'linear-gradient(135deg, #7C3AED, #06B6D4)' : 'rgba(255,255,255,0.05)',
                                scale: active ? 1.1 : 1,
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-border"
                            >
                              {done ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Icon className={`w-3.5 h-3.5 ${active ? 'text-foreground' : 'text-muted'}`} />}
                            </motion.div>
                            <span className={`text-xs font-medium hidden lg:block ${active ? 'text-foreground' : done ? 'text-emerald-500' : 'text-muted'}`}>{s.label}</span>
                          </div>
                          {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-3 lg:mx-4 ${i < checkoutStep ? 'bg-emerald-500/50' : 'bg-white/6'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : pathname !== '/' && (
                <div className="hidden md:flex flex-1 items-center max-w-2xl px-4 lg:px-8 gap-6">
                  <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for Products, Brands and More"
                      className="w-full pl-10 pr-4 py-2 bg-surface border border-border hover:border-primary/50 focus:border-primary rounded-lg text-sm text-foreground placeholder-muted focus:outline-none transition-all"
                    />
                    <button type="submit" className="hidden" />
                  </form>
                  <Link href="/shop" className="flex-shrink-0">
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={{
                        hover: { scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)', backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                        tap: { scale: 0.95 }
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border text-secondary transition-colors group relative"
                    >
                      <motion.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        className="group-hover:text-primary transition-colors"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <motion.polygon 
                          points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                          variants={{
                            hover: { rotate: [0, -45, 380, 360] }
                          }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          style={{ originX: "12px", originY: "12px" }}
                        />
                        <motion.circle
                          cx="12" cy="12" r="2"
                          variants={{
                            hover: { fill: "currentColor", scale: [1, 1.5, 1] }
                          }}
                          transition={{ duration: 1.2 }}
                        />
                      </motion.svg>
                      {/* Tooltip */}
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-elevated border border-border rounded-md text-[10px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                        Browse Shop
                      </span>
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* Right Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notification Bell */}
                {isSignedIn && <NotificationBell />}
                
                {/* Wishlist */}
                {isSignedIn && (
                  <Link href="/wishlist">
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all group relative">
                      <Heart className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                      {wishlistCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-foreground text-[10px] font-bold flex items-center justify-center">
                          {wishlistCount > 9 ? '9+' : wishlistCount}
                        </span>
                      )}
                    </button>
                  </Link>
                )}

                {/* Cart */}
                <Link href="/cart">
                  <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all relative">
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-500 text-foreground text-[10px] font-bold flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Auth */}
                {isSignedIn ? (
                  <div className="flex items-center ml-2">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <SignInButton mode="modal">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group px-5 py-2 rounded-xl bg-surface overflow-hidden border border-border hover:border-primary/50 transition-all shadow-none hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary group-hover:from-foreground group-hover:to-foreground transition-all">
                          Login
                        </span>
                      </motion.button>
                    </SignInButton>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all ml-1"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Row - Search Bar */}
        {pathname !== '/' && (
          <div className="md:hidden bg-background border-b border-border pb-3 px-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border hover:border-primary/50 focus:border-primary rounded-lg text-sm text-foreground placeholder-muted focus:outline-none transition-all"
              />
              <button type="submit" className="hidden" />
            </form>
          </div>
        )}


        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface border-b border-border overflow-hidden"
            >
              <div className="w-full px-4 md:px-8 lg:px-12 py-4 flex flex-col gap-2">
                <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-widest">
                  Categories
                </div>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-secondary hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 rounded-lg transition-all"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={pathname === '/' ? "h-[64px]" : "h-[116px] md:h-[64px]"} />
    </>
  );
}
