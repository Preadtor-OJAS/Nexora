import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getOrderMessages = query({
  args: { orderId: v.id('orders') },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('order_messages')
      .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
      .order('asc')
      .collect();
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    orderId: v.id('orders'),
    senderId: v.string(),
    senderRole: v.string(), // 'customer' | 'seller' | 'admin'
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('order_messages', {
      orderId: args.orderId,
      senderId: args.senderId,
      senderRole: args.senderRole,
      message: args.message,
      createdAt: Date.now(),
    });

    // Automatically trigger notification to the other party
    const order = await ctx.db.get(args.orderId);
    if (!order) return messageId;

    let recipientId = null;
    let title = '';
    let notifMessage = '';
    let link = '';

    if (args.senderRole === 'customer') {
      // Send to seller
      if (order.sellerId) {
        const seller = await ctx.db.get(order.sellerId);
        if (seller) {
          recipientId = seller.clerkId;
          title = `New message on order ${order.orderNumber}`;
          notifMessage = `Customer: ${args.message.substring(0, 50)}...`;
          link = `/seller-dashboard/orders`; 
        }
      }
    } else {
      // Send to customer
      recipientId = order.userId;
      title = `New message on order ${order.orderNumber}`;
      notifMessage = `Seller: ${args.message.substring(0, 50)}...`;
      link = `/orders/${order._id}`;
    }

    if (recipientId) {
      await ctx.db.insert('notifications', {
        userId: recipientId,
        title,
        message: notifMessage,
        type: 'message',
        link,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return messageId;
  },
});
