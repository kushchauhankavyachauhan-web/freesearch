export default function RecycleMotif({ size = 320, className = '' }) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const arcR = r * 0.6;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
    >
      {/* Outer circuit dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + (r * 0.88) * Math.cos(rad);
        const y = cy + (r * 0.88) * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r={3} fill="#2FC7A8" opacity={0.5} />;
      })}
      {/* Circuit lines connecting dots */}
      {[30, 90, 150, 210, 270, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + (r * 0.72) * Math.cos(rad);
        const y1 = cy + (r * 0.72) * Math.sin(rad);
        const x2 = cx + (r * 0.88) * Math.cos(rad);
        const y2 = cy + (r * 0.88) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#2FC7A8"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.4}
          />
        );
      })}

      {/* Three recycling arrows — each 120° apart */}
      {[0, 120, 240].map((offset, i) => {
        const startDeg = offset;
        const endDeg = offset + 100;
        const startRad = (startDeg * Math.PI) / 180;
        const endRad = (endDeg * Math.PI) / 180;
        const x1 = cx + arcR * Math.cos(startRad);
        const y1 = cy + arcR * Math.sin(startRad);
        const x2 = cx + arcR * Math.cos(endRad);
        const y2 = cy + arcR * Math.sin(endRad);
        // Arrowhead direction
        const arrowAngle = endRad + Math.PI / 2;
        const ax = x2 + 12 * Math.cos(arrowAngle);
        const ay = y2 + 12 * Math.sin(arrowAngle);
        const al = x2 + 8 * Math.cos(arrowAngle - 0.5);
        const am = y2 + 8 * Math.sin(arrowAngle - 0.5);
        const ar2 = x2 + 8 * Math.cos(arrowAngle + 0.5);
        const as2 = y2 + 8 * Math.sin(arrowAngle + 0.5);

        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="#2FC7A8"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <polygon
              points={`${ax},${ay} ${al},${am} ${ar2},${as2}`}
              fill="#2FC7A8"
            />
          </g>
        );
      })}

      {/* Center circuit board chip */}
      <rect x={cx - 22} y={cy - 22} width={44} height={44} rx={6} fill="#143C3D" />
      <rect x={cx - 14} y={cy - 14} width={28} height={28} rx={3} fill="#2FC7A8" opacity={0.15} />
      {/* chip pins */}
      {[-8, 0, 8].map((d, i) => (
        <g key={i}>
          <line x1={cx - 22} y1={cy + d} x2={cx - 28} y2={cy + d} stroke="#2FC7A8" strokeWidth={2} />
          <line x1={cx + 22} y1={cy + d} x2={cx + 28} y2={cy + d} stroke="#2FC7A8" strokeWidth={2} />
          <line x1={cx + d} y1={cy - 22} x2={cx + d} y2={cy - 28} stroke="#2FC7A8" strokeWidth={2} />
          <line x1={cx + d} y1={cy + 22} x2={cx + d} y2={cy + 28} stroke="#2FC7A8" strokeWidth={2} />
        </g>
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#2FC7A8" fontSize={10} fontWeight="700">IQ</text>
    </svg>
  );
}
