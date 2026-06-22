import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getUserNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
    return notifications;
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_unread', (q) => q.eq('userId', args.userId).eq('isRead', false))
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_unread', (q) => q.eq('userId', args.userId).eq('isRead', false))
      .collect();
    
    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { isRead: true }))
    );
  },
});
