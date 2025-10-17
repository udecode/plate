---
"@platejs/core": minor
---

Added `/static` export path for React-free static rendering functionality. Static rendering components and utilities are now available via `@platejs/core/static` import.

**New Features:**
- Moved static rendering functionality from `lib/static` to root `static` directory
- Added dedicated `/static` export path in package.json
- Enables React-free usage of static rendering features

**Migration:**
```typescript
// Before
import { PlateStatic } from '@platejs/core/react';

// After
import { PlateStatic } from '@platejs/core/static';
```