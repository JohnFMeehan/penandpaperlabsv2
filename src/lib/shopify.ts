// Shopify Storefront API client. Dormant until PUBLIC_SHOPIFY_STORE_DOMAIN and
// PUBLIC_SHOPIFY_STOREFRONT_TOKEN are set (see .env.example and README.md) — until
// then src/data/products.ts falls back to its hardcoded array and none of this runs.
//
// Requires the "Medium", "Domain Index", and "Badge" metafields and the
// Prints & Posters / Stationery / Built Objects collections described in
// PROJECT_IMPLEMENTATION_PLAN.md §4 to exist in the store. Field mapping here is
// best-effort and untested against a real store — expect to adjust it once one exists.

import type { Product, Category, Medium, Domain, Badge, Swatch } from '../data/products';

const API_VERSION = '2024-10';

export function isShopifyConfigured(): boolean {
  return Boolean(import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN && import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN);
}

export async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain: string = import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
  const token: string = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Shopify Storefront API request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify Storefront API returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
        productType
        totalInventory
        options { name values }
        collections(first: 1) { nodes { title } }
        medium: metafield(namespace: "custom", key: "medium") { value }
        domainIndex: metafield(namespace: "custom", key: "domain_index") { value }
        badge: metafield(namespace: "custom", key: "badge") { value }
        variants(first: 1) {
          nodes {
            id
            price { amount }
          }
        }
      }
    }
  }
`;

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  totalInventory: number;
  options: { name: string; values: string[] }[];
  collections: { nodes: { title: string }[] };
  medium: { value: string } | null;
  domainIndex: { value: string } | null;
  badge: { value: string } | null;
  variants: { nodes: { id: string; price: { amount: string } }[] };
}

const SWATCHES: Swatch[] = ['s1', 's2', 's3', 's4', 's5', 's6'];

function swatchForHandle(handle: string): Swatch {
  let hash = 0;
  for (const char of handle) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SWATCHES[hash % SWATCHES.length];
}

function mapProduct(node: ShopifyProductNode, index: number): Product | null {
  const variant = node.variants.nodes[0];
  if (!variant) return null;

  const category = (node.collections.nodes[0]?.title as Category) ?? 'Built Objects';
  const medium = (node.medium?.value as Medium) ?? 'Physical';
  const domain = (node.domainIndex?.value as Domain) ?? 'PD';
  const badge: Badge | undefined = node.totalInventory <= 0 ? 'Sold out' : ((node.badge?.value as Badge) || undefined);
  const variantOption = node.options.find((o) => o.name !== 'Title');

  return {
    handle: node.handle,
    name: node.title,
    price: Number(variant.price.amount),
    category,
    typeLine: node.productType || category,
    swatch: swatchForHandle(node.handle),
    badge,
    medium,
    domain,
    productNumber: `PPL·${domain}·${String(index + 1).padStart(3, '0')}`,
    description: node.description || 'Full product description coming soon.',
    specs: [
      { label: 'Category', value: category },
      { label: 'Format', value: node.productType || '—' },
      { label: 'Fulfillment', value: node.totalInventory > 0 ? 'Ships in 2–4 days' : 'Currently sold out' },
    ],
    variantOptions: variantOption ? { label: variantOption.name, options: variantOption.values } : undefined,
    variantId: variant.id,
  };
}

export async function fetchStorefrontProducts(): Promise<Product[]> {
  const data = await storefrontFetch<{ products: { nodes: ShopifyProductNode[] } }>(PRODUCTS_QUERY, { first: 100 });
  return data.products.nodes
    .map((node, i) => mapProduct(node, i))
    .filter((p): p is Product => p !== null);
}
