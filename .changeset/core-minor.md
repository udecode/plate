---
"@platejs/core": patch
---

- Added `normalizeStaticValue` to **`@platejs/core`** for normalizing example editor values with deterministic node IDs and stable numeric `createdAt` metadata before SSR hydration.

  ```ts
  import { normalizeStaticValue } from "@platejs/core";

  const value = normalizeStaticValue(exampleValue);
  ```
