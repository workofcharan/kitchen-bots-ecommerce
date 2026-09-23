import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, LayoutGrid, List, Search, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import type { Page } from '../App';
import type { ProductCategory } from '../types/product';
import { useProducts } from '../hooks/use-products';
import { useCart } from '../hooks/use-cart';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import ProductImage from '../components/ProductImage';

interface ProductsPageProps {
  onProductClick: (id: string) => void;
  onCartOpen?: () => void;
  onNavigate?: (page: Page, productId?: string) => void;
}

type ViewMode = 'grid' | 'list';
type CategoryFilter = ProductCategory | 'All';

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price);

export default function ProductsPage({ onProductClick, onCartOpen, onNavigate }: ProductsPageProps) {
  const { products, loading, error, refetch } = useProducts();
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get('category');
  
  const categories: CategoryFilter[] = useMemo(() => [
    'All',
    ...new Set(products.map(product => product.category))
  ], [products]);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(
    requestedCategory && (categories as string[]).includes(requestedCategory) ? (requestedCategory as CategoryFilter) : 'All',
  );
  const [searchQuery, setSearchQuery] = useState(params.get('q') ?? '');
  const [view, setView] = useState<ViewMode>('grid');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const filteredProducts = useMemo(() => {
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter(product => {
      const searchable = [product.name, product.description, product.category, ...(product.features || [])].join(' ').toLowerCase();
      return (activeCategory === 'All' || product.category === activeCategory)
        && terms.every(term => searchable.includes(term));
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      <section className="border-b border-[#F1F5F9] bg-white pb-12 pt-6 lg:pb-16">
        <div className="container mx-auto px-6 lg:px-[80px]">
          <nav className="mb-6 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]" aria-label="Breadcrumb">
            <button className="hover:text-[#111827]" onClick={() => onNavigate?.('home')}>Home</button>
            <ChevronRight size={12} />
            <span className="text-kb-primary">Products</span>
          </nav>
          <h1 className="font-['Outfit'] text-[42px] font-bold leading-tight text-[#111827] md:text-[56px]">Product catalog</h1>
          <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-[#64748B]">
            Browse grills, rocket stoves, automated BBQ equipment, and cooking accessories.
          </p>
        </div>
      </section>

      <section className="sticky top-20 z-40 border-b border-[#E2E8F0] bg-white/95 py-4 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex flex-col gap-4 px-6 lg:px-[80px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={activeCategory === category ? 'default' : 'outline'}
                  className="shrink-0 rounded-md"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category === 'All' ? 'All products' : category}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="change-view-button shrink-0 self-start rounded-md lg:self-auto"
              onClick={() => setView(current => current === 'grid' ? 'list' : 'grid')}
              aria-label={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
            >
              {view === 'grid' ? <List size={18} className="text-[#E45400]" /> : <LayoutGrid size={18} className="text-[#E45400]" />}
              Change view
            </Button>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E45400]" size={18} />
            <label className="sr-only" htmlFor="catalog-search">Search products</label>
            <input
              id="catalog-search"
              type="search"
              placeholder="Search products, categories, or features..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="h-12 w-full border border-[#CBD5E1] bg-[#F8FAFC] pl-12 pr-4 text-[14px] outline-none transition-colors focus:border-[#E45400] focus:bg-white"
            />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-6 lg:px-[80px]">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={36} className="mx-auto mb-4 animate-spin text-kb-primary" />
              <p className="text-sm font-medium text-[#64748B]">Loading catalog from live API...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <AlertCircle size={40} className="mx-auto mb-4 text-[#DC2626]" />
              <h2 className="font-['Outfit'] text-[24px] font-bold text-[#111827]">Catalog unavailable</h2>
              <p className="mt-2 text-sm text-[#64748B]">{error.message}</p>
              <Button className="mt-6 rounded-md" onClick={() => refetch()}>Retry Loading</Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-[#64748B]" aria-live="polite">{filteredProducts.length} products</p>
              <div className={view === 'grid' ? 'grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3' : 'grid gap-5'}>
                {filteredProducts.map(product => (
                  <article
                    key={product.id}
                    className={view === 'grid'
                      ? 'group flex h-full flex-col overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
                      : 'group grid overflow-hidden rounded-2xl border border-[#F1F5F9] bg-white shadow-sm md:grid-cols-[280px_1fr]'}
                  >
                    <button
                      onClick={() => onProductClick(product.id)}
                      className={view === 'grid' ? 'aspect-square overflow-hidden bg-[#F8FAFC] p-10' : 'min-h-[240px] overflow-hidden bg-[#F8FAFC] p-8'}
                      aria-label={`View ${product.name}`}
                    >
                      <ProductImage src={product.image} alt={product.name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col p-7">
                      <button className="text-left" onClick={() => onProductClick(product.id)}>
                        <h2 className="font-['Outfit'] text-[22px] font-bold leading-tight text-[#111827] hover:text-kb-tertiary">{product.name}</h2>
                      </button>
                      <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">{product.description}</p>
                      <ul className="mt-5 grid gap-2 text-[13px] text-[#64748B] sm:grid-cols-2">
                        {(product.features || []).slice(0, 4).map(feature => <li key={feature}>• {feature}</li>)}
                      </ul>
                      <div className="mt-6 font-['Outfit'] text-[24px] font-bold text-[#111827]">{formatPrice(product.price)}</div>

                      <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        <Button
                          className="min-w-[150px] flex-1 rounded-md"
                          onClick={() => {
                            addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                            showToast(`${product.name} added to cart`, 'View cart', () => onCartOpen?.());
                          }}
                        >
                          <ShoppingCart size={18} /> Add to cart
                        </Button>
                        <Button variant="outline" className="min-w-[130px] flex-1 rounded-md" onClick={() => onProductClick(product.id)}>
                          View details <ArrowRight size={18} />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-28 text-center">
                  <Search size={36} className="mx-auto mb-5 text-[#CBD5E1]" />
                  <h2 className="font-['Outfit'] text-[24px] font-bold text-[#111827]">No matching products</h2>
                  <p className="mt-2 text-[#64748B]">Change the search text or select another category.</p>
                  <Button className="mt-7 rounded-md" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>Clear filters</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
