import type { HoverInfo } from '../simulation/types';

interface Props {
  info: HoverInfo | null;
  canvasRect: DOMRect | null;
  tileWidth: number;
  tileHeight: number;
}

export default function InfoPanel({ info, canvasRect, tileWidth, tileHeight }: Props) {
  if (!info || !canvasRect) return null;
  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        left: canvasRect.left + info.x + tileWidth + 8,
        top: canvasRect.top + info.y + tileHeight,
      }}
    >
      <div
        className="rounded-xl px-3 py-2 text-xs text-gray-200 shadow-xl border border-white/10"
        style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <p className="font-semibold text-blue-400">AGV {info.agvId}</p>
        <p>X: {info.gridX}</p>
        <p>Y: {info.gridY}</p>
      </div>
    </div>
  );
}
