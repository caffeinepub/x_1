interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

export default function Sparkline({
  data,
  color,
  height = 40,
  width = 120,
}: SparklineProps) {
  if (data.length < 2) {
    return (
      <div style={{ width, height }} className="flex items-end">
        <div
          className="w-full h-0.5 rounded"
          style={{ backgroundColor: color, opacity: 0.4 }}
        />
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const w = width;
  const h = height;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
    >
      <title>Sparkline chart</title>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
