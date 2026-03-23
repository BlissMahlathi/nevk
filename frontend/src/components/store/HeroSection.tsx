import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import heroBanner768Jpg from "@/assets/hero-banner-768.jpg";
import heroBanner1280Jpg from "@/assets/hero-banner-1280.jpg";
import heroBanner1920Jpg from "@/assets/hero-banner-1920.jpg";
import heroBanner768Webp from "@/assets/hero-banner-768.webp";
import heroBanner1280Webp from "@/assets/hero-banner-1280.webp";
import heroBanner1920Webp from "@/assets/hero-banner-1920.webp";

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
      tl.from(
        imageRef.current,
        {
          scale: 1.3,
          duration: 1.8,
          ease: "power2.out",
        },
        "-=1.2",
      );

      // Text reveals
      tl.from(
        textRef.current?.querySelectorAll(".reveal-item") || [],
        {
          y: 80,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
        },
        "-=1",
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-end lg:items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <div ref={imageRef} className="w-full h-full">
          <picture>
            <source
              type="image/webp"
              srcSet={`${heroBanner768Webp} 768w, ${heroBanner1280Webp} 1280w, ${heroBanner1920Webp} 1920w`}
              sizes="100vw"
            />
            <source
              type="image/jpeg"
              srcSet={`${heroBanner768Jpg} 768w, ${heroBanner1280Jpg} 1280w, ${heroBanner1920Jpg} 1920w`}
              sizes="100vw"
            />
            <img
              src={heroBanner1280Jpg}
              alt="Nevk Cosmetics Collection"
              className="w-full h-full object-cover"
              width={1536}
              height={1024}
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </div>
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-background origin-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-background/10 lg:hidden" />
        <div className="absolute right-[6%] top-[18%] hidden lg:block w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[14%] bottom-[12%] hidden lg:block w-44 h-44 rounded-full border border-primary/30" />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-20 pt-32 lg:py-0">
        <div className="max-w-2xl">
          <div className="reveal-item inline-flex items-center gap-3 border border-foreground/20 bg-background/65 backdrop-blur px-4 py-2 rounded-full mb-7">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="font-body text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              African-made luxury beauty
            </p>
          </div>

          <div ref={textRef}>
            <h1 className="reveal-item heading-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.03] mb-6">
              Your Glow,
              <br />
              <span className="heading-editorial text-primary">
                Your Signature.
              </span>
            </h1>
            <p className="reveal-item text-body text-muted-foreground max-w-xl mb-10 text-base md:text-lg leading-relaxed">
              High-impact lip care for women who move with confidence. Build
              your ritual with gloss, scrub, and liner crafted to be seen.
            </p>
            <div className="reveal-item flex flex-wrap gap-4 mb-8">
              <Link to="/shop" className="btn-rose inline-block">
                Shop Collection
              </Link>
              <Link to="/about" className="btn-ghost inline-block">
                Discover The Brand
              </Link>
            </div>

            <div className="reveal-item grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="bg-background/70 border border-border/80 backdrop-blur rounded-sm px-4 py-3">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Finish
                </p>
                <p className="font-body text-sm text-foreground">
                  Gloss-forward shine
                </p>
              </div>
              <div className="bg-background/70 border border-border/80 backdrop-blur rounded-sm px-4 py-3">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Formula
                </p>
                <p className="font-body text-sm text-foreground">
                  Hydrating care blend
                </p>
              </div>
              <div className="bg-background/70 border border-border/80 backdrop-blur rounded-sm px-4 py-3">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Mood
                </p>
                <p className="font-body text-sm text-foreground">
                  Bold and unapologetic
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
