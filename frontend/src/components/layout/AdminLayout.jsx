import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Wrench, Calendar, ClipboardList, Hammer, 
  Users, Settings, LogOut, ArrowLeft, Shield 
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'DASHBOARD', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'SERVICES CATALOG', path: '/admin/services', icon: Wrench },
    { label: 'INTAKE SLOTS', path: '/admin/slots', icon: Calendar },
    { label: 'APPOINTMENTS', path: '/admin/appointments', icon: ClipboardList },
    { label: 'BENCH REPAIRS', path: '/admin/repairs', icon: Hammer },
    { label: 'CUSTOMERS', path: '/admin/customers', icon: Users },
    { label: 'WORKSHOP SETTINGS', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <div className="min-h-screen bg-offwhite-100 flex flex-col font-quantico">
      {/* Admin Dark Top Bar */}
      <header className="bg-graphite-950 text-white border-b border-graphite-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-electric text-white flex items-center justify-center font-bold text-xs">
                SZ
              </div>
              <span className="font-bold text-sm tracking-wider">
                SERVICE<span className="text-electric">ZONE</span>
              </span>
            </Link>
            <span className="text-graphite-700">/</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-electric/10 border border-electric/40 text-electric text-[11px] font-bold uppercase">
              <Shield className="w-3 h-3" />
              <span>ADMIN OPS</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-techgrey-400">
              <span className="w-2 h-2 bg-green rounded-none" />
              <span>LOGGED IN AS: <strong className="text-white">{user?.name}</strong></span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-graphite-800 text-techgrey-300 hover:text-white hover:border-techgrey-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>EXIT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Admin Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-graphite-900 text-offwhite-100 border border-graphite-800 p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-techgrey-500 border-b border-graphite-800 mb-1">
              OPERATIONS MENU
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-electric text-white'
                      : 'text-techgrey-300 hover:bg-graphite-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-graphite-800">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-xs text-techgrey-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PUBLIC SITE VIEW</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
