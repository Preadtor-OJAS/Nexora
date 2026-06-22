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
import { useUser } from '@clerk/nextjs';

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

export default function SellerProductsPage() {
  const { user } = useUser();
  const products = useQuery(api.products.getProductsBySeller, user ? { sellerId: user.id } : 'skip');
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const toggleActive = useMutation(api.products.toggleProductActive);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filtered = products?.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const handleSaveProduct = async (data) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, sellerId: user.id, ...data });
        toast.success('Product updated successfully');
      } else {
        await createProduct({ ...data, sellerId: user.id });
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct({ id, sellerId: user.id });
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted">{products?.length || 0} total products</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={h === 'Actions' ? "text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3" : "text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td colSpan={6} className="px-6 py-4"><div className="w-full h-10 bg-card animate-pulse rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">No products found.</td></tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-card overflow-hidden border border-border flex items-center justify-center relative">
                          <SafeImage src={product.images?.[0]} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {product.name}
                            {product.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </div>
                          <div className="text-xs text-muted">{product.brand || 'No brand'} • SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                      {product.comparePrice && <div className="text-xs text-muted line-through">{formatCurrency(product.comparePrice)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : product.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {product.stock} in stock
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary capitalize">{product.category}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive({ id: product._id, isActive: !product.isActive })} className={`p-1.5 rounded-lg transition-colors ${product.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-muted hover:bg-slate-500/10'}`}>
                        {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-2 text-slate-600 dark:text-muted hover:text-foreground hover:bg-violet-500/10 dark:hover:bg-white/5 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-600 dark:text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && <ProductModal product={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} />}
      </AnimatePresence>
    </div>
  );
}
