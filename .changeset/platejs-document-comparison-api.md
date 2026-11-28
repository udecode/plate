---
'platejs': patch
---

Remove three-way comparison and `resolveComparison` from `platejs/diff`, collapse `TwoWayComparison` into `Comparison` without `kind`, and move live comparison import from `proposeAuthoredComparison` to `editor.plugin(AuthoredPlugin).api.proposeComparison`. `compare` now hashes document `records` alongside `meta` in `before.envelopeFingerprint`, so callers importing through `proposeComparison` should pass `editor.read.value()` as `before` instead of `editor.read.children()`.

**Migration:**

```ts
// Before
import { proposeAuthoredComparison } from 'platejs/authored';
import { compare, type TwoWayComparison } from 'platejs/diff';

const comparison: TwoWayComparison = await compare({ before, after, schema });
const result = proposeAuthoredComparison(editor, { comparison, groupIds });

// After
import { AuthoredPlugin } from 'platejs/authored';
import { compare, type Comparison } from 'platejs/diff';

const comparison: Comparison = await compare({ before, after, schema });
const result = editor
  .plugin(AuthoredPlugin)
  .api.proposeComparison({ comparison, groupIds });
```
