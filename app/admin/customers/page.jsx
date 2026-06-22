'use client';

import { useQuery, useMutation } from '@/lib/convex-hooks';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, Ban, Users, Crown } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const customers = useQuery(api.customers.getAllCustomers, {});
  const updateRole = useMutation(api.customers.updateCustomerRole);
  const toggleBlock = useMutation(api.customers.toggleCustomerBlock);
  const [search, setSearch] = useState('');

  const filtered = customers?.filter((c) =>
    !search ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted">{customers?.length || 0} total customers</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-lg font-bold text-violet-600 dark:text-violet-300">{customers?.filter((c) => c.role === 'admin').length || 0}</div>
            <div className="text-[10px] text-muted">Admins</div>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-300">{customers?.filter((c) => c.role !== 'admin').length || 0}</div>
            <div className="text-[10px] text-muted">Customers</div>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Customer', 'Email', 'Role', 'Orders', 'Spent', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers === undefined ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-10 rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-muted text-sm">No customers yet. Customers appear here after they sign up.</p>
                </td></tr>
              ) : (
                filtered.map((c) => (
                  <motion.tr key={c._id} layout className="border-b border-border hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-foreground">
                            {c.firstName?.[0]}{c.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">{c.firstName} {c.lastName}</div>
                          {c.isBlocked && <span className="text-[10px] text-red-400">Blocked</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-muted">{c.email}</span></td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${c.role === 'admin' ? 'badge-brand' : 'badge-info'}`}>
                        {c.role === 'admin' ? '👑 Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-foreground">{c.totalOrders || 0}</span></td>
                    <td className="px-4 py-3"><span className="text-sm font-semibold gradient-text">{formatCurrency(c.totalSpent || 0)}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-muted">{formatRelativeTime(c.createdAt)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => {
                            const newRole = c.role === 'admin' ? 'customer' : 'admin';
                            await updateRole({ id: c._id, role: newRole });
                            toast.success(`Role changed to ${newRole}`);
                          }}
                          title="Toggle admin role"
                          className="w-7 h-7 rounded-lg hover:bg-violet-500/10 flex items-center justify-center text-muted hover:text-primary-hover transition-all"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await toggleBlock({ id: c._id, isBlocked: !c.isBlocked });
                            toast.success(c.isBlocked ? 'Customer unblocked' : 'Customer blocked');
                          }}
                          title={c.isBlocked ? 'Unblock' : 'Block'}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted hover:text-red-400 transition-all"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
