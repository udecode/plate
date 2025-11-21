# Bug Report: `int is not defined` error with Turbopack in Next.js 16

**Environment:**
- zod: 4.1.12
- Next.js: 16.0.3 (Turbopack)
- Package Manager: Bun 1.2.22
- Setup: Monorepo

**Issue:**
When using zod v4 with Next.js 16's Turbopack, we get a runtime error:

```
ReferenceError: int is not defined
    at ../../node_modules/zod/v4/classic/schemas.js (348:33)
```

**Code location:**
```javascript
inst.int = (params) => inst.check(int(params));  // Line 348
```

The `int` function is not defined in scope when bundled by Turbopack.

**Reproduction:**
1. Create Next.js 16 app with Turbopack enabled
2. Install zod@4.1.12 in a monorepo
3. Import zod in a component
4. Run dev server - throws "int is not defined"

**Expected:**
zod v4 should work with Turbopack

**Workaround:**
- Downgrade to zod v3.23.8, or
- Use `next dev --webpack` instead of Turbopack

**Additional context:**
The issue is in `/v4/classic/schemas.js` where helper functions like `int` are referenced but not properly bundled by Turbopack.

**Stack trace:**
```
inst.int
../../node_modules/zod/v4/classic/schemas.js (348:33)
module evaluation
../../node_modules/ai/src/tool/mcp/json-rpc-message.ts (9:41)
```
