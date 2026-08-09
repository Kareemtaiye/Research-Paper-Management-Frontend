import React from "react";

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all cursor-pointer disabled:opacity-40";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
    outline:
      "border border-white/10 text-slate-300 hover:bg-white/4 hover:border-white/16",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
