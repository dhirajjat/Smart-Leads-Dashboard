import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Mail, Lock, LayoutDashboard, Loader2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const url = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegisterMode ? { name, email, password } : { email, password };
      const res = await axios.post(url, payload);
      login(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || (isRegisterMode ? 'Registration failed. Verify details.' : 'Authentication failed. Verify credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    if (!isRegisterMode) {
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('admin@example.com');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[440px] w-full z-10"
      >
        <div className="bg-white rounded-[32px] p-10 shadow-2xl shadow-black/50 border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-6 font-black text-xl">
              S
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center">
              {isRegisterMode ? 'Register Sales Account' : 'Access SmartLeads'}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-2 text-center">
              {isRegisterMode ? 'Join and manage your prospect workflow' : 'Manage your sales pipeline with precision'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white text-[8px]">!</div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Password</label>
                {!isRegisterMode && (
                  <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {isRegisterMode ? 'Creating Account...' : 'Authenticating...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? 'Complete Registration' : 'Secure Sign In'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors"
            >
              {isRegisterMode ? '← Back to Secure Sign In' : 'New Salesperson? Register Here'}
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
               <ShieldCheck size={12} className="text-emerald-500" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">SECURE END-TO-END ENCRYPTED</span>
            </div>
            
            {!isRegisterMode && (
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Sandbox Access</p>
                <div className="flex gap-4 cursor-pointer">
                  <div 
                    className="text-[10px] font-black text-slate-500 hover:text-indigo-600 transition-colors"
                    onClick={() => { setEmail('admin@example.com'); setPassword('password'); }}
                  >
                    ADMIN MODEL
                  </div>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <div 
                    className="text-[10px] font-black text-slate-500 hover:text-indigo-600 transition-colors"
                    onClick={() => { setEmail('sales@example.com'); setPassword('password'); }}
                  >
                    SALES MODEL
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
