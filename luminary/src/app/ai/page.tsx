'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';
import { useSearchParams } from 'next/navigation';

export default function AIStudioPage() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get('select');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(preselect ? [preselect] : []);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/photos').then(r => r.json()).then(setPhotos);
  }, []);

  function togglePhoto(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function analyze() {
    if (!selectedIds.length) { setError('Select at least one photo.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      const photoUrls = photos.filter(p => selectedIds.includes(p.id)).map(p => p.url);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">✨ AI Studio</h1>
        <p className="text-[14px] text-stone-500 mt-1">
          Use Grok Vision to analyze photos of a person and generate a cinematic description for video creation with Runway ML or Kling AI.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800 leading-relaxed">
        <strong>How it works:</strong> Grok analyzes your selected photos and generates a detailed portrait description.
        Paste that output into{' '}
        <a href="https://runwayml.com" target="_blank" className="underline font-medium">Runway ML Gen-3</a> or{' '}
        <a href="https://klingai.com" target="_blank" className="underline font-medium">Kling AI</a>{' '}
        to create a realistic video. Your xAI API key is stored as a server environment variable — never exposed to the browser.
      </div>

      {/* Photo selector */}
      <div className="bg-white border border-stone-100 rounded-xl p-5">
        <h2 className="text-[14px] font-bold text-stone-900 mb-1">Select Photos</h2>
        <p className="text-[12px] text-stone-400 mb-4">Choose multiple photos of the same person for the best result</p>
        {photos.length === 0 ? (
          <p className="text-[13px] text-stone-400">No photos yet — upload some first.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {photos.map(p => (
              <button
                key={p.id}
                onClick={() => togglePhoto(p.id)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedIds.includes(p.id) ? 'border-stone-900' : 'border-transparent'}`}
              >
                <Image src={p.url} alt={p.name} fill className="object-cover" sizes="80px" />
                {selectedIds.includes(p.id) && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-stone-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {selectedIds.length > 0 && (
          <p className="text-[12px] text-stone-400 mt-3">{selectedIds.length} photo{selectedIds.length !== 1 ? 's' : ''} selected</p>
        )}
      </div>

      {/* Prompt */}
      <div className="bg-white border border-stone-100 rounded-xl p-5">
        <h2 className="text-[14px] font-bold text-stone-900 mb-1">Custom Prompt</h2>
        <p className="text-[12px] text-stone-400 mb-3">Optional — leave blank to use the default portrait analysis prompt</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Describe this person in vivid detail for a cinematic portrait video — their appearance, expression, and natural energy..."
          className="input resize-y leading-relaxed"
        />
      </div>

      {/* Run button */}
      <div className="bg-white border border-stone-100 rounded-xl p-5">
        <button
          onClick={analyze}
          disabled={loading || !selectedIds.length}
          className="btn-primary w-full py-3 text-[14px] font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing with Grok…
            </span>
          ) : '✨ Analyze with Grok Vision'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-700">{error}</div>
        )}

        {result && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Grok's Analysis</p>
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-[13px] text-stone-800 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-[12px] text-green-700 leading-relaxed">
              ✅ Copy this description and paste it into{' '}
              <a href="https://runwayml.com" target="_blank" className="underline font-medium">Runway ML</a>,{' '}
              <a href="https://klingai.com" target="_blank" className="underline font-medium">Kling AI</a>, or{' '}
              <a href="https://pika.art" target="_blank" className="underline font-medium">Pika Labs</a>{' '}
              as your video generation prompt.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
