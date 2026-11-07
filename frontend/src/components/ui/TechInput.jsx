import React from 'react';

export function TechInput({
  label,
  error,
  helper,
  id,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="font-quantico text-xs font-bold uppercase tracking-wider text-graphite-900 flex items-center justify-between">
          <span>{label} {required && <span className="text-crimson">*</span>}</span>
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`font-quantico text-sm px-3.5 py-2.5 bg-white border ${
          error ? 'border-crimson focus:ring-crimson' : 'border-techgrey-300 focus:border-electric focus:ring-1 focus:ring-electric'
        } rounded-none outline-none transition-colors text-graphite-900 placeholder:text-techgrey-400 disabled:bg-techgrey-100 disabled:text-techgrey-500`}
        {...props}
      />
      {error && <span className="text-xs text-crimson font-quantico font-semibold">{error}</span>}
      {helper && !error && <span className="text-xs text-techgrey-500 font-quantico">{helper}</span>}
    </div>
  );
}
