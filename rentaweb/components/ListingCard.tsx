import { CheckIcon } from "./Icons";

const WA_NUMBER = "919311321008";

interface ListingCardProps {
  category: string;
  description: string;
  features: string[];
  emoji: string;
  accent: string;
}

export default function ListingCard({ category, description, features, emoji, accent }: ListingCardProps) {
  const msg = encodeURIComponent(`Hi, I'm interested in a website for my ${category}. Please share details.`);

  return (
    <div className="group relative bg-[#0D0D16] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#4F6EF7]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,110,247,0.15)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accent}`}>
          {emoji}
        </div>
        <div>
          <h3 className="font-semibold text-white text-lg">{category} Website</h3>
          <p className="text-white/50 text-xs">Ready to deploy</p>
        </div>
      </div>

      <p className="text-white/60 text-sm leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-white/70">
            <CheckIcon className="w-4 h-4 text-[#4F6EF7] shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 border-t border-white/10">
        {/* Pricing */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-white/40 text-xs">Rent from</p>
            <p className="text-white font-bold text-xl">₹1,500<span className="text-white/40 text-sm font-normal">/mo</span></p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs">Buy outright</p>
            <p className="text-white font-bold text-xl">₹24,999</p>
          </div>
        </div>

        <a
          href={`https://wa.me/${WA_NUMBER}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          <WhatsAppIcon />
          Get This Website
        </a>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
