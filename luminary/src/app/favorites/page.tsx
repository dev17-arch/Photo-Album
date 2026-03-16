// src/app/favorites/page.tsx
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';
import { Photo } from '@/types';
import PhotoGrid from '@/components/PhotoGrid';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default async function FavoritesPage() {
  const { userId } = auth();
  if (!userId) return null;

  const supabase = createAdminClient();

  const { data: photos = [] } = await supabase
    .from('photos').select('*')
    .eq('user_id', userId).eq('favorite', true)
    .order('created_at', { ascending: false });

  const { data: allPhotos = [] } = await supabase
    .from('photos').select('name, occasion, tags, favorite')
    .eq('user_id', userId);

  const occasions = Array.from(new Set(allPhotos.map((p: Photo) => p.occasion).filter(Boolean)));
  const people    = Array.from(new Set(allPhotos.map((p: Photo) => p.name).filter(Boolean)));
  const allTags   = Array.from(new Set((allPhotos as Photo[]).flatMap(p => p.tags || [])));
  const favCount  = allPhotos.filter((p: Photo) => p.favorite).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        occasions={occasions} people={people} tags={allTags}
        totalPhotos={allPhotos.length} favCount={favCount}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <PhotoGrid photos={photos as Photo[]} />
        </main>
      </div>
    </div>
  );
}
