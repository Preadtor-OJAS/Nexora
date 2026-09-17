'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion } from 'motion/react';
import { Package, Truck, Check, Clock, X, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatCurrency, formatRelativeTime, ORDER_STATUS } from '@/lib/utils';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-brand',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
  rejected: 'badge-danger',
};

function OrderCard({ order }) {
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminal = ['cancelled', 'rejected'].includes(order.status);

  const firstItemName = order.items[0]?.name || 'Order';
  const additionalItems = order.items.length > 1 ? ` + ${order.items.length - 1} more` : '';
  const displayName = `${firstItemName}${additionalItems}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-semibold text-foreground">
              {displayName} <span className="text-muted font-normal">({order.orderNumber})</span>
            </span>
            <span className={`badge ${STATUS_COLORS[order.status] || 'badge-brand'}`}>
              {ORDER_STATUS[order.status]?.label || order.status}
            </span>
          </div>
          <div className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold gradient-text">{formatCurrency(order.total)}</div>
          <div className="text-xs text-muted">Total paid</div>
        </div>
      </div>

      {/* Items preview */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {order.items.slice(0, 4).map((item, i) => (
          <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-card flex-shrink-0 flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-muted" />
            )}
            {item.quantity > 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-foreground">×{item.quantity}</div>
            )}
          </div>
        ))}
        {order.items.length > 4 && (
          <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-xs text-muted">+{order.items.length - 4}</div>
        )}
      </div>

      {/* Progress tracker */}
      {!isTerminal && (
        <div className="mb-5">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${i <= stepIndex ? 'bg-violet-600 border-violet-500 text-foreground' : 'border-white/15 text-slate-600'}`}>
                  {i < stepIndex ? <Check className="w-3 h-3" /> : i === stepIndex ? <div className="w-2 h-2 rounded-full bg-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 transition-all ${i < stepIndex ? 'bg-violet-500/60' : 'bg-surface'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_STEPS.map((s) => (
              <span key={s} className="text-[9px] text-muted capitalize">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.trackingId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
          <Truck className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-300">Tracking: <span className="font-mono font-semibold">{order.trackingId}</span></span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link href={`/orders/${order._id}`} className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { isSignedIn, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  
  const orders = useQuery(
    api.orders.getUserOrders,
    user ? {} : 'skip'
  );

  const filteredOrders = orders?.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query))
    );
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted">Please sign in to view your orders.</p>
          <Link href="/sign-in" className="btn-primary mt-4 inline-flex py-2 px-6">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container-nexora max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/shop" className="inline-block mb-6 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/40 hover:to-cyan-500/40 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)] hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] transition-all backdrop-blur-md"
              >
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowLeft className="w-4 h-4 text-violet-600 dark:text-violet-300 group-hover:text-white transition-colors" />
                </motion.div>
                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-300 dark:to-cyan-300 group-hover:from-white group-hover:to-white transition-all">
                  Back
                </span>
              </motion.div>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-1">
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search orders or items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all backdrop-blur-md"
                />
              </div>
            </div>
            <p className="text-muted text-sm mt-1">Track and manage all your orders</p>
          </motion.div>

          {orders === undefined ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted mb-6">Your orders will appear here after you make a purchase.</p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">
                <Package className="w-4 h-4" />Start Shopping
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl backdrop-blur-md">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No matching orders</h2>
              <p className="text-muted mb-6">We couldn't find any orders matching your search.</p>
              <button onClick={() => setSearchQuery('')} className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">
                Clear Search
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
