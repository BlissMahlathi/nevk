import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Layout from "@/components/store/Layout";
import pic8 from "@/assets/pic8.png";

const About = () => {
  return (
    <Layout>
      <Seo
        title="About Brand"
        description="Learn the story behind Nevk Cosmetics, an African-made luxury beauty brand built for bold, unapologetic women who own their glow."
        path="/about"
        keywords="about Nevk Cosmetics, African-made beauty brand, luxury lip care"
      />
      <div className="pt-28">
        {/* Hero */}
        <section className="section-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Our Story
            </p>
            <h1 className="heading-display text-4xl md:text-5xl text-foreground mb-4">
              About Nevk Cosmetics
            </h1>
            <div className="divider-thin mt-5" />
          </motion.div>
        </section>

        {/* Content */}
        <section className="px-6 md:px-12 lg:px-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden">
                <img src={pic8} alt="Nevk Cosmetics collection" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="heading-editorial text-2xl md:text-3xl text-foreground mb-6">
                A Beauty Revolution
              </h2>
              <div className="space-y-5 text-body text-muted-foreground leading-relaxed">
                <p>
                  Nevk Cosmetics isn't just a brand — it is a beauty revolution. We create luxury lip care
                  for bold, unapologetic women who own their glow.
                </p>
                <p>
                  Born in South Africa, every product is carefully crafted with premium ingredients,
                  designed to empower and celebrate the beauty of every woman.
                </p>
                <p>
                  From our signature lip glosses to our nourishing skincare range, each formula is a
                  testament to quality, confidence, and self-expression.
                </p>
                <p className="heading-editorial text-lg text-foreground">
                  Gloss. Scrub. Line. Slay.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
            {[
              { title: "African-Made", desc: "Proudly crafted in South Africa with locally sourced, premium ingredients." },
              { title: "High-Impact", desc: "Bold formulas designed to make a statement. Vibrant color, lasting wear." },
              { title: "Always Flawless", desc: "Every product tested to perfection. Your confidence, guaranteed." },
            ].map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <h3 className="heading-display text-xl text-foreground mb-3">{val.title}</h3>
                <p className="text-body text-muted-foreground">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
