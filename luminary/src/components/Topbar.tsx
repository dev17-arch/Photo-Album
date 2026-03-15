'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import UploadModal from './UploadModal';

interface Props { query?: string }

export default function Topbar({ query = '' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUpload, setShowUpload] = useState(false);

  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('q', value);
    else params.delete('q');
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <>
      <header className="h-14 bg-white border-b border-stone-100 flex items-center gap-3 px-5 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">🔍</span>
          <input
            type="search"
            defaultValue={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, occasion, tag, description…"
            className="w-full pl-8 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary text-sm px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Upload
        </button>
      </header>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
