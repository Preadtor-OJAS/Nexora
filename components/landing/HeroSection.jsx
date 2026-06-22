'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ShoppingBag, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import ParticleBackground from '@/components/animations/ParticleBackground';
import MagneticButton from '@/components/animations/MagneticButton';
import TiltCard from '@/components/animations/TiltCard';

const HERO_PRODUCTS = [
  {
    name: 'Nexora Pro Headphones',
    price: '$349',
    badge: 'Best Seller',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    rating: 4.8,
    gradient: 'from-violet-500/20 to-cyan-500/10',
  },
  {
    name: 'Quantum X Smartwatch',
    price: '$299',
    badge: 'New',
    img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
    rating: 4.7,
    gradient: 'from-cyan-500/20 to-emerald-500/10',
  },
  {
    name: 'Aurora Wireless Speaker',
    price: '$179',
    badge: 'Top Rated',
    img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    rating: 4.9,
    gradient: 'from-pink-500/20 to-violet-500/10',
  },
];

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Avg Rating' },
];

export default function HeroSection() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const titleWords = ['AI-Powered', 'Commerce,', 'Reinvented.'];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Particle Background */}
      <ParticleBackground />

      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            x: [-20, 20, -20],
            y: [-10, 10, -10],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="container-nexora text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary">
              Next-gen AI shopping platform
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]">
            <div className="overflow-hidden">
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className={`inline-block mr-4 ${
                    i === 0
                      ? 'gradient-text'
                      : i === 1
                      ? 'text-foreground'
                      : 'text-secondary'
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover premium products curated by AI. Experience shopping that
            feels as fast, intelligent, and beautiful as you deserve.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <MagneticButton
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
              strength={0.25}
              onClick={() => router.push('/shop')}
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton
              className="btn-ghost flex items-center gap-2 text-base px-8 py-3.5"
              strength={0.2}
              onClick={() => router.push('#features')}
            >
              <TrendingUp className="w-4 h-4" />
              View Analytics
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-20"
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating Product Cards */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 perspective-1000">
            {HERO_PRODUCTS.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1 + i * 0.15,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`float float-delay-${i}`}
              >
                <TiltCard
                  className={`glass-card p-5 w-52 cursor-pointer bg-gradient-to-br ${product.gradient} relative overflow-hidden group`}
                  intensity={8}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
                    }}
                  />

                  <div className="badge badge-brand mb-3 text-[10px]">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    {product.badge}
                  </div>

                  <div className="relative w-full h-36 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="200px"
                    />
                  </div>

                  <div className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                    {product.name}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold gradient-text">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-muted">{product.rating}</span>
                    </div>
                  </div>

                  <Link href="/shop">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 w-full py-2 rounded-lg bg-surface hover:bg-white/12 border border-border text-xs text-center text-secondary hover:text-foreground transition-all cursor-pointer"
                    >
                      View Product
                    </motion.div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-600 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-violet-500 to-transparent"
        />
      </motion.div>
    </section>
  );
}
