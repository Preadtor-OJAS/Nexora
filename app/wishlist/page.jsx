'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import SafeImage from '@/components/SafeImage';

export default function WishlistPage() {
  const { isSignedIn, user } = useUser();
  const wishlist = useQuery(
    api.wishlistAndCart.getWishlist,
    isSignedIn ? {} : 'skip'
  );
  const toggleWishlist = useMutation(api.wishlistAndCart.toggleWishlistItem);
  const addToCart = useMutation(api.wishlistAndCart.addToCart);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="pt-32 text-center">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-muted mb-4">Sign in to see your wishlist</p>
          <Link href="/sign-in" className="btn-primary py-2.5 px-6">Sign In</Link>
        </div>
      </div>
    );
  }

  const products = wishlist?.products || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container-nexora">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Wishlist</h1>
            <p className="text-muted text-sm">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
              <p className="text-muted mb-6">Save products you love to your wishlist.</p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6">Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden group"
                >
                  <div className="relative h-48 bg-white/3">
                    <Link href={`/products/${p._id}`}>
                      <SafeImage src={p.images?.[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="300px" />
                    </Link>
                    <button
                      onClick={async () => {
                        await toggleWishlist({ productId: p._id });
                        toast.success('Removed from wishlist');
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Heart className="w-4 h-4 fill-red-400" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-primary capitalize mb-1">{p.category}</div>
                    <Link href={`/products/${p._id}`}>
                      <h3 className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors line-clamp-2 mb-3">{p.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold gradient-text">{formatCurrency(p.price)}</span>
                      {p.comparePrice && <span className="text-xs text-muted line-through">{formatCurrency(p.comparePrice)}</span>}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={async () => {
                        await addToCart({ productId: p._id, quantity: 1 });
                        toast.success('Added to cart!');
                      }}
                      className="w-full py-2 rounded-lg bg-violet-600/10 dark:bg-violet-600/20 hover:bg-violet-600/20 dark:hover:bg-violet-600/30 border border-violet-500/20 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
