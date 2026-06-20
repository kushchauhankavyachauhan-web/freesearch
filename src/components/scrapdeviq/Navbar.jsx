import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/scan', label: 'Predictive Scan' },
  { to: '/resale', label: 'Resale Matcher' },
  { to: '/impact', label: 'Impact Dashboard' },
  { to: '/proof', label: 'Proof of Disposal' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-navy/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 select-none">
          <span className="text-xl font-black tracking-tight text-navy">SCRAP</span>
          <span className="text-xl font-black tracking-tight text-mint">DEVIQ</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === l.to
                  ? 'bg-mint text-white'
                  : 'text-navy hover:bg-mint/10 hover:text-mint'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to="/scan"
          className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
