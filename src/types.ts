/**
 * Universal domain types to prevent Primitive Obsession (Rule 15)
 */

export type Radians = number;
export type Degrees = number;
export type Meters = number;
export type Seconds = number;
export type Pixels = number;
export type HexColor = number;

export interface Vector2D {
    x: number;
    z: number;
}
