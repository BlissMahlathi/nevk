import { motion } from "framer-motion";

const BrandStatement = () => {
  return (
    <section className="section-padding bg-card">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          The Nevk Way
        </p>
        <h2 className="heading-editorial text-2xl md:text-3xl lg:text-4xl text-foreground leading-relaxed mb-8">
          "Isn't just a brand — it is a beauty revolution. We create luxury lip care for bold, unapologetic women who own their glow."
        </h2>
        <div className="divider-thin" />
      </motion.div>
    </section>
  );
};

export default BrandStatement;
