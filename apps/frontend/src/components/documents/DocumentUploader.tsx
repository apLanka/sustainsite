import { useRef, useState } from 'react';
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'dwg'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
interface Props {
    onFileSelect: (file: File) => void;
    selectedFile?: File | null;
}
const fmtSize = (bytes: number) => bytes >= 1000000
    ? `${(bytes / 1000000).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
const DocumentUploader = ({ onFileSelect, selectedFile }: Props) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const validate = (file: File): string | null => {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXTENSIONS.includes(ext))
            return `File type .${ext} is not allowed. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
        if (file.size > MAX_SIZE_BYTES)
            return `File exceeds the 10 MB limit (${fmtSize(file.size)})`;
        return null;
    };
    const handleFile = (file: File) => {
        const err = validate(file);
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        onFileSelect(file);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file)
            handleFile(file);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file)
            handleFile(file);
        e.target.value = '';
    };
    return (<div className={`
        border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group
        ${isDragging
            ? 'border-secondary bg-secondary/5'
            : selectedFile
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-200 hover:border-secondary/50 hover:bg-slate-50/50'}
      `} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
      <input ref={inputRef} type="file" className="hidden" accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')} onChange={handleInputChange}/>

      {selectedFile ? (<>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
            <span className="material-symbols-outlined !text-3xl">task</span>
          </div>
          <p className="text-sm font-bold text-primary text-center leading-snug line-clamp-2">
            {selectedFile.name}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
            {fmtSize(selectedFile.size)} · Ready to upload
          </p>
          <button type="button" onClick={(e) => { e.stopPropagation(); onFileSelect(null as unknown as File); setError(null); }} className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
            Remove
          </button>
        </>) : (<>
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
            <span className="material-symbols-outlined !text-3xl">upload_file</span>
          </div>
          <h3 className="text-sm font-bold text-primary mb-1 text-center">Upload Project Documentation</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4 text-center">
            Drag & drop or click to browse — max 10 MB
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['PDF', 'DOCX', 'XLSX', 'JPG', 'DWG'].map((ext) => (<span key={ext} className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {ext}
              </span>))}
          </div>
        </>)}

      {error && (<p className="mt-3 text-[10px] font-bold text-rose-500 text-center">{error}</p>)}
    </div>);
};
export default DocumentUploader;
