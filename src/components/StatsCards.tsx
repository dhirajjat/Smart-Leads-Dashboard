import React from 'react';
import { Users, UserPlus, CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsProps {
  stats: {
    total: number;
    new: number;
    qualified: number;
    lost: number;
  };
}

export function StatsCards({ stats }: StatsProps) {
  const items = [
    { label: 'Total Active Leads', value: stats.total.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%', isUp: true },
    { label: 'New This Week', value: stats.new.toLocaleString(), icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50', trend: '+5%', isUp: true },
    { label: 'Qualified Leads', value: stats.qualified.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8.4%', isUp: true },
    { label: 'Conversion Loss', value: stats.lost.toLocaleString(), icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100', trend: '-2.1%', isUp: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${item.bg} ${item.color} p-2.5 rounded-xl transition-transform group-hover:scale-110`}>
              <item.icon size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
              item.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
            }`}>
              {item.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.trend}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
              <span className="text-[10px] text-slate-400 font-bold">Leads</span>
            </div>
          </div>

          <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "70%" }}
               transition={{ duration: 1, delay: i * 0.1 }}
               className={`h-full ${item.color.replace('text-', 'bg-')}`}
             />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
