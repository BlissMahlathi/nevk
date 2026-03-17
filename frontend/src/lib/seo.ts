export const SITE_URL = "https://nevk.vercel.app";
export const SITE_NAME = "Nevk Cosmetics";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export const defaultSeo = {
  title: "Nevk Cosmetics | Luxury Lip Care & Skincare",
  description:
    "Nevk Cosmetics is an African-made luxury beauty brand for bold women. Shop premium lip gloss, lip scrubs, lip liners, sunscreen, soaps, oils, and skincare.",
  keywords:
    "Nevk Cosmetics, luxury cosmetics, lip gloss, lip scrub, lip liner, skincare, sunscreen, body oil, African-made beauty",
};
