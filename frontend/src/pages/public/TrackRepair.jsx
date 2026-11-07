import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechBadge } from '../../components/ui/TechBadge';
import { Search, Clock, Cpu, CheckCircle2, AlertCircle, Wrench, ArrowRight } from 'lucide-react';

export function TrackRepair() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [refCode, setRefCode] = useState(initialRef);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (codeToSearch) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackRepairPublic(codeToSearch.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Reference code not found.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchTracking(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (refCode.trim()) {
      setSearchParams({ ref: refCode.trim() });
      fetchTracking(refCode.trim());
    }
  };

  return (
    <div className="py-12 bg-offwhite-100 min-h-screen font-quantico">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-electric">
            PUBLIC WORKBENCH TELEMETRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
            TRACK REPAIR PROGRESS
          </h1>
          <p className="text-xs text-graphite-600 uppercase max-w-xl mx-auto">
            Enter your 5-digit booking reference code provided upon intake reservation to view live bench progress and diagnostic updates.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white border-2 border-graphite-900 p-6 shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-techgrey-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="ENTER REFERENCE CODE (E.G. SZ-48291)"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-techgrey-300 text-sm font-quantico uppercase outline-none focus:border-electric"
              />
            </div>
            <TechButton type="submit" variant="primary" size="md" loading={loading} chamfer>
              QUERY STATUS
            </TechButton>
          </form>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="bg-white border-2 border-crimson p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
            <h3 className="text-sm font-bold uppercase text-graphite-900">SEARCH NOT FOUND</h3>
            <p className="text-xs text-techgrey-600 uppercase">{error}</p>
          </div>
        )}

        {/* Tracking Results */}
        {result && (
          <div className="bg-white border border-techgrey-300 p-8 space-y-8 animate-in fade-in">
            {/* Top Spec Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-techgrey-300 gap-4">
              <div>
                <div className="text-[10px] text-techgrey-500 uppercase tracking-widest">
                  BENCH REFERENCE
                </div>
                <div className="text-2xl font-bold text-graphite-900 tracking-wider">
                  {result.reference_code}
                </div>
                <div className="text-xs text-techgrey-600 uppercase mt-1">
                  {result.device_type} • {result.device_brand} {result.device_model}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right mr-2 hidden sm:block">
                  <div className="text-[10px] text-techgrey-500 uppercase">APPOINTMENT</div>
                  <TechBadge status={result.appointment_status} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-techgrey-500 uppercase">REPAIR STATE</div>
                  <TechBadge status={result.repair_status} />
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs uppercase">
              <div className="border border-techgrey-200 p-3 bg-offwhite-50">
                <div className="text-[10px] text-techgrey-500">ASSIGNED SERVICE</div>
                <div className="font-bold text-graphite-900 mt-0.5">{result.service_name}</div>
              </div>
              <div className="border border-techgrey-200 p-3 bg-offwhite-50">
                <div className="text-[10px] text-techgrey-500">INTAKE DATE</div>
                <div className="font-bold text-graphite-900 mt-0.5">{result.checkin_date || 'AWAITING CHECK-IN'}</div>
              </div>
              <div className="border border-techgrey-200 p-3 bg-offwhite-50">
                <div className="text-[10px] text-techgrey-500">QUOTED BENCH PRICE</div>
                <div className="font-bold text-graphite-900 mt-0.5">
                  {result.quoted_price ? `$${result.quoted_price.toFixed(2)}` : 'SUBJECT TO DIAGNOSIS'}
                </div>
              </div>
            </div>

            {/* Chronological Timeline */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-graphite-900 border-b border-techgrey-200 pb-2">
                CHRONOLOGICAL BENCH LOGS ({result.repair_updates?.length || 0})
              </h3>

              {(!result.repair_updates || result.repair_updates.length === 0) ? (
                <div className="text-xs text-techgrey-500 uppercase py-4">
                  DEVICE IN QUEUE. FIRST BENCH DIAGNOSTIC ENTRY WILL APPEAR HERE UPON INTAKE INSPECTION.
                </div>
              ) : (
                <div className="relative border-l-2 border-graphite-900 ml-3 pl-6 space-y-6">
                  {result.repair_updates.map((update, idx) => (
                    <div key={idx} className="relative">
                      {/* Node indicator */}
                      <span className="absolute -left-[31px] top-1 w-3 h-3 bg-electric border-2 border-white rounded-none" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TechBadge status={update.new_status} />
                          <span className="text-[11px] text-techgrey-500">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-graphite-800 leading-relaxed uppercase pt-1">
                          {update.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
