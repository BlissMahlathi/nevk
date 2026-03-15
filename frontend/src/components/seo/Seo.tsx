import { Helmet } from "react-helmet-async";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  defaultSeo,
  absoluteUrl,
} from "@/lib/seo";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  keywords?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
};

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords,
  noindex = false,
  structuredData,
}: SeoProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : defaultSeo.title;
  const pageDescription = description || defaultSeo.description;
  const canonical = absoluteUrl(path);
  const socialImage = image.startsWith("http") ? image : absoluteUrl(image);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords || defaultSeo.keywords} />
      <meta
        name="robots"
        content={
          noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large"
        }
      />

      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={socialImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={socialImage} />

      {structuredData ? (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      ) : null}
    </Helmet>
  );
}
