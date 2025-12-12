# obj-silhouette

> Debug massive objects without polluting your console.

A lightweight TypeScript utility that summarises the **shape** of complex data
structures instead of logging their raw content. I built this primarily to help
debug machine vision model outputs and larger, untyped API responses.

## Why?

**The problem:** Logging massive objects is slow and useless. You don't need to
see every value, you just need to see a little bit of data and the structure of
the object you're working with.

**The solution:** `obj-silhouette` tells you _what shape your data has_ and
gives you a little taste of the data the object holds, without dumping the
entire thing.

```typescript
// Instead of this nightmare:
console.log(modelOutput);
// { predictions: Float32Array(5000) [0.234, 0.891, 0.445, ...4997 more] }

// Get this:
console.log(getSilhouette(modelOutput));
// { predictions: "Float32Array [Length: 5000]" }
```

## Install

```bash
npm install obj-silhouette
```

Zero dependencies. Works everywhere.

## Usage

```typescript
import { getSilhouette } from "obj-silhouette";

// ML model output
const predictions = {
  logits: new Float32Array(10000),
  labels: ["cat", "dog", "bird"],
  metadata: {
    model: "resnet-50",
    timestamp: new Date(),
  },
};

console.log(getSilhouette(predictions));
```

**Output:**

```json
{
  "logits": "Float32Array [Length: 10000]",
  "labels": ["string", "string", "string"],
  "metadata": {
    "model": "string",
    "timestamp": "Date"
  }
}
```

## What It Does

- **Primitives** → Their type: `"string"`, `"number"`, `"boolean"`, etc.
- **Functions** → `"Function"` or `"Function(name)"`
- **Small arrays** → Recursive shape for each element:
  `["number", "string", {foo: "number"}]`
- **Large arrays** → Summary: `"Array<number> [Length: 50000]"`
- **Typed arrays** → `"Float32Array [Length: 4096]"` (crucial for ML/AI)
- **Objects** → Recursively mapped: `{user: {name: "string", age: "number"}}`
- **Special types** → `"Date"`, `"Map [Size: 3]"`, `"Set [Size: 10]"`,
  `"RegExp"`
- **Circular refs** → Detected safely: `"[Circular]"`
- **Deep nesting** → Respects max depth: `"[Max Depth]"`

## Configuration

```typescript
getSilhouette(data, {
  maxDepth: 5, // Stop recursion at depth 5 (default)
  arrayLimit: 20, // Show full shape for arrays ≤ 20 items (default)
});
```

### `arrayLimit`

- Arrays with ≤ `arrayLimit` items: Show shape of each element
- Arrays with > `arrayLimit` items: Show type summary like
  `"Array<number> [Length: 1000]"`

### `maxDepth`

- Prevents infinite recursion on deeply nested objects
- When depth is exceeded, returns `"[Max Depth]"`

## Use Cases

**Machine Learning**

```typescript
const modelOutput = {
  embeddings: new Float32Array(768),
  attentionWeights: new Float32Array(144),
  predictions: Array(1000).fill(Math.random()),
};

getSilhouette(modelOutput);
// See structure instantly, no console freeze
```

**Large API Responses**

```typescript
const response = await fetch("/api/users");
const data = await response.json();

console.log(getSilhouette(data));
// Understand the response structure before digging in
```

**Debugging Circular References**

```typescript
const graph = { name: "root", children: [] };
graph.children.push(graph); // Oops, circular!

getSilhouette(graph);
// { name: "string", children: ["[Circular]"] }
```

**React Native / Mobile**

```typescript
// Don't crash the debugger with massive state objects
console.log(getSilhouette(reduxStore.getState()));
```

## TypeScript

Full type safety out of the box:

```typescript
import {
  getSilhouette,
  type ShapeOptions,
  type ShapeResult,
} from "obj-silhouette";

const options: ShapeOptions = {
  maxDepth: 3,
  arrayLimit: 10,
};

const result: ShapeResult = getSilhouette(myData, options);
```

## Performance

- **Large arrays:** < 100ms for 50,000+ elements
- **Typed arrays:** < 1ms (instant detection, no iteration)
- **Deep objects:** Handles 100+ levels of nesting with max depth protection
