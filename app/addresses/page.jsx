'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import { MapPin, Plus, Star, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AddressesPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
    label: 'Home', fullName: '', addressLine1: '', addressLine2: '',
    city: '', state: '', zipCode: '', country: 'US', phone: '', isDefault: false
  });

  const customer = useQuery(api.customers.getCustomerByClerkId, user ? {} : 'skip');
  const addAddress = useMutation(api.customers.addAddress);
  const updateAddress = useMutation(api.customers.updateAddress);
  const deleteAddress = useMutation(api.customers.deleteAddress);
  const setDefaultAddress = useMutation(api.customers.setDefaultAddress);

  const addresses = customer?.addresses || [];

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        label: 'Home', fullName: user?.fullName || '', addressLine1: '', addressLine2: '',
        city: '', state: '', zipCode: '', country: 'US', phone: '', isDefault: addresses.length === 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        const { id, isDefault, ...addressData } = formData;
        await updateAddress({ addressId: editingAddress.id, address: addressData });
        toast.success('Address updated successfully');
      } else {
        await addAddress({ address: formData });
        toast.success('Address added successfully');
      }
      handleCloseModal();
    } catch (error) {
      const msg = error instanceof Error ? error.message.replace(/^Uncaught Error: /, '') : 'Failed to save address';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress({ addressId: id });
        toast.success('Address deleted successfully');
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress({ addressId: id });
      toast.success('Primary address updated');
    } catch (error) {
      toast.error('Failed to update primary address');
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container-nexora max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Saved Addresses</h1>
              <p className="text-muted">Manage your shipping addresses for a faster checkout</p>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="btn-primary flex items-center gap-2 px-6 py-2.5"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="glass-card p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No addresses saved yet</h3>
              <p className="text-muted max-w-md mb-6">Add your shipping addresses here to breeze through checkout in the future.</p>
              <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address.id} className={`glass-card p-6 relative border transition-all ${address.isDefault ? 'border-primary/50 bg-violet-500/5' : 'border-border hover:border-strong'}`}>
                  {address.isDefault && (
                    <div className="absolute top-0 right-0 bg-violet-500 text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg rounded-tr-xl">
                      Primary
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${address.isDefault ? 'bg-violet-500/20 text-primary' : 'bg-card text-muted'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                          {address.fullName}
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface text-secondary">
                            {address.label}
                          </span>
                        </h3>
                        <p className="text-sm text-muted">{address.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-secondary space-y-1 mb-6">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {!address.isDefault && (
                      <button 
                        onClick={() => handleSetDefault(address.id)}
                        className="text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5" /> Set as Primary
                      </button>
                    )}
                    <div className="flex-1" />
                    <button 
                      onClick={() => handleOpenModal(address)}
                      className="text-xs font-medium text-muted hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(address.id)}
                      className="text-xs font-medium text-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="sticky top-0 bg-surface/90 backdrop-blur-md px-6 py-4 border-b border-border flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-foreground">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                <button type="button" onClick={handleCloseModal} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">Label (e.g. Home, Work)</label>
                    <input required type="text" value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">Full Name</label>
                    <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">Phone Number</label>
                    <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">Address Line 1</label>
                    <input required type="text" value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted mb-1.5">Address Line 2 (Optional)</label>
                    <input type="text" value={formData.addressLine2} onChange={(e) => setFormData({...formData, addressLine2: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted mb-1.5">City</label>
                    <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted mb-1.5">State</label>
                    <input required type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted mb-1.5">ZIP Code</label>
                    <input required type="text" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-muted mb-1.5">Country</label>
                    <input required type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/60" />
                  </div>
                  
                  {!editingAddress && addresses.length > 0 && (
                    <div className="col-span-2 flex items-center gap-3 mt-2 bg-card p-4 rounded-xl border border-border">
                      <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 accent-violet-500 rounded cursor-pointer" />
                      <label htmlFor="isDefault" className="text-sm font-medium text-secondary cursor-pointer select-none">Set as primary address</label>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-border">
                  <button type="button" onClick={handleCloseModal} className="btn-ghost flex-1 py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2.5">{editingAddress ? 'Save Changes' : 'Add Address'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
