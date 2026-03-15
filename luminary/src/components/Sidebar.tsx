'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn, tagColor, initials } from '@/lib/utils';

interface Props {
  occasions: string[];
  people: string[];
  tags: string[];
  totalPhotos: number;
  favCount: number;
  activeOccasion?: string;
  activePerson?: string;
  activeTags?: string[];
}

export default function Sidebar({
  occasions, people, tags, totalPhotos, favCount,
  activeOccasion, activePerson, activeTags = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    return `/?${params.toString()}`;
  }

  function toggleTag(tag: string) {
    const current = activeTags;
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    router.push(buildHref({ tags: next.length ? next.join(',') : null }));
  }

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-stone-100 flex flex-col overflow-y-auto overflow-x-hidden h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-stone-100">
        <div className="text-[17px] font-bold tracking-tight text-stone-900">
          Luminary<span className="text-stone-300">.</span>
        </div>
        <div className="text-[11px] text-stone-400 mt-0.5">Personal Photo Archive</div>
      </div>

      {/* Main nav */}
      <nav className="mt-1 px-1.5">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors',
            pathname === '/' && !searchParams.get('occasion') && !searchParams.get('person')
              ? 'bg-stone-100 text-stone-900 font-semibold'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
          )}
        >
          <span>🖼️</span>
          <span className="flex-1">All Photos</span>
          <span className="text-[11px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">{totalPhotos}</span>
        </Link>

        <Link
          href="/favorites"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors',
            pathname === '/favorites'
              ? 'bg-stone-100 text-stone-900 font-semibold'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
          )}
        >
          <span>⭐</span>
          <span className="flex-1">Favorites</span>
          <span className="text-[11px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">{favCount}</span>
        </Link>

        <Link
          href="/ai"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors',
            pathname === '/ai'
              ? 'bg-stone-100 text-stone-900 font-semibold'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
          )}
        >
          <span>✨</span>
          <span>AI Studio</span>
        </Link>
      </nav>

      {/* Occasions */}
      {occasions.length > 0 && (
        <>
          <p className="px-4 pt-5 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Occasions</p>
          <nav className="px-1.5">
            {occasions.map(occ => (
              <Link
                key={occ}
                href={buildHref({ occasion: activeOccasion === occ ? null : occ, person: null })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors',
                  activeOccasion === occ
                    ? 'bg-stone-100 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
                )}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="flex-1 truncate">{occ}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* People */}
      {people.length > 0 && (
        <>
          <p className="px-4 pt-5 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">People</p>
          <nav className="px-1.5">
            {people.map(person => (
              <Link
                key={person}
                href={buildHref({ person: activePerson === person ? null : person, occasion: null })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors',
                  activePerson === person
                    ? 'bg-stone-100 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
                )}
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {initials(person)}
                </div>
                <span className="flex-1 truncate">{person}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <>
          <p className="px-4 pt-5 pb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Tags</p>
          <div className="px-3 pb-4 flex flex-wrap gap-1.5">
            {tags.map(tag => {
              const { bg, color } = tagColor(tag);
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: bg,
                    color,
                    outline: active ? `2px solid ${color}` : 'none',
                    outlineOffset: '1px',
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-stone-100 p-3 flex items-center gap-2">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-[12px] text-stone-400">Account</span>
      </div>
    </aside>
  );
}
