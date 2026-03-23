import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import {
  categories as fallbackCategories,
  products as fallbackProducts,
} from "@/data/products";
import {
  USE_FALLBACK_CATALOG,
  useCategoriesQuery,
  useProductsQuery,
} from "@/hooks/useCatalog";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const { data: categoriesData, error: categoriesError } = useCategoriesQuery();
  const {
    data: productsData,
    isLoading,
    error: productsError,
  } = useProductsQuery({
    category: activeCategory,
    search: searchQuery,
    pageSize: 48,
  });

  const categories =
    categoriesData || (USE_FALLBACK_CATALOG ? fallbackCategories : []);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    if (slug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    const sourceProducts =
      productsData || (USE_FALLBACK_CATALOG ? fallbackProducts : []);

    let result = sourceProducts
      .filter((p) => p.isActive)
      .filter(
        (p) => activeCategory === "all" || p.categorySlug === activeCategory,
      )
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        result = [...result].sort(
          (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
        );
        break;
    }

    return result;
  }, [activeCategory, productsData, searchQuery, sortBy]);

  const catalogErrorMessage =
    (productsError as Error | null)?.message ||
    (categoriesError as Error | null)?.message ||
    "Could not load live catalog. Check VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY), and Supabase RLS policies.";

  return (
    <Layout>
      <Seo
        title="Shop"
        description="Browse Nevk Cosmetics luxury collection: lip gloss, lip scrubs, lip liners, sunscreen, soaps, oils, and skincare products."
        path="/shop"
        keywords="shop cosmetics, lip gloss, lip scrub, lip liner, skincare products, South Africa cosmetics"
      />
      <div className="pt-28 pb-8 section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Our Collection
          </p>
          <h1 className="heading-display text-4xl md:text-5xl text-foreground">
            Shop
          </h1>
          <div className="divider-thin mt-5" />
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row items-center gap-4 max-w-2xl mx-auto mb-10">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-border text-foreground text-sm py-3 px-0 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-body"
          />
          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-b border-border text-foreground text-sm py-3 px-0 font-body focus:outline-none focus:border-primary transition-colors cursor-pointer min-w-[140px]"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-14">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`font-body text-xs uppercase tracking-[0.15em] px-4 md:px-5 py-2 transition-all duration-300 ${
              activeCategory === "all"
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories
            .filter((c) => c.isActive)
            .map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`font-body text-xs uppercase tracking-[0.15em] px-4 md:px-5 py-2 transition-all duration-300 ${
                  activeCategory === cat.slug
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Results count */}
        <p className="text-body text-muted-foreground text-xs text-center mb-8">
          {isLoading
            ? "Loading products..."
            : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
        </p>

        {(productsError || categoriesError) && !USE_FALLBACK_CATALOG && (
          <p className="text-center text-red-600 text-body text-xs mb-8">
            {catalogErrorMessage}
          </p>
        )}

        {/* Products grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          layout
        >
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-body py-20">
            No products found.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
