'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useMemo } from 'react';

// Always create a ConvexReactClient — if the URL is invalid/placeholder,
// Convex will just fail to connect silently (no queries run).
// This satisfies the hook contract so useQuery/useMutation always work.
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://example.convex.cloud';

// Use a valid-looking but non-existent URL as fallback so Convex doesn't crash
const safeUrl = CONVEX_URL.includes('placeholder') || !CONVEX_URL
  ? 'https://example.convex.cloud'
  : CONVEX_URL;

let client;
try {
  client = new ConvexReactClient(safeUrl);
} catch {
  client = new ConvexReactClient('https://example.convex.cloud');
}

export function ConvexClientProvider({ children }) {
  return (
    <ConvexProvider client={client}>
      {children}
    </ConvexProvider>
  );
}
