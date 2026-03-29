import React, { useState } from 'react';

const DocumentUploader = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      className={`
        border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group
        ${isDragging 
          ? 'border-secondary bg-secondary/5' 
          : 'border-slate-200 hover:border-secondary/50 hover:bg-slate-50/50'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
        <span className="material-symbols-outlined !text-4xl">upload_file</span>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">Upload Project Documentation</h3>
      <p className="text-xs text-slate-400 font-medium mb-6">Drag and drop files here, or click to browse (max 10MB)</p>
      
      <div className="flex gap-3">
        {['PDF', 'DOCX', 'XLSX', 'JPG'].map(ext => (
          <span key={ext} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            {ext}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DocumentUploader;
