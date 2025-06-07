---
'@udecode/plate-utils': minor
---

- New plugin `SingleBlockPlugin` to restrict editor content to a single block while preserving line breaks, while `SingleLinePlugin` prevents all line breaks.
- `@platejs/utils` (and by extension, `platejs`) now exports a comprehensive `KEYS` object containing all official plugin keys.

  - This is intended to improve decoupling and provide a centralized way to reference plugin keys.
  - Example Usage:

    ```ts
    import { KEYS } from 'platejs';

    // Instead of: ParagraphPlugin.key
    // Use: KEYS.p
    ```

- Many node type definitions (e.g., `TParagraphElement`, `TLinkElement`) are also now exported from `@platejs/utils` (and re-exported by `platejs`), in addition to being available from their specific plugin packages if those still exist or from `@platejs/basic-nodes`.
