'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Package, CreditCard, MapPin, ShoppingBag, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { formatCurrency, generateOrderId } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Package },
];

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    addressLine1: '', addressLine2: '',
    city: '', state: '', zipCode: '', country: 'US',
    phone: '',
  });
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddressForLater, setSaveAddressForLater] = useState(false);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);

  const customer = useQuery(api.customers.getCustomerByClerkId, user ? { clerkId: user.id } : 'skip');
  const cart = useQuery(api.wishlistAndCart.getCart, user ? { userId: user.id } : 'skip');
  const createOrder = useMutation(api.orders.createOrder);
  const clearCart = useMutation(api.wishlistAndCart.clearCart);
  const addAddress = useMutation(api.customers.addAddress);

  const addresses = customer?.addresses || [];

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === 'new' && !address.addressLine1) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setAddress({
        fullName: defaultAddr.fullName,
        addressLine1: defaultAddr.addressLine1,
        addressLine2: defaultAddr.addressLine2 || '',
        city: defaultAddr.city,
        state: defaultAddr.state,
        zipCode: defaultAddr.zipCode,
        country: defaultAddr.country,
        phone: defaultAddr.phone,
      });
    }
  }, [addresses, selectedAddressId, address.addressLine1]);

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddress({
        fullName: user?.fullName || '',
        addressLine1: '', addressLine2: '',
        city: '', state: '', zipCode: '', country: 'US',
        phone: '',
      });
    } else {
      const addr = addresses.find(a => a.id === id);
      if (addr) {
        setAddress({
          fullName: addr.fullName,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || '',
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          phone: addr.phone,
        });
      }
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      // Group items by seller
      const itemsBySeller = items.reduce((acc, item) => {
        const sellerId = item.product?.sellerId || 'platform';
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId].push(item);
        return acc;
      }, {});

      // Create an order for each seller
      for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
        const isMultiVendor = Object.keys(itemsBySeller).length > 1;
        const orderNumberSuffix = isMultiVendor ? `-${sellerId.substring(sellerId.length - 4)}` : '';
        const orderNumber = generateOrderId() + orderNumberSuffix;
        
        const sellerSubtotal = sellerItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
        const sellerShipping = sellerSubtotal >= 50 ? 0 : 9.99;
        const sellerTax = sellerSubtotal * 0.08;
        const sellerTotal = sellerSubtotal + sellerShipping + sellerTax;

        await createOrder({
          userId: user.id,
          orderNumber,
          items: sellerItems.map((item) => ({
            productId: item.productId,
            name: item.product?.name || 'Unknown Product',
            image: item.product?.images?.[0] || '',
            price: item.product?.price || 0,
            quantity: item.quantity,
            selectedColor: item.selectedColor || undefined,
            selectedSize: item.selectedSize || undefined,
          })),
          subtotal: sellerSubtotal,
          tax: sellerTax,
          shipping: sellerShipping,
          total: sellerTotal,
          shippingAddress: address,
          paymentMethod: 'card',
          sellerId: sellerId === 'platform' ? undefined : sellerId,
        });
      }
      
      if (selectedAddressId === 'new' && saveAddressForLater) {
        try {
          await addAddress({
            clerkId: user.id,
            address: { label: 'Saved Address', ...address }
          });
        } catch (error) {
          console.error('Failed to save address', error);
        }
      }
      
      await clearCart({ userId: user.id });
      setOrderPlaced(true);
      
      // Wait for the animation to play, then redirect
      setTimeout(() => {
        router.push('/orders');
      }, 3500);
      
    } catch (e) {
      toast.error('Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050508]/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
              className="flex flex-col items-center justify-center px-4"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full" />
                <lord-icon
                  src="https://cdn.lordicon.com/lupuorrc.json"
                  trigger="in"
                  delay="100"
                  colors="primary:#10b981,secondary:#06b6d4"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 tracking-tight"
              >
                Yahoo! Your order is placed!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted text-lg md:text-xl text-center max-w-lg"
              >
                Sit tight, your premium items are being prepared for shipping. We're redirecting you to your orders...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar checkoutStep={step} />
      <div className="pt-0 pb-20 mt-4">
        <div className="container-nexora max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Shipping Address</h2>
                    
                    {addresses.length > 0 && (
                      <div className="mb-6 space-y-3">
                        <label className="text-sm font-medium text-secondary">Select an address</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60 transition-colors flex items-center justify-between text-left"
                          >
                            <span className="truncate pr-4">
                              {selectedAddressId === 'new' 
                                ? '+ Enter a new address'
                                : (() => {
                                    const a = addresses.find(x => x.id === selectedAddressId);
                                    return a ? `${a.label} (${a.addressLine1}, ${a.city})` : 'Select an address';
                                  })()
                              }
                            </span>
                            <motion.div animate={{ rotate: isAddressDropdownOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                              <ChevronDown className="w-4 h-4 text-muted" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isAddressDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 w-full mt-2 py-2 bg-[#1A1A24] border border-border rounded-xl shadow-xl overflow-hidden"
                              >
                                {addresses.map(a => (
                                  <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => {
                                      handleAddressSelect(a.id);
                                      setIsAddressDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 transition-colors hover:bg-surface ${selectedAddressId === a.id ? 'bg-card' : ''}`}
                                  >
                                    <div className={`font-medium text-sm ${selectedAddressId === a.id ? 'text-primary' : 'text-foreground'}`}>{a.label}</div>
                                    <div className="text-xs text-muted truncate mt-0.5">{a.addressLine1}, {a.city}</div>
                                  </button>
                                ))}
                                <div className="h-px bg-surface my-1 mx-2" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddressSelect('new');
                                    setIsAddressDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface flex items-center gap-2 ${selectedAddressId === 'new' ? 'text-primary bg-card' : 'text-secondary'}`}
                                >
                                  + Enter a new address
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-x-4 gap-y-3 mt-4">
                      {[
                        { key: 'fullName', label: 'Full Name', col: 'sm:col-span-6 col-span-12' },
                        { key: 'phone', label: 'Phone', col: 'sm:col-span-6 col-span-12' },
                        { key: 'addressLine1', label: 'Address Line 1', col: 'col-span-12' },
                        { key: 'city', label: 'City', col: 'sm:col-span-4 col-span-12' },
                        { key: 'state', label: 'State', col: 'sm:col-span-4 col-span-6' },
                        { key: 'zipCode', label: 'ZIP Code', col: 'sm:col-span-4 col-span-6' },
                        { key: 'addressLine2', label: 'Apt/Suite (Optional)', col: 'sm:col-span-6 col-span-12' },
                        { key: 'country', label: 'Country', col: 'sm:col-span-6 col-span-12' },
                      ].map((field) => (
                        <div key={field.key} className={field.col}>
                          <label className="text-[11px] font-medium text-muted mb-1.5 block uppercase tracking-wider">{field.label}</label>
                          <input
                            type="text"
                            value={address[field.key]}
                            onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/10 transition-all hover:bg-elevated"
                          />
                        </div>
                      ))}
                    </div>

                    {selectedAddressId === 'new' && (
                      <div className="mt-4 flex items-center gap-3 bg-card p-4 rounded-xl border border-border">
                        <input 
                          type="checkbox" 
                          id="saveAddress" 
                          checked={saveAddressForLater} 
                          onChange={(e) => setSaveAddressForLater(e.target.checked)} 
                          className="w-4 h-4 accent-violet-500 rounded cursor-pointer" 
                        />
                        <label htmlFor="saveAddress" className="text-sm font-medium text-secondary cursor-pointer select-none">
                          Save this address for next time
                        </label>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: '💳' },
                        { id: 'paypal', label: 'PayPal', desc: 'Pay with your PayPal account', icon: '🅿️' },
                        { id: 'apple', label: 'Apple Pay', desc: 'Pay with Touch ID or Face ID', icon: '🍎' },
                      ].map((method) => (
                        <label key={method.id} className="flex items-center gap-4 p-4 glass rounded-xl border border-border hover:border-violet-500/40 cursor-pointer transition-all has-[:checked]:border-violet-500/60 has-[:checked]:bg-violet-500/5">
                          <input type="radio" name="payment" value={method.id} defaultChecked={method.id === 'card'} className="accent-violet-500" />
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-foreground">{method.label}</div>
                            <div className="text-xs text-muted">{method.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-emerald-300 text-center">🔒 Payments are processed securely. Your card details are never stored.</p>
                    </div>
                    <p className="text-xs text-center text-muted mt-3">
                      This is a demo — no real payment is processed
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Review Order</h2>
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 py-2">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-card flex-shrink-0 relative">
                            <img src={item.product?.images?.[0]} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{item.product?.name || item.name}</div>
                            <div className="text-xs text-muted">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-sm font-semibold text-foreground">{formatCurrency((item.product?.price || 0) * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="glass rounded-xl p-4 border border-border">
                      <h3 className="text-xs font-semibold text-muted mb-2">Ship to:</h3>
                      <p className="text-sm text-foreground">{address.fullName}</p>
                      <p className="text-sm text-muted">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                      <p className="text-sm text-muted">{address.city}, {address.state} {address.zipCode}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 mt-8">
                {step > 0 ? (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(step - 1)} className="w-1/3 bg-card hover:bg-elevated text-foreground rounded-xl flex items-center justify-center gap-2 py-3 text-base font-medium transition-all border border-border">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                ) : (
                  <Link href="/cart" className="w-1/3 block">
                    <motion.button whileTap={{ scale: 0.97 }} className="w-full bg-card hover:bg-elevated text-foreground rounded-xl flex items-center justify-center gap-2 py-3 text-base font-medium transition-all border border-border">
                      Cancel
                    </motion.button>
                  </Link>
                )}

                {step < 2 ? (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(step + 1)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all">
                    Continue <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all">
                    {placing ? 'Placing Order...' : 'Place Order 🎉'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="glass-card p-6 sticky top-28">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-muted">Subtotal ({items.length} items)</span><span className="text-foreground">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span className={shipping === 0 ? 'text-emerald-400' : 'text-foreground'}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span className="text-foreground">{formatCurrency(tax)}</span></div>
                  <div className="h-px bg-white/6" />
                  <div className="flex justify-between font-bold"><span className="text-foreground">Total</span><span className="gradient-text">{formatCurrency(total)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
