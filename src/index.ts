import type { ShapeOptions, ShapeResult } from "./types.js";

const DEFAULT_MAX_DEPTH = 5;
const DEFAULT_ARRAY_LIMIT = 20;

/**
 * Get the silhouette of a data structure
 * @param data - The data to analyze
 * @param options - Configuration options
 * @returns A summarized representation of the data's structure
 */
export function getSilhouette(
  data: unknown,
  options?: ShapeOptions,
): ShapeResult {
  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  const arrayLimit = options?.arrayLimit ?? DEFAULT_ARRAY_LIMIT;
  const visited = new WeakSet<object>();

  return getShapeInternal(data, 0, maxDepth, arrayLimit, visited);
}

function getShapeInternal(
  data: unknown,
  currentDepth: number,
  maxDepth: number,
  arrayLimit: number,
  visited: WeakSet<object>,
): ShapeResult {
  // Handle primitives
  const primitiveType = typeof data;
  if (primitiveType === "string") return "string";
  if (primitiveType === "number") return "number";
  if (primitiveType === "boolean") return "boolean";
  if (primitiveType === "bigint") return "bigint";
  if (primitiveType === "symbol") return "symbol";
  if (primitiveType === "undefined") return "undefined";
  if (data === null) return "null";

  // Handle functions
  if (primitiveType === "function") {
    const funcName = (data as Function).name;
    return funcName ? `Function(${funcName})` : "Function";
  }

  // Check for circular references
  if (typeof data === "object" && data !== null) {
    if (visited.has(data)) {
      return "[Circular]";
    }
    visited.add(data);
  }

  // Check max depth
  if (currentDepth >= maxDepth) {
    return "[Max Depth]";
  }

  // Handle typed arrays
  if (ArrayBuffer.isView(data) && !(data instanceof DataView)) {
    const typedArray = data as
      | Float32Array
      | Float64Array
      | Int8Array
      | Int16Array
      | Int32Array
      | Uint8Array
      | Uint16Array
      | Uint32Array
      | Uint8ClampedArray;
    const typeName = typedArray.constructor.name;
    return `${typeName} [Length: ${typedArray.length}]`;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return "Array [0]";
    }

    // For arrays under the limit, return recursive shapes
    if (data.length <= arrayLimit) {
      return data.map((item) =>
        getShapeInternal(item, currentDepth + 1, maxDepth, arrayLimit, visited),
      );
    }

    // For large arrays, determine the union of types
    const types = new Set<string>();
    for (const item of data) {
      const itemShape = getShapeInternal(
        item,
        currentDepth + 1,
        maxDepth,
        arrayLimit,
        visited,
      );
      if (typeof itemShape === "string") {
        types.add(itemShape);
      } else if (Array.isArray(itemShape)) {
        types.add("Array");
      } else {
        types.add("Object");
      }
    }

    const typeUnion = Array.from(types).sort().join(" | ");
    return `Array<${typeUnion}> [Length: ${data.length}]`;
  }

  // Handle special objects
  const objectType = Object.prototype.toString.call(data);

  if (objectType === "[object Date]") {
    return "Date";
  }

  if (objectType === "[object RegExp]") {
    return "RegExp";
  }

  if (objectType === "[object Map]") {
    const map = data as Map<unknown, unknown>;
    return `Map [Size: ${map.size}]`;
  }

  if (objectType === "[object Set]") {
    const set = data as Set<unknown>;
    return `Set [Size: ${set.size}]`;
  }

  // Handle plain objects
  if (objectType === "[object Object]") {
    const result: { [key: string]: ShapeResult } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = getShapeInternal(
          (data as Record<string, unknown>)[key],
          currentDepth + 1,
          maxDepth,
          arrayLimit,
          visited,
        );
      }
    }
    return result;
  }

  // Fallback for unknown object types
  return "Object";
}

// Re-export types
export type { ShapeOptions, ShapeResult } from "./types.js";
