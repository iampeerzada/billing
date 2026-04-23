import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GSTReportPlaceholderProps {
  title: string;
  description: string;
}

export function GSTReportPlaceholder({ title, description }: GSTReportPlaceholderProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center mt-20">
      <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-6 relative">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl">
        {description}
      </p>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-md w-full text-left">
        <div className="flex gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
          <p className="text-sm text-slate-700">Detailed tax breakdowns based on your invoices.</p>
        </div>
        <div className="flex gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
          <p className="text-sm text-slate-700">JSON output compatible with the GST portal.</p>
        </div>
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
          <p className="text-sm text-slate-700">Continuous background sync with your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
