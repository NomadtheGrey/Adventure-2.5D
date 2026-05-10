import { Vector3 } from 'three';
import { Radians, HexColor } from '../types';

export enum ItemType {
  KEY_GOLD = 'KEY_GOLD',
  KEY_SILVER = 'KEY_SILVER',
  KEY_BLACK = 'KEY_BLACK',
  CHALICE = 'CHALICE',
  BRIDGE = 'BRIDGE',
  MAGNET = 'MAGNET',
  SPEAR = 'SPEAR',
}

export interface InventoryItem {
  type: ItemType;
  name: string;
  color: HexColor;
}

export interface GateInfo {
    id: string;
    type: ItemType; // The key required
    pos: Vector3;
    isOpen: boolean;
}

export interface POI {
  id: string;
  type: 'dragon' | 'item' | 'wall' | 'gate' | 'bush' | 'tree' | 'water' | 'bat' | 'throne';
  pos: Vector3;
  color: HexColor;
}

export interface GameStateData {
  playerPos: Vector3;
  playerRotation: Radians;
  inventory: InventoryItem[];
  activeIndex: number;
  isDead: boolean;
  isPaused: boolean;
  isPhasing: boolean;
  message: string;
  messageTimer: number;
  lastDropTime: number;
  intentToDrop: boolean;
  isMoving: boolean;
  movingSpeed: number;
  isOutdoor: boolean;
  isInitialized: boolean;
  hasWon: boolean;
  signalIntegrity: number;
  showBriefing: boolean;
  currentZone: 'LANDING' | 'SECTOR' | 'SILVER_CASTLE' | 'EAST_CASTLE' | 'NORTH_CASTLE' | 'WEST_CASTLE';
  activeInterior: string | null;
  worldSeed: number;
  pois: POI[];
  gates: GateInfo[];
  audio: {
    isMuted: boolean;
    isRadarMuted: boolean;
  };
  hud: {
    showMinimap: boolean;
    showStatus: boolean;
    showInventory: boolean;
    showControls: boolean;
  };
  telemetryLogs: { id: string; text: string; time: number }[];
  debug: {
    fps: number;
    gpu: string;
    drawCalls: number;
    triangles: number;
    objectCount: number;
    showPhysics: boolean;
  };
}

export const GameState: GameStateData = {
  playerPos: new Vector3(0, 2, 0),
  playerRotation: 0,
  inventory: [
    { type: ItemType.SPEAR, name: 'Spear', color: 0xcccccc }
  ],
  activeIndex: 0,
  isDead: false,
  isPaused: false,
  isPhasing: false,
  message: '',
  messageTimer: 0,
  lastDropTime: 0,
  intentToDrop: false,
  isMoving: false,
  movingSpeed: 0,
  isOutdoor: true,
  isInitialized: false,
  hasWon: false,
  signalIntegrity: 1.0,
  showBriefing: true,
  currentZone: 'LANDING',
  activeInterior: null,
  worldSeed: Math.random(),
  pois: [],
  gates: [],
  audio: {
    isMuted: false,
    isRadarMuted: false,
  },
  hud: {
    showMinimap: true,
    showStatus: true,
    showInventory: true,
    showControls: true,
  },
  telemetryLogs: [],
  debug: {
    fps: 0,
    gpu: 'Identifying...',
    drawCalls: 0,
    triangles: 0,
    objectCount: 0,
    showPhysics: false,
  },
};

export const ITEMS: Record<ItemType, InventoryItem> = {
  [ItemType.KEY_GOLD]: { type: ItemType.KEY_GOLD, name: 'Gold Key', color: 0xffd700 },
  [ItemType.KEY_SILVER]: { type: ItemType.KEY_SILVER, name: 'Silver Key', color: 0xc0c0c0 },
  [ItemType.KEY_BLACK]: { type: ItemType.KEY_BLACK, name: 'Black Key', color: 0x111111 },
  [ItemType.CHALICE]: { type: ItemType.CHALICE, name: 'Chalice', color: 0xffd700 },
  [ItemType.BRIDGE]: { type: ItemType.BRIDGE, name: 'Bridge', color: 0x8b4513 },
  [ItemType.MAGNET]: { type: ItemType.MAGNET, name: 'Flux Attractor', color: 0x0000ff },
  [ItemType.SPEAR]: { type: ItemType.SPEAR, name: 'Spear', color: 0xcccccc },
};
