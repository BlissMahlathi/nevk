import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import BrandStatement from "@/components/store/BrandStatement";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import PromoStrip from "@/components/store/PromoStrip";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BrandStatement />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoStrip />
    </Layout>
  );
};

export default Index;
