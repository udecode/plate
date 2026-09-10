---
"plitejs": patch
---

- Avoid redundant document changes and correction loops when removing absent node properties.
- Fit compatible partial text ranges across marked leaves and containers while preserving unselected content and schema boundaries.
- Limit missing-property canonicalization to compiled default and required candidates while preserving root and ancestor target checks.
- Reuse correction method tables within their owning transaction while retaining live draft reads and expired-write guards.
