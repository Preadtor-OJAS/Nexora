import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Products table
  products: defineTable({
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
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    brand: v.optional(v.string()),
    sku: v.optional(v.string()),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    })),
    colors: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
    sellerId: v.optional(v.string()), // Added for multi-vendor
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_category', ['category'])
    .index('by_slug', ['slug'])
    .index('by_featured', ['isFeatured'])
    .index('by_active', ['isActive'])
    .searchIndex('search_products', {
      searchField: 'name',
      filterFields: ['category', 'isActive'],
    })
    .index('by_seller', ['sellerId']),

  // Orders table
  orders: defineTable({
    userId: v.string(),
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
    sellerId: v.optional(v.string()), // Added for multi-vendor split orders
    status: v.string(), // pending | confirmed | processing | shipped | delivered | cancelled | rejected
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
    paymentStatus: v.optional(v.string()),
    trackingId: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_order_number', ['orderNumber'])
    .index('by_created', ['createdAt'])
    .index('by_seller', ['sellerId']),

  // Customers table
  customers: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatar: v.optional(v.string()),
    role: v.string(), // customer | admin
    phone: v.optional(v.string()),
    addresses: v.optional(v.array(v.object({
      id: v.string(),
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
    }))),
    totalOrders: v.optional(v.number()),
    totalSpent: v.optional(v.number()),
    isBlocked: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  // Wishlist table
  wishlist: defineTable({
    userId: v.string(),
    productIds: v.array(v.id('products')),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Cart table
  cart: defineTable({
    userId: v.string(),
    items: v.array(v.object({
      productId: v.id('products'),
      quantity: v.number(),
      selectedColor: v.optional(v.string()),
      selectedSize: v.optional(v.string()),
      addedAt: v.number(),
    })),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Reviews table
  reviews: defineTable({
    productId: v.id('products'),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    rating: v.number(),
    title: v.optional(v.string()),
    comment: v.string(),
    isVerified: v.optional(v.boolean()),
    helpfulCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_product', ['productId'])
    .index('by_user', ['userId']),

  // Categories table
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parentId: v.optional(v.id('categories')),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_parent', ['parentId']),

  // Analytics events table
  analytics: defineTable({
    event: v.string(), // page_view | product_view | add_to_cart | purchase | search
    userId: v.optional(v.string()),
    productId: v.optional(v.id('products')),
    orderId: v.optional(v.id('orders')),
    data: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index('by_event', ['event'])
    .index('by_timestamp', ['timestamp'])
    .index('by_user', ['userId']),

  // Sellers table (Multi-Vendor)
  sellers: defineTable({
    clerkId: v.string(),
    fullName: v.string(),
    storeName: v.string(),
    email: v.string(),
    phone: v.string(),
    businessDescription: v.string(),
    address: v.string(),
    storeLogo: v.optional(v.string()),
    status: v.string(), // pending | approved | suspended | rejected
    isChatBlocked: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_status', ['status']),

  // Seller Messages table (Multi-Vendor Communication)
  seller_messages: defineTable({
    sellerId: v.id('sellers'),
    senderId: v.string(), // clerkId
    senderRole: v.string(), // 'applicant' | 'admin'
    message: v.string(),
    isRead: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index('by_seller', ['sellerId']),
  // Notifications table
  notifications: defineTable({
    userId: v.string(), // clerkId (can be customer, seller, or 'admin')
    title: v.string(),
    message: v.string(),
    type: v.string(), // 'system', 'order', 'message', 'application'
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_unread', ['userId', 'isRead']),

  // Order Messages table (Customer <-> Seller communication)
  order_messages: defineTable({
    orderId: v.id('orders'),
    senderId: v.string(), // clerkId
    senderRole: v.string(), // 'customer' | 'seller' | 'admin'
    message: v.string(),
    createdAt: v.number(),
  })
    .index('by_order', ['orderId']),
});
