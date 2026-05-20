import React from 'react';
import { Lead, LeadStatus } from '../types';
import { formatDate } from '../lib/utils';
import { Trash2, Mail, CircleSlash2, Edit } from 'lucide-react';
import { cn } from '../lib/utils';

interface TableProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onEdit?: (lead: Lead) => void;
}

export function LeadsTable({ leads, onUpdateStatus, onDelete, isAdmin, onEdit }: TableProps) {
  const getStatusConfig = (status: LeadStatus) => {
    switch (status) {
      case 'Qualified': return { color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', label: 'QUALIFIED' };
      case 'New': return { color: 'text-indigo-600', bg: 'bg-indigo-100', dot: 'bg-indigo-500', label: 'NEW PROSPECT' };
      case 'Contacted': return { color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500', label: 'CONTACTED' };
      case 'Lost': return { color: 'text-slate-400', bg: 'bg-slate-100', dot: 'bg-slate-400', label: 'LOST' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-300', label: 'UNKNOWN' };
    }
  };

  const getSourceConfig = (source: string) => {
    switch(source) {
      case 'Instagram': return { bg: 'bg-pink-50', text: 'text-pink-700' };
      case 'Website': return { bg: 'bg-sky-50', text: 'text-sky-700' };
      case 'Referral': return { bg: 'bg-slate-100', text: 'text-slate-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
          <th className="px-6 py-4">Lead Prospect</th>
          <th className="px-6 py-4 text-center">Source</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Entry Date</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {leads.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2 opacity-30">
                <CircleSlash2 size={40} />
                <p className="text-sm font-bold uppercase tracking-widest">No active leads found</p>
              </div>
            </td>
          </tr>
        ) : (
          leads.map((lead) => {
            const config = getStatusConfig(lead.status);
            const source = getSourceConfig(lead.source);
            return (
              <tr key={lead.id} className="hover:bg-indigo-50/30 transition-colors group cursor-default">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{lead.name}</p>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Mail size={10} /> {lead.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                    source.bg, source.text
                  )}>
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative inline-block group/select">
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-black tracking-widest",
                      config.color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)}></span>
                      {config.label}
                    </div>
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {isAdmin && onEdit && (
                      <button
                        onClick={() => onEdit(lead)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit Lead Details"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
