import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthController } from '../hooks/useAuthController';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error } = useAuthController();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            // Redirect logic here if needed
            window.location.href = '/dashboard';
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-card login-card"
            >
                <div className="brand-header">
                    <div className="logo-glow"></div>
                    <h1>Karim Electronics</h1>
                    <p>Enterprise Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="System Email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Security Key"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="error-message"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button type="submit" className="premium-btn login-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <LogIn size={20} />
                                <span>Initialize Session</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 Advanced Asset Management System</p>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        .brand-header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
        }
        .logo-glow {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 80px;
          background: var(--primary);
          filter: blur(40px);
          opacity: 0.3;
          z-index: -1;
        }
        h1 {
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          color: var(--text-muted);
          font-size: 14px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-field {
          padding-left: 48px;
          transition: all 0.3s ease;
        }
        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-btn {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 48px;
        }
        .error-message {
          color: var(--danger);
          font-size: 13px;
          background: rgba(239, 68, 68, 0.1);
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }
        .login-footer {
          margin-top: 40px;
          text-align: center;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
        }
        .login-footer p {
          font-size: 12px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
        </div>
    );
};

export default Login;
