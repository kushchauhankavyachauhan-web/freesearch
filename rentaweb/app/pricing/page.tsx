import { CheckIcon } from "@/components/Icons";

const WA_NUMBER = "919311321008";

const plans = [
  {
    name: "Monthly",
    price: "₹1,500",
    period: "/month",
    badge: null,
    description: "Perfect to start. Pay monthly, cancel anytime.",
    features: [
      "Professional website for your business",
      "Mobile responsive design",
      "WhatsApp enquiry button",
      "Google Maps integration",
      "Contact & enquiry form",
      "1 round of content changes/month",
      "SSL certificate included",
      "Hosting included",
    ],
    cta: "Get Started",
    highlight: false,
    waMessage: "Hi, I want the Monthly plan at ₹1,500/month. Please share details.",
  },
  {
    name: "Yearly",
    price: "₹14,999",
    period: "/year",
    badge: "Save ₹3,001",
    description: "Our most popular plan. Pay once, save big.",
    features: [
      "Everything in Monthly",
      "2 rounds of content changes/month",
      "Priority support via WhatsApp",
      "SEO basic setup (meta tags)",
      "Google Analytics setup",
      "Social media links & icons",
      "Speed optimised build",
      "Free domain for 1 year",
    ],
    cta: "Get Best Value",
    highlight: true,
    waMessage: "Hi, I want the Yearly plan at ₹14,999/year. Please share details.",
  },
  {
    name: "Buy Outright",
    price: "₹24,999",
    period: "one time",
    badge: "Own it forever",
    description: "Own your website outright. No more monthly fees.",
    features: [
      "Everything in Yearly",
      "Full source code ownership",
      "Unlimited content changes (first month)",
      "Custom domain setup",
      "Advanced SEO setup",
      "Google Business Profile setup",
      "WhatsApp Business integration",
      "1-year free hosting included",
    ],
    cta: "Buy Now",
    highlight: false,
    waMessage: "Hi, I want to Buy Outright at ₹24,999. Please share details.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(79,110,247,0.2),transparent)]" />
        <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 bg-[#4F6EF7]/15 text-[#4F6EF7] text-xs font-semibold px-4 py-1.5 rounded-full border border-[#4F6EF7]/30">
            💸 Transparent Pricing — No Hidden Fees
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Simple, affordable<br />
            <span className="text-[#4F6EF7]">website pricing</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Choose the plan that fits your business. Rent monthly, pay yearly at a discount, or own it forever.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const msg = encodeURIComponent(plan.waMessage);
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 gap-6 transition ${
                  plan.highlight
                    ? "bg-[#4F6EF7]/10 border-[#4F6EF7] shadow-[0_0_60px_rgba(79,110,247,0.25)]"
                    : "bg-[#0D0D16] border-white/10 hover:border-[#4F6EF7]/40"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#4F6EF7] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl">{plan.name}</h2>
                    {plan.badge && !plan.highlight && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    {plan.badge && plan.highlight && (
                      <span className="bg-[#4F6EF7]/20 text-[#4F6EF7] text-xs font-semibold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-white font-extrabold text-4xl">{plan.price}</span>
                    <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckIcon className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-[#4F6EF7]" : "text-[#4F6EF7]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full font-semibold py-3.5 rounded-xl transition text-sm ${
                    plan.highlight
                      ? "bg-[#4F6EF7] hover:bg-[#3a58e0] text-white"
                      : "bg-[#25D366] hover:bg-[#1ebe5d] text-white"
                  }`}
                >
                  {!plan.highlight && <WhatsAppIcon />}
                  {plan.cta} on WhatsApp
                </a>
              </div>
            );
          })}
        </div>

        {/* Trust notes */}
        <div className="max-w-3xl mx-auto mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm">
            <span>✅ No setup fee</span>
            <span>✅ Cancel anytime (monthly plan)</span>
            <span>✅ Live in 48 hours</span>
            <span>✅ GST invoice provided</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Is there any setup fee?",
                a: "No. Zero setup fee. You pay only the plan price and we get to work immediately.",
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, anytime. Just WhatsApp us and we'll adjust your plan without any hassle.",
              },
              {
                q: "What is included in 'hosting'?",
                a: "We host your website on fast, reliable servers. All plans include hosting. No extra cost.",
              },
              {
                q: "What happens if I cancel?",
                a: "For monthly plans, cancel before the next billing cycle and you won't be charged. Your website stays live until the period ends.",
              },
              {
                q: "Can I use my own domain?",
                a: "Yes. Yearly and Buy Outright plans include custom domain setup. For Monthly, you can add your own domain for a small extra charge.",
              },
              {
                q: "How do I pay?",
                a: "We accept UPI, bank transfer, and all major payment methods. GST invoice is provided for all transactions.",
              },
            ].map(({ q, a }, i) => (
              <div key={i} className="bg-[#0D0D16] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <h3 className="text-white font-semibold">{q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <h2 className="text-3xl font-bold text-white">Still have questions?</h2>
          <p className="text-white/50">WhatsApp us directly — we reply within minutes during business hours.</p>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=Hi%2C%20I%20have%20a%20question%20about%20RentAWeb%20pricing`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 rounded-full transition shadow-[0_0_40px_rgba(37,211,102,0.25)]"
          >
            <WhatsAppIcon />
            Ask Us on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
