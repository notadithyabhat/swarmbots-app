export type AgvState = 'AVAILABLE' | 'IN USE' | 'UNAVAILABLE';

export interface DestinationData {
  x: number;
  y: number;
}

export interface AgvData {
  id: number;
  x: number;
  y: number;
  state: AgvState;
  color: string;
  hover: boolean;
  selected: boolean;
  destination: DestinationData;
  isSuper: false;
  tileWidth: number;
  tileHeight: number;
}

export interface SuperAgvData {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  agv1Id: number;
  agv2Id: number;
  state: AgvState;
  color: string;
  hover: boolean;
  selected: boolean;
  destination: DestinationData;
  isSuper: true;
  tileWidth: number;
  tileHeight: number;
}

export type AnyAgv = AgvData | SuperAgvData;

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  enableLabel: string;
  dockLabel: string;
  dockDisabled: boolean;
}

export interface HoverInfo {
  agvId: number;
  gridX: number;
  gridY: number;
  x: number;
  y: number;
}
