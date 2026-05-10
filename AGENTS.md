# Project Tech Specs & Instructions

## Versioning
- The version in `src/version.ts` MUST be incremented for every significant set of changes.
- Format: Semantic versioning (e.g., 1.0.x).
- Display the version in the Telemetry/Debug HUDs.

## Scene Management
- Use "Zone Isolating": When the player is inside a castle (interior zone), the main sector (outdoor) assets should be hidden from the scene to maximize performance.
- Lighting in interiors should be significantly higher than outdoors to avoid "obscurement" issues in the orthographic view.

## Audio
- AudioContext must be resumed on user interaction (Engage Link) and verified in the update loop to prevent silent sessions.

## Regression Prevention
- **System Stability**: Before modifying core logic in `GameState.ts`, `World.ts`, or `ReactionSystem.ts`, always read their full content to preserve existing flags, triggers, and cleanup routines.
- **Asset Integrity**: Do not remove or revert scenery, map features, or NPC systems unless explicitly requested.
- **State Continuity**: Ensure player state (position, inventory, `isOutdoor` status) is correctly updated during zone transitions (e.g., entering/exiting castles).
- **Cleanup Requirement**: When removing items or NPCs, always use established removal helpers (e.g., `removeFromWorld`) to ensure pruning from the scene-graph, the physics grid, and active object lists simultaneously.
