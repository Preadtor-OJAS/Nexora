'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

import SafeImage from '@/components/SafeImage';

export default function CartPage() {
  const { isSignedIn, user } = useUser();
  const cart = useQuery(
    api.wishlistAndCart.getCart,
    isSignedIn ? {} : 'skip'
  );
  const updateItem = useMutation(api.wishlistAndCart.updateCartItem);
  const clearCart = useMutation(api.wishlistAndCart.clearCart);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center pb-20">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view your cart</h2>
          <p className="text-muted mb-6">Your cart items will be saved when you sign in.</p>
          <Link href="/sign-in" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">Sign In</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantity = async (productId, newQty) => {
    await updateItem({ productId, quantity: newQty });
    if (newQty === 0) toast.success('Item removed from cart');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container-nexora">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-foreground mb-8">
            Shopping Cart <span className="text-muted text-xl ml-2">({items.length} items)</span>
          </motion.h1>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted mb-6">Add some amazing products to get started.</p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6"><ShoppingBag className="w-4 h-4" />Start Shopping</Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="glass-card p-4 flex gap-4 group"
                    >
                      <Link href={`/products/${item.productId}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/3">
                        <SafeImage src={item.product?.images?.[0]} alt={item.product?.name || 'Product'} fill className="object-cover" sizes="96px" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors truncate mb-1">{item.product?.name}</h3>
                        </Link>
                        {item.selectedColor && <div className="text-xs text-muted mb-1">Color: {item.selectedColor}</div>}
                        {item.selectedSize && <div className="text-xs text-muted mb-2">Size: {item.selectedSize}</div>}
                        <div className="text-base font-bold gradient-text">{formatCurrency(item.product?.price)}</div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-sm font-semibold text-foreground">{formatCurrency((item.product?.price || 0) * item.quantity)}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center glass rounded-lg overflow-hidden">
                            <button onClick={() => handleQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-foreground text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => handleQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => handleQuantity(item.productId, 0)} className="w-7 h-7 flex items-center justify-center text-muted hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span className="text-foreground">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Shipping</span>
                      <span className={shipping === 0 ? 'text-emerald-400' : 'text-foreground'}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Tax (8%)</span>
                      <span className="text-foreground">{formatCurrency(tax)}</span>
                    </div>
                    <div className="h-px bg-white/6" />
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="gradient-text text-lg">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  {shipping > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                      <Tag className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-xs text-amber-300">Add {formatCurrency(50 - subtotal)} more for free shipping!</span>
                    </div>
                  )}
                  <Link href="/checkout">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link href="/shop" className="block text-center text-sm text-muted hover:text-foreground transition-colors mt-4">Continue Shopping</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
