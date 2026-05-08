# PROJECT TODO: ADVENTURE 2.5D
*Priority List & Feature Roadmap*

## PHASE 1: POLISH & CORE FEEL (Current)
- [x] **Audio Engine:** Implement a procedural synth system. (Completed: 2026-05-08)
- [x] **Dragon Contiguity:** Ensure segments look like a single entity. (Completed: 2026-05-08)
- [x] **Radar Refactor:** Grouped holographic list layout with integrated system rail for precise alignment. (Updated: 2026-05-08 17:02)
- [x] **HUD Cleanup:** Removed redundant Compass in favor of improved Minimap. (Completed: 2026-05-08)
- [x] **Initialization Overlay:** Replaced "Identifying..." with "Engage Link" start screen. (Completed: 2026-05-08)
- [x] **Spawn Protection:** Room [0,0] is now a "Landing Cradle". (Updated: 2026-05-08 16:30 - Added AI repulsion)
- [x] **Pause/Settings Menu:** Comprehensive settings and state management via ESC. (Completed: 2026-05-08)
- [ ] **Visual Feedback:** Implement `ScreenShake` on collision and `RGB-Glitch` effects on death.

## PHASE 2: ENTITY EVOLUTION
- [ ] **Landing Pod Visuals:** Add a unique geometric "Cradle" at the spawn point.
- [ ] **The Cloud-Bat:** Implement the chaotic roaming item-swapper.
- [ ] **Magnetic Flux Item:** Add the magnet item that pulls keys toward the player.
- [ ] **Phase Bridge Item:** Add the temporary wall-bypass utility.

## PHASE 3: SECTOR ARCHITECTURE
- [ ] **Gate Visuals:** Replace generic "Gate" objects with "Sector Barriers."
- [ ] **Artifact Cages:** Rotating wireframe cages for artifacts.

## PHASE 4: THE DEEP DATA (SECRET ROOM)
- [ ] **Technical Secret:** The "Secret Dot" hidden in a wall.
- [ ] **Wireframe Mode:** 'Underworld' render mode toggle.

## PHASE 5: ATMOSPHERE & FEEDBACK
- [ ] **Dynamic Fog:** Implement the "Data Mist" that rolls in near sector boundaries.
- [ ] **Telemetry Logs:** Text-based narrative drops appearing on the Scanner.
- [ ] **Procedural Asset Evolution:** Transforming boxy trees into "Fractal Geometry" and dragons into "Crystal Snakes."
- [ ] **Biomes:** Varying physics and colors for Snow/Desert memory sectors.

## TECHNICAL DEBT / REFACTORING
- [ ] **Asset Manager Caching:** Ensure geometries and materials are fully shared across identical nature types (Rule 9).
- [ ] **Input Normalization:** Add controller support (Gamepad API) for more fluid movement.
