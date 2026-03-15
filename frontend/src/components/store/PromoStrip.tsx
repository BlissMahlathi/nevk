import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import lipgloss from "@/assets/lipgloss.png";

const PromoStrip = () => {
  return (
    <section className="bg-foreground overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh]">
        {/* Image */}
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={lipgloss}
            alt="Nevk Lip Gloss Collection"
            className="w-full h-full object-cover min-h-[40vh]"
            loading="lazy"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          className="flex items-center justify-center p-10 md:p-16 lg:p-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center lg:text-left max-w-md">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-background/40 mb-4">
              Bestsellers
            </p>
            <h2 className="heading-display text-3xl md:text-4xl text-background mb-4">
              The Lip Gloss<br />
              <span className="heading-editorial text-primary">Collection</span>
            </h2>
            <p className="text-body text-background/50 mb-8">
              Our signature high-shine glosses — from bold berry to subtle nude. Find your perfect shade.
            </p>
            <Link to="/shop?category=lip-gloss" className="btn-rose inline-block">
              Shop Lip Gloss
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoStrip;
