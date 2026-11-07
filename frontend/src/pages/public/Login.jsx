import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { Shield, User, LogIn, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/overview', { replace: true });
      } else {
        navigate('/portal/overview', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="py-16 bg-offwhite-100 min-h-screen flex items-center justify-center font-quantico px-4">
      <div className="w-full max-w-md bg-white border-2 border-graphite-900 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-techgrey-300 pb-4">
          <div className="w-10 h-10 bg-graphite-900 text-white flex items-center justify-center font-bold text-base mx-auto">
            SZ
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-graphite-900">
            SIGN IN TO PORTAL
          </h1>
          <p className="text-xs text-techgrey-500 uppercase">
            SECURE ACCESS FOR CUSTOMERS & TECHNICIANS
          </p>
        </div>

        {error && (
          <div className="bg-crimson/10 border border-crimson p-3 text-xs text-crimson font-bold uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TechInput
            label="EMAIL ADDRESS"
            type="email"
            required
            placeholder="USER@SERVICEZONE.TECH"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TechInput
            label="PASSWORD"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TechButton
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full"
            chamfer
            icon={LogIn}
          >
            AUTHENTICATE
          </TechButton>
        </form>

        {/* Demo Fast-Fill Shortcuts */}
        <div className="pt-4 border-t border-techgrey-200 space-y-2">
          <div className="text-[10px] uppercase font-bold text-techgrey-500 text-center tracking-widest">
            ONE-CLICK CREDENTIAL PROFILES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@servicezone.tech', 'admin123')}
              className="px-2 py-1.5 border border-techgrey-300 hover:border-electric text-left bg-offwhite-50 transition-colors"
            >
              <div className="text-[10px] font-bold text-electric flex items-center gap-1">
                <Shield className="w-3 h-3" /> ADMIN
              </div>
              <div className="text-[9px] text-techgrey-500 font-mono truncate">admin@servicezone.tech</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('customer@example.com', 'customer123')}
              className="px-2 py-1.5 border border-techgrey-300 hover:border-electric text-left bg-offwhite-50 transition-colors"
            >
              <div className="text-[10px] font-bold text-graphite-900 flex items-center gap-1">
                <User className="w-3 h-3" /> CUSTOMER
              </div>
              <div className="text-[9px] text-techgrey-500 font-mono truncate">customer@example.com</div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-techgrey-600 pt-2">
          NEW CUSTOMER?{' '}
          <Link to="/register" className="text-electric font-bold hover:underline">
            REGISTER PROFILE
          </Link>
        </div>
      </div>
    </div>
  );
}
