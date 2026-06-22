import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get orders for a user
export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const userId = identity.subject;

    const orders = await ctx.db
      .query('orders')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
    return orders;
  },
});

// Get all orders (admin)
export const getAllOrders = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders;
    if (args.status) {
      orders = await ctx.db
        .query('orders')
        .withIndex('by_status', (q) => q.eq('status', args.status))
        .order('desc')
        .collect();
    } else {
      orders = await ctx.db.query('orders').order('desc').collect();
    }

    if (args.limit) {
      orders = orders.slice(0, args.limit);
    }

    return orders;
  },
});

// Get orders by seller
export const getOrdersBySeller = query({
  args: { 
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const sellerId = identity.subject;

    let q = ctx.db
      .query('orders')
      .withIndex('by_seller', (q) => q.eq('sellerId', sellerId));

    const orders = await q.order('desc').collect();
    
    if (args.status) {
      return orders.filter(o => o.status === args.status);
    }
    return orders;
  },
});

// Get single order
export const getOrder = query({
  args: { id: v.id('orders') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get order by order number
export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('orders')
      .withIndex('by_order_number', (q) => q.eq('orderNumber', args.orderNumber))
      .first();
  },
});

// Create order
export const createOrder = mutation({
  args: {
    orderNumber: v.string(),
    items: v.array(v.object({
      productId: v.id('products'),
      name: v.string(),
      image: v.string(),
      price: v.number(),
      quantity: v.number(),
      selectedColor: v.optional(v.string()),
      selectedSize: v.optional(v.string()),
    })),
    subtotal: v.number(),
    tax: v.number(),
    shipping: v.number(),
    total: v.number(),
    shippingAddress: v.object({
      fullName: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.string(),
    }),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
    sellerId: v.optional(v.string()), // Added for multi-vendor
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const userId = identity.subject;

    // Deduct stock for each item
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await ctx.db.patch(item.productId, { stock: newStock, updatedAt: Date.now() });
      }
    }

    const orderId = await ctx.db.insert('orders', {
      ...args,
      userId,
      status: 'pending',
      paymentStatus: 'paid',
      createdAt: Date.now(),
    });

    // Update customer stats
    const customer = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
      .first();

    if (customer) {
      await ctx.db.patch(customer._id, {
        totalOrders: (customer.totalOrders || 0) + 1,
        totalSpent: (customer.totalSpent || 0) + args.total,
        updatedAt: Date.now(),
      });
    }

    return orderId;
  },
});

// Update order status (admin)
export const updateOrderStatus = mutation({
  args: {
    id: v.id('orders'),
    status: v.string(),
    trackingId: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
    sellerId: v.optional(v.string()), // for authorization
  },
  handler: async (ctx, args) => {
    const { id, sellerId, ...updates } = args;

    // Authorization check
    if (sellerId) {
      const order = await ctx.db.get(id);
      if (order && order.sellerId && order.sellerId !== sellerId) {
        throw new Error('Forbidden: You can only update your own orders.');
      }
    }

    const patch = { ...updates, updatedAt: Date.now() };

    if (args.status === 'delivered') {
      patch.deliveredAt = Date.now();
    }

    await ctx.db.patch(id, patch);
  },
});

// Cancel order (customer)
export const cancelOrder = mutation({
  args: { id: v.id('orders'), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error('Order not found');

    // Restore stock
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.id, {
      status: 'cancelled',
      notes: args.reason,
      updatedAt: Date.now(),
    });
  },
});

// Get analytics data
export const getOrderAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db.query('orders').collect();
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const ordersToday = allOrders.filter((o) => o.createdAt >= today.getTime());
    const ordersThisMonth = allOrders.filter((o) => o.createdAt >= thisMonth.getTime());
    const completedOrders = allOrders.filter((o) => o.status === 'delivered');

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueToday = ordersToday
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    const revenueThisMonth = ordersThisMonth
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.total, 0);

    // Revenue by day for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueChart = last30Days.map((date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOrders = allOrders.filter(
        (o) =>
          o.createdAt >= date.getTime() &&
          o.createdAt < nextDate.getTime() &&
          o.status !== 'cancelled' &&
          o.status !== 'rejected'
      );
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      };
    });

    return {
      totalRevenue,
      revenueToday,
      revenueThisMonth,
      ordersToday: ordersToday.length,
      ordersThisMonth: ordersThisMonth.length,
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
      revenueChart,
    };
  },
});

// Get analytics data for a specific seller
export const getOrderAnalyticsBySeller = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const sellerId = identity.subject;

    const allOrders = await ctx.db
      .query('orders')
      .withIndex('by_seller', (q) => q.eq('sellerId', sellerId))
      .collect();
      
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const ordersToday = allOrders.filter((o) => o.createdAt >= today.getTime());
    const ordersThisMonth = allOrders.filter((o) => o.createdAt >= thisMonth.getTime());
    const completedOrders = allOrders.filter((o) => o.status === 'delivered');

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueToday = ordersToday
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    const revenueThisMonth = ordersThisMonth
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.total, 0);

    // Revenue by day for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueChart = last30Days.map((date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOrders = allOrders.filter(
        (o) =>
          o.createdAt >= date.getTime() &&
          o.createdAt < nextDate.getTime() &&
          o.status !== 'cancelled' &&
          o.status !== 'rejected'
      );
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      };
    });

    return {
      totalRevenue,
      revenueToday,
      revenueThisMonth,
      ordersToday: ordersToday.length,
      ordersThisMonth: ordersThisMonth.length,
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
      revenueChart,
    };
  },
});
