import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  LayoutDashboard, CalendarPlus, Clock, Bell, User, LogOut, ArrowLeft 
} from 'lucide-react';

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const notifs = await api.getNotifications();
        const unread = notifs.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        // silent fail for ticker
      }
    }
    fetchNotifs();
  }, [location.pathname]);

  const navItems = [
    { label: 'OVERVIEW', path: '/portal/overview', icon: LayoutDashboard },
    { label: 'BOOK INTAKE', path: '/portal/book', icon: CalendarPlus },
    { label: 'MY APPOINTMENTS', path: '/portal/appointments', icon: Clock },
    { label: 'NOTIFICATIONS', path: '/portal/notifications', icon: Bell, badge: unreadCount },
    { label: 'PROFILE', path: '/portal/profile', icon: User },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <div className="min-h-screen bg-offwhite-100 flex flex-col font-quantico">
      {/* Top Header */}
      <header className="bg-graphite-900 text-offwhite-100 border-b border-graphite-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-electric text-white flex items-center justify-center font-bold text-xs">
                SZ
              </div>
              <span className="font-bold text-sm tracking-wider text-white">
                SERVICE<span className="text-electric">ZONE</span>
              </span>
            </Link>
            <span className="text-graphite-600">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-techgrey-400">
              CUSTOMER PORTAL
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-white">{user?.name}</span>
              <span className="text-[10px] text-techgrey-400">{user?.email}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-graphite-700 text-techgrey-300 hover:text-white hover:border-techgrey-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-techgrey-300 p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-techgrey-500 border-b border-techgrey-200 mb-1">
              NAVIGATION
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-graphite-900 text-white'
                      : 'text-graphite-900 hover:bg-offwhite-100 hover:text-electric'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-electric text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-techgrey-200">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-xs text-techgrey-600 hover:text-graphite-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK TO PUBLIC SITE</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
