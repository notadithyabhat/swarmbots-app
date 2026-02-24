const LEGEND = [
  { color: '#10b981', label: 'Available' },
  { color: '#f59e0b', label: 'In Use' },
  { color: '#ef4444', label: 'Unavailable' },
  { color: '#3b82f6', label: 'Destination' },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {LEGEND.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm inline-block flex-shrink-0"
            style={{ background: color }}
          />
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
