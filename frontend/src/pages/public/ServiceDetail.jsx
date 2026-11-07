import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { 
  Clock, Shield, ArrowLeft, Wrench, CheckCircle2, AlertCircle, FileText 
} from 'lucide-react';

export function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadService() {
      try {
        const data = await api.getService(slug);
        setService(data);
      } catch (err) {
        setError(err.message || 'Service specification could not be retrieved.');
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs uppercase font-bold text-techgrey-500 font-quantico">
        LOADING SPECIFICATION SHEET...
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 font-quantico">
        <div className="bg-white border border-crimson p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
          <h2 className="text-lg font-bold uppercase text-graphite-900">SPECIFICATION NOT FOUND</h2>
          <p className="text-xs text-techgrey-600 uppercase">{error}</p>
          <Link to="/services">
            <TechButton variant="outline" size="sm" icon={ArrowLeft}>
              BACK TO CATALOG
            </TechButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-offwhite-100 min-h-screen font-quantico">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-techgrey-500 uppercase">
          <Link to="/services" className="hover:text-electric flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            CATALOG
          </Link>
          <span>/</span>
          <span className="text-graphite-900 font-bold">{service.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Scope Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-techgrey-300 p-8 space-y-4">
              <div className="inline-block px-2.5 py-1 bg-electric/10 border border-electric/40 text-electric text-xs font-bold uppercase tracking-wider">
                {service.category}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
                {service.name}
              </h1>

              <p className="text-sm text-graphite-700 leading-relaxed uppercase border-l-2 border-electric pl-4 py-1">
                {service.summary}
              </p>
            </div>

            {/* Technical Scope & Procedure */}
            <div className="bg-white border border-techgrey-300 p-8 space-y-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-graphite-900 border-b border-techgrey-200 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-electric" />
                PROCEDURAL SCOPE & BENCH DIAGNOSTIC PROTOCOL
              </h2>

              <div className="text-xs text-graphite-800 leading-loose uppercase whitespace-pre-line">
                {service.description}
              </div>

              {/* Standard Bench Inclusions */}
              <div className="pt-4 border-t border-techgrey-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-900">
                  STANDARD PROCEDURE INCLUSIONS:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-graphite-700 uppercase">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" />
                    <span>PRE-INTAKE VISUAL & SERIAL AUDIT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" />
                    <span>POWER SUPPLY & BUS VOLTAGE STABILITY CHECK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" />
                    <span>ULTRASONIC AIR FLOW & THERMAL DE-DUSTING</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" />
                    <span>POST-REPAIR 100% LOAD VERIFICATION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white border border-techgrey-300 p-8 space-y-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-graphite-900 border-b border-techgrey-200 pb-2">
                BENCH REPAIR FAQS
              </h2>

              <div className="space-y-4 text-xs">
                <div className="border-b border-techgrey-200 pb-3">
                  <h4 className="font-bold uppercase text-graphite-900 mb-1">How long does bench diagnosis take?</h4>
                  <p className="text-techgrey-600 uppercase">
                    Initial intake diagnosis is conducted within your booked 30-minute window. Comprehensive bench stress-testing is completed within ~{service.estimated_duration_minutes} minutes.
                  </p>
                </div>
                <div className="border-b border-techgrey-200 pb-3">
                  <h4 className="font-bold uppercase text-graphite-900 mb-1">Will my personal data remain secure?</h4>
                  <p className="text-techgrey-600 uppercase">
                    Hardware repairs do not require accessing user storage unless data recovery or OS installation is specifically requested. Disks can remain encrypted.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-graphite-900 mb-1">What if the component cannot be salvaged?</h4>
                  <p className="text-techgrey-600 uppercase">
                    If component-level repair is economically unfeasible, our technicians will provide an itemized quote for an OEM certified replacement module before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Intake Summary Card */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-graphite-900 text-offwhite-100 border-2 border-graphite-700 p-6 shadow-xl space-y-6">
              <div className="border-b border-graphite-700 pb-4">
                <div className="text-[10px] text-techgrey-400 uppercase tracking-widest">
                  BENCH PRICING MODE
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {service.display_price ? `$${service.display_price.toFixed(2)}` : 'UPON DIAGNOSIS'}
                </div>
                <div className="text-[11px] text-electric uppercase mt-0.5">
                  {service.pricing_mode === 'FIXED' ? 'FLAT RATE REPAIR' : 'ESTIMATED BASE COST'}
                </div>
              </div>

              <div className="space-y-3 text-xs text-techgrey-300">
                <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                  <span className="uppercase text-techgrey-400">ESTIMATED TIME:</span>
                  <span className="font-bold text-white">~{service.estimated_duration_minutes} MIN</span>
                </div>
                <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                  <span className="uppercase text-techgrey-400">INTAKE SLOT:</span>
                  <span className="font-bold text-white">30 MIN DEDICATED</span>
                </div>
                <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                  <span className="uppercase text-techgrey-400">WARRANTY:</span>
                  <span className="font-bold text-green">90-DAY BENCH GUARANTEE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="uppercase text-techgrey-400">WORKSHOP BAY:</span>
                  <span className="font-bold text-white">BAY 4 - ON-SITE</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to={`/portal/book?service=${service.id}`} className="block">
                  <TechButton variant="primary" size="lg" className="w-full" chamfer icon={Wrench}>
                    SCHEDULE INTAKE
                  </TechButton>
                </Link>
                <div className="text-[10px] text-center text-techgrey-500 uppercase tracking-wider mt-2.5">
                  NO ONLINE CHARGE REQUIRED // PAY ON HANDOVER
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
