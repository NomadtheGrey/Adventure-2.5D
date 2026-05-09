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
- [x] **Visual Feedback:** Implement `ScreenShake` on collision and `RGB-Glitch` effects on death.
- [x] **CSS Refactor:** Utilize CSS classes from index.css in all TSX files.
- [x] **Geomorph Variety:** 13 room templates defined in nature.json for exploration diversity.

Aesthetic
- [x] **Procedural Textures:** Generated circuit/organic textures for trees, bushes, and grass.
- [x] **Dynamic Ambience:** Background procedural sounds for world life. (Updated: 2026-05-09)
- [x] **Thematic CSS:** Robust component classes in index.css for aesthetic flexibility.


## PHASE 2: ENTITY EVOLUTION
- [x] **Landing Pod Visuals:** Geometric "Cradle" with pulsing pillars at [0,0]. (Completed: 2026-05-09)
- [x] **The Cloud-Bat:** Chaotic roaming item-swapper with radar tracking. (Completed: 2026-05-09)
- [x] **Visual Polish:** Advanced Minimap radar with off-screen tracking for priority targets. (Completed: 2026-05-09)
- [x] **Magnetic Flux Item:** Attraction effect for keys (Passive 5u, Active 20u). (Completed: 2026-05-09)
- [x] **Combat Protocol:** Spear thrusting allows dragon-slaying when facing the target. (Completed: 2026-05-09)
- [x] **Phase Bridge Item:** Active teleport utility for bypassing trees, bushes, and water. (Updated: 2026-05-09)
- [x] **Sector Mazes:** Hardened collisions with overlap and blocked exits. (Updated: 2026-05-09)
- [x] **Item Persistence:** Dropping items (Key Q) and visual indicators on avatar. (Completed: 2026-05-09)
- [x] **Boundary Enforcement:** Map bounds locked unless carrying the Black Key. (Completed: 2026-05-09)

## PHASE 3: SECTOR ARCHITECTURE
- [x] **Gate Visuals:** Enhanced "Castle" strongholds with thematic interiors. (Completed: 2026-05-09)
- [x] **Progression Maze:** Implemented linear progression through Silver, Black, and Gold strongholds. (Completed: 2026-05-09)
- [x] **Throne Room:** Central win condition requiring return of the Chalice to the Golden Throne. (Completed: 2026-05-09)
- [x] **The Cloud-Bat:** Implemented as "Reclamation Drone" (D20 Core) that hovers and pulses. (Completed: 2026-05-09)
- [ ] **Dragon Variety:** 
    - [ ] **RHYNODON:** Hunter logic (Intercept pathing).
    - [ ] **GORGARYS:** Guard logic (Stays near key, enrages if stolen).
    - [ ] **YVITHRAX:** Baiter logic (Lures player toward hunters).
- [x] **Cradle Protection:** Items now spawn in safe zones or away from walls. (Updated: 2026-05-09)
- [ ] **Secret Dot:** Hidden sub-pixel artifact for "Underworld" (Wireframe) mode.
- [ ] **Screen Glitch:** CSS-based RGB shift and glitch effects upon Signal Loss (Death).
- [ ] **Artifact Cages:** Rotating wireframe cages for artifacts. (Implemented for Items in interiors)

## PHASE 4: THE DEEP DATA (SECRET ROOM)
- [ ] **Technical Secret:** The "Secret Dot" hidden in a wall.
- [ ] **Wireframe Mode:** 'Underworld' render mode toggle.

## PHASE 5: ATMOSPHERE & FEEDBACK
- [x] **Telemetry Logs:** Text-based narrative drops appearing on the Scanner. (Completed: 2026-05-09)
- [x] **Procedural Asset Evolution:** Transforming boxy trees into "Fractal Geometry" and dragons into "Crystal Snakes." (Completed: 2026-05-09)
- [ ] **Biomes:** Varying physics and colors for Snow/Desert memory sectors.

## AGENT RECOMMENDATIONS (Future Vision)
- [ ] **Neural Signatures:** Subtle screen glitches or color shifts when moving from one sector to another.
- [ ] **Atmospheric Pressure:** Increasing audio low-end as you move away from the center.
- [ ] **Procedural Loot:** Randomly placed "Flux Chips" that temporarily grant the hero different "debug powers" (e.g., Infinite Spear Thrust).
- [ ] **Dynamic Inhabitants:** Neutral "Simulation Scavengers" that pick up dropped player items and move them to random map coordinates.

## TECHNICAL DEBT / REFACTORING
- [x] **Item Spawning:** Fixed items spawning inside walls or inaccessible locations. (Fixed: 2026-05-09)
- [x] **Refactoring:** Modularizing AudioSystem, WorldAssetManager, and WorldAssembler into specialized asset components. (Completed: 2026-05-09)
- [ ] **Asset Manager Caching:** Ensure geometries and materials are fully shared across identical nature types (Rule 9).
- [ ] **Input Normalization:** Add controller support (Gamepad API) for more fluid movement.
