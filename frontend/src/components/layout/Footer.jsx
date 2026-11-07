import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-graphite-900 text-offwhite-100 border-t border-graphite-700 font-quantico">
      {/* Top Banner */}
      <div className="border-b border-graphite-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 border border-graphite-700 p-4 bg-graphite-850">
            <Cpu className="w-8 h-8 text-electric flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-widest text-techgrey-400">BENCH SPECIFICATION</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">ESD-SAFE MICRO-SOLDERING LAB</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-graphite-700 p-4 bg-graphite-850">
            <ShieldCheck className="w-8 h-8 text-green flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-widest text-techgrey-400">COMPONENT INTEGRITY</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">GENUINE OEM / CERTIFIED GRADE-A PARTS</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-graphite-700 p-4 bg-graphite-850">
            <Clock className="w-8 h-8 text-amber flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-widest text-techgrey-400">INTAKE SCHEDULING</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">ZERO-QUEUE 30-MIN INTAKE SLOTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-electric text-white flex items-center justify-center font-bold text-sm">
              SZ
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              SERVICE<span className="text-electric">ZONE</span>
            </span>
          </div>
          <p className="text-xs text-techgrey-400 leading-relaxed uppercase">
            Specialized bench repair facility dedicated to component-level hardware repair, diagnostic troubleshooting, and precision system optimization.
          </p>
          <div className="text-[11px] text-techgrey-500 font-mono">
            SYS_REF: SZ-US-BAY4 // ACTIVE_PROFILE
          </div>
        </div>

        {/* Col 2: Service Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white border-b border-graphite-700 pb-2 mb-3">
            REPAIR CAPABILITIES
          </h4>
          <ul className="space-y-2 text-xs text-techgrey-400">
            <li><Link to="/services" className="hover:text-electric transition-colors">Motherboard & Logic Board Repair</Link></li>
            <li><Link to="/services" className="hover:text-electric transition-colors">Display & Panel Replacement</Link></li>
            <li><Link to="/services" className="hover:text-electric transition-colors">Liquid Damage Ultrasonic Clean</Link></li>
            <li><Link to="/services" className="hover:text-electric transition-colors">NVMe SSD Data Recovery</Link></li>
            <li><Link to="/services" className="hover:text-electric transition-colors">Thermal Overhaul & Liquid Metal</Link></li>
            <li><Link to="/services" className="hover:text-electric transition-colors">Clean OS & Firmware Flashing</Link></li>
          </ul>
        </div>

        {/* Col 3: Portal Access */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white border-b border-graphite-700 pb-2 mb-3">
            PORTAL ACCESS
          </h4>
          <ul className="space-y-2 text-xs text-techgrey-400">
            <li><Link to="/track" className="hover:text-electric transition-colors">Public Repair Tracker</Link></li>
            <li><Link to="/portal/book" className="hover:text-electric transition-colors">Schedule Intake Appointment</Link></li>
            <li><Link to="/login" className="hover:text-electric transition-colors">Customer Sign In</Link></li>
            <li><Link to="/login" className="hover:text-electric transition-colors">Bench Technician Access</Link></li>
            <li><Link to="/contact" className="hover:text-electric transition-colors">Bench Inquiries</Link></li>
          </ul>
        </div>

        {/* Col 4: Workshop Hours & Contact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white border-b border-graphite-700 pb-2 mb-3">
            WORKSHOP LOCATION
          </h4>
          <div className="space-y-2.5 text-xs text-techgrey-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-electric flex-shrink-0 mt-0.5" />
              <span>104 Tech Boulevard, Suite B, Workshop Bay 4</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-electric flex-shrink-0" />
              <span>+1 (555) 737-8491</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-electric flex-shrink-0" />
              <span>intake@servicezone.tech</span>
            </div>
            <div className="mt-3 pt-2 border-t border-graphite-800 text-[11px] text-techgrey-400">
              <span className="text-white font-bold">HOURS:</span> Mon - Sat: 09:00 - 18:00 (Sun Closed)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-graphite-800 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-techgrey-500">
        <div>
          &copy; {new Date().getFullYear()} SERVICEZONE INC. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>NO PURPLE GRADIENTS // ZERO TEMPLATE CLICHE</span>
          <span>•</span>
          <span>PRECISION ENGINEERING</span>
        </div>
      </div>
    </footer>
  );
}
