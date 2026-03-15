import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, Sparkles, X } from "lucide-react";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchHealth,
  fetchProductDetail,
  fetchProducts,
} from "./api";
import "./App.css";

function App() {
  const [healthMessage, setHealthMessage] = useState(
    "Connecting to backend...",
  );

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [activeProductSlug, setActiveProductSlug] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [parallaxShift, setParallaxShift] = useState(0);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === "all") return "All categories";
    const match = categories.find((item) => item.slug === selectedCategory);
    return match ? match.name : "All categories";
  }, [categories, selectedCategory]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [health, categoryData, featuredData] = await Promise.all([
          fetchHealth(),
          fetchCategories(),
          fetchFeaturedProducts(),
        ]);

        setHealthMessage(health?.message ?? "Backend connected");
        setCategories(categoryData);
        setFeaturedProducts(featuredData);
      } catch {
        setHealthMessage("Backend is not reachable from the frontend.");
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");

      try {
        const payload = await fetchProducts(
          {
            category: selectedCategory,
            search: query,
            page,
          },
          controller.signal,
        );

        setProducts(payload.results);
        setPageCount(Math.max(1, Math.ceil(payload.count / payload.pageSize)));
      } catch {
        setProductsError(
          "Could not load products right now. Please try again.",
        );
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();

    return () => controller.abort();
  }, [selectedCategory, query, page]);

  useEffect(() => {
    if (!activeProductSlug) {
      setActiveProduct(null);
      return;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      setActiveLoading(true);
      try {
        const payload = await fetchProductDetail(
          activeProductSlug,
          controller.signal,
        );
        setActiveProduct(payload);
      } catch {
        setActiveProduct(null);
      } finally {
        setActiveLoading(false);
      }
    };

    loadProduct();

    return () => controller.abort();
  }, [activeProductSlug]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const nextShift = Math.min(window.scrollY, 600);
        setParallaxShift(nextShift);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-in");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [featuredProducts, products, page]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchTerm.trim());
  };

  const onCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setQuery("");
    setPage(1);
  };

  const hasFilters = selectedCategory !== "all" || query.length > 0;

  return (
    <div
      className="app-shell"
      style={{ "--parallax-shift": `${parallaxShift}px` }}
    >
      <header className="hero-panel">
        <p className="eyebrow scroll-in parallax-text-fast">Nevk Cosmetics</p>
        <h1 className="scroll-in parallax-text-slow">
          Shop intentional beauty essentials.
        </h1>
        <p className="hero-copy scroll-in parallax-text-mid">
          Explore curated products with rich scents, clean formulas, and
          textures designed for everyday confidence.
        </p>
        <div className="hero-meta scroll-in parallax-text-fast">
          <span className="status-dot" aria-hidden="true"></span>
          <span>{healthMessage}</span>
        </div>
      </header>

      <section className="filters-panel">
        <form className="search-form scroll-in" onSubmit={onSearchSubmit}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, color, scent, or flavor"
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <div className="controls-row scroll-in">
          <label>
            Category
            <select value={selectedCategory} onChange={onCategoryChange}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name} ({category.product_count})
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="ghost-button"
            onClick={resetFilters}
            disabled={!hasFilters}
          >
            Reset filters
          </button>
        </div>
      </section>

      <section className="featured-panel">
        <div className="section-title scroll-in">
          <Sparkles size={16} aria-hidden="true" />
          <h2>Featured picks</h2>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="muted">No featured products configured yet.</p>
        ) : (
          <div className="featured-scroller">
            {featuredProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                className="featured-card scroll-in"
                onClick={() => setActiveProductSlug(item.slug)}
              >
                {item.primary_image ? (
                  <img
                    src={item.primary_image}
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-fallback">No image</div>
                )}
                <div>
                  <p className="card-title">{item.name}</p>
                  <p className="card-subtitle">
                    R {Number(item.price).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="catalog-panel">
        <div className="section-title scroll-in">
          <h2>
            Catalog: <span>{selectedCategoryLabel}</span>
          </h2>
          {query ? <p>Search term: {query}</p> : <p>Showing latest products</p>}
        </div>

        {productsLoading ? (
          <div className="state-card">
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
            <p>Loading products...</p>
          </div>
        ) : null}

        {productsError ? (
          <div className="state-card error-state">
            <p>{productsError}</p>
          </div>
        ) : null}

        {!productsLoading && !productsError && products.length === 0 ? (
          <div className="state-card">
            <p>No products match your current filters.</p>
          </div>
        ) : null}

        {!productsLoading && !productsError && products.length > 0 ? (
          <div className="product-grid">
            {products.map((item) => (
              <article key={item.id} className="product-card">
                <button
                  className="product-main scroll-in"
                  type="button"
                  onClick={() => setActiveProductSlug(item.slug)}
                >
                  {item.primary_image ? (
                    <img
                      src={item.primary_image}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="image-fallback">No image</div>
                  )}
                  <h3>{item.name}</h3>
                  <p className="price">R {Number(item.price).toFixed(2)}</p>
                  <p className="meta-row">
                    <span>{item.category_name ?? "Uncategorized"}</span>
                    <span>{item.in_stock ? "In stock" : "Out of stock"}</span>
                  </p>
                </button>
              </article>
            ))}
          </div>
        ) : null}

        <div className="pagination scroll-in">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page >= pageCount}
          >
            Next
          </button>
        </div>
      </section>

      <aside className={`detail-panel ${activeProductSlug ? "is-open" : ""}`}>
        <div className="detail-head">
          <h2>Product detail</h2>
          <button type="button" onClick={() => setActiveProductSlug("")}>
            <X size={18} aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>

        {activeLoading ? (
          <p className="muted">Loading product detail...</p>
        ) : null}

        {!activeLoading && activeProduct ? (
          <div className="detail-content">
            <h3>{activeProduct.name}</h3>
            <p className="price">R {Number(activeProduct.price).toFixed(2)}</p>
            <p>
              {activeProduct.description || "No product description available."}
            </p>
            <ul>
              <li>Flavor: {activeProduct.flavor || "Not specified"}</li>
              <li>Color: {activeProduct.color || "Not specified"}</li>
              <li>Scent: {activeProduct.scent || "Not specified"}</li>
              <li>Size: {activeProduct.size || "Not specified"}</li>
              <li>Stock: {activeProduct.stock}</li>
            </ul>
          </div>
        ) : null}

        {!activeLoading && !activeProduct && activeProductSlug ? (
          <p className="muted">Could not load the selected product.</p>
        ) : null}
      </aside>
    </div>
  );
}

export default App;
