import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TechButton } from '../ui/TechButton';
import { Menu, X, Wrench, Shield, User, ArrowRight } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'SERVICES', path: '/services' },
    { label: 'ABOUT BENCH', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
    { label: 'TRACK REPAIR', path: '/track' },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-techgrey-300">
      {/* Top micro ticker */}
      <div className="bg-graphite-900 text-offwhite-100 px-4 py-1 text-[11px] font-quantico uppercase tracking-wider flex justify-between items-center border-b border-graphite-700">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-green animate-pulse" />
          <span>WORKSHOP BENCH BAY 4 // STATUS: OPERATIONAL</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-techgrey-400">
          <span>MON-SAT 09:00 - 18:00</span>
          <span>•</span>
          <span>DIRECT LINE: +1 (555) 737-8491</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-graphite-900 flex items-center justify-center border border-graphite-900 group-hover:border-electric transition-colors">
            <span className="font-quantico font-bold text-white text-lg tracking-tighter">SZ</span>
          </div>
          <div className="flex flex-col">
            <span className="font-quantico font-bold text-lg tracking-wider text-graphite-900 leading-none">
              SERVICE<span className="text-electric">ZONE</span>
            </span>
            <span className="font-quantico text-[9px] uppercase tracking-widest text-techgrey-500 leading-none mt-1">
              PRECISION REPAIR LAB
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-quantico text-xs font-bold uppercase tracking-wider transition-colors py-1 ${
                isActive(link.path)
                  ? 'text-electric border-b-2 border-electric'
                  : 'text-graphite-900 hover:text-electric'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to={isAdmin ? "/admin/overview" : "/portal/overview"}>
                <TechButton variant="secondary" size="sm" icon={isAdmin ? Shield : User}>
                  {isAdmin ? "ADMIN CONSOLE" : "MY PORTAL"}
                </TechButton>
              </Link>
              <TechButton variant="outline" size="sm" onClick={logout}>
                SIGN OUT
              </TechButton>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <TechButton variant="ghost" size="sm">
                  SIGN IN
                </TechButton>
              </Link>
              <Link to="/portal/book">
                <TechButton variant="primary" size="sm" chamfer icon={Wrench}>
                  BOOK INTAKE
                </TechButton>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-graphite-900 hover:bg-techgrey-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-techgrey-300 bg-white px-4 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="font-quantico text-sm font-bold uppercase tracking-wider text-graphite-900 hover:text-electric py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-techgrey-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? "/admin/overview" : "/portal/overview"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <TechButton variant="secondary" size="md" className="w-full">
                    {isAdmin ? "ADMIN CONSOLE" : "MY PORTAL"}
                  </TechButton>
                </Link>
                <TechButton variant="outline" size="md" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  SIGN OUT
                </TechButton>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <TechButton variant="outline" size="md" className="w-full">
                    SIGN IN
                  </TechButton>
                </Link>
                <Link to="/portal/book" onClick={() => setMobileMenuOpen(false)}>
                  <TechButton variant="primary" size="md" className="w-full" chamfer>
                    BOOK INTAKE
                  </TechButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
