# TECH_SPECS.md: THE UNIVERSAL MANIFESTO
*Note: The following rules represent a strict standard for all software development within this workspace, regardless of project scale or domain.*

### 1. NO "ELSE" STATEMENTS
Use Guard Clauses and Early Returns. Keep the logic path linear. If a condition isn't met, exit.

### 2. STRICTLY AVOID LOOPS
Use declarative Array methods (`.map`, `.filter`, `.reduce`). Use Functional Programming patterns to transform data.

### 3. MEMOIZATION AS A RULE
Do not re-run heavy math unnecessarily. Use `useMemo` for any coordinate transformations or physics logic. Treat these as "Variables with Brains" so we stay efficient.

### 4. DATA PIPING
Break complex transformations into a sequence of small, single-purpose functions. I want to see the "story" of the data as it moves from raw input to the final visual output.

### 5. LOGICAL FLATNESS
Separate "Thinking" (Math/Logic) from "Doing" (UI/Assets). Keep the patterns clean and the desk organized. Use `const`; never mutate data.

### 6. SRP & DRY (Single Responsibility & Don't Repeat Yourself)
Every module must "make sense to itself." Define assets (like filters) once and reference them everywhere.

### 7. PRINCIPLE OF LEAST SURPRISE (POLS)
Logic must be predictable and intuitive. If a function is named `calculateScreenPos`, it should only calculate; it should never trigger side effects like audio or state updates. Convention beats cleverness—stick to established patterns so the code base remains readable for anyone stepping into the woods.

### 8. DATA-DRIVEN DEFINITIONS
Logic must not switch on strings or enums if that behavior can be described by data. Move configurations, variant properties, and behavior parameters into JSON or dedicated config modules. The code should be a generic engine that "interprets" data, not a hardcoded list of cases. Any "type" of entity should know how it's handled via its definition.

### 9. ASSET POOLING & CACHING
The Game Loop is a high-speed treadmill. Never instantiate new Objects (`new Vector3()`, `new Box3()`) inside `update` or `animate`. Re-use static "scratch" variables to avoid Garbage Collection spikes. Cache Geometries and Materials at the system level.

### 10. FUNCTIONAL COMPOSITION & EFFECTS
Separate "Detection" from "Reaction." Systems should produce a stream or list of events (e.g., `CollisionEvent`). A separate "Effects Engine" should process these events. This keeps the thinking (math) pure and the doing (mutation) isolated.

### 11. COMPONENT ATOMIZATION
UI and Logic must be decoupled at the file level. Entry points (like `App.tsx`) should act as high-level orchestrators, not a storage for every HUD element. Extract overlays, status bars, and complex UI widgets into their own modules. If a UI file exceeds 100 lines of JSX, it must be subdivided.

### 12. ERROR RESILIENCE & GRACEFUL DEGRADATION
Failures in sub-systems (e.g., a specific AI dragon or a HUD widget) should never crash the main application. Wrap high-risk logic in scoped error handlers that provide "safe defaults" to keep the loop running.

### 13. EXPLICIT DEPENDENCY MANAGEMENT
Avoid "Hidden Globals" or implicit singleton dependencies inside logic functions. If a function needs `GameState` or `DeltaTime`, pass it in. This makes the logic unit-testable and prevents "spooky action at a distance."

### 14. INTENTIONAL OBSERVABILITY
The system's state should be "Inspectable by Default." Include debug toggles or telemetry hooks that reveal the inner workings of math and state transitions without requiring a debugger attached.

### 15. AVOID PRIMITIVE OBSESSION
Don't pass raw `numbers` if they represent specific concepts (e.g., `Radians` vs `Degrees`). Use Type Aliases or value objects to ensure the logic isn't treating a `Speed` variable as a `Distance` variable.

### 16. STRICT TYPE INTELLIGENCE (TS)
Treat `any` as a critical failure. Use Discriminative Unions for complex state and effect types. Leverage `readonly` for configurations. TypeScript is our shield; use it to catch errors at compile-time, not run-time.

### 17. SEMANTIC NAMING (CLEAN CODE)
Booleans must start with `is`, `has`, or `can`. Functions must be verbs (`calculate`, `sync`, `handle`). Variables must be nouns. Naming should be so descriptive that comments become redundant.

### 18. THE 200-LINE LIMIT
No module should exceed 200 lines of code. If a file grows beyond this, its responsibilities are too broad. Subdivide and conquer. Functional density is preferred over monolithic files.

### 19. WORLD DIMENSIONS & TOPOLOGY
The simulation space is defined by an 8x8 grid of 60x60 unit "Rooms" (Total size: 480x480 units). The world is geomorphically static once initialized per session; its layout does not shift during active play-throughs to maintain spatial integrity for the player's P.A.S. (Scanner).

### 20. COLLISION FIDELITY
Use a 20x20 unit Spatial Grid for O(1) local collision lookups. High-fidelity geometry (like trees) should use simplified bounding box proxies for physics to keep the game loop under 16ms overhead.

### 21. SEMANTIC CSS ARCHITECTURE
Do NOT use long inline Tailwind utility strings for complex visual effects, repeated panels, or high-level UI components. Extract these into semantic classes within `src/index.css` using the `@layer components` directive. This ensures a single source of truth for the "Acheron Protocol" aesthetic and allows for global theme swapping (e.g., changing emerald-400 to cyan-400 in one place). Use variables or semantic utility classes like `.text-biometric`, `.text-telemetry`, and `.acheron-panel`.

### 22. SERVICE-ORIENTED MODULE ARCHITECTURE
The system is decoupled into specialized domains to maximize maintainability and reduce token overhead during development:
*   **Systems Layer (`src/game/systems/`):** Stateless logic modules (Boundary, Collision, Reaction) that process physics and game rules.
*   **Asset Layer (`src/game/assets/`):** Dedicated builders for Items, Castles, Structures, and Procedural Textures.
*   **State Management (`GameState.ts`):** Centralized truth for the P.A.S. simulation.
*   **Audio Synthesis (`src/game/audio/`):** Decoupled Drone and Effect synthesizers.
