import Seo from "@/components/seo/Seo";
import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import BrandStatement from "@/components/store/BrandStatement";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import PromoStrip from "@/components/store/PromoStrip";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const Index = () => {
  return (
    <Layout>
      <Seo
        title="Luxury Lip Care & Skincare"
        description="Nevk Cosmetics creates African-made luxury lip care and skincare for bold, unapologetic women. Gloss. Scrub. Line. Slay."
        path="/"
        image={DEFAULT_OG_IMAGE}
        keywords="Nevk Cosmetics, lip care South Africa, luxury lip gloss, lip scrub, lip liner, skincare"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nevk Cosmetics",
          url: "https://nevk.netlify.app",
          logo: "https://nevk.netlify.app/logo.png",
          email: "nevkcosmetics@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "10 Bloekom Avenue, General Albertspark",
            addressLocality: "Alberton",
            addressCountry: "ZA",
          },
          openingHours: "Mo-Su 00:00-23:59",
        }}
      />
      <HeroSection />
      <BrandStatement />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoStrip />
    </Layout>
  );
};

export default Index;
