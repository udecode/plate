---
description: Remove a Plate/Plite feature and every caller, fallback, test and document for its deleted behavior.
name: hard-cut
metadata:
  skiller:
    source: .agents/rules/hard-cut.mdc
---

# Hard Cut

Apply [the Plate workflow](../task/references/workflow.md) for plan, authority, proof and review ownership.


Use this when a feature should die, not linger.

## Rules

- Delete the surface. Do not deprecate it.
- Do not leave `throw new Error("Not implemented")`, placeholder notices,
  "feature removed" banners, or TODOs about bringing it back unless the user
  explicitly asks.
- Do not keep compatibility aliases, deprecated shims, fallback parsing,
  migration bridges, or dead exports.
- Delete tests for deleted behavior. Keep tests only for the behavior that
  still exists.
- Delete comments that describe deleted code or mourn the old feature.
- If removal exposes adjacent dead code, keep cutting until the graph is clean.

## Sweep

1. Find the real surface area:
   - exports
   - commands and flags
   - routes
   - UI entrypoints
   - feature flags
   - docs and examples
2. Trace references with `rg`.
3. Delete the implementation and the glue:
   - call sites
   - types
   - state
   - tests
   - docs
   - comments
4. Grep again for the removed name and obvious aliases.
5. Run the narrowest honest verification for the surviving product.

## Smells

- deprecated notices
- not-implemented throws
- stub handlers
- dead enum or union members
- permanently-false feature-flag branches
- unused env vars and config
- tests that only prove the deleted feature used to exist

## Bias

If the choice is between deleting more code and leaving a zombie boundary, delete
more code.
