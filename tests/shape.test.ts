import { getSilhouette } from "../src/index";

describe("getSilhouette", () => {
  describe("Primitives", () => {
    it("should handle string", () => {
      expect(getSilhouette("hello")).toBe("string");
    });

    it("should handle number", () => {
      expect(getSilhouette(42)).toBe("number");
      expect(getSilhouette(3.14)).toBe("number");
      expect(getSilhouette(NaN)).toBe("number");
      expect(getSilhouette(Infinity)).toBe("number");
    });

    it("should handle boolean", () => {
      expect(getSilhouette(true)).toBe("boolean");
      expect(getSilhouette(false)).toBe("boolean");
    });

    it("should handle null", () => {
      expect(getSilhouette(null)).toBe("null");
    });

    it("should handle undefined", () => {
      expect(getSilhouette(undefined)).toBe("undefined");
    });

    it("should handle bigint", () => {
      expect(getSilhouette(BigInt(9007199254740991))).toBe("bigint");
    });

    it("should handle symbol", () => {
      expect(getSilhouette(Symbol("test"))).toBe("symbol");
    });
  });

  describe("Functions", () => {
    it("should handle anonymous function", () => {
      expect(getSilhouette(() => {})).toBe("Function");
    });

    it("should handle named function", () => {
      function namedFunc() {}
      expect(getSilhouette(namedFunc)).toBe("Function(namedFunc)");
    });

    it("should handle arrow function", () => {
      const arrowFunc = () => {};
      expect(getSilhouette(arrowFunc)).toBe("Function(arrowFunc)");
    });
  });

  describe("Arrays", () => {
    it("should handle empty array", () => {
      expect(getSilhouette([])).toBe("Array [0]");
    });

    it("should handle small array with numbers", () => {
      expect(getSilhouette([1, 2, 3])).toEqual(["number", "number", "number"]);
    });

    it("should handle small array with mixed types", () => {
      expect(getSilhouette([1, "hello", true])).toEqual([
        "number",
        "string",
        "boolean",
      ]);
    });

    it("should handle small array with nested objects", () => {
      const result = getSilhouette([{ a: 1 }, { b: "test" }]);
      expect(result).toEqual([{ a: "number" }, { b: "string" }]);
    });

    it("should handle large array (over arrayLimit)", () => {
      const largeArray = new Array(10000).fill(42);
      const result = getSilhouette(largeArray);
      expect(result).toBe("Array<number> [Length: 10000]");
    });

    it("should handle large array with mixed types", () => {
      const mixedArray = [
        ...new Array(50).fill(1),
        ...new Array(50).fill("test"),
      ];
      const result = getSilhouette(mixedArray);
      expect(result).toBe("Array<number | string> [Length: 100]");
    });

    it("should handle array just at the limit", () => {
      const array = new Array(20).fill(1);
      const result = getSilhouette(array);
      expect(result).toEqual(new Array(20).fill("number"));
    });

    it("should handle array just over the limit", () => {
      const array = new Array(21).fill(1);
      const result = getSilhouette(array);
      expect(result).toBe("Array<number> [Length: 21]");
    });
  });

  describe("Typed Arrays", () => {
    it("should handle Float32Array", () => {
      const arr = new Float32Array([1.1, 2.2, 3.3]);
      expect(getSilhouette(arr)).toBe("Float32Array [Length: 3]");
    });

    it("should handle Float64Array", () => {
      const arr = new Float64Array(1000);
      expect(getSilhouette(arr)).toBe("Float64Array [Length: 1000]");
    });

    it("should handle Int8Array", () => {
      const arr = new Int8Array([1, 2, 3]);
      expect(getSilhouette(arr)).toBe("Int8Array [Length: 3]");
    });

    it("should handle Int16Array", () => {
      const arr = new Int16Array(100);
      expect(getSilhouette(arr)).toBe("Int16Array [Length: 100]");
    });

    it("should handle Int32Array", () => {
      const arr = new Int32Array(500);
      expect(getSilhouette(arr)).toBe("Int32Array [Length: 500]");
    });

    it("should handle Uint8Array", () => {
      const arr = new Uint8Array([255, 0, 128]);
      expect(getSilhouette(arr)).toBe("Uint8Array [Length: 3]");
    });

    it("should handle Uint16Array", () => {
      const arr = new Uint16Array(200);
      expect(getSilhouette(arr)).toBe("Uint16Array [Length: 200]");
    });

    it("should handle Uint32Array", () => {
      const arr = new Uint32Array(300);
      expect(getSilhouette(arr)).toBe("Uint32Array [Length: 300]");
    });

    it("should handle Uint8ClampedArray", () => {
      const arr = new Uint8ClampedArray([255, 0, 128]);
      expect(getSilhouette(arr)).toBe("Uint8ClampedArray [Length: 3]");
    });

    it("should handle large Float32Array (ML use case)", () => {
      const arr = new Float32Array(4096);
      expect(getSilhouette(arr)).toBe("Float32Array [Length: 4096]");
    });
  });

  describe("Special Objects", () => {
    it("should handle Date", () => {
      expect(getSilhouette(new Date())).toBe("Date");
    });

    it("should handle RegExp", () => {
      expect(getSilhouette(/test/g)).toBe("RegExp");
      expect(getSilhouette(new RegExp("test"))).toBe("RegExp");
    });

    it("should handle Map", () => {
      const map = new Map();
      map.set("a", 1);
      map.set("b", 2);
      expect(getSilhouette(map)).toBe("Map [Size: 2]");
    });

    it("should handle empty Map", () => {
      expect(getSilhouette(new Map())).toBe("Map [Size: 0]");
    });

    it("should handle Set", () => {
      const set = new Set([1, 2, 3]);
      expect(getSilhouette(set)).toBe("Set [Size: 3]");
    });

    it("should handle empty Set", () => {
      expect(getSilhouette(new Set())).toBe("Set [Size: 0]");
    });
  });

  describe("Plain Objects", () => {
    it("should handle simple object", () => {
      expect(getSilhouette({ a: 1, b: "test" })).toEqual({
        a: "number",
        b: "string",
      });
    });

    it("should handle nested object", () => {
      const obj = {
        user: {
          name: "John",
          age: 30,
          address: {
            city: "NYC",
            zip: 10001,
          },
        },
      };
      expect(getSilhouette(obj)).toEqual({
        user: {
          name: "string",
          age: "number",
          address: {
            city: "string",
            zip: "number",
          },
        },
      });
    });

    it("should handle empty object", () => {
      expect(getSilhouette({})).toEqual({});
    });

    it("should handle object with array property", () => {
      const obj = {
        items: [1, 2, 3],
      };
      expect(getSilhouette(obj)).toEqual({
        items: ["number", "number", "number"],
      });
    });

    it("should handle complex ML-like object", () => {
      const mlOutput = {
        predictions: new Float32Array(1000),
        labels: ["cat", "dog", "bird"],
        confidence: 0.95,
        metadata: {
          model: "resnet-50",
          version: "1.0",
        },
      };
      expect(getSilhouette(mlOutput)).toEqual({
        predictions: "Float32Array [Length: 1000]",
        labels: ["string", "string", "string"],
        confidence: "number",
        metadata: {
          model: "string",
          version: "string",
        },
      });
    });
  });

  describe("Circular References", () => {
    it("should handle self-referencing object", () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      const result = getSilhouette(obj);
      expect(result).toEqual({
        a: "number",
        self: "[Circular]",
      });
    });

    it("should handle circular reference in array", () => {
      const arr: any[] = [1, 2];
      arr.push(arr);
      const result = getSilhouette(arr);
      expect(result).toEqual(["number", "number", "[Circular]"]);
    });

    it("should handle nested circular reference", () => {
      const obj: any = {
        a: {
          b: {
            c: null,
          },
        },
      };
      obj.a.b.c = obj;
      const result = getSilhouette(obj);
      expect(result).toEqual({
        a: {
          b: {
            c: "[Circular]",
          },
        },
      });
    });
  });

  describe("Max Depth", () => {
    it("should respect default maxDepth", () => {
      const deep = {
        l1: {
          l2: {
            l3: {
              l4: {
                l5: {
                  l6: "too deep",
                },
              },
            },
          },
        },
      };
      const result = getSilhouette(deep);
      expect(result).toEqual({
        l1: {
          l2: {
            l3: {
              l4: {
                l5: "[Max Depth]",
              },
            },
          },
        },
      });
    });

    it("should respect custom maxDepth", () => {
      const deep = {
        l1: {
          l2: {
            l3: "value",
          },
        },
      };
      const result = getSilhouette(deep, { maxDepth: 2 });
      expect(result).toEqual({
        l1: {
          l2: "[Max Depth]",
        },
      });
    });

    it("should allow maxDepth of 0", () => {
      const obj = { a: 1 };
      const result = getSilhouette(obj, { maxDepth: 0 });
      expect(result).toBe("[Max Depth]");
    });
  });

  describe("Custom Options", () => {
    it("should respect custom arrayLimit", () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const result = getSilhouette(arr, { arrayLimit: 5 });
      expect(result).toBe("Array<number> [Length: 6]");
    });

    it("should handle arrayLimit of 0", () => {
      const arr = [1, 2, 3];
      const result = getSilhouette(arr, { arrayLimit: 0 });
      expect(result).toBe("Array<number> [Length: 3]");
    });

    it("should combine maxDepth and arrayLimit", () => {
      const data = {
        items: [
          { deep: { nested: { value: 1 } } },
          { deep: { nested: { value: 2 } } },
        ],
      };
      const result = getSilhouette(data, { maxDepth: 3, arrayLimit: 10 });
      // Depth counting: root (0) -> items array (1) -> array elements (2) -> deep object (3 = max depth)
      expect(result).toEqual({
        items: [{ deep: "[Max Depth]" }, { deep: "[Max Depth]" }],
      });
    });
  });

  describe("Performance", () => {
    it("should handle large array quickly", () => {
      const largeArray = new Array(50000).fill(42);
      const start = Date.now();
      getSilhouette(largeArray);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it("should handle large Float32Array quickly", () => {
      const largeTypedArray = new Float32Array(100000);
      const start = Date.now();
      getSilhouette(largeTypedArray);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it("should handle deeply nested object quickly", () => {
      let deep: any = { value: 1 };
      for (let i = 0; i < 100; i++) {
        deep = { nested: deep };
      }
      const start = Date.now();
      getSilhouette(deep, { maxDepth: 10 });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle object with numeric keys", () => {
      const obj = { 0: "a", 1: "b", 2: "c" };
      expect(getSilhouette(obj)).toEqual({
        0: "string",
        1: "string",
        2: "string",
      });
    });

    it("should handle object with symbol keys (ignored by for...in)", () => {
      const sym = Symbol("test");
      const obj = { [sym]: "value", normal: "key" };
      // Symbol keys are not enumerable with for...in
      expect(getSilhouette(obj)).toEqual({
        normal: "string",
      });
    });

    it("should handle array with holes", () => {
      const arr = new Array(5);
      arr[0] = 1;
      arr[4] = 5;
      const result = getSilhouette(arr);
      // Array.map() doesn't call the callback for holes, so they remain as actual undefined
      expect(result).toEqual([
        "number",
        undefined,
        undefined,
        undefined,
        "number",
      ]);
    });

    it("should handle array-like object", () => {
      const arrayLike = { 0: "a", 1: "b", length: 2 };
      expect(getSilhouette(arrayLike)).toEqual({
        0: "string",
        1: "string",
        length: "number",
      });
    });

    it("should handle class instance", () => {
      class MyClass {
        public prop = 42;
      }
      const instance = new MyClass();
      expect(getSilhouette(instance)).toEqual({ prop: "number" });
    });

    it("should handle mixed array with objects and arrays", () => {
      const data = [{ a: 1 }, [1, 2], "string", 42];
      const result = getSilhouette(data);
      expect(result).toEqual([
        { a: "number" },
        ["number", "number"],
        "string",
        "number",
      ]);
    });
  });
});
