'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Store, Upload, CheckCircle2, XCircle, Clock, Send, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function BecomeSellerPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Queries & Mutations
  const apply = useMutation(api.sellers.apply);
  const sendMessageMutation = useMutation(api.sellers.sendMessage);
  
  const sellerProfile = useQuery(
    api.sellers.getSellerByClerkId,
    user?.id ? { clerkId: user.id } : 'skip'
  );
  
  const messages = useQuery(
    api.sellers.getMessages,
    sellerProfile?._id ? { sellerId: sellerProfile._id } : 'skip'
  );

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    storeName: '',
    email: '',
    phone: '',
    businessDescription: '',
    address: '',
    storeLogo: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sellerProfile && formData.fullName === '') {
      // Pre-fill form data if they want to re-apply after rejection
      setFormData({
        fullName: sellerProfile.fullName || '',
        storeName: sellerProfile.storeName || '',
        email: sellerProfile.email || '',
        phone: sellerProfile.phone || '',
        businessDescription: sellerProfile.businessDescription || '',
        address: sellerProfile.address || '',
        storeLogo: sellerProfile.storeLogo || '',
      });
    }
  }, [sellerProfile, formData.fullName]);

  useEffect(() => {
    // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await apply({
        clerkId: user.id,
        ...formData,
      });
      // The query will auto-update and change the view to Pending
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your application.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sellerProfile) return;
    
    try {
      await sendMessageMutation({
        sellerId: sellerProfile._id,
        senderId: user.id,
        senderRole: 'applicant',
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isLoaded || sellerProfile === undefined) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    router.push('/sign-in?redirect_url=/become-seller');
    return null;
  }

  // RENDERING HELPERS
  
  const renderApplicationForm = (isReapply = false) => (
    <>
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {isReapply ? 'Update Your Application' : 'Become a Nexora Seller'}
        </h1>
        <p className="text-muted text-lg">
          {isReapply 
            ? 'Update your details below and submit to re-apply.' 
            : 'Join our marketplace and start selling your premium products to thousands of customers.'}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 shadow-2xl"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Store Name</label>
              <input required type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="Doe Electronics" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Phone Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Business Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="123 Commerce St, City, Country" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Business Description</label>
            <textarea required rows={4} name="businessDescription" value={formData.businessDescription} onChange={handleChange} className="w-full px-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors resize-none" placeholder="Tell us about your products..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Store Logo URL (Optional)</label>
            <div className="relative">
              <input type="url" name="storeLogo" value={formData.storeLogo} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-elevated border border-border rounded-xl text-foreground focus:outline-none focus:border-violet-500 transition-colors" placeholder="https://example.com/logo.png" />
              <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-foreground rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Submitting Application...' : (isReapply ? 'Re-Apply Now' : 'Apply Now')}
          </button>
        </form>
      </motion.div>
    </>
  );

  const renderChatInterface = () => (
    <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Message Admin</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted text-sm">
            Send a message to the Super Admin regarding your application.
          </div>
        ) : (
          messages?.map((msg, i) => {
            const isMe = msg.senderRole === 'applicant';
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-violet-600 text-white rounded-br-xl shadow-md' : 'bg-surface border border-border text-foreground rounded-bl-xl shadow-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        {sellerProfile?.isChatBlocked ? (
          <div className="text-center py-2 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
            Your chat has been blocked by the administrator.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-secondary font-sans selection:bg-violet-500/30 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* No Profile - Form */}
          {!sellerProfile && renderApplicationForm(false)}

          {/* Pending Profile */}
          {sellerProfile?.status === 'pending' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card border border-amber-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Application Pending</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Your application is currently being reviewed by our team. You can communicate with the admin below if you have any questions.
                </p>
              </div>
              {renderChatInterface()}
            </motion.div>
          )}

          {/* Approved Profile */}
          {sellerProfile?.status === 'approved' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-emerald-500/30 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Application Approved!</h2>
              <p className="text-muted text-lg mb-8 max-w-lg mx-auto">
                Congratulations! You are now an official Nexora Seller. You can now access your Seller Dashboard to start listing products.
              </p>
              <Link href="/seller-dashboard">
                <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-foreground rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  Go to Seller Dashboard
                </button>
              </Link>
            </motion.div>
          )}

          {/* Rejected Profile */}
          {sellerProfile?.status === 'rejected' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card border border-red-500/30 rounded-2xl p-8 text-center mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Application Rejected</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Unfortunately, your seller application was rejected. Please review your details and you may update them to re-apply.
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50 pointer-events-none" />
                <div className="relative">
                  {renderApplicationForm(true)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Suspended Profile */}
          {sellerProfile?.status === 'suspended' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card border border-red-500/30 rounded-2xl p-8 text-center mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Account Suspended</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Your seller account has been suspended by the administrator. Please use the chat below to contact support regarding your account status.
                </p>
              </div>
              {renderChatInterface()}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
