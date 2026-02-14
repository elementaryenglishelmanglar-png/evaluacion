import React from 'react';
import { MOCK_HISTORY_LIST } from '../services/mockData';
import { Trash2, FileText, ChevronRight } from 'lucide-react';

export default function HistoryList() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-700 text-lg mb-4">Minutas Archivadas</h3>
      {MOCK_HISTORY_LIST.map((item) => (
        <div key={item.id} className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
               <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{item.grade} - {item.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.eval}</span>
                 <span className="text-xs text-slate-400">{item.date}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
        </div>
      ))}
    </div>
  );
}