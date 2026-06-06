export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-cream/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-serif text-xl font-semibold text-gradient-gold mb-1">FreeReach</p>
          <p className="text-cream-dim/60 text-xs font-sans">Find your first buyers — for free.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-cream-dim/40 font-sans">
          <a href="#tool" className="hover:text-cream-dim transition-colors">Tool</a>
          <a href="#pricing" className="hover:text-cream-dim transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-cream-dim transition-colors">FAQ</a>
          <span>·</span>
          <span>© 2024 FreeReach</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-cream-dim/30 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          All systems operational
        </div>
      </div>
    </footer>
  )
}
