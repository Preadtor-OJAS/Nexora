'use client';

import ScrollReveal from '@/components/animations/ScrollReveal';
import { motion } from 'motion/react';
import { Zap, Shield, Truck, RotateCcw, Headphones, Star } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    title: 'AI-Powered Discovery',
    desc: 'Our AI learns your preferences to surface products you\'ll love before you even know you want them.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(124,58,237,0.3)',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    desc: 'Bank-grade encryption with multiple payment options. Your data is always safe.',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Express shipping to your doorstep with real-time tracking and delivery notifications.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns. Not happy? We\'ll make it right, no questions asked.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Real humans available around the clock. We\'re here when you need us.',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.3)',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    desc: 'Every product is vetted by our team. Only the best makes it to your cart.',
    gradient: 'from-violet-500 to-cyan-500',
    glow: 'rgba(124,58,237,0.3)',
  },
];

export default function BenefitsSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="container-nexora relative">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="badge badge-success mb-4">Why Nexora</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built Different.{' '}
              <span className="gradient-text">Built Better.</span>
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              We obsessed over every detail so you don't have to think about it.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <ScrollReveal key={benefit.title} delay={i * 0.08} direction="up">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-6 h-full relative overflow-hidden group"
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 30% 30%, ${benefit.glow} 0%, transparent 60%)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} p-0.5 mb-5 relative`}
                  >
                    <div className="w-full h-full rounded-[10px] bg-background/90 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{benefit.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
