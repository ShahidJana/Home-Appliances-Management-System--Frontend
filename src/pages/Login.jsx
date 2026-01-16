import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthController } from '../hooks/useAuthController';

import logo from '../assets/Karim_Electronics_Logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuthController();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // window.location.href = '/dashboard'; // Let useAuthController handle redirect or state change if possible, or keep as is if that's the established pattern.
      // Based on original code, it redirects manually.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login failed:', err);
      // Fallback: If it's a deactivation error, show alert
      const msg = err.message || (err.response && err.response.data && err.response.data.message);
      if (msg && msg.includes('deactivated')) {
        alert(msg);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card w-full max-w-[440px] p-12 relative overflow-hidden"
      >
        <div className="text-center mb-10 relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--primary)] blur-[60px] opacity-20 -z-10"></div>
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center">
              <img src={logo} alt="Karim Electronics Logo" className="w-32 h-auto" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">Enterprise Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="System Email"
              className="input-field pl-12 transition-all duration-300 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Security Key"
              className="input-field pl-12 transition-all duration-300 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center hover:text-white transition-colors border-none bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-[13px] bg-red-500/10 p-2.5 rounded-lg text-center flex items-center justify-center gap-2.5"
            >
              <AlertCircle size={16} />
              <span>{typeof error === 'string' ? error : error.message || 'Login failed'}</span>
            </motion.div>
          )}

          <button type="submit" className="premium-btn mt-2.5 flex items-center justify-center gap-3 w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <LogIn size={20} />
                <span>Initialize Session</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">© 2026 Advanced Asset Management System</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
