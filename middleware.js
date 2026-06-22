import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/orders(.*)',
  '/wishlist(.*)',
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
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
