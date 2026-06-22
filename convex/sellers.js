import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Apply to become a seller
export const apply = mutation({
  args: {
    fullName: v.string(),
    storeName: v.string(),
    email: v.string(),
    phone: v.string(),
    businessDescription: v.string(),
    address: v.string(),
    storeLogo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    // Check if already applied
    const existing = await ctx.db
      .query('sellers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    if (existing) {
      if (existing.status === 'rejected') {
        // Re-apply by updating the existing record
        await ctx.db.patch(existing._id, {
          ...args,
          status: 'pending',
          updatedAt: Date.now(),
        });
        return existing._id;
      }
      throw new Error('You have already applied to become a seller.');
    }

    const sellerId = await ctx.db.insert('sellers', {
      ...args,
      clerkId,
      status: 'pending',
      createdAt: Date.now(),
    });

    return sellerId;
  },
});

// Get seller profile by clerkId
export const getSellerByClerkId = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const callerId = identity.subject;

    let targetId = callerId;
    if (args.clerkId && args.clerkId !== callerId) {
      const caller = await ctx.db
        .query('customers')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', callerId))
        .first();
      if (!caller || caller.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      targetId = args.clerkId;
    }

    return await ctx.db
      .query('sellers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', targetId))
      .first();
  },
});

// Admin: Get all sellers
export const getAllSellers = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('sellers')
        .withIndex('by_status', (q) => q.eq('status', args.status))
        .order('desc')
        .collect();
    }
    return await ctx.db.query('sellers').order('desc').collect();
  },
});

// Admin: Update seller status
export const updateSellerStatus = mutation({
  args: {
    id: v.id('sellers'),
    status: v.string(), // approved | suspended | rejected
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // If approved, update customer role to 'seller'
    if (args.status === 'approved') {
      const customer = await ctx.db
        .query('customers')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .first();
      
      if (customer) {
        await ctx.db.patch(customer._id, { role: 'seller', updatedAt: Date.now() });
      }
    } else if (args.status === 'suspended' || args.status === 'rejected') {
       const customer = await ctx.db
        .query('customers')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .first();
      
      if (customer && customer.role === 'seller') {
        await ctx.db.patch(customer._id, { role: 'customer', updatedAt: Date.now() });
      }
    }

    // Insert Notification for Seller
    let title = '';
    let message = '';
    if (args.status === 'approved') {
      title = 'Application Approved! 🎉';
      message = 'Congratulations! Your seller application has been approved. You can now access the Seller Dashboard.';
    } else if (args.status === 'rejected') {
      title = 'Application Update';
      message = 'Your seller application has been rejected. Please contact support for more details.';
    } else if (args.status === 'suspended') {
      title = 'Account Suspended';
      message = 'Your seller account has been suspended. Please contact support immediately.';
    }

    if (title) {
      await ctx.db.insert('notifications', {
        userId: args.clerkId,
        title,
        message,
        type: 'application',
        link: '/seller-dashboard',
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

// Send a message regarding a seller application
export const sendMessage = mutation({
  args: {
    sellerId: v.id('sellers'),
    senderId: v.string(),
    senderRole: v.string(), // 'applicant' | 'admin'
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('seller_messages', {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
    // Update the seller's updatedAt to push it up in lists
    await ctx.db.patch(args.sellerId, { updatedAt: Date.now() });
  },
});

// Get messages for a seller application
export const getMessages = query({
  args: { sellerId: v.id('sellers') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('seller_messages')
      .withIndex('by_seller', (q) => q.eq('sellerId', args.sellerId))
      .order('asc')
      .collect();
  },
});

// Get pending sellers count
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query('sellers')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect();
    return pending.length;
  },
});

// Admin: Toggle chat block for a seller
export const toggleChatBlock = mutation({
  args: {
    id: v.id('sellers'),
    isChatBlocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isChatBlocked: args.isChatBlocked,
      updatedAt: Date.now(),
    });
  },
});

// Get unread messages count
export const getUnreadChatCount = query({
  args: {
    sellerId: v.optional(v.id('sellers')),
    role: v.string(), // 'admin' or 'applicant'
  },
  handler: async (ctx, args) => {
    // If admin is asking, and no specific sellerId, get all unread from ANY seller
    if (args.role === 'admin' && !args.sellerId) {
      const messages = await ctx.db
        .query('seller_messages')
        .filter((q) => q.and(q.eq(q.field('isRead'), false), q.eq(q.field('senderRole'), 'applicant')))
        .collect();
      return messages.length;
    }
    
    // Otherwise get for a specific seller
    if (!args.sellerId) return 0;
    
    const messages = await ctx.db
      .query('seller_messages')
      .withIndex('by_seller', (q) => q.eq('sellerId', args.sellerId))
      .filter((q) => q.and(q.eq(q.field('isRead'), false), q.neq(q.field('senderRole'), args.role)))
      .collect();
    
    return messages.length;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    sellerId: v.id('sellers'),
    role: v.string(), // 'admin' or 'applicant'
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('seller_messages')
      .withIndex('by_seller', (q) => q.eq('sellerId', args.sellerId))
      .filter((q) => q.and(q.eq(q.field('isRead'), false), q.neq(q.field('senderRole'), args.role)))
      .collect();
      
    for (const msg of messages) {
      await ctx.db.patch(msg._id, { isRead: true });
    }
  },
});
