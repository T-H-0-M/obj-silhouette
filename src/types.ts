export interface ShapeOptions {
  maxDepth?: number;
  arrayLimit?: number;
}

export type ShapeResult =
  | string
  | ShapeResult[]
  | { [key: string]: ShapeResult };
