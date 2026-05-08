import { GameState, ItemType, ITEMS } from './GameState';

export class InventorySystem {
  static scroll(delta: number) {
    if (GameState.inventory.length === 0) return;
    
    GameState.activeIndex = (GameState.activeIndex + (delta > 0 ? 1 : -1) + GameState.inventory.length) % GameState.inventory.length;
  }

  static addItem(type: ItemType) {
    if (GameState.inventory.find(i => i.type === type)) return;
    GameState.inventory.push(ITEMS[type]);
  }

  static removeItem(type: ItemType) {
    const index = GameState.inventory.findIndex(i => i.type === type);
    if (index !== -1) {
      GameState.inventory.splice(index, 1);
      if (GameState.activeIndex >= GameState.inventory.length) {
        GameState.activeIndex = Math.max(0, GameState.inventory.length - 1);
      }
    }
  }

  static getActiveItem() {
    return GameState.inventory[GameState.activeIndex] || null;
  }
}
