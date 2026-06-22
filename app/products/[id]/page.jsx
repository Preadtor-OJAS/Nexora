'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Star, ArrowLeft, Truck, Shield, RotateCcw, Plus, Minus, Check, Share2, Zap } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { formatCurrency, calcDiscount } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

function ProductPageSkeleton() {
  return (
    <div className="pt-24 container-nexora pb-20 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="skeleton h-[500px] rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = useQuery(api.products.getProduct, id ? { id } : 'skip');
  const isWishlisted = useQuery(
    api.wishlistAndCart.isInWishlist,
    isSignedIn && id ? { userId: user.id, productId: id } : 'skip'
  );

  const addToCart = useMutation(api.wishlistAndCart.addToCart);
  const toggleWishlist = useMutation(api.wishlistAndCart.toggleWishlistItem);

  if (product === undefined) return <><Navbar /><ProductPageSkeleton /></>;
  if (!product) return <><Navbar /><div className="pt-24 text-center text-muted py-20">Product not found</div></>;

  const discount = calcDiscount(product.comparePrice, product.price);

  const handleAddToCart = async () => {
    if (!isSignedIn) { toast.error('Please sign in to shop'); return; }
    await addToCart({ 
      userId: user.id, 
      productId: product._id, 
      quantity, 
      selectedColor: selectedColor || undefined, 
      selectedSize: selectedSize || undefined 
    });
    setAddedToCart(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!isSignedIn) { toast.error('Please sign in to shop'); return; }
    await addToCart({ 
      userId: user.id, 
      productId: product._id, 
      quantity, 
      selectedColor: selectedColor || undefined, 
      selectedSize: selectedSize || undefined 
    });
    router.push('/checkout');
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please sign in first');
    await toggleWishlist({ productId: product._id });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container-nexora">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-secondary capitalize">{product.category}</span>
            <span>/</span>
            <span className="text-foreground truncate max-w-32">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-white/3 glass-card">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <SafeImage
                      src={product.images?.[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && <span className="badge badge-danger">-{discount}% OFF</span>}
                  {product.stock <= 5 && product.stock > 0 && <span className="badge badge-warning">Only {product.stock} left!</span>}
                </div>

                {/* Wishlist */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
                >
                  <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-400 fill-red-400' : 'text-muted'}`} />
                </motion.button>
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${selectedImage === i ? 'ring-2 ring-violet-500' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <SafeImage src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-primary capitalize font-medium mb-2">{product.brand || product.category}</div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold gradient-text">{formatCurrency(product.price)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-muted line-through mb-1">{formatCurrency(product.comparePrice)}</span>
                    <span className="badge badge-danger mb-1">Save {formatCurrency(product.comparePrice - product.price)}</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-muted leading-relaxed">{product.description}</p>

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-foreground mb-3">Color</div>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-slate-950 ${selectedColor === color ? 'ring-2 ring-violet-400 scale-110' : 'hover:scale-105'}`}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-foreground mb-3">Size</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSize === size ? 'bg-violet-600 text-foreground border border-violet-500' : 'glass border border-border text-secondary hover:border-violet-500/50 hover:text-foreground'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-0 glass-card rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-foreground font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted">{product.stock} in stock</span>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${product.stock === 0 ? 'bg-surface text-muted cursor-not-allowed' : addedToCart ? 'bg-emerald-600 text-foreground' : 'glass border border-border hover:border-violet-500/50 hover:bg-surface text-slate-200 text-base'}`}
                  >
                    {addedToCart ? <><Check className="w-5 h-5" />Added!</> : <><ShoppingBag className="w-5 h-5" />Add to Cart</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${product.stock === 0 ? 'bg-surface text-muted cursor-not-allowed' : 'btn-primary text-base'}`}
                  >
                    <Zap className="w-5 h-5" /> Buy Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWishlist}
                    className="w-12 h-12 glass-card rounded-xl flex items-center justify-center text-muted hover:text-red-400 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-400 fill-red-400' : ''}`} />
                  </motion.button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {[
                  { icon: Truck, label: 'Free shipping over $50' },
                  { icon: Shield, label: 'Secure payment' },
                  { icon: RotateCcw, label: '30-day returns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted">{label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs text-muted bg-card border border-border">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
