import Link from 'next/link';
import { Zap, Globe, Code2, Briefcase, Camera, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Electronics', href: '/shop?category=electronics' },
    { label: 'Fashion', href: '/shop?category=fashion' },
    { label: 'Home & Living', href: '/shop?category=home' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
  ],
  Account: [
    { label: 'My Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Profile', href: '/dashboard' },
    { label: 'Sign In', href: '/sign-in' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const socials = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Code2, href: '#', label: 'GitHub' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: Camera, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border mt-20">
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="container-nexora py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold gradient-text">Nexora</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              AI-powered e-commerce platform delivering premium products with a world-class shopping experience.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-card hover:bg-elevated border border-border flex items-center justify-center text-muted hover:text-foreground transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-slate-200 transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nexora Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Powered by</span>
            <span className="text-xs gradient-text font-semibold">AI Commerce Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
