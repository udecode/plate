---
'plitejs': patch
---

Remove three-way comparison and `resolveComparison` from `plitejs/diff`, collapse `TwoWayComparison` into `Comparison` without `kind`, and move live comparison import from `proposeAuthoredComparison` to `editor.api.authored.proposeComparison`. `compare` now hashes document `records` alongside `meta` in `before.envelopeFingerprint`, so callers importing through `proposeComparison` should pass `editor.read.value()` as `before` instead of `editor.read.children()`.

**Migration:**

```ts
// Before
import { proposeAuthoredComparison } from 'plitejs/authored';
import { compare, type TwoWayComparison } from 'plitejs/diff';

const comparison: TwoWayComparison = await compare({ before, after, schema });
const result = proposeAuthoredComparison(editor, { comparison, groupIds });

// After
import { compare, type Comparison } from 'plitejs/diff';

const comparison: Comparison = await compare({ before, after, schema });
const result = editor.api.authored.proposeComparison({ comparison, groupIds });
```
