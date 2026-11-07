import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TechButton } from '../../components/ui/TechButton';
import { TechInput } from '../../components/ui/TechInput';
import { UserPlus, AlertCircle } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate('/portal/overview');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-offwhite-100 min-h-screen flex items-center justify-center font-quantico px-4">
      <div className="w-full max-w-md bg-white border-2 border-graphite-900 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2 border-b border-techgrey-300 pb-4">
          <div className="w-10 h-10 bg-graphite-900 text-white flex items-center justify-center font-bold text-base mx-auto">
            SZ
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-graphite-900">
            CREATE CUSTOMER ACCOUNT
          </h1>
          <p className="text-xs text-techgrey-500 uppercase">
            MANAGE APPOINTMENTS, TRACK REPAIRS & HISTORY
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
            label="FULL NAME"
            required
            placeholder="ALEX VANCE"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TechInput
            label="EMAIL ADDRESS"
            type="email"
            required
            placeholder="ALEX@EXAMPLE.COM"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <TechInput
            label="PHONE NUMBER"
            required
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <TechInput
            label="PASSWORD"
            type="password"
            required
            placeholder="MINIMUM 6 CHARACTERS"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <TechButton
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full"
            chamfer
            icon={UserPlus}
          >
            CREATE ACCOUNT
          </TechButton>
        </form>

        <div className="text-center text-xs text-techgrey-600 pt-2 border-t border-techgrey-200">
          ALREADY REGISTERED?{' '}
          <Link to="/login" className="text-electric font-bold hover:underline">
            SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
