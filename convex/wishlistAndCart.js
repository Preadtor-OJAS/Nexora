import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get user's wishlist
export const getWishlist = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query('wishlist')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!wishlist) return { productIds: [], products: [] };

    const products = await Promise.all(
      wishlist.productIds.map((id) => ctx.db.get(id))
    );

    return {
      ...wishlist,
      products: products.filter(Boolean),
    };
  },
});

// Toggle wishlist item
export const toggleWishlistItem = mutation({
  args: { userId: v.string(), productId: v.id('products') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('wishlist')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert('wishlist', {
        userId: args.userId,
        productIds: [args.productId],
        updatedAt: Date.now(),
      });
      return { added: true };
    }

    const isInWishlist = existing.productIds.includes(args.productId);
    const newProductIds = isInWishlist
      ? existing.productIds.filter((id) => id !== args.productId)
      : [...existing.productIds, args.productId];

    await ctx.db.patch(existing._id, {
      productIds: newProductIds,
      updatedAt: Date.now(),
    });

    return { added: !isInWishlist };
  },
});

// Check if product is in wishlist
export const isInWishlist = query({
  args: { userId: v.string(), productId: v.id('products') },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query('wishlist')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!wishlist) return false;
    return wishlist.productIds.includes(args.productId);
  },
});

// === CART ===
export const getCart = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!cart) return { items: [], total: 0 };

    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    const total = itemsWithProducts.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    return {
      ...cart,
      items: itemsWithProducts.filter((item) => item.product),
      total,
    };
  },
});

export const addToCart = mutation({
  args: {
    userId: v.string(),
    productId: v.id('products'),
    quantity: v.number(),
    selectedColor: v.optional(v.string()),
    selectedSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('cart')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert('cart', {
        userId: args.userId,
        items: [{
          productId: args.productId,
          quantity: args.quantity,
          selectedColor: args.selectedColor,
          selectedSize: args.selectedSize,
          addedAt: Date.now(),
        }],
        updatedAt: Date.now(),
      });
      return;
    }

    const existingItemIndex = existing.items.findIndex(
      (item) =>
        item.productId === args.productId &&
        item.selectedColor === args.selectedColor &&
        item.selectedSize === args.selectedSize
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = existing.items.map((item, i) =>
        i === existingItemIndex
          ? { ...item, quantity: item.quantity + args.quantity }
          : item
      );
    } else {
      newItems = [
        ...existing.items,
        {
          productId: args.productId,
          quantity: args.quantity,
          selectedColor: args.selectedColor,
          selectedSize: args.selectedSize,
          addedAt: Date.now(),
        },
      ];
    }

    await ctx.db.patch(existing._id, { items: newItems, updatedAt: Date.now() });
  },
});

export const updateCartItem = mutation({
  args: {
    userId: v.string(),
    productId: v.id('products'),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!cart) return;

    const newItems =
      args.quantity === 0
        ? cart.items.filter((item) => item.productId !== args.productId)
        : cart.items.map((item) =>
            item.productId === args.productId
              ? { ...item, quantity: args.quantity }
              : item
          );

    await ctx.db.patch(cart._id, { items: newItems, updatedAt: Date.now() });
  },
});

export const clearCart = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (cart) {
      await ctx.db.patch(cart._id, { items: [], updatedAt: Date.now() });
    }
  },
});
