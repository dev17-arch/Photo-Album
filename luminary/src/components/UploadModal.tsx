'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OCCASIONS } from '@/types';

interface Props { onClose: () => void }

export default function UploadModal({ onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileData(result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  async function handleSubmit() {
    if (!fileData) { setError('Please select a photo.'); return; }
    if (!name.trim()) { setError('Please enter a person\'s name.'); return; }

    setUploading(true);
    setProgress(20);

    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 400);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileData,
          name: name.trim(),
          occasion,
          description: description.trim(),
          tags: tags.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean),
          date: date || new Date().toISOString().split('T')[0],
        }),
      });

      clearInterval(interval);
      setProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 300);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-stone-100 w-[480px] max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold text-stone-900">Add Photo</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-2xl leading-none transition-colors">×</button>
        </div>

        {/* Drop zone / preview */}
        {preview ? (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="w-full rounded-xl object-cover max-h-56" />
            <button
              onClick={() => { setPreview(null); setFileData(null); }}
              className="mt-2 text-[12px] text-stone-400 hover:text-stone-700 underline"
            >
              Change photo
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center mb-5 cursor-pointer transition-all ${dragging ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="text-3xl mb-2">📁</div>
            <p className="text-[13px] text-stone-500">Drop a photo here or <strong className="text-stone-800">click to browse</strong></p>
            <p className="text-[11px] text-stone-400 mt-1">JPG · PNG · WEBP · GIF</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Person's Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Occasion</label>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} className="input">
                <option value="">Select…</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">
              Tags <span className="font-normal text-stone-400">(comma-separated)</span>
            </label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="family, celebration, portrait" className="input" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" className="input" />
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mt-4 h-1 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-stone-900 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Error */}
        {error && <p className="mt-3 text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-stone-100">
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!fileData || uploading}
            className="btn-primary text-sm px-5 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Add Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
