---
'@udecode/plate-basic-marks': minor
---

- `KbdPlugin` and `HighlightPlugin` are now part of `BasicMarksPlugin`.
- All mark plugins now have a `toggle` transform.
- **New Individual Heading Plugins**: Added `H1Plugin`, `H2Plugin`, `H3Plugin`, `H4Plugin`, `H5Plugin`, and `H6Plugin` as a more flexible alternative to `HeadingPlugin`. These allow for granular control over which heading levels to include and their individual configurations.

```ts
// Example usage in basic-elements-kit.tsx
import {
  H1Plugin,
  H2Plugin,
  H3Plugin,
} from '@udecode/plate-basic-elements/react';

export const BasicElementsKit = [
  H1Plugin.configure({
    node: { component: H1Element },
    shortcuts: { toggle: { keys: 'mod+alt+1' } },
  }),
  H2Plugin.configure({
    node: { component: H2Element },
    shortcuts: { toggle: { keys: 'mod+alt+2' } },
  }),
  H3Plugin.configure({
    node: { component: H3Element },
    shortcuts: { toggle: { keys: 'mod+alt+3' } },
  }),
];
```
