'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';
import { tagColor, formatDate } from '@/lib/utils';

interface Props {
  photo: Photo;
  onClose: () => void;
  onUpdate: (p: Photo) => void;
  onDelete: (id: string) => void;
}

export default function DetailPanel({ photo, onClose, onUpdate, onDelete }: Props) {
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  async function patch(updates: Partial<Photo>) {
    setSaving(true);
    const res = await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id, ...updates }),
    });
    const data = await res.json();
    if (!data.error) onUpdate(data);
    setSaving(false);
  }

  async function addTag() {
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || photo.tags.includes(tag)) { setNewTag(''); return; }
    const tags = [...photo.tags, tag];
    setNewTag('');
    onUpdate({ ...photo, tags });
    await patch({ tags });
  }

  async function removeTag(tag: string) {
    const tags = photo.tags.filter(t => t !== tag);
    onUpdate({ ...photo, tags });
    await patch({ tags });
  }

  async function handleDelete() {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    onDelete(photo.id);
    await fetch(`/api/photos?id=${photo.id}`, { method: 'DELETE' });
  }

  return (
    <aside className="w-[300px] min-w-[300px] bg-white border-l border-stone-100 flex flex-col overflow-y-auto">
      {/* Photo */}
      <div className="relative">
        <Image
          src={photo.url}
          alt={photo.name}
          width={photo.width || 400}
          height={photo.height || 300}
          className="w-full object-cover"
          style={{ aspectRatio: '4/3' }}
        />
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-lg hover:bg-black/70 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="p-4 flex-1">
        {/* Name + fav */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-stone-900">{photo.name}</h2>
          <button
            onClick={() => patch({ favorite: !photo.favorite }).then(() => onUpdate({ ...photo, favorite: !photo.favorite }))}
            className="text-xl transition-transform hover:scale-110"
          >
            {photo.favorite ? '★' : '☆'}
          </button>
        </div>
        <p className="text-[12px] text-stone-400">
          {[photo.occasion, photo.date ? formatDate(photo.date) : null].filter(Boolean).join(' · ')}
        </p>
        {photo.description && (
          <p className="text-[13px] text-stone-500 mt-2.5 leading-relaxed">{photo.description}</p>
        )}

        {/* Tags */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5 min-h-[24px]">
            {photo.tags.length === 0 && <span className="text-[12px] text-stone-300">No tags yet</span>}
            {photo.tags.map(tag => {
              const { bg, color } = tagColor(tag);
              return (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: bg, color }}
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100 text-[13px] leading-none">×</button>
                </span>
              );
            })}
          </div>
          <div className="flex gap-1.5 mt-2">
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Add a tag…"
              className="flex-1 px-2.5 py-1.5 text-[12px] border border-stone-200 rounded-lg bg-stone-50 outline-none focus:border-stone-400 transition"
            />
            <button
              onClick={addTag}
              className="px-3 py-1.5 bg-stone-900 text-white text-[12px] font-semibold rounded-lg hover:bg-stone-700 transition whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </div>

        {/* Info table */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Info</p>
          <table className="w-full text-[12px]">
            <tbody>
              {[
                ['Person', photo.name],
                ['Occasion', photo.occasion || '—'],
                ['Date', photo.date ? formatDate(photo.date) : '—'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="text-stone-400 py-1 pr-3">{k}</td>
                  <td className="text-stone-700 font-medium text-right py-1">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-stone-100">
          <button onClick={handleDelete} className="btn-secondary flex-1 text-sm py-2 rounded-lg">
            🗑 Delete
          </button>
          <a
            href={`/ai?select=${photo.id}`}
            className="btn-primary flex-1 text-sm py-2 rounded-lg text-center"
          >
            ✨ Use in AI
          </a>
        </div>
        {saving && <p className="text-[11px] text-stone-400 mt-2 text-center">Saving…</p>}
      </div>
    </aside>
  );
}
