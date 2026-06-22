'use client';

import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion } from 'motion/react';
import {
  DollarSign, ShoppingBag, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Package, AlertTriangle, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { formatCurrency, formatRelativeTime, ORDER_STATUS } from '@/lib/utils';
import { useEffect, useRef } from 'react';

function AnimatedStat({ label, value, prefix = '', suffix = '', change, icon: Icon, color, glow }) {
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current || value === undefined) return;
    const el = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = num * eased;
          el.textContent = (Number.isInteger(num) ? Math.floor(current).toLocaleString() : current.toFixed(1));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, prefix, suffix]);

  const isPositive = !change || change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="glass-card p-5 relative overflow-hidden group cursor-default"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(ellipse at 10% 10%, ${glow}15 0%, transparent 60%)` }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">
        <span className="text-lg">{prefix}</span>
        <span ref={ref}>0</span>
        <span className="text-lg">{suffix}</span>
      </div>
      <div className="text-xs text-muted">{label}</div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl border border-border text-xs">
      <div className="text-muted mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary capitalize">{p.name}:</span>
          <span className="text-foreground font-semibold">
            {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLOR = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#7C3AED',
  shipped: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444', rejected: '#EF4444',
};

export default function AdminDashboard() {
  const analytics = useQuery(api.orders.getOrderAnalytics, {});
  const customerAnalytics = useQuery(api.customers.getCustomerAnalytics, {});
  const recentOrders = useQuery(api.orders.getAllOrders, { limit: 5 });
  const products = useQuery(api.products.getAllProductsAdmin, {});

  const lowStockProducts = products?.filter((p) => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0) || [];
  const outOfStock = products?.filter((p) => p.stock === 0) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStat label="Total Revenue" value={analytics?.totalRevenue || 0} prefix="$" icon={DollarSign} color="#10B981" glow="#10B981" change={18} />
        <AnimatedStat label="Orders Today" value={analytics?.ordersToday || 0} icon={ShoppingBag} color="#7C3AED" glow="#7C3AED" change={12} />
        <AnimatedStat label="Total Customers" value={customerAnalytics?.total || 0} icon={Users} color="#06B6D4" glow="#06B6D4" change={8} />
        <AnimatedStat label="This Month" value={analytics?.revenueThisMonth || 0} prefix="$" icon={TrendingUp} color="#F59E0B" glow="#F59E0B" change={22} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Revenue & Orders</h2>
              <p className="text-xs text-muted">Last 30 days</p>
            </div>
            <div className="badge badge-success text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Live
            </div>
          </div>
          {analytics?.revenueChart ? (
            <ResponsiveContainer width="100%" height={220} debounce={50}>
              <AreaChart data={analytics.revenueChart} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fill="url(#revenueGrad)" />
                <Area type="monotone" dataKey="orders" stroke="#06B6D4" strokeWidth={2} fill="url(#ordersGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 skeleton rounded-xl" />
          )}
        </div>

        {/* Customer Growth */}
        <div className="glass-card p-5">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground">Customer Growth</h2>
            <p className="text-xs text-muted">Last 6 months</p>
          </div>
          {customerAnalytics?.growthChart ? (
            <ResponsiveContainer width="100%" height={220} debounce={50}>
              <BarChart data={customerAnalytics.growthChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="customers" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 skeleton rounded-xl" />
          )}
          <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">New this month</span>
              <span className="text-sm font-bold text-violet-600 dark:text-violet-300">+{customerAnalytics?.newThisMonth || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-primary hover:text-primary-hover transition-colors">View all →</a>
          </div>
          <div className="space-y-3">
            {recentOrders === undefined ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No orders yet</p>
            ) : recentOrders.map((order) => (
              <motion.a
                key={order._id}
                href={`/admin/orders`}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${STATUS_COLOR[order.status]}20` }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: STATUS_COLOR[order.status] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{order.orderNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLOR[order.status]}20`, color: STATUS_COLOR[order.status] }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted">{order.items.length} items · {formatRelativeTime(order.createdAt)}</div>
                </div>
                <div className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground">Inventory Alerts</h2>
            <a href="/admin/inventory" className="text-xs text-primary hover:text-primary-hover transition-colors">Manage →</a>
          </div>

          {outOfStock.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-red-600 dark:text-red-300 mb-1">{outOfStock.length} product{outOfStock.length !== 1 ? 's' : ''} out of stock</div>
                <div className="text-[10px] text-red-500/70 dark:text-red-400/70">{outOfStock.map((p) => p.name).join(', ')}</div>
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">{lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low</div>
                <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}</div>
              </div>
            </div>
          )}

          {lowStockProducts.length === 0 && outOfStock.length === 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Package className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300">All products are well-stocked ✓</span>
            </div>
          )}

          <div className="space-y-2 mt-4">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-card flex-shrink-0">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                  <div className="w-full h-1.5 bg-surface rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((p.stock / (p.lowStockThreshold || 10)) * 100, 100)}%`,
                        background: p.stock <= 3 ? '#EF4444' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-medium">{p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
