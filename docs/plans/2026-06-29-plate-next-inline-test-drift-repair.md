# plate-next-inline-test-drift-repair

Objective:
Repair the `plate-next` review rule and the named Core spec so migrated tests keep main-style inline setup instead of extracting plugin arrays or helper variables to work around typing.

Completion threshold:
Done when `packages/core/src/internal/plugin/resolvePlugins.spec.tsx` no longer extracts construction-only plugin variables, `.agents/rules/plate-next.mdc` records the reusable rule, the generated `plate-next` skill mirrors it, focused Core spec proof passes, Core typecheck passes, and deliberate non-repairs are recorded.

Verification surface:
- Source audit: rule text exists in `.agents/rules/plate-next.mdc` and `.agents/skills/plate-next/SKILL.md`.
- Spec audit: remaining `const plugins` / `const plugin` variables in `resolvePlugins.spec.tsx` are test subjects, not construction-only drift.
- Runtime proof: focused Bun spec for `resolvePlugins.spec.tsx`.
- Type proof: Core package typecheck through Turbo.
- Format proof: Biome check on touched TypeScript files.

Constraints:
- Patch source-of-truth `.agents/rules/plate-next.mdc`, not generated skill by hand.
- Preserve inline plugin construction when the variable is not itself asserted or mutated.
- Do not broaden into unrelated Core files.
- Keep runtime assertions honest; use shallow type boundaries only where TypeScript recursion blocks runtime-focused assertions.

Boundaries:
- In scope: `resolvePlugins.spec.tsx`, source typing needed by that spec, `plate-next` rule source and generated mirror, this goal plan.
- Out of scope: full Core migration sweep, public API rename work, unrelated Plate v2 cleanup.
- Source of truth: user request to repair extracted `const plugins` drift and make it a durable `plate-next` rule.

Blocked condition:
Blocked only if inline setup could not be preserved without failing focused spec or Core typecheck; that did not happen.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | User asked to repair extracted `const plugins` in `resolvePlugins.spec.tsx` and add a `plate-next` no-drift rule. |
| Skill owner read | yes | `plate-next` and `autogoal` were loaded before durable repair. |
| Source owner selected | yes | `.agents/rules/plate-next.mdc` is the source; `SKILL.md` is generated. |
| Non-goals constrained | yes | No repo sweep beyond the named spec and source typing required by that spec. |

Work Checklist:
- [x] Captured the explicit request as checkable work.
- [x] Repaired construction-only `const plugins` / `const plugin` extraction in the named spec.
- [x] Kept subject variables where the test mutates, asserts, or passes the variable as the direct test input.
- [x] Added the durable `plate-next` rule forbidding main-style inline test drift.
- [x] Ran Skiller sync with `bun x skiller@latest apply`.
- [x] Verified source and generated skill mirror contain the new rule.
- [x] Fixed the overloaded `Parameters<typeof createBasePlugin>` helper typing by adding `CreateBasePluginInput`.
- [x] Ran focused runtime proof.
- [x] Ran Core typecheck.
- [x] Recorded deliberate non-repairs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch `.agents/rules/plate-next.mdc`. | Rule added under Plate Next Rules. |
| Generated skill sync | yes | Regenerate generated skill. | `bun x skiller@latest apply`; mirror audit found rule in `.agents/skills/plate-next/SKILL.md`. |
| Named spec repaired | yes | Inline construction-only plugin setup. | `resolvePlugins.spec.tsx` audit leaves only subject variables. |
| Helper/source typing repaired | yes | Avoid overloaded `Parameters<typeof createBasePlugin>` collapse. | `CreateBasePluginInput` exported and used by `resolveCreatePluginTest.ts`. |
| Runtime proof | yes | Run focused spec. | `pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx` passed. |
| Type proof | yes | Run Core typecheck. | `pnpm turbo typecheck --filter=./packages/core` passed. |
| Format proof | yes | Format/check touched TypeScript. | `pnpm exec biome check --write ...` passed. |
| Goal plan complete | yes | Run autogoal completion checker. | Final checker run recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Requirements copied into plan and owner selected. | none |
| Patch | complete | Spec, source rule, generated mirror, and helper typing patched. | none |
| Verification | complete | Focused spec, Core typecheck, mirror audit, and format proof passed. | none |
| Closeout | complete | Deliberate non-repairs and final handoff recorded. | none |

Findings:
- Extracting plugin variables hid the real problem: TypeScript recursion around full plugin inference in runtime-focused tests.
- `Parameters<typeof createBasePlugin>` is the wrong type source for overloaded plugin factories; it collapsed into the wrong branch under stricter tests.
- `targetPluginToInject` needed explicit input typing so inline callback parameters stay inferred.

Decisions and tradeoffs:
- Kept inline plugin construction for reviewability.
- Used `Reflect.get` and shallow plugin-list boundaries only in runtime API assertions where full type inference triggers TypeScript recursion; that is a local testing boundary, not a public API pattern.
- Did not remove subject variables used to compare original plugin state after editor resolution.

Deliberate non-repairs:
- Remaining `const plugins` in `resolvePlugins.spec.tsx` are direct test inputs for `resolvePlugins` / `applyPluginsToEditor`, or keyless plugin scenarios.
- Remaining option-merge `const plugin` variables are asserted after resolution, so inlining them would weaken the test.

Verification evidence:
- `rg -n 'Preserve main-style inline test setup|Do not extract \`const plugins\`|Inline editor/plugin construction|explicit callback/helper types' .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` found source and generated mirror hits.
- `pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx` passed with 40 tests and 96 expectations.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm exec biome check --write packages/core/src/internal/plugin/resolvePlugins.spec.tsx packages/core/src/internal/plugin/resolveCreatePluginTest.ts packages/core/src/lib/plugin/createBasePlugin.ts packages/core/src/lib/editor/SlateEditor.ts` passed.

Final repair handoff:
- Repaired expectation: Plate Next must preserve main-style inline test setup and fix source typing instead of reshaping tests.
- Repaired owner: `.agents/rules/plate-next.mdc`, synced to `.agents/skills/plate-next/SKILL.md`.
- Code path: `resolvePlugins.spec.tsx`, `resolveCreatePluginTest.ts`, and `createBasePlugin.ts`.
- Caveat: some runtime API assertions use a shallow type boundary because full plugin inference still hits TypeScript recursion.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after checker passes. |
| What is the goal? | Repair inline test drift and durable `plate-next` policy. |
| What have I learned? | Extracted plugin variables were masking type recursion and overloaded factory typing debt. |
| What have I done? | Patched spec shape, source typing, rule source, generated mirror, and proof. |

Open risks:
- The helper still uses a shallow plugin-list boundary for runtime-focused tests. That is acceptable for this named repair but should not become public API documentation.
