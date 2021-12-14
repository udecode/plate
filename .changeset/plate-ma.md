---
'@udecode/plate-plate': major
---

- renamed `plate-x-ui` to `plate-ui-x`: all packages depending on `styled-components` has `plate-ui` prefix
- renamed `plate-x-serializers` to `plate-serializers-x`
- is now exporting only these (new) packages:
  - `@udecode/plate-headless`: all unstyled packages
  - `@udecode/plate-ui`: all styled packages