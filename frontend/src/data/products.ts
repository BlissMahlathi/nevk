import lipgloss from "@/assets/lipgloss.png";
import pic6 from "@/assets/pic6.png";
import pic8 from "@/assets/pic8.png";
import pic12 from "@/assets/pic12.png";
import picture1 from "@/assets/picture1.png";
import picture2 from "@/assets/picture2.png";
import lipScrub from "@/assets/lip-scrub.jpg";
import lipLiner from "@/assets/lip-liner.jpg";
import nudeGloss from "@/assets/nude-gloss.jpg";
import sheaSoap from "@/assets/shea-soap.jpg";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  categorySlug: string;
  image: string;
  images: string[];
  flavor?: string;
  color?: string;
  scent?: string;
  size?: string;
  isFeatured: boolean;
  isActive: boolean;
  stock: number;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  image?: string;
}

export const categories: Category[] = [
  { name: "Lip Gloss", slug: "lip-gloss", description: "High-shine luxury lip glosses", isActive: true, image: lipgloss },
  { name: "Lip Scrubs", slug: "lip-scrubs", description: "Exfoliating lip treatments", isActive: true, image: lipScrub },
  { name: "Lip Liners", slug: "lip-liners", description: "Precision lip definition", isActive: true, image: lipLiner },
  { name: "Skincare", slug: "skincare", description: "Premium face and body care", isActive: true, image: picture2 },
  { name: "Sun Care", slug: "sun-care", description: "Protective sunscreen formulas", isActive: true, image: pic6 },
  { name: "Body Care", slug: "body-care", description: "Soaps, oils, and body treatments", isActive: true, image: picture1 },
  { name: "Gift Sets", slug: "gift-sets", description: "Curated luxury collections", isActive: true, image: pic8 },
];

export const products: Product[] = [
  // Lip Glosses
  {
    id: "1", name: "Velvet Rose Lip Gloss", slug: "velvet-rose-lip-gloss",
    description: "A luxurious high-shine lip gloss with a velvety rose finish. Hydrating formula enriched with vitamin E for soft, plump lips that last all day.",
    price: 189, category: "Lip Gloss", categorySlug: "lip-gloss",
    image: lipgloss, images: [lipgloss], flavor: "Rose", color: "Rose Pink",
    scent: "Light Rose", size: "10ml", isFeatured: true, isActive: true, stock: 45,
  },
  {
    id: "7", name: "Nude Glow Lip Gloss", slug: "nude-glow-lip-gloss",
    description: "An everyday nude gloss with a warm golden shimmer. The perfect your-lips-but-better shade for any occasion. Non-sticky, ultra-hydrating formula.",
    price: 169, category: "Lip Gloss", categorySlug: "lip-gloss",
    image: nudeGloss, images: [nudeGloss], flavor: "Vanilla", color: "Nude Glow",
    scent: "Warm Vanilla", size: "10ml", isFeatured: true, isActive: true, stock: 55,
  },
  // Lip Scrubs
  {
    id: "8", name: "Sweet Rose Lip Scrub", slug: "sweet-rose-lip-scrub",
    description: "A gentle exfoliating lip scrub infused with rose extract and sugar crystals. Buffs away dry, flaky skin to reveal smooth, kissable lips.",
    price: 129, category: "Lip Scrubs", categorySlug: "lip-scrubs",
    image: lipScrub, images: [lipScrub], flavor: "Rose", scent: "Sweet Rose",
    size: "15g", isFeatured: true, isActive: true, stock: 70,
  },
  // Lip Liners
  {
    id: "9", name: "Berry Kiss Lip Liner", slug: "berry-kiss-lip-liner",
    description: "A creamy, long-wearing lip liner in a deep berry shade. Defines and shapes lips with precision. Pairs perfectly with our Velvet Rose Lip Gloss.",
    price: 99, category: "Lip Liners", categorySlug: "lip-liners",
    image: lipLiner, images: [lipLiner], color: "Deep Berry",
    isFeatured: false, isActive: true, stock: 80,
  },
  // Gift Sets
  {
    id: "2", name: "NevK Gift Box Collection", slug: "nevk-gift-box",
    description: "The ultimate luxury gift set featuring our bestselling lip gloss, lip liner, and lip scrub in a beautifully curated box. Perfect for the bold woman who owns her glow.",
    price: 450, category: "Gift Sets", categorySlug: "gift-sets",
    image: pic8, images: [pic8], isFeatured: true, isActive: true, stock: 20,
  },
  // Body Care
  {
    id: "3", name: "Charcoal Detox Soap", slug: "charcoal-detox-soap",
    description: "Deep cleanses your face to draw out dirt & oil impurities from pores to prevent acne & reduce blackheads. 120g of activated charcoal purification.",
    price: 120, category: "Body Care", categorySlug: "body-care",
    image: picture1, images: [picture1], size: "120g", isFeatured: false, isActive: true, stock: 60,
  },
  {
    id: "10", name: "Shea Butter Soap", slug: "shea-butter-soap",
    description: "A nourishing artisanal soap enriched with raw shea butter. Gently cleanses while deeply moisturising, leaving skin soft and supple.",
    price: 95, category: "Body Care", categorySlug: "body-care",
    image: sheaSoap, images: [sheaSoap], size: "100g", scent: "Unscented",
    isFeatured: false, isActive: true, stock: 90,
  },
  {
    id: "6", name: "Glow Oil", slug: "glow-oil",
    description: "A luxurious body oil that nourishes skin and delivers a radiant, healthy glow. 100% natural ingredients for luminous skin.",
    price: 220, category: "Body Care", categorySlug: "body-care",
    image: pic12, images: [pic12], size: "100ml", isFeatured: true, isActive: true, stock: 40,
  },
  // Skincare
  {
    id: "4", name: "Radiant Face Cream", slug: "radiant-face-cream",
    description: "Provides smooth skin & reduces hyperpigmentation for a more even & radiant complexion. Lightweight, deeply nourishing formula.",
    price: 250, category: "Skincare", categorySlug: "skincare",
    image: picture2, images: [picture2], size: "50ml", isFeatured: true, isActive: true, stock: 35,
  },
  // Sun Care
  {
    id: "5", name: "SPF 60 Sunscreen", slug: "spf-60-sunscreen",
    description: "Broad-spectrum SPF 60 protection with a lightweight, non-greasy formula. Shields against UVA & UVB rays while keeping skin hydrated.",
    price: 199, category: "Sun Care", categorySlug: "sun-care",
    image: pic6, images: [pic6], size: "100ml", isFeatured: false, isActive: true, stock: 50,
  },
];
