import React from "react";

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-white/4 border text-slate-200 placeholder-slate-600 text-sm px-3 py-2 rounded-md outline-none focus:border-indigo-500 transition-colors ${className}`}
      style={{ borderColor: "rgba(255,255,255,0.08)", borderWidth: "0.5px" }}
      {...props}
    />
  );
}

export default Input;
