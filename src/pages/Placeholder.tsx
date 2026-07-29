import React from 'react';

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-slate-400 text-2xl font-bold">{title.charAt(0)}</span>
      </div>
      <h2 className="text-2xl font-semibold text-slate-800">{title} Module</h2>
      <p className="text-slate-500 mt-2 max-w-md">
        This module is currently under development. The full feature set will be deployed in the next update.
      </p>
    </div>
  );
}
