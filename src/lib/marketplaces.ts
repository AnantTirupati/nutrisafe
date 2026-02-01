/**
 * Marketplace search URL patterns. Query is encoded and inserted.
 * Use these to link users to search for suggested products online.
 */
export const MARKETPLACES = [
  {
    name: "Amazon",
    searchUrl: (query: string) =>
      `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    icon: "🛒",
  },
  {
    name: "Flipkart",
    searchUrl: (query: string) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
    icon: "🛍️",
  },
  {
    name: "BigBasket",
    searchUrl: (query: string) =>
      `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
    icon: "🥬",
  },
  {
    name: "Google Shopping",
    searchUrl: (query: string) =>
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
    icon: "🔍",
  },
] as const;
