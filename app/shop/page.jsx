'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Star, Heart, ShoppingBag, Grid3X3, List, X, ChevronDown, Zap, ChevronRight, Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TiltCard from '@/components/animations/TiltCard';
import { formatCurrency, calcDiscount, CATEGORIES, debounce } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@/lib/convex-hooks';
import { toast } from 'sonner';
import SafeImage from '@/components/SafeImage';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

function ProductSkeleton({ view }) {
  if (view === 'list') {
    return (
      <div className="glass-card p-4 flex gap-4 animate-pulse">
        <div className="skeleton w-28 h-28 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-3 w-3/4 mb-2 rounded" />
          <div className="skeleton h-3 w-1/2 mb-4 rounded" />
          <div className="skeleton h-6 w-24 rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="skeleton h-52 w-full rounded-xl mb-4" />
      <div className="skeleton h-3 w-3/4 mb-2 rounded" />
      <div className="skeleton h-3 w-1/2 mb-4 rounded" />
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  );
}

function ProductCard({ product, view }) {
  const { isSignedIn, user } = useUser();
  const addToCart = useMutation(api.wishlistAndCart.addToCart);
  const toggleWishlist = useMutation(api.wishlistAndCart.toggleWishlistItem);
  const discount = calcDiscount(product.comparePrice, product.price);

  const wishlist = useQuery(
    api.wishlistAndCart.getWishlist,
    isSignedIn ? {} : 'skip'
  );
  const isWishlisted = wishlist?.productIds?.includes(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isSignedIn) { toast.error('Please sign in to add to cart'); return; }
    await addToCart({ productId: product._id, quantity: 1 });
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isSignedIn) { toast.error('Please sign in to add to wishlist'); return; }
    const result = await toggleWishlist({ productId: product._id });
    toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  if (view === 'list') {
    return (
      <motion.div layout className="glass-card p-4 flex gap-4 group">
        <Link href={`/products/${product._id}`} className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-white/3 flex items-center justify-center">
          <SafeImage
            src={product.images?.[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="112px"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-primary capitalize mb-1">{product.category}</div>
          <Link href={`/products/${product._id}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors mb-1 truncate">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            ))}
            <span className="text-xs text-muted ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold gradient-text">{formatCurrency(product.price)}</span>
            {product.comparePrice && <span className="text-xs text-muted line-through">{formatCurrency(product.comparePrice)}</span>}
            {discount > 0 && <span className="badge badge-danger text-[10px]">-{discount}%</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleWishlist} className={`w-8 h-8 rounded-lg glass flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-400' : 'text-muted hover:text-red-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleAddToCart} className="w-8 h-8 rounded-lg bg-violet-600/80 hover:bg-violet-600 flex items-center justify-center text-foreground transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <TiltCard intensity={6}>
      <motion.div layout className="glass-card overflow-hidden group cursor-pointer h-full flex flex-col">
        <div className="relative h-52 overflow-hidden bg-white/3 flex items-center justify-center">
          <Link href={`/products/${product._id}`} className="w-full h-full block relative">
            <SafeImage
              src={product.images?.[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isFeatured && <span className="badge badge-brand text-[10px]">Featured</span>}
            {discount > 0 && <span className="badge badge-danger text-[10px]">-{discount}%</span>}
            {product.stock <= 5 && product.stock > 0 && <span className="badge badge-warning text-[10px]">Low Stock</span>}
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleWishlist} className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center hover:bg-elevated transition-all ${isWishlisted ? 'text-red-500 hover:text-red-400' : 'text-secondary hover:text-red-400'}`}>
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAddToCart} className="w-full py-2 rounded-lg bg-white/90 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-primary font-medium mb-1 capitalize">{product.category}</div>
          <Link href={`/products/${product._id}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors line-clamp-2 mb-2 flex-1">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            ))}
            <span className="text-xs text-muted ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold gradient-text">{formatCurrency(product.price)}</span>
              {product.comparePrice && <span className="text-xs text-muted line-through">{formatCurrency(product.comparePrice)}</span>}
            </div>
            <div className="flex items-center gap-3">
              {product.stock === 0 && <span className="text-xs text-red-400">Out of stock</span>}
              <Link href={`/products/${product._id}`} className="text-xs font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1">
                Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const products = useQuery(api.products.getProducts, {
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
    sortBy,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container-nexora pt-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-5 sticky top-32 z-10 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
              <h3 className="text-sm font-semibold text-foreground mb-4">Categories</h3>
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!selectedCategory ? 'bg-violet-600/10 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/20 dark:border-violet-500/30' : 'text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5'}`}>
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-violet-600/10 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/20 dark:border-violet-500/30' : 'text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5'}`}>
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Sort By</h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${sortBy === opt.value ? 'bg-violet-600/10 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative flex-1">
                {/* Global search is in the Navbar */}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setView('grid')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-600 dark:text-muted hover:text-foreground hover:bg-primary/5'}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-600 dark:text-muted hover:text-foreground hover:bg-primary/5'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="badge badge-brand flex items-center gap-1.5">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="badge badge-info flex items-center gap-1.5">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid/List */}
            <AnimatePresence mode="wait">
              {products === undefined ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3'}
                >
                  {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} view={view} />)}
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted text-sm">Try adjusting your filters or search query.</p>
                  <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); }} className="btn-ghost mt-6 text-sm py-2 px-6">Clear Filters</button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${view}-${selectedCategory}-${sortBy}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3'}
                >
                  {products.map((product, i) => (
                    <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCard product={product} view={view} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
