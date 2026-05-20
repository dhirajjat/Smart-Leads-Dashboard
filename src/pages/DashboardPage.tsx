import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { StatsCards } from '../components/StatsCards';
import { LeadsTable } from '../components/LeadsTable';
import { LeadModal } from '../components/LeadModal';
import { 
  Search, Plus, LogOut, Download, PieChart as PieIcon, 
  Filter, ChevronLeft, ChevronRight, Loader2,
  LayoutDashboard, Command, Trash2
} from 'lucide-react';
import { Lead, PaginationData, LeadStatus, LeadSource } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, new: 0, qualified: 0, lost: 0,
    sources: { website: 0, instagram: 0, referral: 0 }
  });
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const chartData = [
    { name: 'Website', value: stats.sources.website, color: '#4F46E5' },
    { name: 'Instagram', value: stats.sources.instagram, color: '#EC4899' },
    { name: 'Referral', value: stats.sources.referral, color: '#10B981' },
  ];

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/leads', {
        params: { search: debouncedSearch, status, source, sortBy, page, limit: 10 }
      });
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/leads/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [debouncedSearch, status, source, sortBy, page]);

  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    try {
      await axios.patch(`/api/leads/${id}`, { status: newStatus });
      fetchLeads();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = (id: string) => {
    const found = leads.find(l => l.id === id);
    if (found) {
      setLeadToDelete(found);
    }
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await axios.delete(`/api/leads/${leadToDelete.id}`);
      setLeadToDelete(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSubmit = async (data: any) => {
    try {
      if (editingLead) {
        await axios.patch(`/api/leads/${editingLead.id}`, data);
      } else {
        await axios.post('/api/leads', data);
      }
      setIsModalOpen(false);
      setEditingLead(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = "Name,Email,Status,Source,Date\n";
    const csvContent = leads.map(l => `${l.name},${l.email},${l.status},${l.source},${l.createdAt}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 shrink-0 relative z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">S</div>
            <h1 className="text-white font-bold text-lg tracking-tight">SmartLeads <span className="text-indigo-400 text-xs">v1.2</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-slate-700">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-slate-500 group-hover:text-rose-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Quick search pipeline... (Name or Email)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all outline-none" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500">
                <Command size={10} /> K
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={14} /> Export
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={16} /> New Lead
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 space-y-6 flex-1 overflow-auto">
          {/* Bento Stats & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <StatsCards stats={stats} />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Source Distribution</h3>
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-4">
                {chartData.map(item => (
                  <div key={item.name} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
                    <span className="text-sm font-black text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                  <Filter size={14} className="text-slate-400" />
                  <span>Filters</span>
                </div>
                <select 
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500"
                >
                  <option value="">Status: All</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
                <select 
                  value={source}
                  onChange={(e) => { setSource(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500"
                >
                  <option value="">Source: All</option>
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500 text-slate-700"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-700">{leads.length}</span> of <span className="font-bold text-slate-700">{pagination?.total || 0}</span> leads
              </div>
            </div>

            <div className="flex-1 relative overflow-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Syncing Leads...</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              
              <LeadsTable
                leads={leads}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteLead}
                isAdmin={user?.role === 'admin'}
                onEdit={(lead) => {
                  setEditingLead(lead);
                  setIsModalOpen(true);
                }}
              />
            </div>

            {/* Compact Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination?.pages || 0 }, (_, i) => i + 1).map(p => (
                   <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      page === p 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button 
                disabled={page === pagination?.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Global Footer Status */}
        <footer className="h-8 px-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">
          <div>Status: <span className="text-emerald-600">Production Live</span></div>
          <div>Role: <span className="text-indigo-600 font-black">{user?.role}</span></div>
          <div>Last Sync: {new Date().toLocaleTimeString()}</div>
        </footer>
      </main>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingLead}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {leadToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setLeadToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="delete-confirm-backdrop"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 z-10 p-6 flex flex-col items-center text-center"
              id="delete-confirm-container"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4" id="delete-confirm-icon">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight" id="delete-confirm-title">Delete Lead Record?</h3>
              <p className="text-slate-500 text-xs font-semibold mt-2 px-2 leading-relaxed" id="delete-confirm-desc">
                Are you sure you want to permanently delete <span className="text-slate-800 font-black">{leadToDelete.name}</span>? This action is irreversible.
              </p>
              
              <div className="flex gap-3 w-full mt-6" id="delete-confirm-actions">
                <button
                  onClick={() => setLeadToDelete(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-all text-xs"
                  id="delete-cancel-btn"
                >
                  No, Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-200 text-xs"
                  id="delete-confirm-btn"
                >
                  Yes, Delete Lead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
    }`}>
      <span className={active ? 'text-indigo-400' : 'opacity-70'}>{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow"></div>}
    </div>
  );
}
