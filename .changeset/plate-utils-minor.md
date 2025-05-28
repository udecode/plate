---
'@udecode/plate-utils': minor
---

- `@udecode/plate-utils` (and by extension, `@udecode/plate`) now exports a comprehensive `KEYS` object containing all official plugin keys.

  - This is intended to improve decoupling and provide a centralized way to reference plugin keys.
  - Example Usage:

    ```ts
    import { KEYS } from '@udecode/plate'; // Or from '@udecode/plate-utils'

    // Instead of: ParagraphPlugin.key
    // Use: KEYS.p

    // Instead of: ImagePlugin.key
    // Use: KEYS.img
    ```

- Many node type definitions (e.g., `TParagraphElement`, `TLinkElement`) are also now exported from `@udecode/plate-utils` (and re-exported by `@udecode/plate`), in addition to being available from their specific plugin packages if those still exist or from `@udecode/plate-basic-nodes`.
