## 2026-02-18T04:10:00Z
- Objective: fix listed failing tests in table static spec only.
- Repro: `bun test apps/www/src/registry/ui/table-node-static.spec.tsx` fails 16/16 with same error: `ReferenceError: React is not defined`.
- Hypothesis (confidence 96): Bun test transpilation here needs explicit React import for JSX in this spec.
- Plan: add `import React from 'react';` to the spec, rerun targeted tests, commit atomic fix.
## 2026-02-18T04:13:00Z
- Implemented: added React import to `apps/www/src/registry/ui/table-node-static.spec.tsx`.
- Implemented: relaxed background color expectation to handle DOM style normalization (`#ff0000` or `rgb(255, 0, 0)`).
- Verification: `bun test apps/www/src/registry/ui/table-node-static.spec.tsx` => 16 pass, 0 fail.
- Note: React hydration warnings are emitted by invalid semantic nesting in test render tree via Slate wrapper, but assertions pass.
