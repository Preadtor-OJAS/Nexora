'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';

export function SyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const getOrCreateCustomer = useMutation(api.customers.getOrCreateCustomer);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      getOrCreateCustomer({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || 'no-email@example.com',
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
        avatar: user.imageUrl,
      }).catch(console.error);
    }
  }, [isLoaded, isSignedIn, user, getOrCreateCustomer]);

  return null;
}
