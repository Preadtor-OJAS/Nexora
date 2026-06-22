import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get all products (with optional filters)
export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.search) {
      products = await ctx.db
        .query('products')
        .withSearchIndex('search_products', (q) =>
          q.search('name', args.search).eq('isActive', true)
        )
        .collect();
    } else if (args.category) {
      products = await ctx.db
        .query('products')
        .withIndex('by_category', (q) => q.eq('category', args.category))
        .collect();
      products = products.filter((p) => p.isActive !== false);
    } else if (args.featured) {
      products = await ctx.db
        .query('products')
        .withIndex('by_featured', (q) => q.eq('isFeatured', true))
        .collect();
      products = products.filter((p) => p.isActive !== false);
    } else {
      products = await ctx.db
        .query('products')
        .withIndex('by_active', (q) => q.eq('isActive', true))
        .collect();
    }

    // Sort
    if (args.sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (args.sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (args.sortBy === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (args.sortBy === 'newest') {
      products.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      products.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (args.limit) {
      products = products.slice(0, args.limit);
    }

    return products;
  },
});

// Get single product by ID
export const getProduct = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get product by slug
export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
  },
});

// Get all products (admin)
export const getAllProductsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').order('desc').collect();
  },
});

// Get products by seller (seller dashboard)
export const getProductsBySeller = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const sellerId = identity.subject;

    return await ctx.db
      .query('products')
      .withIndex('by_seller', (q) => q.eq('sellerId', sellerId))
      .order('desc')
      .collect();
  },
});

// Create product
export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    comparePrice: v.optional(v.number()),
    images: v.array(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    tags: v.array(v.string()),
    stock: v.number(),
    lowStockThreshold: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    brand: v.optional(v.string()),
    sku: v.optional(v.string()),
    colors: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
    sellerId: v.optional(v.string()), // Added for multi-vendor
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert('products', {
      ...args,
      rating: 0,
      reviewCount: 0,
      createdAt: Date.now(),
      isActive: args.isActive ?? true,
    });
    return productId;
  },
});

// Update product
export const updateProduct = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    price: v.optional(v.number()),
    comparePrice: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    brand: v.optional(v.string()),
    colors: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
    sellerId: v.optional(v.string()), // for authorization
  },
  handler: async (ctx, args) => {
    const { id, sellerId, ...updates } = args;
    
    // Authorization check
    if (sellerId) {
      const product = await ctx.db.get(id);
      if (product && product.sellerId && product.sellerId !== sellerId) {
        throw new Error('Forbidden: You can only edit your own products.');
      }
    }

    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// Delete product
export const deleteProduct = mutation({
  args: { 
    id: v.id('products'),
    sellerId: v.optional(v.string()), // for authorization
  },
  handler: async (ctx, args) => {
    // Authorization check
    if (args.sellerId) {
      const product = await ctx.db.get(args.id);
      if (product && product.sellerId && product.sellerId !== args.sellerId) {
        throw new Error('Forbidden: You can only delete your own products.');
      }
    }
    
    await ctx.db.delete(args.id);
  },
});

// Toggle product active status
export const toggleProductActive = mutation({
  args: { id: v.id('products'), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive, updatedAt: Date.now() });
  },
});

// Seed sample products
export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleProducts = [
      {
        name: 'Nexora Pro Headphones',
        slug: 'nexora-pro-headphones',
        description: 'Premium noise-cancelling headphones with 40-hour battery life, adaptive sound control, and crystal-clear audio. Features multi-device pairing and foldable design for travel.',
        shortDescription: 'Premium ANC headphones with 40hr battery',
        price: 349,
        comparePrice: 499,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=800',
        ],
        category: 'electronics',
        tags: ['headphones', 'audio', 'wireless', 'noise-cancelling'],
        stock: 45,
        lowStockThreshold: 10,
        isFeatured: true,
        isActive: true,
        brand: 'Nexora Audio',
        rating: 4.8,
        reviewCount: 234,
        colors: ['#1a1a2e', '#ffffff', '#7C3AED'],
        createdAt: Date.now() - 1000000,
      },
      {
        name: 'Quantum X Smartwatch',
        slug: 'quantum-x-smartwatch',
        description: 'Next-generation smartwatch with health monitoring, GPS, 5-day battery, and stunning AMOLED display. Track your fitness goals with AI-powered insights.',
        shortDescription: 'AI-powered smartwatch with AMOLED display',
        price: 299,
        comparePrice: 399,
        images: [
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        ],
        category: 'electronics',
        tags: ['smartwatch', 'fitness', 'health', 'wearable'],
        stock: 23,
        lowStockThreshold: 5,
        isFeatured: true,
        isActive: true,
        brand: 'Quantum',
        rating: 4.7,
        reviewCount: 187,
        colors: ['#000000', '#silver', '#rose-gold'],
        createdAt: Date.now() - 900000,
      },
      {
        name: 'Aura Silk Dress',
        slug: 'aura-silk-dress',
        description: 'Luxurious silk blend dress with elegant draping. Perfect for formal occasions and evenings out. Available in multiple sizes.',
        shortDescription: 'Premium silk blend evening dress',
        price: 189,
        comparePrice: 280,
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
          'https://images.unsplash.com/photo-1566479179817-d12a9f4d1b5b?w=800',
        ],
        category: 'fashion',
        tags: ['dress', 'silk', 'formal', 'luxury'],
        stock: 67,
        lowStockThreshold: 15,
        isFeatured: true,
        isActive: true,
        brand: 'Aura Fashion',
        rating: 4.9,
        reviewCount: 312,
        colors: ['#1a1a2e', '#f4c2c2', '#2d5016'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        createdAt: Date.now() - 800000,
      },
      {
        name: 'Minimal Desk Lamp',
        slug: 'minimal-desk-lamp',
        description: 'Architectural desk lamp with adjustable color temperature and brightness. USB-C charging port built-in. Perfect for work and study.',
        shortDescription: 'Smart desk lamp with USB-C charging',
        price: 89,
        comparePrice: 129,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        ],
        category: 'home',
        tags: ['lamp', 'desk', 'minimalist', 'smart'],
        stock: 8,
        lowStockThreshold: 5,
        isFeatured: false,
        isActive: true,
        brand: 'Luminos',
        rating: 4.6,
        reviewCount: 89,
        colors: ['#ffffff', '#000000', '#c0c0c0'],
        createdAt: Date.now() - 700000,
      },
      {
        name: 'Velocity Running Shoes',
        slug: 'velocity-running-shoes',
        description: 'Professional running shoes with carbon fiber plate and advanced foam cushioning. Designed for speed and comfort over long distances.',
        shortDescription: 'Carbon plate running shoes for performance',
        price: 239,
        comparePrice: 320,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        ],
        category: 'sports',
        tags: ['running', 'shoes', 'carbon', 'performance'],
        stock: 34,
        lowStockThreshold: 8,
        isFeatured: true,
        isActive: true,
        brand: 'Velocity',
        rating: 4.8,
        reviewCount: 456,
        colors: ['#ff6b35', '#1a1a2e', '#ffffff'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        createdAt: Date.now() - 600000,
      },
      {
        name: 'Aurora Wireless Speaker',
        slug: 'aurora-wireless-speaker',
        description: '360° immersive audio with spatial sound technology. Waterproof design with 24-hour battery and party sync for multi-speaker setups.',
        shortDescription: '360° spatial audio waterproof speaker',
        price: 179,
        comparePrice: 249,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
        ],
        category: 'electronics',
        tags: ['speaker', 'wireless', 'waterproof', 'audio'],
        stock: 56,
        lowStockThreshold: 12,
        isFeatured: true,
        isActive: true,
        brand: 'Nexora Audio',
        rating: 4.7,
        reviewCount: 203,
        colors: ['#7C3AED', '#000000', '#ffffff'],
        createdAt: Date.now() - 500000,
      },
      {
        name: 'Zen Meditation Cushion Set',
        slug: 'zen-meditation-cushion-set',
        description: 'Premium buckwheat-filled meditation cushion with removable organic cotton cover. Includes yoga mat and guide booklet.',
        shortDescription: 'Premium buckwheat meditation cushion set',
        price: 79,
        comparePrice: 110,
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
        ],
        category: 'sports',
        tags: ['meditation', 'yoga', 'wellness', 'cushion'],
        stock: 3,
        lowStockThreshold: 5,
        isFeatured: false,
        isActive: true,
        brand: 'Zen Studio',
        rating: 4.9,
        reviewCount: 127,
        colors: ['#2d5016', '#8b4513', '#4a4a6a'],
        createdAt: Date.now() - 400000,
      },
      {
        name: 'Lumière Face Serum',
        slug: 'lumiere-face-serum',
        description: 'Advanced vitamin C + retinol serum for radiant, youthful skin. Dermatologist-tested formula with hyaluronic acid and niacinamide.',
        shortDescription: 'Advanced Vitamin C + Retinol serum',
        price: 68,
        comparePrice: 95,
        images: [
          'https://images.unsplash.com/photo-1617897903246-719242758050?w=800',
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
        ],
        category: 'beauty',
        tags: ['skincare', 'serum', 'vitamin-c', 'anti-aging'],
        stock: 89,
        lowStockThreshold: 20,
        isFeatured: true,
        isActive: true,
        brand: 'Lumière Beauty',
        rating: 4.8,
        reviewCount: 534,
        createdAt: Date.now() - 300000,
      },
    ];

    for (const product of sampleProducts) {
      await ctx.db.insert('products', product);
    }

    return { success: true, count: sampleProducts.length };
  },
});

// Get pending products count (inactive)
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query('products')
      .withIndex('by_active', (q) => q.eq('isActive', false))
      .collect();
    return pending.length;
  },
});
