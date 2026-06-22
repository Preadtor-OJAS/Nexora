// Re-export Convex hooks.
// The ConvexClientProvider always wraps the app, so these are always safe to call.
// Data will be undefined (skeleton state) until you connect a real Convex deployment.
export { useQuery, useMutation } from 'convex/react';
