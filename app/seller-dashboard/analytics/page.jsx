'use client';

import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { motion } from 'motion/react';
import {
  DollarSign, ShoppingBag, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
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

const COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function SellerAnalyticsPage() {
  const { user } = useUser();
  const analytics = useQuery(api.orders.getOrderAnalyticsBySeller, user ? { sellerId: user.id } : 'skip');

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home', value: 300 },
    { name: 'Beauty', value: 200 },
  ];

  if (analytics === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Analytics</h1>
        <p className="text-sm text-muted">Track your store's performance and sales metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStat label="Total Revenue" value={analytics?.totalRevenue || 0} prefix="$" icon={DollarSign} color="#10B981" glow="#10B981" />
        <AnimatedStat label="Orders Today" value={analytics?.ordersToday || 0} icon={ShoppingBag} color="#7C3AED" glow="#7C3AED" />
        <AnimatedStat label="Total Orders" value={analytics?.totalOrders || 0} icon={Activity} color="#06B6D4" glow="#06B6D4" />
        <AnimatedStat label="This Month" value={analytics?.revenueThisMonth || 0} prefix="$" icon={TrendingUp} color="#F59E0B" glow="#F59E0B" />
      </div>

      {/* Charts */}
      <div className="glass-card p-5">
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
          <ResponsiveContainer width="100%" height={300} debounce={50}>
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
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted text-sm">No data available yet</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Daily Orders</h2>
          <div className="h-80 w-full">
            {analytics?.revenueChart ? (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart data={analytics.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="orders" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted text-sm">No data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-center">
          <div className="flex-1 w-full">
            <h2 className="text-lg font-semibold text-foreground mb-6">Sales by Category</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="w-full md:w-64 space-y-4 pt-6 md:pt-0">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 glass rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-secondary">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">${category.value}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
