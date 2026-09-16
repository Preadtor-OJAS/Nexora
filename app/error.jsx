'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass-card max-w-md w-full p-8 text-center border border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong!</h1>
        
        <p className="text-muted text-sm mb-8">
          {error.message?.includes('Invalid ID') || error.message?.includes('Argument validation error')
            ? "The item you're looking for doesn't exist in this environment's database."
            : "An unexpected error occurred while loading this page."}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()} 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <a 
            href="/" 
            className="btn-ghost w-full py-3 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
