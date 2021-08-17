---
"@udecode/plate-common": patch
---

fix:
- `getPointBefore`: it's now doing a strict equality between the lookup text and `matchString` instead of `includes` 
