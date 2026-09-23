import { useState } from 'react';
import { 
  NotebookPen, 
  Send,
  CheckCircle,
  Building2,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import type { Page } from '../App';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api-client';

interface BulkEnquiryPageProps {
  onNavigate: (page: Page) => void;
}

export default function BulkEnquiryPage({ onNavigate }: BulkEnquiryPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      await apiClient('/v1/enquiries', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          city: formData.city,
          message: formData.requirements,
          type: 'bulk'
        }),
      });
      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      {/* BREADCRUMB */}
      <div className="container mx-auto px-6 md:px-[80px] pt-12 md:pt-20 pb-6">
        <nav className="flex items-center gap-2 text-[13px] text-[#64748B] font-medium font-['DM_Sans']">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('home')} 
            className="h-auto p-0 text-[13px] font-medium text-[#64748B] hover:text-kb-primary hover:bg-transparent"
          >
            Home
          </Button>
          <span className="opacity-40">/</span>
          <span className="text-[#111827]">Bulk Enquiry</span>
        </nav>
      </div>

      {/* HEADER SECTION */}
      <section className="container mx-auto px-6 md:px-[80px] pb-12 md:pb-20">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-[#F0FDF4] text-kb-primary text-[11px] font-bold uppercase tracking-widest rounded-full mb-4 font-['Outfit']">
            B2B Solutions
          </span>
          <h1 className="text-[40px] md:text-[52px] font-bold text-[#111827] mb-4 font-['Outfit'] leading-tight">
            Get Quote / Bulk Enquiry
          </h1>
          <p className="text-[18px] text-[#475569] leading-relaxed font-['DM_Sans'] max-w-2xl">
            Streamline your commercial kitchen with our expert solutions. Tell us your requirements and get a customized quote within 24 hours.
          </p>
        </div>
      </section>

      {/* CONTENT AREA */}
      <section className="container mx-auto px-6 md:px-[80px] py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* LEFT: Info & Benefits */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                src="/images/redesign/bulk-enquiry-hero.png" 
                alt="Bulk Kitchen Equipment" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-10">
                <div className="flex items-center gap-3 text-white mb-2">
                  <Building2 size={24} />
                  <span className="text-[20px] font-bold font-['Outfit']">Enterprise Ready</span>
                </div>
                <p className="text-white/80 text-[15px] font-['DM_Sans']">
                  Supporting hotels, restaurants, and cloud kitchens across India with smart automation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-[#F1F5F9] shadow-sm">
                <div className="w-10 h-10 bg-[#FFF7EC] rounded-xl flex items-center justify-center mb-4 text-kb-tertiary">
                  <MessageCircle size={20} />
                </div>
                <h4 className="font-bold text-[#111827] mb-1 font-['Outfit']">Expert Consult</h4>
                <p className="text-[13px] text-[#64748B] font-['DM_Sans']">Personalized kitchen planning support.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-[#F1F5F9] shadow-sm">
                <div className="w-10 h-10 bg-[#F0FDF4] rounded-xl flex items-center justify-center mb-4 text-kb-primary">
                  <CheckCircle size={20} />
                </div>
                <h4 className="font-bold text-[#111827] mb-1 font-['Outfit']">GST Invoicing</h4>
                <p className="text-[13px] text-[#64748B] font-['DM_Sans']">Fully compliant business documentation.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] p-8 md:p-12 border border-[#F1F5F9] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              {isSubmitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-kb-primary" size={40} />
                  </div>
                  <h3 className="text-[24px] font-bold text-[#111827] mb-3 font-['Outfit']">Enquiry Received!</h3>
                  <p className="text-[#64748B] font-['DM_Sans'] mb-8">We've received your enquiry and sent your requirements to our sales team. You'll hear from us shortly.</p>
                  <Button 
                    variant="link"
                    onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', phone: '', company: '', city: '', requirements: '' }); }}
                    className="text-kb-tertiary font-bold p-0"
                  >
                    Submit another enquiry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-kb-tertiary rounded-xl flex items-center justify-center text-white">
                      <NotebookPen size={20} />
                    </div>
                    <h3 className="text-[22px] font-bold text-[#111827] font-['Outfit']">Submit Requirements</h3>
                  </div>

                  {errorMessage && (
                    <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">Full Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rahul Sharma" 
                          required
                          className="w-full h-[52px] px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans']"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">Email Address *</label>
                        <input 
                          type="email" 
                          placeholder="rahul@hotel.com" 
                          required
                          className="w-full h-[52px] px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans']"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="+91 XXXXX XXXXX" 
                          className="w-full h-[52px] px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans']"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">Company Name</label>
                        <input 
                          type="text" 
                          placeholder="Restaurant or Hotel name" 
                          className="w-full h-[52px] px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans']"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">City / Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mumbai, Maharashtra" 
                        className="w-full h-[52px] px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans']"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-[#475569] ml-1 font-['Outfit']">Specific Requirements *</label>
                      <textarea 
                        required
                        placeholder="Mention products, quantities, and custom specifications..."
                        className="w-full h-[140px] p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--kb-primary)]/20 focus:border-kb-primary transition-all font-['DM_Sans'] resize-none"
                        value={formData.requirements}
                        onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      variant="accent"
                      size="lg"
                      className="w-full h-[60px] gap-3"
                    >
                      <Send size={20} />
                      {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                    </Button>
                    
                    <p className="text-center text-[13px] text-[#94A3B8] font-['DM_Sans']">
                      By submitting, you agree to our <Button type="button" variant="link" className="p-0 h-auto text-[13px] text-[#94A3B8] hover:text-[#475569] underline">Privacy Policy</Button>.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
