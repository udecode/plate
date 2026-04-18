---
title: CSV papaparse CJS interop needs a default import
type: solution
date: 2026-03-25
status: completed
category: test-failures
module: CSV
problem_type: test_failure
component: parser_deserialization
root_cause: wrong_api
resolution_type: code_change
severity: medium
tags:
  - csv
  - papaparse
  - esm
  - commonjs
  - vitest
  - node
  - verification
symptoms:
  - "Importing `@platejs/csv` through native Node ESM failed with `Named export 'parse' not found`."
  - "Vitest failed before any real assertions ran because the package entrypoint could not load `papaparse`."
---

# CSV papaparse CJS interop needs a default import

## Problem

`@platejs/csv` exposes an ESM entrypoint from [packages/csv/dist/index.js](packages/csv/dist/index.js). That entrypoint imported `parse` as a named export from `papaparse`.

That looks harmless until native Node ESM loads the package. `papaparse` is CommonJS, so Node rejects `import { parse } from 'papaparse'` and the whole package explodes before any CSV logic runs.

## Root Cause

The deserializer in [packages/csv/src/lib/deserializer/utils/deserializeCsv.ts](packages/csv/src/lib/deserializer/utils/deserializeCsv.ts) used a named import:

```ts
import { parse } from "papaparse";
```

The build preserved that shape in the published ESM output. Native Node ESM does not guarantee named exports from a CommonJS dependency, so the runtime import failed with:

```txt
SyntaxError: Named export 'parse' not found. The requested module 'papaparse' is a CommonJS module
```

There was one extra trap here: Bun can hide the issue. A Bun test that shells out through `process.execPath` is still launching Bun, not Node, so the regression test can go green while the published package stays broken.

## Fix

Load Papa Parse through the CommonJS-safe default import and call `parse` from that namespace:

```ts
import Papa from "papaparse";

const parseCsv = <T>(data: string, config?: CsvParseOptions) =>
  Papa.parse<T>(data, {
    ...config,
    download: false,
    worker: false,
  });
```

That makes the built entrypoint emit:

```ts
import Papa from "papaparse";
```

Node can load that form correctly from an ESM package, so Vitest and other native ESM consumers stop failing at module load time.

## Verification

Add a regression test at [packages/csv/src/lib/esmInterop.spec.ts](packages/csv/src/lib/esmInterop.spec.ts) that imports the built package entrypoint through real Node ESM:

```ts
execFileSync("node", [
  "--input-type=module",
  "--eval",
  `await import(${JSON.stringify(distEntry)});`,
]);
```

That test matters because it proves the package surface, not just the TypeScript source.

## Prevention

- When an ESM package depends on a CommonJS library, default to the namespace-safe import unless you have hard proof that named exports survive native Node ESM.
- If the bug report mentions Vitest, Node ESM, or `Named export ... not found`, test the built package entrypoint directly.
- Do not trust Bun alone for this class of issue. If the failure is about Node-native module loading, the regression test must invoke `node`, not `process.execPath`.
