'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/nextjs';
import { Search, Check, X, Truck, Eye, ChevronDown, Package, MessageSquare, Send } from 'lucide-react';
import { formatCurrency, formatRelativeTime, ORDER_STATUS } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_COLOR = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#7C3AED',
  shipped: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444', rejected: '#EF4444',
};

const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-brand',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger', rejected: 'badge-danger',
};

function OrderMessages({ orderId, user }) {
  const [newMessage, setNewMessage] = useState('');
  const messages = useQuery(api.order_messages.getOrderMessages, { orderId });
  const sendMessage = useMutation(api.order_messages.sendMessage);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await sendMessage({
        orderId,
        senderId: user.id,
        senderRole: 'seller',
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-violet-400" /> Messages with Customer
      </h3>
      
      <div className="flex flex-col h-[200px] mb-3">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages === undefined ? (
            <div className="text-center text-muted text-xs mt-4">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted text-xs mt-4">No messages yet. Send an update to the customer!</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === 'seller' && msg.senderId === user.id;
              return (
                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-muted mb-0.5 px-1">
                    {msg.senderRole === 'customer' ? 'Customer' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-3 py-1.5 rounded-2xl max-w-[85%] text-xs ${isMe ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-background border border-border text-foreground rounded-bl-sm'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message customer..."
          className="w-full pl-3 pr-10 py-2 bg-background border border-border focus:border-violet-500 rounded-lg text-sm text-foreground placeholder-muted focus:outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md bg-violet-600 text-white disabled:opacity-50 disabled:bg-surface disabled:text-muted transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

function StatusModal({ order, user, onClose }) {
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStatus({ id: order._id, status, trackingId: trackingId || undefined, adminNotes: adminNotes || undefined });
      toast.success('Order status updated!');
      onClose();
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Update Order</h2>
        <p className="text-xs text-muted mb-5">{order.orderNumber}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => (
                <button key={s} onClick={() => setStatus(s)} className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${status === s ? 'text-foreground' : 'glass text-muted hover:text-foreground'}`}
                  style={status === s ? { background: `${STATUS_COLOR[s]}30`, border: `1px solid ${STATUS_COLOR[s]}50`, color: STATUS_COLOR[s] } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Tracking ID</label>
            <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g. 1Z999AA10123456784" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-sm" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Admin Notes</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 resize-none shadow-sm transition-all" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <OrderMessages orderId={order._id} user={user} />
      </motion.div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = useQuery(api.orders.getOrdersBySeller, user ? { status: statusFilter || undefined } : 'skip');
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const filtered = orders?.filter((o) =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ id, status, sellerId: user.id });
      toast.success(`Order marked as ${status}`);
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted">{orders?.length || 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'glass text-muted hover:text-foreground hover:bg-primary/5 border border-border'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3"><div className="skeleton h-12 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-12 text-sm">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <motion.tr key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="text-sm font-mono font-semibold text-foreground">{order.orderNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground truncate max-w-32">{order.shippingAddress?.fullName || 'N/A'}</div>
                      <div className="text-xs text-muted">{order.shippingAddress?.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-7 h-7 rounded-md overflow-hidden bg-card flex-shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-3.5 h-3.5 text-muted" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && <div className="w-7 h-7 rounded-md bg-card flex items-center justify-center text-[10px] text-muted">+{order.items.length - 3}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-bold gradient-text">{formatCurrency(order.total)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-brand'} capitalize text-[10px]`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted">{formatRelativeTime(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(order._id, 'processing')} className="p-2 text-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Process">
                            <Package className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleUpdateStatus(order._id, 'cancelled')} className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => handleUpdateStatus(order._id, 'shipped')} className="p-2 text-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Ship">
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button onClick={() => handleUpdateStatus(order._id, 'delivered')} className="p-2 text-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Deliver">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <StatusModal order={selectedOrder} user={user} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
