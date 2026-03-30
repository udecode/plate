---
description: 'Command: sync-testing-skill'
name: sync-testing-skill
metadata:
  skiller:
    source: .agents/rules/sync-testing-skill.mdc
---

Scan package tests, update @.agents/rules/testing.mdc with new patterns. Follow writing-skills: DRY, ultra-concise, token-efficient.

**Process:**

1. Glob `packages/[PACKAGE]/**/*.spec.{ts,tsx}`
2. Read 6-8 diverse tests: plugins, transforms, components, hooks, utils
3. Identify patterns NOT in testing.mdc:
   - Imports (ONLY `mock`/`spyOn` from bun:test - describe/it/expect are global)
   - Test organization, mocking, assertions, RTL, edge cases
4. Update testing.mdc: Add to existing sections (DRY), one example per pattern, Quick Reference if frequent
5. Report: `Found X patterns → Updated Y sections`

**Critical:**

- Only actual codebase patterns. No theoretical examples. No duplication.
- Test globals (`describe`, `it`, `expect`, etc.) are global via `tooling/config/global.d.ts` - NO imports needed
- ONLY import `mock` and `spyOn` when used

**Package:** Specify path (e.g., `packages/media`)
