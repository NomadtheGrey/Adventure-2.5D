# Game Development Guide

This guide outlines universal principles for game development within this project space.

## 1. The ESC Menu (Neural Hub)
- **Centralized Configuration**: Every new global setting, HUD toggle, or audio option MUST be integrated into the ESC menu (Neural Hub).
- **Aesthetic Consistency**: Use the "Neural Hub" naming convention and "Acheron Protocol" style branding for system menus.
- **HUD Visibility**: All major HUD components (Minimap, Status, Inventory, Controls) must remain optional and toggleable via the HUD state.

## 2. Interface Design (UI/HUD)
- **High Contrast & Glow**: Use `emerald-400` / `emerald-500` for active tactical elements and high-contrast text.
- **Monospace Decorum**: Technical data, IDs, and protocol strings should use monospace fonts with tracked-out uppercase styling.
- **Interactive Feedback**: All UI clicks and state changes should trigger associated audio cues (e.g., `Audio.playUIClick()`).

## 3. World & Audio
- **Atmospheric Depth**: Maintain a techno-ambient audio profile. Use drones, pulsars, and wind noise to create a sense of vast, lonely space.
- **Responsive Environments**: Visuals should react to the player's presence or actions (e.g., pulsing lights, sensor feedback).

## 4. Control Systems
- **Standard Mapping**:
  - `[WASD]` for movement.
  - `[ESC]` for system options / pause.
  - `[SCROLL]` or numeric keys for item selection.
  - `[CLICK]` or `[SPACE]` for primary interaction.
- **Guidance**: Always provide a toggleable "Interface Guide" (Controls Hint) for new users.

## 5. Audio Architecture (Acheron Protocol P.A.S.)
- **Signal as Proxy**: Audio should represent the HUD's ability to maintain a link. High threat = Signal Degradation (Jitter, Static, Detune).
- **Lonely Technical Observation**: Maintain a 220Hz "Isolation Sine" and unstable noise floors to emphasize the vastness of the digital wilderness.
- **Neural Interference**: Hostiles do not make biological sounds. Their presence causes the player's audio stack to struggle and glitch.
- **Tactile Grounding**: Subtle low-frequency hums (55Hz) provide feedback for physical movement through the simulation.

## 6. CSS Architecture
- **No Inline Bloat**: Do NOT use long inline Tailwind utility strings for complex visual effects like CRT scans, specific glows, or custom buttons.
- **Semantic Components**: Use established component classes defined in `index.css`:
  - `.acheron-scanner-glass`: Applies CRT scanlines and radial distortion.
  - `.text-biometric`: High-visibility emerald text with a digital glow.
  - `.text-telemetry`: Micro-data styling (monospace, tracked-out, reduced opacity).
  - `.btn-link-engage`: The standard "System Action" button with clipped corners and hover states.
- **Expansion**: If a new repeated visual pattern is identified, it MUST be extracted into a component class within the `@layer components` of `index.css`.
