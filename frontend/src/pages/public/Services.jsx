import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TechButton } from '../../components/ui/TechButton';
import { Search, Clock, ArrowRight, Filter } from 'lucide-react';

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'Hardware Repair',
    'Software Services',
    'Virus & Malware Removal',
    'Computer Maintenance',
    'Data Recovery',
    'PC Assembly & Upgrades'
  ];

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        let params = '';
        const queryParts = [];
        if (selectedCategory !== 'ALL') {
          queryParts.push(`category=${encodeURIComponent(selectedCategory)}`);
        }
        if (search.trim()) {
          queryParts.push(`search=${encodeURIComponent(search.trim())}`);
        }
        if (queryParts.length > 0) {
          params = `?${queryParts.join('&')}`;
        }

        const data = await api.getServices(params);
        setServices(data);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchServices();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <div className="py-12 bg-offwhite-100 min-h-screen font-quantico">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-techgrey-300">
          <div className="text-xs font-bold uppercase tracking-widest text-electric mb-1">
            REPAIR CAPABILITIES
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-graphite-900">
            WORKSHOP SERVICE CATALOG
          </h1>
          <p className="text-sm text-graphite-700 mt-2 max-w-2xl uppercase">
            All services are performed on-site at Workshop Bay 4 using calibrated diagnostic equipment and OEM certified components.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-techgrey-300 p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-techgrey-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="SEARCH REPAIR PROTOCOLS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-techgrey-300 text-xs font-quantico uppercase outline-none focus:border-electric"
              />
            </div>

            <div className="text-xs text-techgrey-500 uppercase font-bold">
              SHOWING {services.length} ACTIVE SPECIFICATIONS
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-techgrey-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-graphite-900 border-graphite-900 text-white'
                    : 'bg-offwhite-100 border-techgrey-300 text-graphite-800 hover:border-graphite-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="p-16 text-center text-xs font-bold uppercase tracking-widest text-techgrey-500">
            QUERYING WORKSHOP CATALOG...
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border border-techgrey-300 p-12 text-center space-y-3">
            <div className="text-sm font-bold uppercase text-graphite-900">NO MATCHING SERVICES FOUND</div>
            <p className="text-xs text-techgrey-500 uppercase">
              Try adjusting your search criteria or contact our bench engineer directly.
            </p>
            <TechButton variant="outline" size="sm" onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}>
              RESET FILTERS
            </TechButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="bg-white border border-techgrey-300 p-6 flex flex-col justify-between hover:border-electric transition-colors group relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-techgrey-500 font-mono">
                    <span className="uppercase text-electric font-bold">{service.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-techgrey-400" />
                      ~{service.estimated_duration_minutes} MIN
                    </span>
                  </div>

                  <h2 className="text-lg font-bold uppercase tracking-wider text-graphite-900 group-hover:text-electric transition-colors">
                    {service.name}
                  </h2>

                  <p className="text-xs text-graphite-700 leading-relaxed uppercase">
                    {service.summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-techgrey-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-techgrey-500 uppercase tracking-wider">
                      {service.pricing_mode === 'FIXED' ? 'FIXED RATE' : 'BENCH DIAGNOSTIC FROM'}
                    </div>
                    <div className="text-base font-bold text-graphite-900">
                      {service.display_price ? `$${service.display_price.toFixed(2)}` : 'SUBJECT TO BENCH'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/services/${service.slug}`}>
                      <TechButton variant="outline" size="sm">
                        DETAILS
                      </TechButton>
                    </Link>
                    <Link to={`/portal/book?service=${service.id}`}>
                      <TechButton variant="primary" size="sm" chamfer>
                        BOOK
                      </TechButton>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
