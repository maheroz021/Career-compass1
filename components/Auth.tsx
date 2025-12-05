
import React, { useState } from 'react';
import { db } from '../services/db';
import { GraduationCap, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (isCoordinator: boolean) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isLogin) {
      const result = db.login(email, password);
      if (result.success) {
        onLogin(!!result.isCoordinator);
      } else {
        setError('Invalid credentials. Please check your email/password.');
      }
    } else {
      if (!name || !email || !password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      const success = db.signup({ name, email, password });
      if (success) {
        onLogin(false); // Signups are always students
      } else {
        setError('Email already exists');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-slate-900 opacity-90"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CareerCompass</h1>
            <p className="text-indigo-200 text-sm">Campus Placement & Tracking System</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="user@college.edu"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {isLogin && (
             <div className="mt-8 border-t border-slate-100 pt-6">
               <p className="text-xs text-center text-slate-400 font-bold uppercase mb-3">Demo Credentials</p>
               <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => { setEmail('alex@college.edu'); setPassword('password123'); }}
                    className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-indigo-50 border border-slate-100 transition-colors text-center"
                  >
                    <p className="text-xs font-bold text-slate-700">Student</p>
                    <p className="text-[10px] text-slate-400">alex@college.edu</p>
                  </div>
                  <div 
                    onClick={() => { setEmail('admin@college.edu'); setPassword('admin123'); }}
                    className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-indigo-50 border border-slate-100 transition-colors text-center"
                  >
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-indigo-500" /> Admin
                    </p>
                    <p className="text-[10px] text-slate-400">admin@college.edu</p>
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
