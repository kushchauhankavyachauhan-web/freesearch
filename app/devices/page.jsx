"use client";
import Link from 'next/link';
import { useStore } from '../../lib/store.js';
import { StatusBadge, HazardBadge, Card, EmptyState, SectionHeader, MintButton } from '../../components/ui.jsx';
import { getStatus } from '../../lib/scanner.js';

export default function DevicesPage() {
  const { state, markForDisposal } = useStore();
  const { scannedDevices } = state;

  if (!scannedDevices.length) {
    return (
      <div className="min-h-screen bg-bg py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader label="My Devices" title="Tracked Devices" sub="Devices you've scanned appear here." />
          <EmptyState
            icon="📱"
            title="No devices scanned yet"
            sub="Scan your first device to start tracking its lifecycle."
            action={<Link href="/scan"><MintButton>Scan a Device →</MintButton></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader label="My Devices" title={`${scannedDevices.length} Tracked Device${scannedDevices.length !== 1 ? 's' : ''}`} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scannedDevices.map(device => {
            const status = getStatus(device.predictedLifespanMonthsRemaining);
            const usable = device.components.filter(c => c.usable).length;
            const total = device.components.length;
            return (
              <Card key={device.scanId} className="p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-xl">📱</div>
                  <StatusBadge status={status} />
                </div>
                <div className="text-xs text-navy/45 font-semibold mb-1">{device.category} · {device.brandName}</div>
                <h3 className="font-bold text-navy text-base leading-snug mb-3">{device.deviceName}</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-bg rounded-lg p-2">
                    <div className="text-xs text-navy/45">Months Left</div>
                    <div className="font-bold text-navy">{device.predictedLifespanMonthsRemaining}m</div>
                  </div>
                  <div className="bg-bg rounded-lg p-2">
                    <div className="text-xs text-navy/45">Components</div>
                    <div className="font-bold text-navy">{usable}/{total} usable</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <HazardBadge level={device.hazardLevel} />
                  <span className="text-xs text-navy/35">{new Date(device.scannedAt).toLocaleDateString('en-IN')}</span>
                </div>
                {/* Lifespan mini-bar */}
                <div className="mt-4 h-1.5 bg-navy/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${status === 'Healthy' ? 'bg-green-400' : status === 'Aging' ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (device.predictedLifespanMonthsRemaining / 48) * 100)}%` }} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/scan"><MintButton>+ Scan Another Device</MintButton></Link>
        </div>
      </div>
    </div>
  );
}
