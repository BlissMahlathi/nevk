import { motion } from "framer-motion";
import { Mail, MapPin, Clock } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Layout from "@/components/store/Layout";

const Contact = () => {
  return (
    <Layout>
      <Seo
        title="Contact"
        description="Contact Nevk Cosmetics at nevkcosmetics@gmail.com. Visit us at 10 Bloekom Avenue, General Albertspark, Alberton. Open 24 hours."
        path="/contact"
        keywords="Nevk Cosmetics contact, beauty store Alberton, cosmetics support"
      />
      <div className="pt-28">
        <section className="section-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Get in Touch
            </p>
            <h1 className="heading-display text-4xl md:text-5xl text-foreground">Contact Us</h1>
            <div className="divider-thin mt-5" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              <div>
                <h2 className="heading-display text-2xl text-foreground mb-6">
                  We'd love to hear from you
                </h2>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Whether you have questions about our products, need skincare advice,
                  or want to place a bulk order — reach out anytime.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "nevkcosmetics@gmail.com", href: "mailto:nevkcosmetics@gmail.com" },
                  { icon: MapPin, label: "Address", value: "10 Bloekom Avenue, General Albertspark, Alberton" },
                  { icon: Clock, label: "Hours", value: "Open 24 Hours" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a href={item.href} className="text-body text-foreground hover:text-primary transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-body text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-border text-foreground text-sm py-3 px-0 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-body"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-border text-foreground text-sm py-3 px-0 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-body"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full bg-transparent border-b border-border text-foreground text-sm py-3 px-0 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-body resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-rose w-full md:w-auto mt-4">
                Send Message
              </button>
            </motion.form>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;
