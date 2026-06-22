import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const logEvent = mutation({
  args: {
    action: v.string(),
    targetId: v.optional(v.string()),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    let userId = undefined;
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        userId = identity.subject;
      }
    } catch (e) {
      // ignore
    }

    await ctx.db.insert('audit_logs', {
      action: args.action,
      userId,
      targetId: args.targetId,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const callerId = identity.subject;

    // Verify admin
    const caller = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', callerId))
      .first();
    
    if (!caller || caller.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required to view audit logs');
    }

    let q = ctx.db.query('audit_logs').order('desc');
    
    if (args.limit) {
       return await q.take(args.limit);
    }
    return await q.collect();
  },
});
