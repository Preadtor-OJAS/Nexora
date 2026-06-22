'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Check, X, Ban, Shield, MessageCircle, Send, XCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function AdminSellersPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState('all'); // all, pending, approved, suspended
  const [selectedSeller, setSelectedSeller] = useState(null); // For the Chat Modal
  
  const sellers = useQuery(api.sellers.getAllSellers, filter === 'all' ? {} : { status: filter });
  const updateStatus = useMutation(api.sellers.updateSellerStatus);
  const sendMessageMutation = useMutation(api.sellers.sendMessage);

  const handleUpdateStatus = async (id, status, clerkId) => {
    try {
      await updateStatus({ id, status, clerkId });
      if (selectedSeller?._id === id && status !== 'pending') {
        setSelectedSeller(null); // Close modal if status changes
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'rejected': return 'bg-slate-500/10 text-muted border-slate-500/20';
      default: return 'bg-card text-secondary border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Sellers Management</h1>
          <p className="text-sm text-muted">Review and manage marketplace vendors</p>
        </div>
        <div className="flex bg-muted/80 dark:bg-elevated p-1 rounded-lg border border-border">
          {['all', 'pending', 'approved', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filter === status 
                  ? 'bg-surface text-foreground shadow-sm' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {!sellers ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Sellers Found</h3>
          <p className="text-muted">No seller applications match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <SellerCard
              key={seller._id}
              seller={seller}
              setSelectedSeller={setSelectedSeller}
              handleUpdateStatus={handleUpdateStatus}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {/* Chat & Details Modal */}
      <AnimatePresence>
        {selectedSeller && (
          <SellerChatModal 
            seller={selectedSeller} 
            adminId={user?.id}
            onClose={() => setSelectedSeller(null)} 
            sendMessageMutation={sendMessageMutation}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SellerCard({ seller, setSelectedSeller, handleUpdateStatus, getStatusColor }) {
  const unreadCount = useQuery(api.sellers.getUnreadChatCount, { sellerId: seller._id, role: 'admin' }) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-violet-500/20 transition-colors flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {seller.storeName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{seller.storeName}</h3>
            <p className="text-xs text-muted">{seller.fullName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wider ${getStatusColor(seller.status)}`}>
          {seller.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-6 flex-grow">
        <div className="text-sm">
          <span className="text-muted block text-xs mb-0.5">Email</span>
          <span className="text-secondary">{seller.email}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted block text-xs mb-0.5">Phone</span>
          <span className="text-secondary">{seller.phone}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted block text-xs mb-0.5">Business</span>
          <span className="text-secondary line-clamp-2">{seller.businessDescription}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
        <button 
          onClick={() => setSelectedSeller(seller)}
          className="relative p-2 bg-violet-500/10 text-primary hover:bg-violet-500/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium px-3 mr-auto"
        >
          <MessageCircle className="w-4 h-4" /> Chat
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {seller.status === 'pending' && (
          <>
            <button 
              onClick={() => handleUpdateStatus(seller._id, 'approved', seller.clerkId)}
              className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors tooltip-trigger"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleUpdateStatus(seller._id, 'rejected', seller.clerkId)}
              className="p-2 bg-slate-500/10 text-muted hover:bg-slate-500/20 rounded-lg transition-colors tooltip-trigger"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        {seller.status === 'approved' && (
          <button 
            onClick={() => handleUpdateStatus(seller._id, 'suspended', seller.clerkId)}
            className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium px-3"
          >
            <Ban className="w-4 h-4" /> Suspend
          </button>
        )}
        {seller.status === 'suspended' && (
          <button 
            onClick={() => handleUpdateStatus(seller._id, 'approved', seller.clerkId)}
            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium px-3"
          >
            <Shield className="w-4 h-4" /> Re-Approve
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SellerChatModal({ seller: initialSeller, adminId, onClose, sendMessageMutation, handleUpdateStatus }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const liveSeller = useQuery(api.sellers.getSellerByClerkId, { clerkId: initialSeller.clerkId });
  const seller = liveSeller || initialSeller;
  const messages = useQuery(api.sellers.getMessages, { sellerId: seller._id });
  const toggleChatBlock = useMutation(api.sellers.toggleChatBlock);
  const markMessagesAsRead = useMutation(api.sellers.markMessagesAsRead);

  const handleToggleChatBlock = async () => {
    try {
      await toggleChatBlock({ id: seller._id, isChatBlocked: !seller.isChatBlocked });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read
    if (seller?._id && messages?.some(m => m.senderRole === 'applicant' && !m.isRead)) {
      markMessagesAsRead({ sellerId: seller._id, role: 'admin' });
    }
  }, [messages, seller?._id, markMessagesAsRead]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId) return;
    
    try {
      await sendMessageMutation({
        sellerId: seller._id,
        senderId: adminId,
        senderRole: 'admin',
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col md:flex-row h-[80vh] max-h-[800px] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-muted hover:text-foreground bg-black/50 rounded-full p-1 backdrop-blur-md">
          <XCircle className="w-6 h-6" />
        </button>

        {/* Left Side: Application Details */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border bg-card p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Application Info
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Store Name</label>
              <div className="text-foreground font-medium">{seller.storeName}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Applicant Name</label>
              <div className="text-secondary">{seller.fullName}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Email</label>
              <a href={`mailto:${seller.email}`} className="text-primary hover:text-primary-hover">{seller.email}</a>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Phone</label>
              <div className="text-secondary">{seller.phone}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Address</label>
              <div className="text-secondary text-sm">{seller.address}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Business Description</label>
              <div className="text-secondary text-sm whitespace-pre-wrap bg-card p-3 rounded-lg border border-border">{seller.businessDescription}</div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {seller.status !== 'approved' && (
                  <button onClick={() => handleUpdateStatus(seller._id, 'approved', seller.clerkId)} className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-emerald-500/20">
                    <Check className="w-4 h-4" /> Approve Application
                  </button>
                )}
                {seller.status !== 'rejected' && (
                  <button onClick={() => handleUpdateStatus(seller._id, 'rejected', seller.clerkId)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-red-500/20">
                    <X className="w-4 h-4" /> Reject Application
                  </button>
                )}
                {seller.status === 'approved' && (
                  <button onClick={() => handleUpdateStatus(seller._id, 'suspended', seller.clerkId)} className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-amber-500/20">
                    <Ban className="w-4 h-4" /> Suspend Seller
                  </button>
                )}
                <button onClick={handleToggleChatBlock} className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border ${seller.isChatBlocked ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 hover:bg-slate-500/20 text-muted border-slate-500/20'}`}>
                  <Ban className="w-4 h-4" /> {seller.isChatBlocked ? 'Unblock Chat' : 'Block Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full md:w-2/3 flex flex-col bg-background">
          <div className="p-4 border-b border-border bg-card flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chat with Applicant</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted text-sm text-center px-6">
                No messages yet. Send a message to ask for more details or clarify their application.
              </div>
            ) : (
              messages?.map((msg, i) => {
                const isMe = msg.senderRole === 'admin';
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMe ? 'bg-violet-600 text-foreground rounded-br-sm' : 'bg-slate-100 dark:bg-elevated text-foreground dark:text-slate-200 border border-border rounded-bl-sm'
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
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message to the applicant..."
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
