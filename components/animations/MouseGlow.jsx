'use client';

import { useEffect, useRef } from 'react';

export default function MouseGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      glow.style.left = `${currentX}px`;
      glow.style.top = `${currentY}px`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0"
      style={{
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        transition: 'none',
        willChange: 'left, top',
      }}
    />
  );
}
