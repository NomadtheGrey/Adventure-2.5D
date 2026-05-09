# WORLD_GUIDE.md: ADVENTURE 2.5D
*The Living Document of the Shifting Realm*

## 1. THE GENRE: TECHNO-FANTASY
**Genre:** Labyrinth Crawler / Tactical Action.
A "Hard-Sci-Fi" lens applied to a Primal Magical world. The hero is not a knight, but a **Surveyor** equipped with a **P.A.S. (Pulse Acquisition Scanner)**, navigating a low-poly simulation of an ancient kingdom.

## 2. THE LORE: THE SECTOR ZERO ANOMALY
You are a Surveyor sent to "clean" a corrupted memory sector known as the **Labyrinth**. The environment consists of geomorphic sectors that rearrange their layout upon every system initialization (Initial Loading), but remain **strictly static and fixed** for the duration of the play-through. This ensures that the Surveyor can map the realm without the floor shifting beneath them. The **Chalice** is not just a cup; it is the *Source Code* of the simulation.

### 2.1 THE LANDING CRADLE
Every mission begins at **Sector [0,0]**, the **Landing Cradle**. This zone is a hardened bio-sync buffer—strictly non-hostile. The unique geometric torch-ring and central beacon marking this site ensure the Surveyor can orient themselves before venturing into the static Labyrinth.

## 3. THE BESTIARY (DRAGON AI)
The dragons are "Security Daemons" patrolling the memory sectors:
*   **RHYNODON (Red / Hunter):** Aggressive tracking logic. It calculates the shortest path through the grid to intercept the Surveyor.
*   **GORGARYS (Green / Sentinel):** Guard logic. It stays tethered to high-value keys. If the player steals its guarded item, it enters "Enraged Pursuit" mode.
*   **YVITHRAX (Yellow / Skittish Throttler):** Passive-aggressive logic. It keeps the player away from boundaries, often baiting them back into the center where the Rhynodon hunts.

## 4. THE HUD: PULSE ACQUISITION SCANNER (P.A.S.)
The Surveyor's interface is a high-latency projection:
*   **The holographic list (HUD-L):** Active systems (Inventory) are managed via a vertical holographic list on the left flank. Each module includes a diagnostic ID and secondary status descriptor.
*   **The Scanner (HUD-R):** A top-down projection of the immediate memory sector with fixed North orientation.
*   **The Bio-Link:** Health and status are monitored via the central telemetry ring.
*   **Telemetry Audio (Implemented):** Pulse-hum feedback intensifies as you leave the protection of the Landing Cradle or approach a Security Daemon.

## 5. RECONNAISSANCE PROTOCOLS
*   **Bio-Link Termination:** Upon survey failure (Death), the P.A.S. initiates a graceful 3-second shutdown sequence before signal loss.
*   **Cradle Repulsion:** Security Daemons are hard-coded to avoid the Landing Cradle's localized encryption. They will patrol the perimeter but effectively refuse to enter the buffer zone.

## 6. THE CHAOS FACTOR: THE RECLAMATION DRONE
Known as the "Cloud-Bat" in system logs, this is an automated reclamation unit (D20-core geometry) that ignores all collision and roams the map randomly. It serves as a guardian of data entropy, hovering above the labyrinth and pulsing with kinetic energy.

## 5. THE ARSENAL (THE SCANNER SUIT)
*   **The Pulse Spear:** (Implemented) A high-frequency energy rod. It requires precision timing (The Thrust) to disrupt the dragon's code.
*   **The Flux Attractor:** (Implemented) A ferromagnetic utility that pulses with energy, making nearby items easier to acquire.
*   **The Phase Bridge:** (Implemented) A phase-shifting tool that allows the player to bypass environmental obstacles like trees and bushes.

## 6. THE STRONGHOLDS (CASTLES)
The world consists of three fortified strongholds, each guarding critical system components:
1.  **Silver Castle (East):** Guarded by Silver encryption. Contains the **Black Key**.
2.  **Black Castle (West):** Guarded by Obsidian barriers. Contains the **Gold Key** and the **Chalice**.
3.  **Gold Castle (North):** The system root. Contains the **Throne Room**, where the Chalice must be returned to initiate the system reboot.

## 7. VISUAL STYLE & ATMOSPHERE
### MOOD: THE "UNCANNY SIMULATION"
The environment should feel like a lush, natural world that is "rendering" in real-time. It is vibrant but fragile.
*   **Lighting:** High-contrast Global Illumination. Surfaces should have a subtle "fresnel" glow at the edges, suggesting they are composed of light/data rather than matter.
*   **Color Palette:**
    *   **Nature:** Deep Emerald (#065f46), Forest Shadows (#022c22), and Sky Cyan (#0ea5e9).
    *   **Technology:** "Atari Gold" (#fbbf24), "Link Silver" (#94a3b8), and "System Red" (#ef4444).
    *   **The Void:** The edges of the world should fade into a pitch-black digital abyss.

## 8. ENTITY DESIGN EVOLUTION
| Entity | Current Form (v1.0) | Intended Form (Final) |
| :--- | :--- | :--- |
| **Surveyor (Player)** | Floating Prism + Ring | A multi-layered "Data Core" with orbiting satellite bits that change color based on the held key. |
| **Daemons (Dragons)** | Segmented Boxes | Procedural "Crystal Snakes." Translucent bodies with glowing internal spines. Faces should be abstract digital masks. |
| **Environment** | Boxy Trees/Bushes | "Fractal Geometry." Trees that look like branching circuit boards; bushes that are clusters of voxels. |
| **Artifacts** | Floating Cubes | Low-poly gems encased in rotating wireframe safety-cages. |

## 9. THE ARTIFACT REGISTRY: GOALS & UTILITY
*   **The Pulse Spear:** (Implemented) Primary defense. Disrupts Daemon logic on impact.
*   **Encryption Keys (Gold/Silver/Black):** (Implemented) Used to bypass stronghold gates and navigate the shifting labyrinth.
*   **The Chalice:** (Implemented) The win-condition. Returning it to the Gold Throne reboots the system.
*   **The Flux Attractor:** (Implemented) Ferromagnetic utility for item acquisition.
*   **The Phase Bridge:** (Implemented) Utility for bypassing dense nature.
*   **The Secret Dot (Planned):** A sub-pixel artifact hidden in a wall. Collecting it unlocks the "Underworld" render mode (Wireframe only).

## 10. INTENDED NARRATIVE ARC
1.  **Initialization:** Player spawns in a safe "Cradle" of trees.
2.  **Exploration:** Navigate the shifting Geomorphic Forest, using the P.A.S. (Minimap) to avoid the Rhynodon (Stalker).
3.  **The Heist:** Infiltrate the Gorgarys' (Guardian) nest to steal the Silver Key.
4.  **The Breach:** Unlock Sector Prime to find the Gold Key, while dealing with the Yvithrax (Thief) baiting you into traps.
5.  **The Final Extraction:** Unlock Sector Zero, slay the final guardian, and secure the Chalice to "Reboot" the system.

## 11. TECHNICAL ROADMAP: PHASE 2
*   **Audio Synths:** (Implemented) Procedural "Data Screams" for dragons and low-frequency "Hums" for keys.
*   **Screen Shake & Glitch:** Visual feedback when the player is "Eaten" (Signal Lost), including CSS-based RGB shift effects.

## 12. AGENT RECOMMENDATIONS (Future Vision)
- **Neural Signatures:** Subtle screen glitches or color shifts when moving from one sector to another.
- **Atmospheric Pressure:** Increasing audio low-end as you move away from the center.
- **Procedural Loot:** Randomly placed "Flux Chips" that temporarily grant the hero different "debug powers" (e.g., Infinite Spear Thrust).
- **Dynamic Inhabitants:** Neutral "Simulation Scavengers" that pick up dropped player items and move them to random map coordinates.
