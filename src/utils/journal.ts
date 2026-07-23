import type { CollectionEntry } from 'astro:content';

export const categoryIcon: Record<string, string> = {
  Print: 'i-print',
  Paper: 'i-note',
  Electronics: 'i-hw',
  Process: 'i-process',
  'Shop notes': 'i-tag',
};

const WORDS_PER_MINUTE = 200;

export function readTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

export function byDateDesc(a: CollectionEntry<'journal'>, b: CollectionEntry<'journal'>) {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}·${m}·${d}`;
}
