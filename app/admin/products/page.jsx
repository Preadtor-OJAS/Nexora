'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, Package, X, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

const Field = ({ label, name, type = 'text', required, className = '', form, setForm }) => (
  <div className={className}>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}{required && ' *'}</label>
    <input
      type={type}
      value={form[name] || ''}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      required={required}
      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-sm"
    />
  </div>
);

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    name: '', slug: '', description: '', price: 0, comparePrice: '',
    images: [''], category: 'electronics', tags: '', stock: 0,
    isFeatured: false, isActive: true, brand: '', sku: '',
    colors: '', sizes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
      stock: parseInt(form.stock),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
      colors: typeof form.colors === 'string' ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : form.colors || [],
      sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : form.sizes || [],
      images: typeof form.images === 'string' ? form.images.split(',').map((img) => img.trim()).filter(Boolean) : Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border bg-surface/90 backdrop-blur-xl rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-foreground">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-violet-500/10 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground transition-all"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field form={form} setForm={setForm} label="Product Name" name="name" required className="col-span-2" />
            <Field form={form} setForm={setForm} label="Brand" name="brand" />
            <Field form={form} setForm={setForm} label="SKU" name="sku" />
            <Field form={form} setForm={setForm} label="Price ($)" name="price" type="number" required />
            <Field form={form} setForm={setForm} label="Compare Price ($)" name="comparePrice" type="number" />
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-sm">
                {['electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 'gaming', 'food'].map((c) => <option key={c} value={c} className="bg-background capitalize">{c}</option>)}
              </select>
            </div>
            <Field form={form} setForm={setForm} label="Stock" name="stock" type="number" required />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-sm resize-none" />
          </div>

          <Field form={form} setForm={setForm} label="Image URLs (first URL used as main)" name="images" />
          <Field form={form} setForm={setForm} label="Tags (comma-separated)" name="tags" />
          <Field form={form} setForm={setForm} label="Colors (comma-separated hex or names)" name="colors" />
          <Field form={form} setForm={setForm} label="Sizes (comma-separated, e.g. S,M,L)" name="sizes" />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-violet-500" />
              <span className="text-sm text-secondary">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-violet-500" />
              <span className="text-sm text-secondary">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
            <button type="submit" className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"><Check className="w-4 h-4" />{product ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminProductsPage() {
  const products = useQuery(api.products.getAllProductsAdmin, {});
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const toggleActive = useMutation(api.products.toggleProductActive);
  const seedProducts = useMutation(api.products.seedProducts);

  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const filtered = products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleSave = async (data) => {
    try {
      if (modalProduct?._id) {
        await updateProduct({ id: modalProduct._id, ...data });
        toast.success('Product updated!');
      } else {
        await createProduct(data);
        toast.success('Product created!');
      }
      setShowModal(false);
      setModalProduct(null);
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteProduct({ id });
    toast.success('Product deleted');
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedProducts({});
      toast.success(`Seeded ${result.count} sample products!`);
    } catch (e) { toast.error('Already seeded or error: ' + e.message); }
    setSeeding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted">{products?.length || 0} total products</p>
        </div>
        <div className="flex gap-3">
          {products?.length === 0 && (
            <button onClick={handleSeed} disabled={seeding} className="btn-ghost py-2 px-4 text-sm">
              {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
            </button>
          )}
          <button onClick={() => { setModalProduct(null); setShowModal(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3"><div className="skeleton h-10 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-12 text-sm">No products found. Use "Seed Demo Data" to add samples.</td></tr>
              ) : (
                filtered.map((p) => (
                  <motion.tr key={p._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-card flex-shrink-0 relative">
                          <SafeImage src={p.images?.[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground truncate max-w-40">{p.name}</div>
                          <div className="text-xs text-muted">{p.brand || p.sku || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge badge-brand capitalize text-[10px]">{p.category}</span></td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-foreground">{formatCurrency(p.price)}</div>
                      {p.comparePrice && <div className="text-xs text-muted line-through">{formatCurrency(p.comparePrice)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock <= 10 ? 'text-amber-400' : 'text-foreground'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-foreground">{p.rating || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive({ id: p._id, isActive: !p.isActive })} className={`badge cursor-pointer transition-all ${p.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {p.isActive !== false ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setModalProduct(p); setShowModal(true); }} className="w-7 h-7 rounded-lg hover:bg-violet-500/10 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-muted hover:text-foreground transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={modalProduct}
            onClose={() => { setShowModal(false); setModalProduct(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
