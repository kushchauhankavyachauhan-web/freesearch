"use client";
import { useStore } from '../../lib/store.js';
import { Card, SectionHeader } from '../../components/ui.jsx';

const MOCK_ENTRIES = [
  { name: 'Green Valley School', location: 'Pune, MH', points: 4820, badge: '🏆' },
  { name: 'Sunrise Society RWA', location: 'Bengaluru, KA', points: 3950, badge: '🥈' },
  { name: 'EcoTech Club IIT Delhi', location: 'Delhi, DL', points: 3210, badge: '🥉' },
  { name: 'Greenleaf Apartments', location: 'Mumbai, MH', points: 2780 },
  { name: 'Blue Hills Colony', location: 'Hyderabad, TS', points: 2340 },
  { name: 'Future Leaders School', location: 'Chennai, TN', points: 1980 },
  { name: 'EcoWarriors Club', location: 'Jaipur, RJ', points: 1740 },
  { name: 'Navi Mumbai RWA', location: 'Navi Mumbai, MH', points: 1520 },
  { name: 'Green Campus NGO', location: 'Ahmedabad, GJ', points: 1380 },
  { name: 'TechReuse Foundation', location: 'Kolkata, WB', points: 1120 },
  { name: 'Pearl City Eco Group', location: 'Visakhapatnam, AP', points: 980 },
  { name: 'Cyber City Recyclers', location: 'Gurugram, HR', points: 840 },
];

export default function LeaderboardPage() {
  const { state } = useStore();
  const { points } = state;

  const allEntries = [
    ...MOCK_ENTRIES,
    { name: 'You', location: 'Your City', points, isUser: true },
  ].sort((a, b) => b.points - a.points);

  const userRank = allEntries.findIndex(e => e.isUser) + 1;

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          label="Community"
          title="Leaderboard"
          sub="Top recyclers, schools, and housing societies ranked by ScrapDevIQ points."
        />

        {/* User rank highlight */}
        <Card className="p-5 mb-8 border-mint/30 bg-mint/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center text-white font-black text-2xl">
              #{userRank}
            </div>
            <div className="flex-1">
              <div className="text-xs text-mint font-bold uppercase tracking-wider mb-0.5">Your Rank</div>
              <div className="font-black text-navy text-xl">You</div>
              <div className="text-navy/50 text-sm">{points} points</div>
            </div>
            <div className="text-right">
              {points === 0 ? (
                <p className="text-xs text-navy/45">Scan devices to earn points!</p>
              ) : (
                <>
                  <div className="text-2xl font-black text-mint">{points}</div>
                  <div className="text-xs text-navy/45">pts total</div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Full table */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-navy/8">
            <h3 className="font-bold text-navy">All Rankings</h3>
          </div>
          <div className="divide-y divide-navy/5">
            {allEntries.map((entry, i) => {
              const rank = i + 1;
              const medals = { 1: '🏆', 2: '🥈', 3: '🥉' };
              return (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 transition-all ${
                  entry.isUser ? 'bg-mint/8 border-l-4 border-mint' : 'hover:bg-bg'
                }`}>
                  {/* Rank */}
                  <div className={`w-8 text-center font-black text-sm ${
                    rank <= 3 ? 'text-2xl' : 'text-navy/40'
                  }`}>
                    {medals[rank] || `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    entry.isUser ? 'bg-mint text-white' : 'bg-navy/10 text-navy'
                  }`}>
                    {entry.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${entry.isUser ? 'text-mint' : 'text-navy'}`}>
                      {entry.name} {entry.isUser && '← You'}
                    </div>
                    <div className="text-xs text-navy/45">{entry.location}</div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className={`font-black text-lg ${entry.isUser ? 'text-mint' : 'text-navy'}`}>
                      {entry.points.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-navy/35">pts</div>
                  </div>

                  {/* Bar */}
                  <div className="w-24 hidden md:block">
                    <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${entry.isUser ? 'bg-mint' : 'bg-navy/30'}`}
                        style={{ width: `${(entry.points / allEntries[0].points) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="mt-6 p-4 bg-mint/5 border border-mint/20 rounded-xl text-center">
          <p className="text-sm text-navy/60">
            Earn <strong className="text-navy">10 pts</strong> per scan ·
            <strong className="text-navy"> 20 pts</strong> per listing ·
            <strong className="text-navy"> 30 pts</strong> per recycling record
          </p>
        </div>
      </div>
    </div>
  );
}
