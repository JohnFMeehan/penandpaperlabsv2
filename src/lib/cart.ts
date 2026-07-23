// Client-side Storefront Cart API. Dormant for the same reason as shopify.ts —
// no-ops until PUBLIC_SHOPIFY_STORE_DOMAIN/TOKEN are set. Runs in the browser
// (imported from <script> tags), so it uses the same PUBLIC_ env vars Astro
// inlines into the client bundle at build time.
//
// NOTE: only adds the product's single default variant (see mapProduct in
// shopify.ts, which fetches variants(first: 1)). Products with real option-based
// variants (e.g. the Frame finish selector on Desk Clock Kit) will need the
// Shopify client extended to fetch all variants and map option values to variant
// IDs before "Add to cart" can honor a chosen option — not built yet.

import { isShopifyConfigured, storefrontFetch } from './shopify';

const CART_ID_KEY = 'ppl_cart_id';

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
}

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { message }
    }
  }
`;

const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`;

export { isShopifyConfigured as isCartConfigured };

export async function getCart(): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;
  const id = localStorage.getItem(CART_ID_KEY);
  if (!id) return null;
  const data = await storefrontFetch<{ cart: Cart | null }>(CART_QUERY, { id });
  if (!data.cart) {
    localStorage.removeItem(CART_ID_KEY);
    return null;
  }
  return data.cart;
}

export async function addToCart(variantId: string, quantity = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify is not connected — set PUBLIC_SHOPIFY_STORE_DOMAIN/TOKEN first.');
  }

  const existingId = localStorage.getItem(CART_ID_KEY);
  const lines = [{ merchandiseId: variantId, quantity }];

  if (existingId) {
    const data = await storefrontFetch<{ cartLinesAdd: { cart: Cart | null; userErrors: { message: string }[] } }>(
      CART_LINES_ADD_MUTATION,
      { cartId: existingId, lines },
    );
    if (data.cartLinesAdd.cart) return data.cartLinesAdd.cart;
    // Cart id was stale (e.g. expired) — fall through to create a new one.
  }

  const data = await storefrontFetch<{ cartCreate: { cart: Cart; userErrors: { message: string }[] } }>(
    CART_CREATE_MUTATION,
    { lines },
  );
  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
  }
  localStorage.setItem(CART_ID_KEY, data.cartCreate.cart.id);
  return data.cartCreate.cart;
}
