import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get or create customer profile
export const getOrCreateCustomer = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    const existing = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    const isAdmin = args.email.toLowerCase() === 'arnavkhnr@gmail.com';
    const role = isAdmin ? 'admin' : 'customer';

    if (existing) {
      const updates = {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        avatar: args.avatar,
        updatedAt: Date.now(),
      };
      
      // Ensure superadmin always has the admin role
      if (isAdmin && existing.role !== 'admin') {
        updates.role = 'admin';
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert('customers', {
      ...args,
      clerkId,
      role,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: Date.now(),
    });
  },
});

// Get customer by clerk ID
export const getCustomerByClerkId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const clerkId = identity.subject;

    return await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();
  },
});

// Get all customers (admin)
export const getAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('customers').order('desc').collect();
  },
});

// Update customer role (admin)
export const updateCustomerRole = mutation({
  args: { id: v.id('customers'), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role, updatedAt: Date.now() });
  },
});

// Block/Unblock customer (admin)
export const toggleCustomerBlock = mutation({
  args: { id: v.id('customers'), isBlocked: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isBlocked: args.isBlocked, updatedAt: Date.now() });
  },
});

// Get customer analytics
export const getCustomerAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query('customers').collect();
    const now = new Date();

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    const newThisMonth = customers.filter((c) => c.createdAt >= thisMonth.getTime()).length;
    const newLastMonth = customers.filter(
      (c) => c.createdAt >= lastMonth.getTime() && c.createdAt < thisMonth.getTime()
    ).length;

    // Growth by month for last 6 months
    const growthChart = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        customers: customers.filter(
          (c) => c.createdAt >= date.getTime() && c.createdAt < nextMonth.getTime()
        ).length,
      };
    });

    return {
      total: customers.length,
      newThisMonth,
      newLastMonth,
      growthRate: newLastMonth > 0
        ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
        : 100,
      growthChart,
      admins: customers.filter((c) => c.role === 'admin').length,
    };
  },
});

// Add an address for a customer
export const addAddress = mutation({
  args: {
    address: v.object({
      label: v.string(),
      fullName: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.string(),
      isDefault: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    if (!customer) throw new Error('Customer not found');

    const newAddress = {
      ...args.address,
      id: crypto.randomUUID(),
    };

    let addresses = customer.addresses || [];

    // Check for duplicates
    const isDuplicate = addresses.some((a) => 
      a.addressLine1.trim().toLowerCase() === args.address.addressLine1.trim().toLowerCase() &&
      a.city.trim().toLowerCase() === args.address.city.trim().toLowerCase() &&
      a.zipCode.trim().toLowerCase() === args.address.zipCode.trim().toLowerCase() &&
      a.country.trim().toLowerCase() === args.address.country.trim().toLowerCase()
    );

    if (isDuplicate) {
      throw new Error('This exact address is already saved in your profile.');
    }

    // If it's the first address, or the user requested it to be default, make it default
    if (addresses.length === 0 || args.address.isDefault) {
      newAddress.isDefault = true;
      // Remove default from others
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    } else {
      newAddress.isDefault = false;
    }

    addresses.push(newAddress);

    await ctx.db.patch(customer._id, { addresses, updatedAt: Date.now() });
    return newAddress.id;
  },
});

// Update an address
export const updateAddress = mutation({
  args: {
    addressId: v.string(),
    address: v.object({
      label: v.string(),
      fullName: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    if (!customer) throw new Error('Customer not found');

    const addresses = customer.addresses || [];
    const index = addresses.findIndex((a) => a.id === args.addressId);
    
    if (index === -1) throw new Error('Address not found');

    addresses[index] = { ...addresses[index], ...args.address };

    await ctx.db.patch(customer._id, { addresses, updatedAt: Date.now() });
  },
});

// Delete an address
export const deleteAddress = mutation({
  args: {
    addressId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    if (!customer) throw new Error('Customer not found');

    let addresses = customer.addresses || [];
    const index = addresses.findIndex((a) => a.id === args.addressId);
    
    if (index === -1) return;

    const wasDefault = addresses[index].isDefault;
    addresses.splice(index, 1);

    // If we deleted the default address, make the first remaining one default
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    await ctx.db.patch(customer._id, { addresses, updatedAt: Date.now() });
  },
});

// Set default address
export const setDefaultAddress = mutation({
  args: {
    addressId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const clerkId = identity.subject;

    const customer = await ctx.db
      .query('customers')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first();

    if (!customer) throw new Error('Customer not found');

    let addresses = customer.addresses || [];
    
    addresses = addresses.map((a) => ({
      ...a,
      isDefault: a.id === args.addressId,
    }));

    await ctx.db.patch(customer._id, { addresses, updatedAt: Date.now() });
  },
});
