import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products as fallbackProducts } from "@/data/products";
import { USE_FALLBACK_CATALOG, useProductsQuery } from "@/hooks/useCatalog";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data, error } = useProductsQuery({ featured: true, pageSize: 8 });
  const source = data || (USE_FALLBACK_CATALOG ? fallbackProducts : []);
  const featured = source
    .filter((p) => p.isFeatured && p.isActive)
    .slice(0, 6);

  return (
    <section className="section-padding">
      <div className="text-center mb-14">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Curated for You
        </p>
        <h2 className="heading-display text-3xl md:text-4xl text-foreground">
          Featured Products
        </h2>
        <div className="divider-thin mt-5" />
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        layout
      >
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </motion.div>

      {error && !USE_FALLBACK_CATALOG && (
        <p className="text-center text-red-600 text-body text-xs mt-6">
          Could not load featured products from API.
        </p>
      )}

      <div className="text-center mt-14">
        <Link to="/shop" className="btn-ghost inline-block">
          View All Products
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
