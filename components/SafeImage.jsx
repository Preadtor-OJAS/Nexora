'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

export default function SafeImage({ src, alt = '', fill = false, width, height, className = '', sizes }) {
  const [imgError, setImgError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (!src || imgError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-500/5 text-muted gap-2 min-h-12 ${className}`}>
        <Package className="w-8 h-8 stroke-[1.5] opacity-60" />
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">No Image</span>
      </div>
    );
  }

  // 1. Check if relative local path
  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        onError={() => setImgError(true)}
      />
    );
  }

  // 2. Check if absolute URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const url = new URL(src);
      const hostname = url.hostname;
      
      // Next.js allowed remote hostnames (from next.config.mjs)
      const allowedHosts = ['images.unsplash.com', 'img.clerk.com', 'uploadthing.com'];
      const isNextImageAllowed = allowedHosts.some(host => hostname === host || hostname.endsWith('.' + host)) || hostname.endsWith('.convex.cloud');

      if (isNextImageAllowed) {
        return (
          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            className={className}
            sizes={sizes}
            onError={() => setImgError(true)}
          />
        );
      } else {
        // Use standard img tag for non-configured hostnames to avoid Next.js build/runtime crashes
        const style = fill ? { position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0 } : {};
        return (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            onError={() => setImgError(true)}
          />
        );
      }
    } catch (e) {
      // Invalid URL format (e.g. throws error in new URL())
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-500/5 text-muted gap-2 min-h-12 ${className}`}>
          <Package className="w-8 h-8 stroke-[1.5] opacity-60" />
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">No Image</span>
        </div>
      );
    }
  }

  // 3. Inline data URI
  if (src.startsWith('data:')) {
    const style = fill ? { position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0 } : {};
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback for completely invalid string (e.g., "22")
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-500/5 text-muted gap-2 min-h-12 ${className}`}>
      <Package className="w-8 h-8 stroke-[1.5] opacity-60" />
      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">No Image</span>
    </div>
  );
}
