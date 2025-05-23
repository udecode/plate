---
'@udecode/plate-utils': minor
---

- This package now exports all plugin keys and node types to improve decoupling.

```ts
import { KEYS } from '@udecode/plate';

// Before
ParagraphPlugin.key;

// After
KEYS.p;
```
