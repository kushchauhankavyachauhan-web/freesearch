"use client";
import { useState } from "react";
import ListingCard from "@/components/ListingCard";

const WA_NUMBER = "919311321008";

const listings = [
  {
    category: "Gym",
    emoji: "🏋️",
    accent: "bg-orange-500/20",
    description: "A high-energy fitness website to attract members, showcase schedules, and drive sign-ups online.",
    features: [
      "Membership enquiry form",
      "Class schedule & timetable",
      "Trainer profiles",
      "Google Maps integration",
      "WhatsApp enquiry button",
      "Mobile responsive",
    ],
  },
  {
    category: "Salon",
    emoji: "💇",
    accent: "bg-pink-500/20",
    description: "Elegant salon website to showcase your services, book appointments, and grow your clientele.",
    features: [
      "Service menu with prices",
      "Appointment booking form",
      "Before & after gallery",
      "Staff showcase",
      "WhatsApp booking button",
      "Instagram feed integration",
    ],
  },
  {
    category: "Tuition",
    emoji: "📚",
    accent: "bg-blue-500/20",
    description: "Professional website for coaching centres and tutors to attract students and build credibility.",
    features: [
      "Course listing page",
      "Student testimonials",
      "Faculty profiles",
      "Batch schedule",
      "Online enquiry form",
      "WhatsApp admission button",
    ],
  },
  {
    category: "Store",
    emoji: "🛍️",
    accent: "bg-yellow-500/20",
    description: "Showcase your products, share your story, and bring local customers online with ease.",
    features: [
      "Product catalogue",
      "WhatsApp order button",
      "Location & hours",
      "Offer & deals banner",
      "Customer reviews section",
      "Google Maps integration",
    ],
  },
  {
    category: "Clinic",
    emoji: "🏥",
    accent: "bg-green-500/20",
    description: "Trust-building medical website for doctors and clinics to attract patients and share information.",
    features: [
      "Doctor profiles",
      "Speciality listings",
      "Appointment form",
      "Working hours display",
      "Emergency contact banner",
      "Google Maps integration",
    ],
  },
  {
    category: "Restaurant",
    emoji: "🍽️",
    accent: "bg-red-500/20",
    description: "Mouth-watering restaurant website to showcase your menu, ambiance, and take reservations online.",
    features: [
      "Digital menu with prices",
      "Table reservation form",
      "Photo gallery / ambiance",
      "Location & timing",
      "WhatsApp order button",
      "Customer reviews section",
    ],
  },
  {
    category: "Bakery",
    emoji: "🎂",
    accent: "bg-pink-500/20",
    description: "Beautiful bakery website with full menu, custom cake orders, specials section, timings and WhatsApp ordering.",
    features: [
      "Full Menu",
      "Custom Cakes",
      "Weekly Specials",
      "WhatsApp Orders",
    ],
  },
  {
    category: "Company",
    emoji: "🏢",
    accent: "bg-blue-500/20",
    description: "Professional corporate website with services, team, testimonials, how we work section and contact form.",
    features: [
      "Services Grid",
      "Team Section",
      "Testimonials",
      "Contact Form",
    ],
  },
  {
    category: "Cafe",
    emoji: "☕",
    accent: "bg-yellow-700/20",
    description: "Cosy cafe website with coffee menu, food items, cafe vibe section, timings and Instagram link.",
    features: [
      "Coffee Menu",
      "Food Items",
      "WiFi Info",
      "Instagram Link",
    ],
  },
];

const categories = ["All", "Gym", "Salon", "Tuition", "Store", "Clinic", "Restaurant", "Bakery", "Company", "Cafe"];

const steps = [
  { num: "01", title: "Pick Your Category", desc: "Choose from Gym, Salon, Clinic, Store, Tuition, or Restaurant." },
  { num: "02", title: "WhatsApp Us", desc: "Send us a quick message. We'll confirm your details in minutes." },
  { num: "03", title: "We Customise", desc: "Our team sets up your logo, colours, content, and contact info." },
  { num: "04", title: "Go Live", desc: "Your professional website is live within 48 hours. Guaranteed." },
];

const whyUs = [
  { emoji: "⚡", title: "Live in 48 Hours", desc: "No waiting weeks. Your website goes live within 2 business days." },
  { emoji: "🇮🇳", title: "Made for India", desc: "Built for Indian SMBs — Hindi support, UPI, WhatsApp-first design." },
  { emoji: "💰", title: "Affordable Plans", desc: "Starting at just ₹1,500/month. No hidden charges or setup fees." },
  { emoji: "📱", title: "Mobile First", desc: "80% of your customers are on mobile. We build for that." },
  { emoji: "🔧", title: "Zero Tech Skills Needed", desc: "We handle everything. You just provide your business info." },
  { emoji: "🔄", title: "Rent or Own", desc: "Rent monthly, pay yearly at a discount, or buy outright forever." },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? listings
    : listings.filter((l) => l.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,110,247,0.25),transparent)]" />
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 bg-[#4F6EF7]/15 text-[#4F6EF7] text-xs font-semibold px-4 py-1.5 rounded-full border border-[#4F6EF7]/30">
            🚀 India&apos;s #1 Website Rental Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
            Your business deserves<br />
            <span className="text-[#4F6EF7]">a real website.</span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl">
            Rent a professional website for your gym, salon, clinic, store, tuition centre or restaurant — starting at just ₹1,500/month. Live in 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=Hi%2C%20I%27d%20like%20to%20rent%20a%20website%20for%20my%20business`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#4F6EF7] hover:bg-[#3a58e0] text-white font-semibold px-8 py-3.5 rounded-full transition text-base"
            >
              Get Started — Free Consultation
            </a>
            <a
              href="#listings"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-full transition text-base border border-white/10"
            >
              Browse Websites ↓
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/40 text-sm">
            <span>✅ No setup fee</span>
            <span>✅ Cancel anytime</span>
            <span>✅ Live in 48 hours</span>
            <span>✅ 100% customised</span>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose Your Business Type</h2>
            <p className="text-white/50">All websites are fully customised for your brand and ready to convert visitors.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                  activeFilter === cat
                    ? "bg-[#4F6EF7] text-white"
                    : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard key={listing.category} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-white/50">From enquiry to live website in 4 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-[#0D0D16] border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[#4F6EF7] font-black text-4xl leading-none">{step.num}</span>
                <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/20 text-xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RentAWeb */}
      <section id="why-us" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why RentAWeb?</h2>
            <p className="text-white/50">We remove every barrier between your business and a professional online presence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <div key={i} className="bg-[#0D0D16] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#4F6EF7]/40 transition">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">RentAWeb vs. Alternatives</h2>
            <p className="text-white/50">See why hundreds of Indian businesses choose us.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-white/60 font-medium">Feature</th>
                  <th className="px-6 py-4 text-[#4F6EF7] font-bold">RentAWeb</th>
                  <th className="px-6 py-4 text-white/40 font-medium">Web Agency</th>
                  <th className="px-6 py-4 text-white/40 font-medium">DIY Builder</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cost", "₹1,500/mo", "₹30,000+ one-time", "₹800/mo + effort"],
                  ["Setup time", "48 hours", "4–8 weeks", "Weeks of your time"],
                  ["Tech skills needed", "None", "None", "Medium–High"],
                  ["Customised for you", "✅ Yes", "✅ Yes", "❌ You do it"],
                  ["WhatsApp integration", "✅ Built-in", "❌ Extra cost", "❌ Extra plugin"],
                  ["Mobile optimised", "✅ Always", "Sometimes", "Depends"],
                  ["Ongoing support", "✅ Included", "❌ Extra cost", "❌ Self-service"],
                  ["Cancel anytime", "✅ Yes", "❌ No refunds", "✅ Yes"],
                ].map(([feature, ours, agency, diy], i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="px-6 py-4 text-white/70">{feature}</td>
                    <td className="px-6 py-4 text-center text-white font-medium">{ours}</td>
                    <td className="px-6 py-4 text-center text-white/40">{agency}</td>
                    <td className="px-6 py-4 text-center text-white/40">{diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to go online?</h2>
          <p className="text-white/50 text-lg">WhatsApp us right now — free consultation and your website live in 48 hours.</p>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=Hi%2C%20I%27d%20like%20to%20rent%20a%20website%20for%20my%20business`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-10 py-4 rounded-full transition text-lg shadow-[0_0_40px_rgba(37,211,102,0.3)]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
