---
"@platejs/plate": minor
---

Added `/static` export path that re-exports from `@platejs/core/static`. This provides a unified entry point for static rendering functionality.

**New Features:**
- Added `platejs/static` import path for static rendering utilities
- Re-exports all static functionality from `@platejs/core/static`

**Usage:**
```typescript
import { PlateStatic, serializeHtml } from 'platejs/static';
```