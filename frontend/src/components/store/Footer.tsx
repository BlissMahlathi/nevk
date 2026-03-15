import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand */}
          <div>
            <h3 className="heading-display text-2xl text-background mb-4">Nevk Cosmetics</h3>
            <p className="text-body text-background/60 leading-relaxed">
              African-made. High-impact. Always flawless.<br />
              Glow Loud. Glow Nevk.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-background mb-6">Navigate</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Shop All", path: "/shop" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-body text-background/50 hover:text-background transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.2em] text-background mb-6">Get in Touch</h4>
            <div className="flex flex-col gap-3 text-body text-background/50">
              <a href="mailto:nevkcosmetics@gmail.com" className="flex items-center gap-2 hover:text-background transition-colors">
                <Mail size={14} /> nevkcosmetics@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>10 Bloekom Avenue, General Albertspark, Alberton</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-background/50 hover:text-background transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-16 pt-8 text-center">
          <p className="text-body text-background/30 text-xs">
            © {new Date().getFullYear()} Nevk Cosmetics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
