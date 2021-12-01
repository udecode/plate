---
"@udecode/plate-core": patch
"@udecode/plate-link": patch
---

- fix link upsert on space 
- `getPointBefore`: will return early if the point before is in another block. Removed `multiPaths` option as it's not used anymore.
