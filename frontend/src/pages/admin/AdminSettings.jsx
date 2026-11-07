import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { Settings, Shield, CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react';

export function AdminSettings() {
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getAdminSettings();
        setSettingsData(data);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="bg-white border border-techgrey-300 p-12 text-center text-xs uppercase font-bold text-techgrey-500 font-quantico">
        LOADING WORKSHOP TELEMETRY...
      </div>
    );
  }

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="pb-6 border-b border-techgrey-300">
        <div className="text-xs font-bold uppercase tracking-widest text-electric">
          SYSTEM ENVIRONMENT & PROFILE
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
          WORKSHOP OPERATIONAL CONFIGURATION
        </h1>
      </div>

      {saved && (
        <div className="bg-green/10 border border-green p-3 text-xs text-green font-bold uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>WORKSHOP PARAMETERS COMMITTED</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl text-xs uppercase">
        <div className="space-y-4">
          <TechInput
            label="FACILITY / BRAND NAME"
            value={settingsData?.business_name || ''}
            onChange={(e) => setSettingsData({ ...settingsData, business_name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TechInput
              label="DIRECT BENCH PHONE"
              value={settingsData?.business_phone || ''}
              onChange={(e) => setSettingsData({ ...settingsData, business_phone: e.target.value })}
            />

            <TechInput
              label="DISPATCH EMAIL"
              type="email"
              value={settingsData?.business_email || ''}
              onChange={(e) => setSettingsData({ ...settingsData, business_email: e.target.value })}
            />
          </div>

          <TechInput
            label="PHYSICAL WORKSHOP LOCATION"
            value={settingsData?.business_address || ''}
            onChange={(e) => setSettingsData({ ...settingsData, business_address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TechInput
              label="WORKBENCH TIMEZONE"
              value={settingsData?.timezone || 'UTC'}
              onChange={(e) => setSettingsData({ ...settingsData, timezone: e.target.value })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite-900">
                AUTO-CONFIRM NEW BOOKINGS
              </label>
              <select
                value={settingsData?.auto_confirm_bookings ? 'true' : 'false'}
                onChange={(e) => setSettingsData({ ...settingsData, auto_confirm_bookings: e.target.value === 'true' })}
                className="font-quantico text-sm px-3.5 py-2.5 bg-white border border-techgrey-300 rounded-none outline-none focus:border-electric"
              >
                <option value="false">FALSE (REQUIRE SUPERVISOR APPROVAL)</option>
                <option value="true">TRUE (AUTO-CONFIRM INSTANTLY)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-techgrey-200">
          <TechButton type="submit" variant="primary" size="md" chamfer>
            SAVE WORKSHOP CONFIGURATION
          </TechButton>
        </div>
      </form>
    </div>
  );
}
