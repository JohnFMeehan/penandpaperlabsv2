// This hardcoded array is the fallback used whenever Shopify isn't configured
// (see getProducts() below and src/lib/shopify.ts). Shape mirrors what the
// Storefront API fetch returns: handle, price, the "Medium"/"Domain Index"
// custom metafields, and per-product specs (PROJECT_IMPLEMENTATION_PLAN.md §2, §4).

import { isShopifyConfigured, fetchStorefrontProducts } from '../lib/shopify';

export type Category = 'Prints & Posters' | 'Stationery' | 'Built Objects';
export type Medium = 'Physical' | 'Digital' | 'Hybrid';
export type Domain = 'HW' | 'SW' | 'XR' | 'RES' | 'PD' | 'LIFE';
export type Badge = 'New' | 'Kit' | 'Sold out';
export type Swatch = 's1' | 's2' | 's3' | 's4' | 's5' | 's6';

export interface Product {
  handle: string;
  name: string;
  price: number;
  category: Category;
  typeLine: string;
  swatch: Swatch;
  badge?: Badge;
  medium: Medium;
  domain: Domain;
  productNumber: string;
  description: string;
  specs: { label: string; value: string }[];
  variantOptions?: { label: string; options: string[] };
  /** Shopify variant GID, only present when fetched live — needed for cart operations. */
  variantId?: string;
}

export const products: Product[] = [
  {
    handle: 'riso-print-03',
    name: 'Riso Print №03',
    price: 38,
    category: 'Prints & Posters',
    typeLine: 'Print · A2 · 2-color',
    swatch: 's1',
    badge: 'New',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·001',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Prints & Posters' },
      { label: 'Format', value: 'Print · A2 · 2-color' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'grid-notebook',
    name: 'Grid Notebook',
    price: 18,
    category: 'Stationery',
    typeLine: 'Stationery · A5 · 120pp',
    swatch: 's2',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·002',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Stationery' },
      { label: 'Format', value: 'Stationery · A5 · 120pp' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'desk-clock-kit',
    name: 'Desk Clock Kit',
    price: 64,
    category: 'Built Objects',
    typeLine: 'Built · Solder-it-yourself',
    swatch: 's3',
    badge: 'Kit',
    medium: 'Physical',
    domain: 'HW',
    productNumber: 'PPL·HW·007',
    description: 'An open-source desk clock you assemble yourself. Through-hole components, a laser-cut walnut frame, and a printed zine that walks you through every joint. No prior electronics experience needed — just a soldering iron and an afternoon.',
    specs: [
      { label: 'Includes', value: 'PCB, components, walnut frame, zine' },
      { label: 'Display', value: '4-digit, warm-white' },
      { label: 'Power', value: 'USB-C · 5V' },
      { label: 'Build time', value: '~2 hours' },
      { label: 'Files', value: 'Open-source (CC-BY-SA)' },
    ],
    variantOptions: { label: 'Frame finish', options: ['Walnut', 'Maple', 'Black'] },
  },
  {
    handle: 'type-poster-a1',
    name: 'Type Poster A1',
    price: 45,
    category: 'Prints & Posters',
    typeLine: 'Print · A1 · Offset',
    swatch: 's4',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·004',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Prints & Posters' },
      { label: 'Format', value: 'Print · A1 · Offset' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'enamel-pin-set',
    name: 'Enamel Pin Set',
    price: 22,
    category: 'Built Objects',
    typeLine: 'Built · Set of 3',
    swatch: 's5',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·005',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Built Objects' },
      { label: 'Format', value: 'Built · Set of 3' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'dot-grid-cards',
    name: 'Dot Grid Cards',
    price: 14,
    category: 'Stationery',
    typeLine: 'Stationery · Pack of 10',
    swatch: 's6',
    badge: 'Sold out',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·006',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Stationery' },
      { label: 'Format', value: 'Stationery · Pack of 10' },
      { label: 'Fulfillment', value: 'Currently sold out' },
    ],
  },
  {
    handle: 'pcb-bookmark',
    name: 'PCB Bookmark',
    price: 12,
    category: 'Built Objects',
    typeLine: 'Built · Etched brass',
    swatch: 's2',
    medium: 'Hybrid',
    domain: 'HW',
    productNumber: 'PPL·HW·007b',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Built Objects' },
      { label: 'Format', value: 'Built · Etched brass' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'riso-print-02',
    name: 'Riso Print №02',
    price: 38,
    category: 'Prints & Posters',
    typeLine: 'Print · A2 · 3-color',
    swatch: 's1',
    medium: 'Physical',
    domain: 'PD',
    productNumber: 'PPL·PD·008',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Prints & Posters' },
      { label: 'Format', value: 'Print · A2 · 3-color' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
  {
    handle: 'led-matrix-sign',
    name: 'LED Matrix Sign',
    price: 58,
    category: 'Built Objects',
    typeLine: 'Built · 8×8 · USB-C',
    swatch: 's3',
    badge: 'Kit',
    medium: 'Hybrid',
    domain: 'HW',
    productNumber: 'PPL·HW·009',
    description: 'Full product description coming soon — placeholder copy until real product content is written.',
    specs: [
      { label: 'Category', value: 'Built Objects' },
      { label: 'Format', value: 'Built · 8×8 · USB-C' },
      { label: 'Fulfillment', value: 'Ships in 2–4 days' },
    ],
  },
];

export function getProduct(list: Product[], handle: string): Product | undefined {
  return list.find((p) => p.handle === handle);
}

export function getRelatedProducts(list: Product[], product: Product, count = 4): Product[] {
  const sameCategory = list.filter((p) => p.handle !== product.handle && p.category === product.category);
  const rest = list.filter((p) => p.handle !== product.handle && p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, count);
}

// Returns live Shopify data when PUBLIC_SHOPIFY_STORE_DOMAIN/TOKEN are set,
// otherwise the hardcoded array above. If Shopify IS configured but the fetch
// fails, this throws rather than silently falling back — a bad token should
// fail the build loudly, not quietly ship stale demo data.
let cachedProducts: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured()) return products;
  if (!cachedProducts) cachedProducts = await fetchStorefrontProducts();
  return cachedProducts;
}
