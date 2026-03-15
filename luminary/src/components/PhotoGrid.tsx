'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';
import { tagColor, formatDate } from '@/lib/utils';
import DetailPanel from './DetailPanel';

interface Props { photos: Photo[] }

export default function PhotoGrid({ photos }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localPhotos, setLocalPhotos] = useState(photos);

  const selected = selectedId ? localPhotos.find(p => p.id === selectedId) ?? null : null;

  async function toggleFav(id: string) {
    const photo = localPhotos.find(p => p.id === id);
    if (!photo) return;
    setLocalPhotos(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
    await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, favorite: !photo.favorite }),
    });
  }

  if (localPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400">
        <div className="text-5xl mb-4">📷</div>
        <p className="text-base font-semibold text-stone-600">No photos found</p>
        <p className="text-sm mt-1">Try adjusting your filters, or upload some photos</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-full">
      {/* Masonry grid */}
      <div className={`flex-1 transition-all ${selected ? 'max-w-[calc(100%-320px)]' : ''}`}>
        <div className="columns-3 gap-3 lg:columns-3 md:columns-2 sm:columns-1">
          {localPhotos.map(photo => {
            const colors = photo.tags?.slice(0, 3).map(t => tagColor(t));
            return (
              <div
                key={photo.id}
                className="break-inside-avoid mb-3 rounded-xl overflow-hidden bg-white border border-stone-100 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-stone-200"
                onClick={() => setSelectedId(selectedId === photo.id ? null : photo.id)}
              >
                <div className="relative w-full bg-stone-100" style={{ minHeight: 100 }}>
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    width={photo.width || 400}
                    height={photo.height || 300}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 pt-2.5 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-stone-900 truncate">{photo.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleFav(photo.id); }}
                      className="text-base ml-1 transition-transform hover:scale-125"
                      title={photo.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {photo.favorite ? '★' : '☆'}
                    </button>
                  </div>
                  {photo.occasion && (
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {photo.occasion}{photo.date ? ` · ${formatDate(photo.date)}` : ''}
                    </p>
                  )}
                  {photo.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {photo.tags.slice(0, 4).map((tag, i) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: colors![i]?.bg, color: colors![i]?.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          photo={selected}
          onClose={() => setSelectedId(null)}
          onUpdate={updated => setLocalPhotos(prev => prev.map(p => p.id === updated.id ? updated : p))}
          onDelete={id => { setLocalPhotos(prev => prev.filter(p => p.id !== id)); setSelectedId(null); }}
        />
      )}
    </div>
  );
}
