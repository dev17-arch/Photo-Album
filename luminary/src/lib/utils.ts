// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TAG_PALETTE = [
  { bg: '#f0fdf4', color: '#166534' },
  { bg: '#fff7ed', color: '#9a3412' },
  { bg: '#eff6ff', color: '#1e40af' },
  { bg: '#fdf4ff', color: '#7e22ce' },
  { bg: '#fff1f2', color: '#9f1239' },
  { bg: '#f0fdfa', color: '#134e4a' },
  { bg: '#fefce8', color: '#854d0e' },
  { bg: '#f8fafc', color: '#334155' },
];

export function tagColor(tag: string) {
  let hash = 0;
  for (const ch of tag) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function initials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
