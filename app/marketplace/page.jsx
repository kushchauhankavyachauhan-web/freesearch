"use client";
import Link from 'next/link';
import { useStore } from '../../lib/store.js';
import { Card, EmptyState, SectionHeader, MintButton, PointsChip } from '../../components/ui.jsx';

export default function MarketplacePage() {
  const { state } = useStore();
  const { marketplaceListings } = state;

  if (!marketplaceListings.length) {
    return (
      <div className="min-h-screen bg-bg py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader label="Layer 3" title="Marketplace Listings" sub="Usable components listed for resale appear here." />
          <EmptyState
            icon="🛒"
            title="No listings yet"
            sub="Scan a device and list its usable components for resale."
            action={<Link href="/scan"><MintButton>Scan a Device →</MintButton></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <SectionHeader label="Layer 3" title={`${marketplaceListings.length} Active Listing${marketplaceListings.length !== 1 ? 's' : ''}`} />
          <PointsChip pts={20} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {marketplaceListings.map(listing => (
            <Card key={listing.id} className="p-5 hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-xl">🔩</div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                  Active
                </span>
              </div>
              <div className="text-xs text-mint font-bold uppercase tracking-wider mb-1">{listing.category}</div>
              <h3 className="font-black text-navy text-lg mb-1">{listing.componentName}</h3>
              <p className="text-xs text-navy/50 mb-3">from {listing.deviceName}</p>
              <div className="bg-bg rounded-xl p-3 mb-4">
                <div className="text-xs text-navy/40 mb-0.5">Condition note</div>
                <p className="text-xs text-navy/70 leading-relaxed">{listing.reason}</p>
              </div>
              <div className="mt-auto">
                <div className="text-xs text-navy/40 mb-0.5">Estimated Value</div>
                <div className="font-black text-navy text-lg mb-3">{listing.estimatedValue}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy/35">{new Date(listing.listedAt).toLocaleDateString('en-IN')}</span>
                  <button className="text-xs bg-mint/10 text-mint px-3 py-1.5 rounded-lg font-bold hover:bg-mint hover:text-white transition-all">
                    Contact Buyer →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
