import { useState } from 'react';
import { ArrowLeft, Check, Heart, Share2, ShoppingCart, Loader2 } from 'lucide-react';
import { useProductDetail, useProducts } from '../hooks/use-products';
import { useCart } from '../hooks/use-cart';
import { useWishlist } from '../hooks/use-wishlist';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import ProductImage from '../components/ProductImage';
import { cn } from '../lib/utils';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
}

type Tab = 'Description' | 'Specifications' | 'Usage' | 'Warranty';

const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(price);

export default function ProductDetailPage({ productId, onBack }: ProductDetailPageProps) {
  const { product, loading: isProductLoading, error: productError } = useProductDetail(productId);
  const { products: allProducts } = useProducts();
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<Tab>('Description');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  if (isProductLoading) {
    return (
      <section className="min-h-[60vh] bg-[#F8FAFC] px-6 py-32 text-center">
        <Loader2 size={36} className="mx-auto mb-4 animate-spin text-kb-primary" />
        <p className="text-sm font-medium text-[#64748B]">Loading product details...</p>
      </section>
    );
  }

  if (productError || !product) {
    return (
      <section className="min-h-[60vh] bg-[#F8FAFC] px-6 py-32 text-center">
        <h1 className="font-['Outfit'] text-3xl font-bold text-[#111827]">Product not found</h1>
        <p className="mt-3 text-[#64748B]">This product link is invalid or no longer available.</p>
        <Button className="mt-7 rounded-md" onClick={onBack}><ArrowLeft size={18} /> Back to products</Button>
      </section>
    );
  }

  const images = (product.images && product.images.length) ? product.images : [product.image];
  const specifications = Object.entries(product.specifications || {});

  const addProduct = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAdded(true);
    showToast(`${product.name} added to cart`);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const share = async () => {
    const url = new URL('/product-detail', window.location.origin);
    url.searchParams.set('id', product.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast('Product link copied');
    } catch {
      showToast('Unable to copy product link');
    }
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#F8FAFC] pb-24 pt-28">
      <div className="container mx-auto px-6 lg:px-[80px]">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Button variant="ghost" className="rounded-md px-0 hover:bg-transparent" onClick={onBack}>
            <ArrowLeft size={18} /> Back to products
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-md" onClick={share} aria-label="Copy product link"><Share2 size={18} /></Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('rounded-md', isInWishlist(product.id) && 'border-red-200 bg-red-50 text-red-600')}
              onClick={() => toggleWishlist(product.id)}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 xl:gap-20">
          <div className="min-w-0">
            <button className="block aspect-square w-full overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8" aria-label={`View ${product.name} image`}>
              <ProductImage src={images[activeImage]} alt={product.name} className="h-full w-full object-contain" />
            </button>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    aria-pressed={activeImage === index}
                    className={cn(
                      'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1',
                      activeImage === index ? 'border-[#E45400]' : 'border-[#E2E8F0]',
                    )}
                  >
                    <ProductImage src={image} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 pt-2">
            <h1 className="font-['Outfit'] text-4xl font-bold leading-tight text-[#111827] md:text-[54px]">{product.name}</h1>
            <p className="mt-6 text-[18px] leading-relaxed text-[#64748B]">{product.description}</p>

            <div className="mt-8 border-y border-[#E2E8F0] py-6">
              <div className="font-['Outfit'] text-4xl font-bold text-[#111827]">{formatPrice(product.price)}</div>
              {product.mrp && <div className="mt-1 text-sm text-[#94A3B8] line-through">{formatPrice(product.mrp)}</div>}
            </div>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {(product.features || []).map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm font-medium text-[#475569]">
                  <Check size={17} className="mt-0.5 shrink-0 text-kb-primary" /> {feature}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="min-w-[210px] flex-1 rounded-md" onClick={addProduct}>
                {added ? <><Check size={20} /> Added to cart</> : <><ShoppingCart size={20} /> Add to cart</>}
              </Button>
              <Button size="lg" variant="outline" className="min-w-[180px] flex-1 rounded-md" onClick={() => window.location.href = `mailto:info@kitchenbots.in?subject=${encodeURIComponent(`Product enquiry: ${product.name}`)}`}>
                Ask about product
              </Button>
            </div>

            <div className="mt-12">
              <div className="flex gap-5 overflow-x-auto border-b border-[#E2E8F0]">
                {(['Description', 'Specifications', 'Usage', 'Warranty'] as Tab[]).map(item => (
                  <button
                    key={item}
                    className={cn(
                      'shrink-0 border-b-2 px-1 pb-3 text-sm font-bold',
                      tab === item ? 'border-[#E45400] text-[#9A3412]' : 'border-transparent text-[#64748B] hover:text-[#111827]',
                    )}
                    onClick={() => setTab(item)}
                    aria-pressed={tab === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="min-h-40 py-6 text-[15px] leading-relaxed text-[#475569]">
                {tab === 'Description' && <p>{product.description}</p>}
                {tab === 'Specifications' && (
                  specifications.length ? (
                    <dl>
                      {specifications.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[minmax(110px,1fr)_1.5fr] gap-4 border-b border-[#E2E8F0] py-3">
                          <dt className="font-bold text-[#111827]">{label}</dt>
                          <dd className="min-w-0 break-words">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : <p>Specifications are not listed for this product.</p>
                )}
                {tab === 'Usage' && <p>{product.usage || 'Usage guidance is not listed for this product. Contact the team before purchase if you need operating details.'}</p>}
                {tab === 'Warranty' && <p>{product.warranty || 'Warranty terms are not listed for this product. Contact the team to confirm coverage.'}</p>}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 border-t border-[#E2E8F0] pt-12">
          <h2 className="font-['Outfit'] text-2xl font-bold text-[#111827]">Related products</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {allProducts.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4).map(item => (
              <button key={item.id} onClick={() => window.location.href = `/product-detail?id=${encodeURIComponent(item.id)}`} className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white text-left">
                <div className="aspect-[4/3] bg-[#F8FAFC] p-5"><ProductImage src={item.image} alt={item.name} className="h-full w-full object-contain" /></div>
                <span className="block p-4 font-bold text-[#111827]">{item.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
