import React from 'react';

export function TechSelect({
  label,
  error,
  options = [],
  id,
  className = '',
  required = false,
  children,
  ...props
}) {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="font-quantico text-xs font-bold uppercase tracking-wider text-graphite-900 flex items-center justify-between">
          <span>{label} {required && <span className="text-crimson">*</span>}</span>
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`font-quantico text-sm px-3.5 py-2.5 bg-white border ${
          error ? 'border-crimson' : 'border-techgrey-300 focus:border-electric focus:ring-1 focus:ring-electric'
        } rounded-none outline-none transition-colors text-graphite-900 cursor-pointer disabled:bg-techgrey-100`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <span className="text-xs text-crimson font-quantico font-semibold">{error}</span>}
    </div>
  );
}
