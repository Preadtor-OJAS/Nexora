'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Menu, X, Zap, ChevronRight, Bell, Store, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/layout/NotificationBell';

const NAV_ITEMS = [
  { href: '/seller-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller-dashboard/products', label: 'My Products', icon: Package },
  { href: '/seller-dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller-dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/seller-dashboard/support', label: 'Support', icon: MessageCircle },
];

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const seller = useQuery(api.sellers.getSellerByClerkId, user ? { clerkId: user.id } : 'skip');
  const unreadChatCount = useQuery(api.sellers.getUnreadChatCount, seller?._id ? { sellerId: seller._id, role: 'applicant' } : 'skip') || 0;

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      // Wait for seller query to resolve
      if (seller === undefined) return;

      if (seller && seller.status === 'approved') {
        setIsAuthorized(true);
      } else {
        router.push('/become-seller');
      }
    }
  }, [isLoaded, user, seller, router]);

  if (!isLoaded || !isAuthorized || seller === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 px-4 border-b border-border flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-foreground" strokeWidth={2.5} />
          </div>
          <div className={cn("whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out", sidebarOpen ? "max-w-[200px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0")}>
            <div className="text-sm font-bold gradient-text leading-none">{seller.storeName}</div>
            <div className="text-[10px] text-muted">Seller Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/seller-dashboard' 
            ? pathname === '/seller-dashboard' 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm font-semibold" 
                  : "text-muted hover:bg-primary/5 hover:text-foreground hover:translate-x-1"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary" : "group-hover:text-primary")} strokeWidth={isActive ? 2.5 : 2} />
                {!sidebarOpen && item.label === 'Support' && unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background" />
                )}
              </div>
              <div className={cn("flex items-center overflow-hidden whitespace-nowrap gap-2 transition-all duration-300 ease-in-out", sidebarOpen ? "max-w-[200px] opacity-100 ml-1" : "max-w-0 opacity-0 ml-0")}>
                <span className="font-medium text-sm">{item.label}</span>
                {item.label === 'Support' && unreadChatCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-bold flex items-center justify-center">
                    {unreadChatCount}
                  </span>
                )}
                {isActive && item.label !== 'Support' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
      </nav>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background text-secondary font-sans selection:bg-violet-500/30 selection:text-white">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border glass flex-shrink-0 overflow-visible sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out will-change-[width]",
          sidebarOpen ? "w-[260px]" : "w-[76px]"
        )}
      >
        <div className="w-full h-full overflow-hidden flex flex-col">
          <SidebarContent />
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-muted hover:text-primary transition-all shadow-md hover:shadow-lg hover:scale-110 z-40"
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform duration-300', sidebarOpen ? 'rotate-180' : '')} />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[260px] border-r border-border glass-strong z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out will-change-[width]">
        {/* Top Header */}
        <header className="glass border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-muted hover:text-foreground lg:hidden rounded-lg hover:bg-violet-500/10 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted font-medium">
              <span className="text-primary">Seller Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-secondary capitalize">
                {pathname.split('/').pop() === 'seller-dashboard' ? 'Overview' : pathname.split('/').pop()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <Link href="/" className="group flex items-center gap-2 text-xs font-semibold text-secondary hover:text-foreground transition-all px-4 py-2 bg-gradient-to-r from-violet-600/10 to-cyan-500/10 hover:from-violet-600/20 hover:to-cyan-500/20 rounded-xl border border-border hover:border-violet-500/50 shadow-[0_0_10px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] hidden sm:flex">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Storefront
            </Link>
            <div className="w-px h-6 bg-surface" />
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-white/10 hover:ring-violet-500/50 transition-all"
                }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
