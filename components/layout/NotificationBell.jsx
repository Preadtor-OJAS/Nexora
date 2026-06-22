'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Bell, Check, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationBell() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user ? { userId: user.id } : 'skip'
  );

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    user ? { userId: user.id } : 'skip'
  ) || 0;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded || !user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        whileHover="hover"
        onClick={() => setIsOpen(!isOpen)}
        className="group w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground relative hover:bg-violet-500/10 dark:hover:bg-white/5 transition-colors"
      >
        <motion.div
          variants={{ hover: { rotate: [0, -15, 15, -15, 15, 0] } }}
          transition={{ duration: 0.5 }}
        >
          {unreadCount > 0 ? (
            <BellRing className="w-4 h-4 animate-pulse text-violet-500" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </motion.div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.5)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-brand text-[10px] px-1.5 py-0.5">{unreadCount} New</span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead({ userId: user.id })}
                  className="text-xs text-violet-500 hover:text-violet-400 font-medium flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {notifications === undefined ? (
                <div className="p-8 text-center text-muted text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`p-4 transition-colors hover:bg-violet-500/5 dark:hover:bg-white/5 ${!notif.isRead ? 'bg-violet-500/10 dark:bg-violet-500/10' : ''}`}
                    >
                      <Link 
                        href={notif.link || '#'} 
                        onClick={() => {
                          if (!notif.isRead) markAsRead({ notificationId: notif._id });
                          setIsOpen(false);
                        }}
                        className="block"
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-muted whitespace-nowrap mt-1">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'text-secondary' : 'text-muted'} line-clamp-2`}>
                          {notif.message}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
