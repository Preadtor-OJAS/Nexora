'use client';

import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const analytics = useQuery(api.orders.getOrderAnalytics, {});
  const customerAnalytics = useQuery(api.customers.getCustomerAnalytics, {});

  if (analytics === undefined || customerAnalytics === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-2xl font-bold text-foreground mb-6">Analytics Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Mock data for charts since Convex might not have historical data yet
  const revenueData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 18 },
    { name: 'Wed', revenue: 2000, orders: 12 },
    { name: 'Thu', revenue: 2780, orders: 19 },
    { name: 'Fri', revenue: 1890, orders: 15 },
    { name: 'Sat', revenue: 2390, orders: 22 },
    { name: 'Sun', revenue: 3490, orders: 28 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home', value: 300 },
    { name: 'Beauty', value: 200 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted">Total Revenue</div>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics?.totalRevenue || 0)}</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted">Total Orders</div>
              <div className="text-2xl font-bold text-foreground">{analytics?.ordersToday || 0}</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted">Customers</div>
              <div className="text-2xl font-bold text-foreground">{customerAnalytics?.total || 0}</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted">Monthly Revenue</div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(analytics?.revenueThisMonth || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Revenue Over Time</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Daily Orders</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="orders" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col md:flex-row items-center">
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
