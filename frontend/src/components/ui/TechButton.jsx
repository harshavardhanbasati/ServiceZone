import React from 'react';

export function TechButton({
  children,
  variant = 'primary',
  size = 'md',
  chamfer = false,
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-quantico font-bold uppercase tracking-wider transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-1";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5 border",
    md: "text-sm px-5 py-2.5 gap-2 border",
    lg: "text-base px-7 py-3.5 gap-2.5 border-2",
  };

  const variantStyles = {
    primary: "bg-electric border-electric text-white hover:bg-electric-hover active:bg-electric-dim",
    secondary: "bg-graphite-900 border-graphite-900 text-offwhite-100 hover:bg-graphite-800 active:bg-graphite-950",
    outline: "bg-transparent border-graphite-900 text-graphite-900 hover:bg-graphite-900 hover:text-white",
    outlineWhite: "bg-transparent border-offwhite-100 text-offwhite-100 hover:bg-offwhite-100 hover:text-graphite-900",
    danger: "bg-crimson border-crimson text-white hover:bg-red-700",
    ghost: "border-transparent text-graphite-900 hover:bg-techgrey-200",
  };

  const chamferClass = chamfer ? "chamfer-br" : "rounded-none";

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${chamferClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent animate-spin mr-2" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4"} />
      ) : null}
      {children}
    </button>
  );
}
