import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getTileDimensions,
  createAgv,
  createSuperAgv,
  splitSuperAgv,
  checkNeighbors,
  updateAgv,
  updateSuperAgv,
  renderFrame,
} from '../simulation/engine';
import type { AnyAgv, AgvData, SuperAgvData, ContextMenuState, HoverInfo } from '../simulation/types';
import ContextMenu from './ContextMenu';
import InfoPanel from './InfoPanel';

const CANVAS_W_RATIO = 1 / 1.05;
const CANVAS_H_RATIO = 0.68;

function initAgvs(tw: number, th: number): AnyAgv[] {
  return [
    createAgv(1, 2, 2, tw, th),
    createAgv(2, 3, 2, tw, th),
    createAgv(3, 2, 5, tw, th, 'UNAVAILABLE'),
    createAgv(4, 2, 7, tw, th),
  ];
}

export default function SimCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agvsRef = useRef<AnyAgv[]>([]);
  const rafRef = useRef<number>(0);
  const oneSelectedRef = useRef(false);
  const hoverRef = useRef<{ x: number | null; y: number | null; color: string | null; tw: number; th: number }>({
    x: null, y: null, color: null, tw: 0, th: 0,
  });
  const isOccupiedRef = useRef(false);

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const tileDimRef = useRef({ tileWidth: 0, tileHeight: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0,
    enableLabel: 'Disable', dockLabel: 'Dock', dockDisabled: false,
  });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Compute canvas size from window
  const computeSize = useCallback(() => {
    const w = Math.floor(window.innerWidth * CANVAS_W_RATIO);
    const h = Math.floor(window.innerHeight * CANVAS_H_RATIO);
    return { w, h };
  }, []);

  // Initialize
  useEffect(() => {
    const { w, h } = computeSize();
    setCanvasSize({ w, h });
    const { tileWidth, tileHeight } = getTileDimensions(w, h);
    tileDimRef.current = { tileWidth, tileHeight };
    agvsRef.current = initAgvs(tileWidth, tileHeight);
    hoverRef.current.tw = tileWidth;
    hoverRef.current.th = tileHeight;

    const handleResize = () => {
      const { w: nw, h: nh } = computeSize();
      setCanvasSize({ w: nw, h: nh });
      const { tileWidth: ntw, tileHeight: nth } = getTileDimensions(nw, nh);
      tileDimRef.current = { tileWidth: ntw, tileHeight: nth };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeSize]);

  // Animation loop
  useEffect(() => {
    if (!canvasSize.w) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { tileWidth, tileHeight } = tileDimRef.current;

    let selectedTw = tileWidth, selectedTh = tileHeight;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      // Update
      const updated: AnyAgv[] = agvsRef.current.map((agv) => {
        if (agv.isSuper) return updateSuperAgv(agv as SuperAgvData);
        return updateAgv(agv as AgvData, tileWidth, tileHeight);
      });
      agvsRef.current = updated;

      // Track selected tile size for hover preview
      selectedTw = tileWidth;
      selectedTh = tileHeight;
      for (const agv of updated) {
        if (agv.selected && agv.isSuper) {
          selectedTw = agv.tileWidth;
          selectedTh = agv.tileHeight;
        }
      }
      hoverRef.current.tw = selectedTw;
      hoverRef.current.th = selectedTh;

      renderFrame(
        ctx,
        canvasSize.w,
        canvasSize.h,
        tileWidth,
        tileHeight,
        updated,
        hoverRef.current.x,
        hoverRef.current.y,
        hoverRef.current.color,
        hoverRef.current.tw,
        hoverRef.current.th
      );
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasSize]);

  const getGridPos = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { tileWidth, tileHeight } = tileDimRef.current;
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth);
    const yIndex = Math.round((my - tileHeight * 0.5) / tileHeight);
    return { mx, my, x: xIndex * tileWidth, y: yIndex * tileHeight, rect };
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridPos(event);
    if (!pos) return;
    const { mx, my, x, y } = pos;
    const canvas = canvasRef.current!;
    if (mx < 0 || my < 0 || mx > canvas.width || my > canvas.height) return;

    agvsRef.current = agvsRef.current.map((agv) => {
      const onAgv = agv.x === x && agv.y === y;
      if (onAgv && agv.state === 'AVAILABLE') {
        if (agv.selected && oneSelectedRef.current) {
          oneSelectedRef.current = false;
          return { ...agv, selected: false };
        } else if (!oneSelectedRef.current) {
          oneSelectedRef.current = true;
          return { ...agv, selected: true };
        }
      } else if (!onAgv && agv.selected) {
        if (!isOccupiedRef.current) {
          oneSelectedRef.current = false;
          return { ...agv, selected: false, destination: { x, y } };
        }
      }
      return agv;
    });
  }, [getGridPos]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridPos(event);
    if (!pos) return;
    const { x, y, rect } = pos;
    const { tileWidth, tileHeight } = tileDimRef.current;

    let isSelected = false;
    let selX = 0, selY = 0;
    isOccupiedRef.current = false;
    let selectedSuperAgv: SuperAgvData | null = null;
    let isSuper = false;
    let newHoverInfo: HoverInfo | null = null;

    // First pass: find selected super, detect boundary occupation
    for (const agv of agvsRef.current) {
      if (agv.isSuper && agv.selected) {
        selectedSuperAgv = agv as SuperAgvData;
        isSuper = true;
        const sagv = agv as SuperAgvData;
        if (
          (sagv.y === sagv.y2 && x + sagv.tileWidth > canvasSize.w + 1) ||
          (sagv.x === sagv.x2 && y + sagv.tileHeight > canvasSize.h + 1)
        ) {
          isOccupiedRef.current = true;
        }
      }
    }

    // Second pass: update hover, check occupation
    agvsRef.current = agvsRef.current.map((agv) => {
      let hover = false;
      if (agv.isSuper) {
        const sagv = agv as SuperAgvData;
        hover = x === sagv.x && y === sagv.y;
        if ((x === sagv.x2 && y === sagv.y2) && !isSuper) isOccupiedRef.current = true;
      } else {
        hover = x === agv.x && y === agv.y;
      }

      if (x === agv.x && y === agv.y) isOccupiedRef.current = true;
      if (x === agv.destination.x && y === agv.destination.y) isOccupiedRef.current = true;

      // Super-agv neighbor blocking
      if (isSuper && selectedSuperAgv && !agv.selected) {
        const sagv = selectedSuperAgv;
        if (sagv.y === sagv.y2 && agv.x - x === tileWidth && y === agv.y)
          isOccupiedRef.current = true;
        if (sagv.x === sagv.x2 && agv.y - y === tileHeight && x === agv.x)
          isOccupiedRef.current = true;
      }

      if (agv.selected || hover) {
        newHoverInfo = {
          agvId: agv.id,
          gridX: Math.round(agv.x / tileWidth),
          gridY: Math.round(agv.y / tileHeight),
          x: agv.x,
          y: agv.y,
        };
      }
      if (agv.selected) {
        isSelected = true;
        selX = agv.x;
        selY = agv.y;
      }
      return { ...agv, hover, color: agv.selected ? lighten(agv.color) : agv.color };
    });

    setHoverInfo(newHoverInfo);
    setCanvasRect(rect);

    if (isSelected) {
      hoverRef.current.x = x;
      hoverRef.current.y = y;
      if (isOccupiedRef.current) {
        hoverRef.current.color = x === selX && y === selY ? 'rgba(0,0,0,0)' : '#ef4444';
      } else {
        hoverRef.current.color = '#3b82f6';
      }
    } else {
      hoverRef.current.x = null;
      hoverRef.current.y = null;
      hoverRef.current.color = null;
    }
  }, [getGridPos, canvasSize]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const pos = getGridPos(event);
    if (!pos) return;
    const { x, y, rect } = pos;
    const { tileWidth, tileHeight } = tileDimRef.current;

    let valid = false, isSuper = false, superSelected = false;
    let state = '';
    let neighbor = false;

    for (const agv of agvsRef.current) {
      if (agv.x === x && agv.y === y) {
        valid = true;
        state = agv.state;
        isSuper = agv.isSuper;
        neighbor = checkNeighbors(agv, agvsRef.current, tileWidth, tileHeight) !== null;
        if (agv.isSuper && agv.hover) superSelected = true;
      }
    }
    if (!valid) return;

    const enableLabel = state === 'AVAILABLE' ? 'Disable' : 'Enable';
    let dockLabel = 'Dock';
    let dockDisabled = !neighbor && !isSuper;
    if (isSuper) {
      dockLabel = superSelected ? 'Undock' : 'Dock';
      if (state === 'UNAVAILABLE') dockDisabled = true;
    }

    setContextMenu({
      visible: true,
      x: rect.left + x + tileWidth,
      y: rect.top + y + tileHeight,
      canvasX: x,
      canvasY: y,
      enableLabel,
      dockLabel,
      dockDisabled,
    });
  }, [getGridPos]);

  const closeMenu = useCallback(() => {
    setContextMenu((m) => ({ ...m, visible: false }));
  }, []);

  const handleEnable = useCallback(() => {
    const { canvasX, canvasY, enableLabel } = contextMenu;
    agvsRef.current = agvsRef.current.map((agv) => {
      if (agv.x === canvasX && agv.y === canvasY) {
        return { ...agv, state: enableLabel === 'Enable' ? 'AVAILABLE' : 'UNAVAILABLE' };
      }
      return agv;
    });
    closeMenu();
  }, [contextMenu, closeMenu]);

  const handleDock = useCallback(() => {
    const { canvasX, canvasY, dockLabel } = contextMenu;
    const { tileWidth, tileHeight } = tileDimRef.current;

    if (dockLabel === 'Dock') {
      let docked = false;
      const newAgvs: AnyAgv[] = [];
      let target: AgvData | null = null;
      let neighbor: AgvData | null = null;
      for (const agv of agvsRef.current) {
        if (agv.x === canvasX && agv.y === canvasY && !docked) {
          target = agv as AgvData;
          neighbor = checkNeighbors(agv, agvsRef.current, tileWidth, tileHeight);
          docked = true;
        }
      }
      if (target && neighbor) {
        const sagv = createSuperAgv(1, target, neighbor);
        for (const agv of agvsRef.current) {
          if (agv !== target && agv !== neighbor) newAgvs.push(agv);
        }
        newAgvs.push(sagv);
        agvsRef.current = newAgvs;
      }
    } else {
      // Undock
      const newAgvs: AnyAgv[] = [];
      for (const agv of agvsRef.current) {
        if (agv.isSuper && agv.x === canvasX && agv.y === canvasY) {
          const [a1, a2] = splitSuperAgv(agv as SuperAgvData, tileWidth, tileHeight);
          newAgvs.push(a1, a2);
        } else {
          newAgvs.push(agv);
        }
      }
      agvsRef.current = newAgvs;
    }
    closeMenu();
  }, [contextMenu, closeMenu]);

  return (
    <>
      <div onClick={closeMenu} className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="rounded-2xl cursor-crosshair"
          style={{ boxShadow: '0 0 60px rgba(59,130,246,0.15), 0 0 120px rgba(59,130,246,0.07)' }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onContextMenu={handleContextMenu}
        />
      </div>
      <InfoPanel
        info={hoverInfo}
        canvasRect={canvasRect}
        tileWidth={tileDimRef.current.tileWidth}
        tileHeight={tileDimRef.current.tileHeight}
      />
      <ContextMenu menu={contextMenu} onEnable={handleEnable} onDock={handleDock} />
    </>
  );
}

function lighten(color: string): string {
  // Slightly brighten on selection — just returns a slightly transparent version
  if (color === '#10b981') return '#34d399';
  if (color === '#f59e0b') return '#fbbf24';
  if (color === '#ef4444') return '#f87171';
  return color;
}
