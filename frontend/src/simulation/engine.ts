import type { AgvData, SuperAgvData, AnyAgv, AgvState } from './types';

const COLUMNS = 12;
const ROWS = 8;

export function getTileDimensions(canvasWidth: number, canvasHeight: number) {
  return {
    tileWidth: Math.round(canvasWidth / COLUMNS),
    tileHeight: Math.round(canvasHeight / ROWS),
    columns: COLUMNS,
    rows: ROWS,
  };
}

function getFont(tileWidth: number, ratio: number): string {
  const size = tileWidth * ratio;
  return `${Math.floor(size)}px system-ui, sans-serif`;
}

export function createAgv(
  id: number,
  gridX: number,
  gridY: number,
  tileWidth: number,
  tileHeight: number,
  state: AgvState = 'AVAILABLE'
): AgvData {
  const x = gridX * tileWidth;
  const y = gridY * tileHeight;
  return {
    id,
    x,
    y,
    state,
    color: state === 'UNAVAILABLE' ? '#ef4444' : '#10b981',
    hover: false,
    selected: false,
    destination: { x, y },
    isSuper: false,
    tileWidth,
    tileHeight,
  };
}

export function createSuperAgv(
  id: number,
  agv1: AgvData,
  agv2: AgvData
): SuperAgvData {
  const first = agv1.x < agv2.x || agv1.y < agv2.y ? agv1 : agv2;
  const second = first === agv1 ? agv2 : agv1;
  const tw = agv1.x !== agv2.x ? 2 * agv1.tileWidth : agv1.tileWidth;
  const th = agv1.x !== agv2.x ? agv1.tileHeight : 2 * agv1.tileHeight;
  return {
    id,
    x: first.x,
    y: first.y,
    x2: second.x,
    y2: second.y,
    agv1Id: first.id,
    agv2Id: second.id,
    state: 'AVAILABLE',
    color: '#10b981',
    hover: false,
    selected: false,
    destination: { x: first.x, y: first.y },
    isSuper: true,
    tileWidth: tw,
    tileHeight: th,
  };
}

export function splitSuperAgv(
  sagv: SuperAgvData,
  baseTileW: number,
  baseTileH: number
): [AgvData, AgvData] {
  const a1 = createAgv(sagv.agv1Id, sagv.x / baseTileW, sagv.y / baseTileH, baseTileW, baseTileH, sagv.state);
  const a2 = createAgv(sagv.agv2Id, sagv.x2 / baseTileW, sagv.y2 / baseTileH, baseTileW, baseTileH, sagv.state);
  return [a1, a2];
}

export function checkNeighbors(
  agv: AnyAgv,
  agvs: AnyAgv[],
  tileWidth: number,
  tileHeight: number
): AgvData | null {
  for (const other of agvs) {
    if (other === agv) continue;
    const dx = Math.abs(other.x - agv.x);
    const dy = Math.abs(other.y - agv.y);
    const isNeighbor =
      (dx === tileWidth && other.y === agv.y) ||
      (dy === tileHeight && other.x === agv.x);
    if (
      isNeighbor &&
      !other.isSuper &&
      !agv.isSuper &&
      agv.state !== 'UNAVAILABLE' &&
      other.state !== 'UNAVAILABLE'
    ) {
      return other as AgvData;
    }
  }
  return null;
}

export function updateAgv(
  agv: AgvData,
  _tileWidth: number,
  _tileHeight: number
): AgvData {
  if (agv.state === 'UNAVAILABLE') {
    return { ...agv, color: '#ef4444', state: 'UNAVAILABLE' };
  }
  const dx = agv.destination.x - agv.x;
  const dy = agv.destination.y - agv.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    return {
      ...agv,
      color: '#10b981',
      state: 'AVAILABLE',
      x: agv.destination.x,
      y: agv.destination.y,
    };
  }
  const angle = Math.atan2(dy, dx);
  return {
    ...agv,
    color: '#f59e0b',
    state: 'IN USE',
    x: agv.x + Math.cos(angle) * 2,
    y: agv.y + Math.sin(angle) * 2,
  };
}

export function updateSuperAgv(agv: SuperAgvData): SuperAgvData {
  if (agv.state === 'UNAVAILABLE') {
    return { ...agv, color: '#ef4444', state: 'UNAVAILABLE' };
  }
  const dx = agv.destination.x - agv.x;
  const dy = agv.destination.y - agv.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    const x2 =
      Math.abs(agv.x2 - agv.destination.x) > 1
        ? agv.destination.x + Math.sign(agv.x2 - agv.x) * agv.tileWidth
        : agv.destination.x;
    const y2 =
      Math.abs(agv.y2 - agv.destination.y) > 1
        ? agv.destination.y + Math.sign(agv.y2 - agv.y) * agv.tileHeight
        : agv.destination.y;
    return {
      ...agv,
      color: '#10b981',
      state: 'AVAILABLE',
      x: agv.destination.x,
      y: agv.destination.y,
      x2,
      y2,
    };
  }
  const angle = Math.atan2(dy, dx);
  const vx = Math.cos(angle) * 2;
  const vy = Math.sin(angle) * 2;
  return {
    ...agv,
    color: '#f59e0b',
    state: 'IN USE',
    x: agv.x + vx,
    y: agv.y + vy,
    x2: agv.x2 + vx,
    y2: agv.y2 + vy,
  };
}

// ─── Drawing ────────────────────────────────────────────────────────────────

function drawGrid(
  c: CanvasRenderingContext2D,
  width: number,
  height: number,
  tileWidth: number,
  tileHeight: number
) {
  c.save();
  c.strokeStyle = 'rgba(99,118,160,0.25)';
  c.lineWidth = 1;
  // border
  c.strokeStyle = 'rgba(99,118,160,0.5)';
  c.strokeRect(0, 0, width, height);
  c.strokeStyle = 'rgba(99,118,160,0.2)';
  for (let i = 1; i <= COLUMNS; i++) {
    c.beginPath();
    c.moveTo(tileWidth * i, 0);
    c.lineTo(tileWidth * i, height);
    c.stroke();
  }
  for (let i = 1; i <= ROWS; i++) {
    c.beginPath();
    c.moveTo(0, tileHeight * i);
    c.lineTo(width, tileHeight * i);
    c.stroke();
  }
  c.restore();
}

function drawDestinationMarker(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  w: number,
  h: number,
  tileWidth: number,
  tileHeight: number
) {
  if (x == null || y == null) return;
  c.save();
  c.lineWidth = tileWidth / 20;
  c.strokeStyle = color;
  c.shadowColor = color;
  c.shadowBlur = 20;
  c.strokeRect(
    x + tileWidth / 40,
    y + tileWidth / 40,
    w - tileWidth / 20,
    h - tileWidth / 20
  );
  c.shadowBlur = 0;
  c.font = getFont(tileWidth, 0.18);
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(`(${Math.round(x / tileWidth)},${Math.round(y / tileHeight)})`, x + w / 2, y + h / 2);
  c.restore();
}

function drawAgvTile(
  c: CanvasRenderingContext2D,
  agv: AgvData | SuperAgvData,
  tileWidth: number
) {
  const { x, y, color, hover, selected, tileWidth: tw, tileHeight: th } = agv;
  c.save();
  if (hover || selected) {
    c.shadowColor = color;
    c.shadowBlur = 18;
  }
  c.fillStyle = color;
  c.strokeStyle = color;
  c.lineJoin = 'round';
  c.lineWidth = tw / 5;
  const pad = tw / 10;
  const rounding = 6;
  // Rounded rect
  const rx = x + pad;
  const ry = y + pad;
  const rw = tw - pad * 2;
  const rh = th - pad * 2;
  c.beginPath();
  c.roundRect(rx, ry, rw, rh, rounding);
  c.fill();
  c.restore();

  // Label
  c.save();
  c.font = getFont(tileWidth, 0.2);
  c.fillStyle = '#ffffff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const label = agv.isSuper
    ? `AGV${(agv as SuperAgvData).agv1Id}+${(agv as SuperAgvData).agv2Id}`
    : `AGV${agv.id}`;
  c.fillText(label, x + tw / 2, y + th / 2 - 8);
  c.font = getFont(tileWidth, 0.13);
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.fillText(agv.state, x + tw / 2, y + th / 2 + 10);
  c.restore();
}

export function renderFrame(
  c: CanvasRenderingContext2D,
  width: number,
  height: number,
  tileWidth: number,
  tileHeight: number,
  agvs: AnyAgv[],
  hoverX: number | null,
  hoverY: number | null,
  hoverColor: string | null,
  hoverTileW: number,
  hoverTileH: number
) {
  c.clearRect(0, 0, width, height);
  drawGrid(c, width, height, tileWidth, tileHeight);

  for (const agv of agvs) {
    // Draw destination marker while moving
    if (agv.state === 'IN USE') {
      drawDestinationMarker(
        c,
        agv.destination.x,
        agv.destination.y,
        '#3b82f6',
        agv.tileWidth,
        agv.tileHeight,
        tileWidth,
        tileHeight
      );
    }
    drawAgvTile(c, agv, tileWidth);
  }

  // Hover preview
  if (hoverX !== null && hoverY !== null && hoverColor) {
    drawDestinationMarker(c, hoverX, hoverY, hoverColor, hoverTileW, hoverTileH, tileWidth, tileHeight);
  }
}
