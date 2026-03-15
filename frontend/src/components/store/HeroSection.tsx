import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Image reveal
      tl.from(overlayRef.current, {
        scaleX: 1,
        duration: 0,
      });
      tl.to(overlayRef.current, {
        scaleX: 0,
        duration: 1.2,
        ease: "power4.inOut",
      });
      tl.from(imageRef.current, {
        scale: 1.3,
        duration: 1.8,
        ease: "power2.out",
      }, "-=1.2");

      // Text reveals
      tl.from(textRef.current?.querySelectorAll(".reveal-item") || [], {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      }, "-=1");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-end lg:items-center overflow-hidden">
      {/* Full-width background image */}
      <div className="absolute inset-0">
        <div ref={imageRef} className="w-full h-full">
          <img
            src={heroBanner}
            alt="Nevk Cosmetics Collection"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Wipe reveal overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-background origin-right"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20 lg:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-20 pt-32 lg:py-0">
        <div ref={textRef} className="max-w-xl">
          <p className="reveal-item font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            African-made · High-impact · Always Flawless
          </p>
          <h1 className="reveal-item heading-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.05] mb-6">
            Glow Loud.<br />
            <span className="heading-editorial text-primary">Glow Nevk.</span>
          </h1>
          <p className="reveal-item text-body text-muted-foreground max-w-md mb-10 text-base">
            Luxury lip care for bold, unapologetic women who own their glow.
            Gloss. Scrub. Line. Slay.
          </p>
          <div className="reveal-item flex flex-wrap gap-4">
            <Link to="/shop" className="btn-rose inline-block">
              Shop Collection
            </Link>
            <Link to="/about" className="btn-ghost inline-block">
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
