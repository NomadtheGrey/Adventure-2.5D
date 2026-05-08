import { Vector3 } from 'three';

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
  color: number;
}

export interface GateInfo {
    id: string;
    type: ItemType; // The key required
    pos: Vector3;
    isOpen: boolean;
}

export interface POI {
  id: string;
  type: 'dragon' | 'item' | 'wall' | 'gate';
  pos: Vector3;
  color: number;
}

export interface GameStateData {
  playerPos: Vector3;
  playerRotation: number;
  inventory: InventoryItem[];
  activeIndex: number;
  isDead: boolean;
  hasWon: boolean;
  worldSeed: number;
  pois: POI[];
  gates: GateInfo[];
  debug: {
    fps: number;
    gpu: string;
    drawCalls: number;
    triangles: number;
    objectCount: number;
  };
}

export const GameState: GameStateData = {
  playerPos: new Vector3(0, 0, 0),
  playerRotation: 0,
  inventory: [
    { type: ItemType.SPEAR, name: 'Spear', color: 0xcccccc }
  ],
  activeIndex: 0,
  isDead: false,
  hasWon: false,
  worldSeed: Math.random(),
  pois: [],
  gates: [],
  debug: {
    fps: 0,
    gpu: 'Identifying...',
    drawCalls: 0,
    triangles: 0,
    objectCount: 0,
  },
};

export const ITEMS: Record<ItemType, InventoryItem> = {
  [ItemType.KEY_GOLD]: { type: ItemType.KEY_GOLD, name: 'Gold Key', color: 0xffd700 },
  [ItemType.KEY_SILVER]: { type: ItemType.KEY_SILVER, name: 'Silver Key', color: 0xc0c0c0 },
  [ItemType.KEY_BLACK]: { type: ItemType.KEY_BLACK, name: 'Black Key', color: 0x333333 },
  [ItemType.CHALICE]: { type: ItemType.CHALICE, name: 'Chalice', color: 0xff00ff },
  [ItemType.BRIDGE]: { type: ItemType.BRIDGE, name: 'Bridge', color: 0x8b4513 },
  [ItemType.MAGNET]: { type: ItemType.MAGNET, name: 'Magnet', color: 0x0000ff },
  [ItemType.SPEAR]: { type: ItemType.SPEAR, name: 'Spear', color: 0xcccccc },
};
