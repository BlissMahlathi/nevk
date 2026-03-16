import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import Seo from "@/components/seo/Seo";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import {
  USE_FALLBACK_CATALOG,
  useProductDetailQuery,
  useProductsQuery,
} from "@/hooks/useCatalog";
import { useCart } from "@/context/CartContext";

const ProductDetails = () => {
  const { slug } = useParams();
  const fallbackProduct = USE_FALLBACK_CATALOG
    ? fallbackProducts.find((p) => p.slug === slug)
    : undefined;
  const { data: apiProduct, isLoading, error } = useProductDetailQuery(slug);
  const product = apiProduct || fallbackProduct;

  const { data: relatedFromApi } = useProductsQuery(
    {
      category: product?.categorySlug,
      pageSize: 12,
    },
    Boolean(product?.categorySlug),
  );

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading && !product) {
    return (
      <Layout>
        <div className="pt-32 section-padding text-center">
          <p className="text-body text-muted-foreground">
            Loading product details...
          </p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-32 section-padding text-center">
          <h1 className="heading-display text-3xl text-foreground mb-4">
            {error ? "Product could not be loaded" : "Product Not Found"}
          </h1>
          {error && (
            <p className="text-body text-red-600 mb-5">
              Could not fetch product, we are working on it
            </p>
          )}
          <Link to="/shop" className="btn-ghost inline-block">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  const attributes = [
    { label: "Category", value: product.category },
    { label: "Size", value: product.size },
    { label: "Flavor", value: product.flavor },
    { label: "Color", value: product.color },
    { label: "Scent", value: product.scent },
  ].filter((a) => a.value);

  const relatedSource = relatedFromApi || fallbackProducts;
  const related = relatedSource
    .filter(
      (p) =>
        p.categorySlug === product.categorySlug &&
        p.id !== product.id &&
        p.isActive,
    )
    .slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setQuantity(1);
  };

  return (
    <Layout>
      <Seo
        title={product.name}
        description={product.description}
        path={`/product/${product.slug}`}
        image={product.image}
        type="product"
        keywords={`${product.name}, ${product.category}, Nevk Cosmetics, luxury beauty`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images,
          brand: {
            "@type": "Brand",
            name: "Nevk Cosmetics",
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "ZAR",
            price: product.price,
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `https://nevk.netlify.app/product/${product.slug}`,
          },
        }}
      />
      <div className="pt-28 section-padding">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 nav-link mb-10"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square bg-card rounded-sm overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {product.category}
            </p>
            <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
              {product.name}
            </h1>
            <p className="font-body text-2xl font-light text-foreground mb-6">
              R{product.price.toFixed(2)}
            </p>
            <div className="divider-thin !mx-0 mb-6" />
            <p className="text-body text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Attributes */}
            {attributes.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {attributes.map((attr) => (
                  <div key={attr.label}>
                    <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                      {attr.label}
                    </p>
                    <p className="font-body text-sm text-foreground">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-3 font-body text-sm text-foreground min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  aria-label="Increase quantity"
                  className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="btn-rose flex-1 disabled:opacity-40"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            <p className="text-body text-muted-foreground text-xs mt-4">
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Currently unavailable"}
            </p>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="heading-display text-2xl text-foreground mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;
