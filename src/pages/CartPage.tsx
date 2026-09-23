import React, { useState } from 'react';
import { useCart } from '../hooks/use-cart';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import type { Page } from '../App';
import { Button } from '../components/ui/button';
import ProductImage from '../components/ProductImage';
import { apiClient } from '../lib/api-client';

interface CartPageProps {
  onNavigate: (page: Page) => void;
}

function renderConfigValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)))
      .join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{ id?: string; referenceNumber?: string } | null>(null);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (!Number.isFinite(newQuantity)) return;
    const sanitized = Math.floor(newQuantity);
    if (sanitized >= 1 && sanitized <= 999) {
      updateQuantity(id, sanitized);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const response = await apiClient<{ id?: string; referenceNumber?: string }>('/v1/orders', {
        method: 'POST',
        requireAuth: true,
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
            name: i.name,
            configuration: i.configuration
          })),
          totalItems,
          estimatedTotal: totalPrice
        }),
      });

      clearCart();
      setOrderConfirmation(response || { id: `ORD-${Date.now().toString().slice(-6)}` });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmation) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-lg mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-5 text-kb-primary">
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] font-['Outfit'] mb-2">
              Order Confirmed!
            </h1>
            <p className="text-[#64748B] text-sm sm:text-base font-['DM_Sans'] mb-4">
              Thank you for your order. Your order reference is:
            </p>
            <div className="inline-block px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-mono font-bold text-[#111827] mb-6">
              {orderConfirmation.referenceNumber || orderConfirmation.id || 'CONFIRMED'}
            </div>
            <p className="text-[#64748B] text-xs font-['DM_Sans'] mb-8">
              Our team will review your order requirements and send dispatch & shipping updates to <span className="font-semibold text-[#111827]">{user?.email}</span>.
            </p>
            <Button
              onClick={() => onNavigate('products')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-kb-primary hover:bg-[#145e2e] text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-lg mx-auto bg-white border border-[#E2E8F0] rounded-xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl flex items-center justify-center mx-auto mb-5 text-kb-primary">
              <ShoppingBag className="w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] font-['Outfit'] mb-2">
              Your cart is empty
            </h1>
            <p className="text-[#64748B] text-sm sm:text-base font-['DM_Sans'] mb-8">
              You have not added any products to your cart yet. Browse our commercial and outdoor cooking equipment to get started.
            </p>
            <Button
              onClick={() => onNavigate('products')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-kb-primary hover:bg-[#145e2e] text-white focus-visible:ring-2 focus-visible:ring-kb-primary focus-visible:ring-offset-2"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-[#111827] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kb-primary rounded px-1.5 py-2 min-h-[44px] inline-flex items-center"
          >
            Home
          </button>
          <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="hover:text-[#111827] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kb-primary rounded px-1.5 py-2 min-h-[44px] inline-flex items-center"
          >
            Products
          </button>
          <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
          <span className="text-[#111827] px-1.5 py-2 min-h-[44px] inline-flex items-center" aria-current="page">
            Cart
          </span>
        </nav>

        {/* Page Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E2E8F0] pb-5">
          <div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827]">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-[#64748B] font-['DM_Sans']">
              Review items in your order before placing your order or requesting a quote.
            </p>
          </div>
          <span className="text-sm font-medium text-[#64748B] shrink-0">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </header>

        {errorMessage && (
          <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2 font-['DM_Sans']">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <section aria-label="Cart items" className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemSubtotal = item.price * item.quantity;
              const hasConfig = Boolean(
                item.configuration &&
                typeof item.configuration === 'object' &&
                Object.keys(item.configuration).length > 0
              );

              return (
                <article
                  key={item.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9] p-2 shrink-0 flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                        <h2 className="font-['Outfit'] text-base sm:text-lg font-bold text-[#111827] leading-snug break-words min-w-0">
                          {item.name}
                        </h2>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="font-['Outfit'] text-base sm:text-lg font-bold text-[#111827] whitespace-nowrap">
                            ₹{itemSubtotal.toLocaleString('en-IN')}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#64748B] whitespace-nowrap">
                              ₹{item.price.toLocaleString('en-IN')} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Product Configuration Display */}
                      {hasConfig && item.configuration && (
                        <div className="mt-2 text-xs text-[#64748B] space-y-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-md p-2.5">
                          <span className="font-semibold text-[#475569] uppercase tracking-wider text-[10px]">
                            Configuration:
                          </span>
                          <div className="space-y-1 mt-1">
                            {Object.entries(item.configuration).map(([key, val]) => (
                              <div key={key} className="flex flex-wrap items-baseline gap-1.5 text-xs break-words">
                                <span className="font-medium text-[#475569] shrink-0">{key}:</span>
                                <span className="text-[#1E293B] break-all">{renderConfigValue(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Removal Controls */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#64748B]">Quantity:</span>
                        <div className="flex items-center border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-11 h-11 flex items-center justify-center text-[#475569] hover:text-[#111827] hover:bg-[#E2E8F0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kb-primary focus-visible:z-10 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-transparent hover:disabled:text-[#475569]"
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <span
                            aria-label={`Current quantity: ${item.quantity}`}
                            className="w-10 text-center font-['Outfit'] text-sm font-semibold text-[#111827] select-none"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 999}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-11 h-11 flex items-center justify-center text-[#475569] hover:text-[#111827] hover:bg-[#E2E8F0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-kb-primary focus-visible:z-10 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-transparent hover:disabled:text-[#475569]"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] min-h-[44px] px-3 text-xs font-medium gap-1.5 focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Order Summary Sidebar */}
          <aside aria-label="Order summary" className="lg:col-span-1">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <h2 className="font-['Outfit'] text-xl font-bold text-[#111827] mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-[#475569]">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-['Outfit'] font-semibold text-[#111827]">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#475569]">
                  <span>Shipping & freight</span>
                  <span className="font-medium text-[#1E293B]">Confirmed upon order</span>
                </div>
                <div className="flex justify-between items-center text-[#475569]">
                  <span>Taxes & GST</span>
                  <span className="font-medium text-[#1E293B]">Calculated on invoice</span>
                </div>

                <div className="h-px bg-[#E2E8F0] my-4" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-['Outfit'] text-base font-bold text-[#111827]">
                    Estimated Total
                  </span>
                  <span className="font-['Outfit'] text-2xl font-bold text-[#111827]">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Functional emphasis note */}
              <div className="mt-4 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs text-[#92400E] leading-relaxed">
                Prices shown in INR. Final freight, taxes, and lead times are verified on server order creation.
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  variant="secondary"
                  size="lg"
                  className="w-full text-base font-bold flex items-center justify-center gap-2 bg-kb-primary hover:bg-[#145e2e] text-white focus-visible:ring-2 focus-visible:ring-kb-primary focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : user ? (
                    <>
                      Place Direct Order
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      Sign In to Place Order
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => onNavigate('bulk-enquiry')}
                  variant="outline"
                  size="default"
                  className="w-full text-sm font-medium"
                >
                  Request Bulk Quote
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
