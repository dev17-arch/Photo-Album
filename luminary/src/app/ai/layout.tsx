// src/app/ai/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';
import { Photo } from '@/types';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default async function AILayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();
  if (!userId) return null;

  const supabase = createAdminClient();
  const { data: allPhotos = [] } = await supabase
    .from('photos').select('name, occasion, tags, favorite')
    .eq('user_id', userId);

  const occasions = [...new Set(allPhotos.map((p: Photo) => p.occasion).filter(Boolean))];
  const people    = [...new Set(allPhotos.map((p: Photo) => p.name).filter(Boolean))];
  const allTags   = [...new Set((allPhotos as Photo[]).flatMap(p => p.tags || []))];
  const favCount  = allPhotos.filter((p: Photo) => p.favorite).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        occasions={occasions} people={people} tags={allTags}
        totalPhotos={allPhotos.length} favCount={favCount}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-stone-50">{children}</main>
      </div>
    </div>
  );
}
