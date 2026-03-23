import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="product-card-surface relative">
          <div className="aspect-square overflow-hidden bg-card">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product);
              }}
              className="w-full bg-foreground/90 text-background font-body text-xs uppercase tracking-[0.15em] py-3 flex items-center justify-center gap-2 hover:bg-foreground transition-colors"
            >
              <ShoppingBag size={14} />
              Quick Add
            </button>
          </div>

          {/* Featured badge */}
          {product.isFeatured && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground font-body text-[10px] uppercase tracking-[0.15em] px-3 py-1">
              Featured
            </span>
          )}
        </div>
      </Link>
      <div className="pt-4 pb-2 px-1">
        <Link to={`/product/${product.slug}`}>
          <h3 className="heading-display text-lg text-foreground mb-0.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="font-body text-xs text-muted-foreground mb-1.5">
          {product.category}
        </p>
        <p className="font-body text-sm font-medium text-foreground">
          R{product.price.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
