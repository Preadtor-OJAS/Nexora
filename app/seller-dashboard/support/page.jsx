'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MessageCircle, Send, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function SellerSupportPage() {
  const { user, isLoaded } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessageMutation = useMutation(api.sellers.sendMessage);
  const markMessagesAsRead = useMutation(api.sellers.markMessagesAsRead);

  const sellerProfile = useQuery(
    api.sellers.getSellerByClerkId,
    user?.id ? { clerkId: user.id } : 'skip'
  );

  const messages = useQuery(
    api.sellers.getMessages,
    sellerProfile?._id ? { sellerId: sellerProfile._id } : 'skip'
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read
    if (sellerProfile?._id && messages?.some(m => m.senderRole === 'admin' && !m.isRead)) {
      markMessagesAsRead({ sellerId: sellerProfile._id, role: 'applicant' });
    }
  }, [messages, sellerProfile?._id, markMessagesAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sellerProfile || !user) return;
    
    try {
      await sendMessageMutation({
        sellerId: sellerProfile._id,
        senderId: user.id,
        senderRole: 'applicant', // the schema expects 'applicant' for seller's messages
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isLoaded || sellerProfile === undefined) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Support Chat</h1>
        <p className="text-sm text-muted">Communicate directly with the Super Admin</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-xl"
      >
        <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Message Admin</h3>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted text-sm text-center">
              Send a message to the Super Admin regarding your store or products.
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
            <div className="text-center py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
              <ShieldAlert className="w-4 h-4" /> Your chat has been blocked by the administrator.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
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
          )}
        </div>
      </motion.div>
    </div>
  );
}
