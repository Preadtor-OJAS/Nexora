'use client';

import { useState, use } from 'react';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Package, Truck, Check, ArrowLeft, MapPin, CreditCard, Receipt, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatCurrency, ORDER_STATUS } from '@/lib/utils';
import { toast } from 'sonner';

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
        senderRole: 'customer',
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex flex-col h-[400px]">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-violet-400" /> Messages with Seller
      </h2>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages === undefined ? (
          <div className="text-center text-muted text-sm mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted text-sm mt-10">No messages yet. Send a message to the seller!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === 'customer' && msg.senderId === user.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted mb-1 px-1">
                  {msg.senderRole === 'seller' ? 'Seller' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-surface border border-border text-foreground rounded-bl-sm'}`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="relative mt-auto flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full pl-4 pr-12 py-3 bg-background border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-xl text-sm text-foreground placeholder-muted focus:outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white disabled:opacity-50 disabled:bg-surface disabled:text-muted transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

export default function OrderDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const order = useQuery(
    api.orders.getOrder,
    orderId ? { id: orderId } : 'skip'
  );

  const cancelOrder = useMutation(api.orders.cancelOrder);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted">Please sign in to view your order details.</p>
          <Link href="/sign-in" className="btn-primary mt-4 inline-flex py-2 px-6">Sign In</Link>
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 container-nexora max-w-4xl space-y-4">
          <div className="skeleton h-10 w-48 rounded" />
          <div className="skeleton h-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Order not found</h1>
          <p className="text-muted mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/orders" className="btn-primary inline-flex py-2 px-6">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminal = ['cancelled', 'rejected'].includes(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder({ id: order._id, reason: 'Customer requested cancellation' });
        toast.success('Order cancelled successfully');
      } catch (e) {
        toast.error('Failed to cancel order');
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container-nexora max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/orders" className="group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/40 hover:to-cyan-500/40 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)] hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] transition-all backdrop-blur-md"
                >
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowLeft className="w-5 h-5 text-violet-600 dark:text-violet-300 group-hover:text-white transition-colors" />
                  </motion.div>
                </motion.div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
                <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`badge ${STATUS_COLORS[order.status] || 'badge-brand'} px-3 py-1.5`}>
                {ORDER_STATUS[order.status]?.label || order.status}
              </span>
              {canCancel && (
                <button onClick={handleCancel} className="btn-ghost text-sm py-1.5 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
                  Cancel Order
                </button>
              )}
            </div>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Order Status
            </h2>
            
            {isTerminal ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">Order {order.status === 'cancelled' ? 'Cancelled' : 'Rejected'}</h3>
                <p className="text-sm text-muted">This order has been {order.status}. No further action will be taken.</p>
                {order.notes && <p className="text-xs text-red-400 mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">Reason: {order.notes}</p>}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-0 mb-4">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all z-10 ${i <= stepIndex ? 'bg-violet-600 border-violet-500 text-foreground shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'bg-slate-100 dark:bg-surface border-border text-slate-500 dark:text-slate-600'}`}>
                        {i < stepIndex ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : i === stepIndex ? <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="flex-1 relative h-1 mx-1 md:mx-2 rounded-full overflow-hidden bg-card">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: i < stepIndex ? '100%' : '0%' }} 
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-cyan-500" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center">
                      <span className={`text-[10px] md:text-xs font-medium capitalize ${i <= stepIndex ? 'text-violet-600 dark:text-violet-300' : 'text-muted'}`}>
                        {ORDER_STATUS[s]?.label || s}
                      </span>
                    </div>
                  ))}
                </div>

                {order.trackingId && (
                  <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-300 mb-1">Tracking Number</div>
                      <div className="font-mono font-bold text-foreground text-lg tracking-wider">{order.trackingId}</div>
                    </div>
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-6 text-sm whitespace-nowrap">
                        Track Package
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Items */}
            <div className="md:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" /> Items in Order ({order.items.length})
                </h2>
                <div className="divide-y divide-white/5">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-card flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/products/${item.productId}`} className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors line-clamp-2 mb-1">
                            {item.name}
                          </Link>
                          <div className="text-xs text-muted flex items-center gap-3">
                            <span>Qty: {item.quantity}</span>
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          </div>
                        </div>
                        <div className="font-bold text-foreground">{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Messaging UI */}
              <OrderMessages orderId={order._id} user={user} />
            </div>

            {/* Right Column - Order Info */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Shipping Address
                </h2>
                <div className="text-sm text-secondary space-y-1">
                  <p className="font-semibold text-foreground">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="pt-2 text-muted">📞 {order.shippingAddress.phone}</p>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-400" /> Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold gradient-text">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Details
                  </h3>
                  <div className="text-sm text-secondary">
                    <p>Method: <span className="capitalize">{order.paymentMethod || 'Stripe Checkout'}</span></p>
                    <p>Status: <span className="capitalize text-emerald-400">{order.paymentStatus || 'Paid'}</span></p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
