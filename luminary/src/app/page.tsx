// src/app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';
import { Photo } from '@/types';
import PhotoGrid from '@/components/PhotoGrid';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; occasion?: string; person?: string; tags?: string };
}) {
  const { userId } = auth();
  if (!userId) return null;

  const supabase = createAdminClient();

  // Base query
  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Full-text search
  if (searchParams.q) {
    query = query.textSearch('search_vector', searchParams.q, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Filters
  if (searchParams.occasion) query = query.eq('occasion', searchParams.occasion);
  if (searchParams.person)   query = query.eq('name', searchParams.person);
  if (searchParams.tags)     query = query.contains('tags', searchParams.tags.split(','));

  const { data: photos = [], error } = await query;
  if (error) console.error('Supabase error:', error);

  // Sidebar aggregates
  const { data: allPhotos = [] } = await supabase
    .from('photos')
    .select('name, occasion, tags, favorite')
    .eq('user_id', userId);

  const occasions = [...new Set(allPhotos.map((p: Photo) => p.occasion).filter(Boolean))];
  const people    = [...new Set(allPhotos.map((p: Photo) => p.name).filter(Boolean))];
  const allTags   = [...new Set((allPhotos as Photo[]).flatMap(p => p.tags || []))];
  const favCount  = allPhotos.filter((p: Photo) => p.favorite).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        occasions={occasions}
        people={people}
        tags={allTags}
        totalPhotos={allPhotos.length}
        favCount={favCount}
        activeOccasion={searchParams.occasion}
        activePerson={searchParams.person}
        activeTags={searchParams.tags?.split(',') ?? []}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar query={searchParams.q} />
        <main className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <PhotoGrid photos={photos as Photo[]} />
        </main>
      </div>
    </div>
  );
}
