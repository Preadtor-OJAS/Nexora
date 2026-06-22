import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/orders(.*)',
  '/wishlist(.*)',
  '/dashboard(.*)',
]);

// Basic in-memory rate limiter for Edge (per-isolate, provides basic protection against rapid bots)
const rateLimitMap = new Map();
const RATE_LIMIT = 100; // max requests
const WINDOW_MS = 60 * 1000; // 1 minute window

export default clerkMiddleware(async (auth, req) => {
  // Rate Limiting Logic
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  const currentTime = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: currentTime + WINDOW_MS });
  } else {
    const data = rateLimitMap.get(ip);
    if (currentTime > data.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: currentTime + WINDOW_MS });
    } else {
      data.count++;
      if (data.count > RATE_LIMIT) {
        return new Response('Too Many Requests. Please slow down.', { status: 429 });
      }
    }
  }

  // Admin routes require auth (role check happens in page/layout)
  if (isAdminRoute(req) || isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
