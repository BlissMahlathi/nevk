import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories as fallbackCategories } from "@/data/products";
import { useCategoriesQuery } from "@/hooks/useCatalog";

const CategoryShowcase = () => {
  const { data } = useCategoriesQuery();
  const activeCategories = (data || fallbackCategories)
    .filter((c) => c.isActive)
    .slice(0, 4);

  return (
    <section className="section-padding">
      <div className="text-center mb-14">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Explore
        </p>
        <h2 className="heading-display text-3xl md:text-4xl text-foreground">
          Shop by Category
        </h2>
        <div className="divider-thin mt-5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {activeCategories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              to={`/shop?category=${cat.slug}`}
              className="group block relative aspect-[3/4] overflow-hidden rounded-sm"
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="heading-display text-lg md:text-xl text-background">
                  {cat.name}
                </h3>
                <p className="font-body text-xs text-background/70 mt-1 hidden md:block">
                  {cat.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;
