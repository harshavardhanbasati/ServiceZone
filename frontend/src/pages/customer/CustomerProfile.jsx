import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export function CustomerProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = { name, phone };
      if (password.trim()) {
        payload.password = password.trim();
      }
      const updatedUser = await api.updateProfile(payload);
      setUser(updatedUser);
      setPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="pb-6 border-b border-techgrey-300">
        <div className="text-xs font-bold uppercase tracking-widest text-electric">
          ACCOUNT IDENTITY
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
          PROFILE & CONTACT SETTINGS
        </h1>
      </div>

      {success && (
        <div className="bg-green/10 border border-green p-3 text-xs text-green font-bold uppercase flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>PROFILE DETAILS SUCCESSFULLY UPDATED</span>
        </div>
      )}

      {error && (
        <div className="bg-crimson/10 border border-crimson p-3 text-xs text-crimson font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <TechInput
          label="FULL NAME"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-quantico text-xs font-bold uppercase tracking-wider text-graphite-900">
            REGISTERED EMAIL (READ-ONLY)
          </label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="font-quantico text-sm px-3.5 py-2.5 bg-techgrey-100 border border-techgrey-300 text-techgrey-500 rounded-none cursor-not-allowed"
          />
        </div>

        <TechInput
          label="PHONE NUMBER (FOR BENCH ALERTS)"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="pt-4 border-t border-techgrey-200">
          <TechInput
            label="UPDATE PASSWORD (LEAVE BLANK TO RETAIN CURRENT)"
            type="password"
            placeholder="ENTER NEW PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <TechButton type="submit" variant="primary" size="md" loading={loading} chamfer>
          COMMIT PROFILE CHANGES
        </TechButton>
      </form>
    </div>
  );
}
