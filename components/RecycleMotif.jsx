"use client";
export default function RecycleMotif({ size = 300, className = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const arcR = size * 0.28;
  const outerR = size * 0.44;

  const arrows = [0, 120, 240].map(offset => {
    const startDeg = offset + 10;
    const endDeg = offset + 105;
    const toRad = d => (d * Math.PI) / 180;
    const x1 = cx + arcR * Math.cos(toRad(startDeg));
    const y1 = cy + arcR * Math.sin(toRad(startDeg));
    const x2 = cx + arcR * Math.cos(toRad(endDeg));
    const y2 = cy + arcR * Math.sin(toRad(endDeg));
    const arrowAngle = toRad(endDeg + 90);
    const tip = { x: x2 + 11 * Math.cos(arrowAngle), y: y2 + 11 * Math.sin(arrowAngle) };
    const l = { x: x2 + 7 * Math.cos(arrowAngle - 0.55), y: y2 + 7 * Math.sin(arrowAngle - 0.55) };
    const r = { x: x2 + 7 * Math.cos(arrowAngle + 0.55), y: y2 + 7 * Math.sin(arrowAngle + 0.55) };
    return { x1, y1, x2, y2, tip, l, r, arcR };
  });

  const dots = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
    const r = (deg * Math.PI) / 180;
    return { x: cx + outerR * Math.cos(r), y: cy + outerR * Math.sin(r) };
  });

  const circuitLines = [30, 90, 150, 210, 270, 330].map(deg => {
    const r = (deg * Math.PI) / 180;
    return {
      x1: cx + (arcR + 20) * Math.cos(r), y1: cy + (arcR + 20) * Math.sin(r),
      x2: cx + outerR * 0.9 * Math.cos(r), y2: cy + outerR * 0.9 * Math.sin(r),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      {/* Outer circuit dots */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={3.5} fill="#2FC7A8" opacity={0.45} />
      ))}
      {/* Circuit lines */}
      {circuitLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#2FC7A8" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.35} />
      ))}
      {/* Tick marks */}
      {[15, 75, 135, 195, 255, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x1 = cx + (outerR - 6) * Math.cos(r);
        const y1 = cy + (outerR - 6) * Math.sin(r);
        const x2 = cx + (outerR + 2) * Math.cos(r);
        const y2 = cy + (outerR + 2) * Math.sin(r);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2FC7A8" strokeWidth={2} opacity={0.3} />;
      })}
      {/* Three recycling arcs */}
      {arrows.map((a, i) => (
        <g key={i}>
          <path
            d={`M ${a.x1} ${a.y1} A ${arcR} ${arcR} 0 0 1 ${a.x2} ${a.y2}`}
            fill="none" stroke="#2FC7A8" strokeWidth={6} strokeLinecap="round"
          />
          <polygon points={`${a.tip.x},${a.tip.y} ${a.l.x},${a.l.y} ${a.r.x},${a.r.y}`} fill="#2FC7A8" />
        </g>
      ))}
      {/* Center chip */}
      <rect x={cx - 24} y={cy - 24} width={48} height={48} rx={7} fill="#143C3D" />
      <rect x={cx - 16} y={cy - 16} width={32} height={32} rx={4} fill="#2FC7A8" opacity={0.12} />
      {/* Chip pins */}
      {[-8, 0, 8].map((d, i) => (
        <g key={i}>
          <line x1={cx - 24} y1={cy + d} x2={cx - 30} y2={cy + d} stroke="#2FC7A8" strokeWidth={2.5} />
          <line x1={cx + 24} y1={cy + d} x2={cx + 30} y2={cy + d} stroke="#2FC7A8" strokeWidth={2.5} />
          <line x1={cx + d} y1={cy - 24} x2={cx + d} y2={cy - 30} stroke="#2FC7A8" strokeWidth={2.5} />
          <line x1={cx + d} y1={cy + 24} x2={cx + d} y2={cy + 30} stroke="#2FC7A8" strokeWidth={2.5} />
        </g>
      ))}
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#2FC7A8"
        fontSize={10} fontWeight="800" fontFamily="Inter, system-ui, sans-serif">IQ</text>
    </svg>
  );
}
