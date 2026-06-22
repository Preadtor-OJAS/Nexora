'use client';

import { useQuery } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import TiltCard from '@/components/animations/TiltCard';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { formatCurrency, calcDiscount } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@/lib/convex-hooks';
import { toast } from 'sonner';

function ProductCardSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="skeleton h-52 w-full rounded-xl mb-4" />
      <div className="skeleton h-3 w-3/4 mb-2 rounded" />
      <div className="skeleton h-3 w-1/2 mb-4 rounded" />
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  );
}

function ProductCard({ product }) {
  const { isSignedIn, user } = useUser();
  const toggleWishlist = useMutation(api.wishlistAndCart.toggleWishlistItem);
  const discount = calcDiscount(product.comparePrice, product.price);

  const wishlist = useQuery(
    api.wishlistAndCart.getWishlist,
    isSignedIn ? { userId: user?.id } : 'skip'
  );
  const isWishlisted = wishlist?.productIds?.includes(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isSignedIn) { toast.error('Please sign in'); return; }
    const result = await toggleWishlist({ userId: user.id, productId: product._id });
    toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <TiltCard intensity={6}>
      <div className="glass-card overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-52 overflow-hidden rounded-t-xl bg-white/3">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="badge badge-brand text-[10px]">Featured</span>
            )}
            {discount > 0 && (
              <span className="badge badge-danger text-[10px]">-{discount}%</span>
            )}
          </div>
          {/* Wishlist */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full glass backdrop-blur-md flex items-center justify-center hover:bg-elevated transition-all ${isWishlisted ? 'text-red-500 hover:text-red-400' : 'text-foreground hover:text-red-400'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Link href={`/products/${product._id}`}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full py-2 rounded-lg bg-white/90 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Quick View
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-xs text-primary font-medium mb-1 capitalize">
            {product.category}
          </div>
          <Link href={`/products/${product._id}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary-hover transition-colors line-clamp-1 mb-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold gradient-text">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xs text-muted line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-amber-400">Only {product.stock} left</span>
            )}
            {product.stock === 0 && (
              <span className="text-xs text-red-400">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

export default function FeaturedProducts() {
  const products = useQuery(api.products.getProducts, { featured: true, limit: 6 });

  return (
    <section className="py-24 relative">
      <div className="container-nexora">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="badge badge-brand mb-4">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Handpicked for You
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              AI-curated selection of our most loved products, updated daily based on trends and ratings.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products === undefined
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <ScrollReveal key={product._id} delay={i * 0.08}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
        </div>

        <ScrollReveal className="text-center mt-12">
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost inline-flex items-center gap-2"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
