import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api-client';

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  {
    icon: MapPin,
    title: 'Manufacturing Unit',
    details: ['Plot No. 45, Industrial Estate', 'Cherlapally, Hyderabad', 'Telangana 500051'],
    href: null,
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 94907 01421'],
    href: 'tel:+919490701421',
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['kitchenbots.sales@gmail.com'],
    href: 'mailto:kitchenbots.sales@gmail.com',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Monday – Saturday', '9:00 AM – 5:00 PM'],
    href: null,
  },
];

export default function ContactPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const elements = section.querySelectorAll('.animate-in');
      gsap.set(elements, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        onEnter: () => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
          });
        },
        once: true,
      });
    }, section);

    return () => ctx.revert();
  }, []);

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
          message: formData.message,
          type: 'quote'
        }),
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', city: '', message: '' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section ref={sectionRef} className="pt-20 bg-[#FAFAFA] min-h-screen">
      <div className="container mx-auto px-6 md:px-[80px] py-12 md:py-20">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="animate-in max-w-2xl mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.1em] text-kb-primary uppercase mb-4 font-['Outfit']">
            Request a Quote
          </span>
          <h1 className="text-[40px] md:text-[48px] font-bold font-['Outfit'] text-[#111827] mb-4 leading-tight">
            Get Quote / Bulk Enquiry
          </h1>
          <p className="text-[18px] font-bold text-[#111827] mb-3 font-['Outfit']">
            Request a Quote or Submit Your Bulk Enquiry
          </p>
          <p className="text-[15px] text-[#6B7280] leading-relaxed font-['DM_Sans']">
            Tell us your requirements — products, quantities, and delivery city. Our team will respond within 24 hours to provide a customized solution.
          </p>
        </div>

        {/* ── Layout: Form + Sidebar ────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Contact Info (sidebar) */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const content = (
                <div
                  className="animate-in p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-kb-primary transition-all duration-300 group shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-kb-primary transition-colors duration-300">
                    <Icon className="w-6 h-6 text-kb-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-[16px] font-bold font-['Outfit'] text-[#111827] mb-1.5">{info.title}</h3>
                  {info.details.map((d, i) => (
                    <p key={i} className="text-[14px] text-[#6B7280] font-['DM_Sans']">{d}</p>
                  ))}
                </div>
              );

              return info.href ? (
                <a key={index} href={info.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={index}>{content}</div>
              );
            })}

            {/* WhatsApp Card */}
            <a
              href="https://wa.me/919490701421"
              target="_blank"
              rel="noopener noreferrer"
              className="animate-in flex flex-col gap-2 p-5 bg-[#25D366] text-white rounded-2xl hover:bg-[#128C7E] transition-all duration-300 group shadow-lg shadow-[#25D366]/20"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold font-['Outfit']">Prefer WhatsApp?</h3>
              <p className="text-sm text-white/80" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Chat directly → wa.me/919490701421
              </p>
              <span className="mt-1 text-sm font-bold underline" style={{ fontFamily: 'DM Sans, sans-serif' }}>Chat with us →</span>
            </a>
          </div>

          {/* Form */}
          <div className="animate-in lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-[#E0EAE0] rounded-3xl p-8 md:p-10">
              {isSubmitted ? (
                /* ── Success State ─────────────────────────────── */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[var(--brand-300)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[var(--kb-primary)]" />
                  </div>
                  <h3 className="text-2xl font-bold font-['Outfit'] text-[#4A4A4A] mb-3">
                    Thank You!
                  </h3>
                  <p className="text-[#4A4A4A]/70 text-lg">
                    We'll contact you at your phone/email within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="ghost"
                    size="sm"
                    className="mt-6 text-kb-primary underline hover:no-underline font-normal"
                  >
                    Submit another enquiry
                  </Button>
                </div>
              ) : (
                /* ── Form ──────────────────────────────────────── */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2 font-['DM_Sans']">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 1: Name + Email */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                        Name <span className="text-[var(--brand-600)]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                        Email <span className="text-[var(--brand-600)]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone + Company */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                        Phone
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E0EAE0] bg-[#F7FAF7] text-[#4A4A4A]/60 text-sm select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="flex-1 px-4 py-3 rounded-r-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all"
                          placeholder="9490701421"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                        Company Name <span className="text-[#4A4A4A]/40 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all"
                        placeholder="Restaurant / Hotel / Trade name"
                      />
                    </div>
                  </div>

                  {/* Row 3: City */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all"
                      placeholder="e.g. Mumbai, Hyderabad, Delhi"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                      Requirements <span className="text-[var(--brand-600)]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-[#E0EAE0] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]/50 focus:border-[var(--brand-300)] transition-all resize-none"
                      placeholder="E.g. 10 units BBQ Grill Commercial Grade, delivery to Mumbai, need GST invoice"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? 'Sending…' : 'Submit Enquiry'}
                    <Send className="w-4 h-4 text-white" />
                  </Button>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#E0EAE0]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-white px-3 text-[#4A4A4A]/40">or</span>
                    </div>
                  </div>

                  {/* WhatsApp alternative */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-[#25D366]/20"
                  >
                    <a
                      href="https://wa.me/919490701421"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Prefer WhatsApp? Chat with us →
                    </a>
                  </Button>
                  <p className="text-xs text-center text-[#4A4A4A]/40 mt-1">
                    Fastest response via WhatsApp · wa.me/919490701421
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
