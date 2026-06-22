'use client';

import ScrollReveal from '@/components/animations/ScrollReveal';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'Nexora completely changed how I shop online. The AI recommendations are incredibly accurate—it found products I didn\'t even know I needed.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Tech Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'The admin dashboard is a masterpiece. Real-time analytics, beautiful charts, and everything just works. My conversion rate went up 40%.',
  },
  {
    name: 'Priya Patel',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'The product discovery is unreal. I open Nexora and it already has my next favorite outfit waiting for me. Premium experience all around.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.06) 0%, transparent 60%)',
      }} />

      <div className="container-nexora relative">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="badge badge-accent mb-4">Testimonials</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Loved by <span className="gradient-text-aurora">50,000+</span> Shoppers
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.12} direction="up">
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 h-full relative"
              >
                <Quote className="w-8 h-8 text-violet-500/30 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-secondary leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30"
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
