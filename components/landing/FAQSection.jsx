'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'How does AI-powered product discovery work?',
    a: 'Our AI analyzes your browsing patterns, purchase history, and preferences to surface products you\'re most likely to love. It gets smarter with every interaction.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, PayPal, Apple Pay, Google Pay, and more. All transactions are secured with bank-grade encryption.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout. Free standard shipping on orders over $50.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer 30-day hassle-free returns on most items. Simply initiate a return from your order history page and we\'ll arrange a free pickup.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you\'ll receive a tracking ID via email. You can also track in real-time from your Orders page in your account dashboard.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'Orders can be cancelled or modified within 1 hour of placement. After that, please wait for delivery and then initiate a return if needed.',
  },
];

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-violet-300 transition-colors pr-4">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-5">
              <div className="h-px bg-white/6 mb-4" />
              <p className="text-sm text-muted leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-24 relative">
      <div className="container-nexora max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="badge badge-info mb-4">FAQ</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Got Questions?
            </h2>
            <p className="text-muted">
              Everything you need to know about Nexora.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <FAQItem item={item} index={i} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
