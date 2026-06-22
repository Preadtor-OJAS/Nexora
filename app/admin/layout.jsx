'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  Warehouse, Menu, X, Zap, ChevronRight, Bell, Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/layout/NotificationBell';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const pendingSellersCount = useQuery(api.sellers.getPendingCount) || 0;
  const pendingProductsCount = useQuery(api.products.getPendingCount);
  const unreadChatCount = useQuery(api.sellers.getUnreadChatCount, isAdmin ? { role: 'admin' } : 'skip') || 0;
  
  const totalSellerAlerts = pendingSellersCount + unreadChatCount;

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
      
      if (adminEmails.includes(userEmail)) {
        setIsAdmin(true);
      } else {
        router.push('/');
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !isAdmin) {
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
            <Zap className="w-4 h-4 text-foreground" strokeWidth={2.5} />
          </div>
          <div className={cn("whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out", sidebarOpen ? "max-w-[200px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0")}>
            <div className="text-sm font-bold gradient-text leading-none">Nexora</div>
            <div className="text-[10px] text-muted">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm font-semibold'
                    : 'text-muted hover:bg-primary/5 hover:text-foreground hover:translate-x-1'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110', active ? 'text-primary' : 'group-hover:text-primary')} strokeWidth={active ? 2.5 : 2} />
                  {!sidebarOpen && item.label === 'Sellers' && totalSellerAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border-2 border-background" />
                  )}
                  {!sidebarOpen && item.label === 'Products' && pendingProductsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 border-2 border-background" />
                  )}
                </div>
                <div className={cn("flex items-center overflow-hidden whitespace-nowrap gap-2 transition-all duration-300 ease-in-out", sidebarOpen ? "max-w-[200px] opacity-100 ml-1" : "max-w-0 opacity-0 ml-0")}>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.label === 'Sellers' && totalSellerAlerts > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[10px] font-bold flex items-center justify-center">
                      {totalSellerAlerts}
                    </span>
                  )}
                  {item.label === 'Products' && pendingProductsCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/20 text-[10px] font-bold flex items-center justify-center">
                      {pendingProductsCount}
                    </span>
                  )}
                  {!item.label.includes('Sellers') && !item.label.includes('Products') && active && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className={cn("border-t border-border overflow-hidden whitespace-nowrap transition-all duration-300", sidebarOpen ? "p-4 h-auto opacity-100" : "h-0 p-0 opacity-0")}>
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{user?.fullName}</div>
            <div className="text-[10px] text-primary">Administrator</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col glass border-r border-border flex-shrink-0 overflow-visible sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out will-change-[width]",
          sidebarOpen ? "w-[220px]" : "w-[64px]"
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }} transition={{ duration: 0.3 }} className="fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col glass-strong border-r border-border md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out will-change-[width]">
        {/* Top bar */}
        <header className="glass border-b border-border px-4 h-16 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground">
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-foreground">
                {NAV_ITEMS.find((n) => n.href === pathname)?.label || 'Dashboard'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Link href="/" className="group flex items-center gap-2 text-xs font-semibold text-secondary hover:text-foreground transition-all px-4 py-2 bg-gradient-to-r from-violet-600/10 to-cyan-500/10 hover:from-violet-600/20 hover:to-cyan-500/20 rounded-xl border border-border hover:border-violet-500/50 shadow-[0_0_10px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] ml-2">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Storefront
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
