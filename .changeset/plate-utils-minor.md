---
'@udecode/plate-utils': minor
---

- `@platejs/utils` (and by extension, `platejs`) now exports a comprehensive `KEYS` object containing all official plugin keys.

  - This is intended to improve decoupling and provide a centralized way to reference plugin keys.
  - Example Usage:

    ```ts
    import { KEYS } from 'platejs'; // Or from '@platejs/utils'

    // Instead of: ParagraphPlugin.key
    // Use: KEYS.p

    // Instead of: ImagePlugin.key
    // Use: KEYS.img
    ```

- Many node type definitions (e.g., `TParagraphElement`, `TLinkElement`) are also now exported from `@platejs/utils` (and re-exported by `platejs`), in addition to being available from their specific plugin packages if those still exist or from `@platejs/basic-nodes`.
