---
"@udecode/plate-ui": minor
---

- add support for `plate-components.json` to avoid conflict with shadcn's `components.json`. If `plate-components.json` does not exist, `components.json` will be used.
- add support for custom ui dir in `components.json`: use `aliases > plate-ui`.
