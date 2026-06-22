'use client';

import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Package, Edit, Check, X, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

function StockEditor({ product, onSave, onCancel }) {
  const [stock, setStock] = useState(product.stock);
  const [threshold, setThreshold] = useState(product.lowStockThreshold || 10);

  return (
    <div className="flex items-center gap-2">
      <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value) || 0)} min={0} className="w-20 px-2 py-1 bg-card border border-primary/50 rounded-lg text-sm text-foreground focus:outline-none" />
      <button onClick={() => onSave(stock, threshold)} className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button onClick={onCancel} className="w-7 h-7 rounded-lg hover:bg-violet-500/10 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-muted transition-all">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function AdminInventoryPage() {
  const products = useQuery(api.products.getAllProductsAdmin, {});
  const updateProduct = useMutation(api.products.updateProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = (products || []).filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'out' ? p.stock === 0 :
      filter === 'low' ? (p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)) :
      true;
    return matchSearch && matchFilter;
  });

  const handleSaveStock = async (product, stock, threshold) => {
    await updateProduct({ id: product._id, stock, lowStockThreshold: threshold });
    toast.success(`Stock updated to ${stock}`);
    setEditingId(null);
  };

  const outOfStock = products?.filter((p) => p.stock === 0).length || 0;
  const lowStock = products?.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length || 0;
  const inStock = products?.filter((p) => p.stock > (p.lowStockThreshold || 10)).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm text-muted">Manage stock levels across all products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Stock', value: inStock, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { label: 'Low Stock', value: lowStock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Out of Stock', value: outOfStock, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 border" style={{ borderColor: s.border, background: s.bg }}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All Products'], ['low', 'Low Stock'], ['out', 'Out of Stock']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-3 py-2 rounded-lg text-xs transition-all ${filter === v ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'glass text-muted hover:text-foreground hover:bg-primary/5 border border-border'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'Category', 'Current Stock', 'Low Stock Alert', 'Status', 'Price', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products === undefined ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-12 rounded-lg" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12"><Package className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-muted text-sm">No products found</p></td></tr>
              ) : (
                filtered.map((p) => {
                  const threshold = p.lowStockThreshold || 10;
                  const stockStatus = p.stock === 0 ? 'out' : p.stock <= threshold ? 'low' : 'ok';
                  const pct = Math.min((p.stock / Math.max(threshold * 3, 30)) * 100, 100);

                  return (
                    <tr key={p._id} className="border-b border-border hover:bg-white/3 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-card flex-shrink-0 relative">
                            <SafeImage src={p.images?.[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div className="text-sm font-medium text-foreground truncate max-w-36">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="badge badge-brand capitalize text-[10px]">{p.category}</span></td>
                      <td className="px-4 py-3">
                        {editingId === p._id ? (
                          <StockEditor product={p} onSave={(s, t) => handleSaveStock(p, s, t)} onCancel={() => setEditingId(null)} />
                        ) : (
                          <div>
                            <span className={`text-sm font-bold ${stockStatus === 'out' ? 'text-red-400' : stockStatus === 'low' ? 'text-amber-400' : 'text-foreground'}`}>{p.stock}</span>
                            <div className="w-20 h-1.5 bg-surface rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: stockStatus === 'out' ? '#EF4444' : stockStatus === 'low' ? '#F59E0B' : '#10B981' }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-muted">{threshold}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${stockStatus === 'out' ? 'badge-danger' : stockStatus === 'low' ? 'badge-warning' : 'badge-success'}`}>
                          {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm font-semibold gradient-text">{formatCurrency(p.price)}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditingId(editingId === p._id ? null : p._id)} className="w-7 h-7 rounded-lg hover:bg-violet-500/10 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
