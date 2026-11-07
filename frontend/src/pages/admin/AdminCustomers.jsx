import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react';

export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await api.getAdminCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customer directory", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="bg-white border border-techgrey-300 p-6 sm:p-8 font-quantico space-y-6">
      <div className="pb-6 border-b border-techgrey-300">
        <div className="text-xs font-bold uppercase tracking-widest text-electric">
          ACCOUNT DIRECTORY
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-graphite-900 mt-1">
          REGISTERED CLIENT DIRECTORY
        </h1>
      </div>

      <div className="flex items-center justify-between bg-offwhite-50 border border-techgrey-200 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-techgrey-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="FILTER BY NAME, EMAIL, OR PHONE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-techgrey-300 text-xs font-quantico uppercase outline-none focus:border-electric"
          />
        </div>
        <div className="text-xs text-techgrey-500 uppercase font-bold">
          TOTAL CLIENTS: {filtered.length}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500">
          QUERYING CLIENT DIRECTORY...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs uppercase font-bold text-techgrey-500 border border-techgrey-200">
          NO CLIENTS FOUND.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs uppercase border-collapse">
            <thead>
              <tr className="border-b border-techgrey-300 bg-offwhite-100 text-techgrey-600">
                <th className="py-2.5 px-3">CUSTOMER NAME</th>
                <th className="py-2.5 px-3">EMAIL ADDRESS</th>
                <th className="py-2.5 px-3">PHONE CONTACT</th>
                <th className="py-2.5 px-3">REGISTERED SINCE</th>
                <th className="py-2.5 px-3">ACCOUNT STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-techgrey-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-offwhite-50">
                  <td className="py-3 px-3 font-bold text-graphite-900">{c.name}</td>
                  <td className="py-3 px-3 text-techgrey-700 font-mono lowercase">{c.email}</td>
                  <td className="py-3 px-3 text-techgrey-700">{c.phone}</td>
                  <td className="py-3 px-3 text-techgrey-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold border bg-green/10 border-green text-green">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
