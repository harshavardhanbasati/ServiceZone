import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { 
  Wrench, ShieldCheck, Cpu, Clock, ArrowRight, Search, 
  CheckCircle2, AlertCircle, Sparkles, Terminal 
} from 'lucide-react';

export function Home() {
  const [services, setServices] = useState([]);
  const [trackRef, setTrackRef] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getServices();
        setServices(data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadData();
  }, []);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (trackRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(trackRef.trim())}`);
    }
  };

  return (
    <div className="flex flex-col font-quantico">
      {/* Hero Section */}
      <section className="relative bg-offwhite-100 border-b border-techgrey-300 tech-grid py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: High Impact Editorial Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 text-offwhite-100 text-xs font-bold uppercase tracking-widest border border-graphite-700">
                <Terminal className="w-3.5 h-3.5 text-electric" />
                <span>BENCH PROTOCOL // REPAIR SPEC V1.0</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-graphite-900 leading-[1.05]">
                PRECISION REPAIR. <br />
                <span className="text-electric">RELIABLE</span> TECHNOLOGY.
              </h1>

              <p className="text-base sm:text-lg text-graphite-700 max-w-xl leading-relaxed uppercase">
                Specialized component-level hardware repair, diagnostic troubleshooting, and system optimization for computers, laptops, and custom workstations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/portal/book">
                  <TechButton variant="primary" size="lg" chamfer icon={Wrench}>
                    SCHEDULE BENCH INTAKE
                  </TechButton>
                </Link>
                <Link to="/track">
                  <TechButton variant="outline" size="lg" icon={Search}>
                    TRACK ACTIVE REPAIR
                  </TechButton>
                </Link>
              </div>

              {/* Technical badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-techgrey-300 text-xs text-graphite-800">
                <div>
                  <div className="font-bold text-electric text-base sm:text-xl">100%</div>
                  <div className="text-[11px] text-techgrey-500 uppercase mt-0.5">ESD-SAFE BENCH</div>
                </div>
                <div>
                  <div className="font-bold text-graphite-900 text-base sm:text-xl">30 MIN</div>
                  <div className="text-[11px] text-techgrey-500 uppercase mt-0.5">DEDICATED INTAKE</div>
                </div>
                <div>
                  <div className="font-bold text-green text-base sm:text-xl">OEM / GRADE-A</div>
                  <div className="text-[11px] text-techgrey-500 uppercase mt-0.5">CERTIFIED COMPONENTS</div>
                </div>
              </div>
            </div>

            {/* Right Col: Technical Workbench Spec Card */}
            <div className="lg:col-span-5">
              <div className="bg-graphite-900 border-2 border-graphite-700 text-offwhite-100 p-6 relative shadow-2xl">
                <div className="flex items-center justify-between border-b border-graphite-700 pb-3 mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-electric flex items-center gap-2">
                    <span className="w-2 h-2 bg-green animate-ping" />
                    LIVE BENCH INTAKE
                  </div>
                  <span className="text-[10px] text-techgrey-400 font-mono">SYS_STATUS: ONLINE</span>
                </div>

                <div className="space-y-4">
                  <div className="border border-graphite-800 p-3 bg-graphite-850">
                    <div className="text-[11px] text-techgrey-400 uppercase">LOCATION BAY</div>
                    <div className="text-sm font-bold text-white uppercase mt-0.5">
                      104 TECH BLVD, SUITE B, BAY 4
                    </div>
                  </div>

                  <div className="border border-graphite-800 p-3 bg-graphite-850">
                    <div className="text-[11px] text-techgrey-400 uppercase">DIAGNOSTIC EQUIPMENT</div>
                    <div className="text-sm font-bold text-white uppercase mt-0.5">
                      FLIR THERMAL IMAGING • 100MHZ OSCILLOSCOPE • MICROSOLDERING JBC
                    </div>
                  </div>

                  {/* Public Quick Tracker Widget */}
                  <div className="pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-techgrey-300 block mb-2">
                      QUICK REPAIR LOOKUP
                    </label>
                    <form onSubmit={handleQuickTrack} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER REFERENCE (E.G. SZ-48291)"
                        value={trackRef}
                        onChange={(e) => setTrackRef(e.target.value)}
                        className="flex-1 bg-graphite-800 border border-graphite-700 text-white text-xs px-3 py-2.5 outline-none focus:border-electric font-quantico placeholder:text-techgrey-500 uppercase"
                      />
                      <TechButton type="submit" variant="primary" size="sm">
                        TRACK
                      </TechButton>
                    </form>
                  </div>
                </div>

                {/* Micro tech footer */}
                <div className="mt-6 pt-3 border-t border-graphite-800 text-[10px] text-techgrey-500 flex justify-between uppercase">
                  <span>PRECISION TOLERANCE: 0.1%</span>
                  <span>TIMEZONE: UTC/LOCAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Spotlight Section */}
      <section className="py-16 bg-white border-b border-techgrey-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-techgrey-300">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-electric mb-1">
                CORE DISCIPLINES
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
                WORKSHOP REPAIR CATALOG
              </h2>
            </div>
            <Link to="/services" className="mt-4 md:mt-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-electric hover:text-electric-hover">
              <span>EXPLORE COMPLETE SERVICE SPECIFICATION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-techgrey-500">
              LOADING REPAIR PROTOCOLS...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <div 
                  key={service.id}
                  className="bg-offwhite-50 border border-techgrey-300 p-6 flex flex-col justify-between hover:border-electric transition-colors relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-techgrey-500 font-mono">
                      <span>[ 0{idx + 1} ]</span>
                      <span className="uppercase text-graphite-900 font-bold">{service.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold uppercase tracking-wider text-graphite-900 group-hover:text-electric transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-xs text-graphite-700 leading-relaxed uppercase">
                      {service.summary}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-techgrey-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-techgrey-500 uppercase tracking-wider">
                        {service.pricing_mode === 'FIXED' ? 'FIXED RATE' : 'STARTING BENCH PRICE'}
                      </div>
                      <div className="text-base font-bold text-graphite-900">
                        {service.display_price ? `$${service.display_price.toFixed(2)}` : 'UPON DIAGNOSIS'}
                      </div>
                    </div>

                    <Link to={`/services/${service.slug}`}>
                      <TechButton variant="outline" size="sm">
                        VIEW SPEC
                      </TechButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works - 4 Stage Intake Process */}
      <section className="py-16 bg-offwhite-100 border-b border-techgrey-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="text-xs uppercase font-bold tracking-widest text-electric mb-1">
              OPERATIONAL PROTOCOL
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
              BENCH INTAKE WORKFLOW
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-techgrey-300 p-6 relative">
              <div className="text-2xl font-bold text-electric mb-4">01</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-graphite-900 mb-2">
                RESERVE INTAKE SLOT
              </h3>
              <p className="text-xs text-techgrey-600 leading-relaxed uppercase">
                Select your service, submit hardware specifications and defect symptoms, and secure an exclusive 30-minute intake window.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-techgrey-300 p-6 relative">
              <div className="text-2xl font-bold text-electric mb-4">02</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-graphite-900 mb-2">
                WORKSHOP DROP-OFF
              </h3>
              <p className="text-xs text-techgrey-600 leading-relaxed uppercase">
                Bring your hardware to Workshop Bay 4. Our intake technician verifies serial tags and logs physical condition into the workbench.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-techgrey-300 p-6 relative">
              <div className="text-2xl font-bold text-electric mb-4">03</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-graphite-900 mb-2">
                DIAGNOSIS & QUOTATION
              </h3>
              <p className="text-xs text-techgrey-600 leading-relaxed uppercase">
                Hardware undergoes thermal analysis and circuit inspection. You receive a diagnostic report and exact quote before work begins.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-techgrey-300 p-6 relative">
              <div className="text-2xl font-bold text-electric mb-4">04</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-graphite-900 mb-2">
                REPAIR & HANDOVER
              </h3>
              <p className="text-xs text-techgrey-600 leading-relaxed uppercase">
                Technicians perform board-level repairs, run 24-hour stress tests, and alert you when your device is ready for verified handover.
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-graphite-900 text-offwhite-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-electric uppercase font-bold tracking-wider">NO APPOINTMENT OVERLAP</div>
              <div className="text-sm font-bold uppercase text-white mt-0.5">DEDICATED BENCH TIME RESERVED FOR YOUR HARDWARE</div>
            </div>
            <Link to="/portal/book">
              <TechButton variant="primary" size="md" chamfer>
                BOOK INTAKE NOW
              </TechButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
