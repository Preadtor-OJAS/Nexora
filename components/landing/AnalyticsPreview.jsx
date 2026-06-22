'use client';

import { useEffect, useRef } from 'react';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight } from 'lucide-react';

const METRICS = [
  { label: 'Total Revenue', value: '$2.4M', change: '+18.5%', icon: DollarSign, color: '#10B981' },
  { label: 'Orders Today', value: '284', change: '+12.3%', icon: ShoppingBag, color: '#7C3AED' },
  { label: 'New Customers', value: '1,249', change: '+8.7%', icon: Users, color: '#06B6D4' },
  { label: 'Growth Rate', value: '32%', change: '+4.2%', icon: TrendingUp, color: '#F59E0B' },
];

function AnimatedCounter({ target, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          // Simple number animation
          const numStr = target.replace(/[^0-9.]/g, '');
          const num = parseFloat(numStr);
          const isDecimal = numStr.includes('.');
          const duration = 1500;
          const start = Date.now();

          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = num * eased;
            const formatted = isDecimal
              ? current.toFixed(1)
              : Math.floor(current).toLocaleString();
            el.textContent = prefix + formatted + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  );
}

export default function AnalyticsPreview() {
  return (
    <section className="py-24 relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="container-nexora relative">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="badge badge-brand mb-4">Analytics</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Data That{' '}
              <span className="gradient-text">Drives Decisions</span>
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              Real-time analytics dashboard giving you complete visibility into your business performance.
            </p>
          </div>
        </ScrollReveal>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <ScrollReveal key={metric.label} delay={i * 0.1}>
                <div className="glass-card p-5 relative overflow-hidden group">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                    style={{
                      background: `radial-gradient(ellipse at 0% 0%, ${metric.color}15 0%, transparent 60%)`,
                    }}
                  />
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${metric.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: metric.color }} />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <ArrowUpRight className="w-3 h-3" />
                      {metric.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    <AnimatedCounter
                      target={metric.value.replace(/[$,M%K]/g, '')}
                      prefix={metric.value.startsWith('$') ? '$' : ''}
                      suffix={
                        metric.value.endsWith('M')
                          ? 'M'
                          : metric.value.endsWith('K')
                          ? 'K'
                          : metric.value.endsWith('%')
                          ? '%'
                          : ''
                      }
                    />
                  </div>
                  <div className="text-xs text-muted">{metric.label}</div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Dashboard Preview Card */}
        <ScrollReveal>
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
              <div className="lg:col-span-2">
                <div className="badge badge-brand mb-4">Admin Dashboard</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Full Control, Zero Complexity
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Manage products, track orders, analyze customer behavior, and monitor inventory — all from one beautiful dashboard.
                </p>
                <ul className="space-y-2">
                  {[
                    'Real-time revenue tracking',
                    'Order accept/reject workflow',
                    'Inventory alerts & management',
                    'Customer growth analytics',
                    'Best-selling product insights',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fake Chart Preview */}
              <div className="lg:col-span-3 bg-slate-100/80 dark:bg-black/30 rounded-xl p-4 border border-border min-h-48">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-muted">Revenue — Last 30 Days</span>
                  <span className="badge badge-success text-[10px]">Live</span>
                </div>
                {/* Simulated chart bars */}
                <div className="flex items-end gap-1.5 h-32">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100, 65, 80, 90, 55, 70, 85, 95, 60, 75, 88, 65, 92, 78, 85, 96, 70, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all duration-300 hover:opacity-100 opacity-80"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 29
                            ? 'linear-gradient(to top, #7C3AED, #A855F7)'
                            : 'linear-gradient(to top, rgba(124,58,237,0.55), rgba(168,85,247,0.75))',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
