# Plate plugin constructor-first `.extend()` audit

Objective:
Move every constructor-accessible initial plugin contribution out of
`.extend()` across Plate source, registry examples, docs, tests, and release
prose. Keep `.extend()` only for an earlier-stage capability or resolved
consumer configuration, an imported/prebuilt descriptor, or a shared factory
the constructor cannot own.

Completion threshold:
- `discussion-kit.tsx` owns `selectors` in `createPlatePlugin`.
- Every tracked plugin-authoring `.extend()` is migrated or classified by an
  exact source-enforced exception.
- Constructor callbacks infer `api`, `read`, `selectors`, `update`,
  `extension`, and `codecs`, including declaration emit.
- Current docs teach constructor-first authoring and terminal `.configure()`.
- Source audit, focused tests, all package builds/typechecks, docs compilation,
  Browser proof, lint, doctrine validation, and structured review are recorded.

Verification surface:
- AST/source audit:
  `node tooling/scripts/check-plate-schema-adoption.mjs --audit`
- Checker tests:
  `bun test tooling/scripts/check-plate-schema-adoption.test.mjs`
- Focused contracts:
  `bun test packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/internal/plugin/resolvePlugins.spec.tsx packages/list/src/lib/BaseListPlugin.spec.tsx`
- Published declaration graph: `pnpm typecheck`
- Docs parser: `pnpm --filter www build:source`
- Formatting: `pnpm lint:fix`
- Doctrine: `node .agents/rules/plate-next/scripts/version.mjs validate`
- Browser:
  `http://localhost:3000/docs/discussion` and
  `http://localhost:3000/blocks/discussion-demo`
- Review: `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output`

Constraints:
- Constructor is the default owner for every initial contribution, including
  contextual callbacks.
- `.extend()` is not justified by file size, callback syntax, builder-context
  access, or a desire to group fields.
- Repeat `.extend()` only when a later stage consumes an earlier stage.
- `.configure()` remains the terminal consumer override and does not widen.
- Base/static code never imports React package entrypoints; static components
  bind through the Base plugin `component` field.
- Preserve root Markdown API and the accepted options-only plugin contract.
- Fix inference at the Core builder owner; do not annotate callbacks or cast
  plugin exports to hide generic regressions.
- Preserve unrelated shared-checkout work and do not edit generated registry
  output or templates.

Boundaries:
- In scope: plugin authoring under `packages/**`, `apps/**`, `content/**`,
  current doctrine, builder contracts, checker enforcement, and the release
  prose already carrying this public API work.
- Historical migration snapshots may show historical `.extend()` shapes.
- Plite `editor.extend`, transaction `extend`, DOM `Range.extend`, test matcher
  `expect.extend`, schema library `.extend`, and runtime plugin implementation
  calls are different APIs.
- No git staging, commit, push, PR, branch switch, or other-task coordination.

Blocked condition:
Blocked only if constructor inference cannot preserve source and emitted
declaration types without weakening the public contract, or if a surviving
production `.extend()` cannot be classified from its live owner. Neither
condition remains.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Broad usage sweep | yes | User explicitly requested all `.extend()` usage, not one package |
| Core inference owner | yes | Constructor callback typing required Core generic repair |
| Docs and release prose | yes | Current docs taught the staged shape |
| Browser | yes | Registry discussion kit has runnable docs and standalone demo routes |
| Package attestation | no | This is a cross-repo API sweep, not a package-by-package Plate Next attestation |

Work Checklist:
- [x] Copy the user’s constructor-first rule and exception boundary.
- [x] Move Discussion selectors into `createPlatePlugin`.
- [x] Audit all 4,699 tracked source and documentation files.
- [x] Move independent initial contributions into constructors.
- [x] Repair Core constructor callback and declaration inference.
- [x] Enforce every surviving direct creator stage by exact file and fields.
- [x] Repair source rules, Plate Vision, generated skills, and Plate Next v10.
- [x] Update current docs, examples, tests, changesets, and registry prose.
- [x] Prove List’s resolved consumer configuration exception with a regression
      test and restore its dynamic override stage.
- [x] Run focused runtime/type contracts and the complete package artifact
      graph.
- [x] Verify docs and standalone discussion routes in Browser.
- [x] Run final lint, source audit, doctrine validation, and structured review.

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Classification | complete | 4,699-file AST/source audit |
| Migration | complete | Independent fields live in constructors |
| Core inference | complete | Core contracts and emitted package graph pass |
| Docs and doctrine | complete | Docs compile; Plate Next v10 validates |
| Runtime proof | complete | Focused tests and Browser routes pass |
| Closeout | complete | Lint and structured review recorded below |

Surviving direct creator stages:
- 18 exact stages are enforced in
  `tooling/scripts/check-plate-schema-adoption.mjs`.
- Blockquote, Code Block, Indent, and Column shortcuts consume constructor-owned
  update method names.
- Comment update consumes constructor-owned API.
- List override consumes resolved consumer `targetPluginNames`; its later update
  and extension stages consume earlier inferred capabilities.
- List Classic update and extension consume earlier inferred capabilities.
- Table’s ordered API/update/extension stages are genuinely dependent.
- Copilot and Block Selection each require one shared lexical factory across
  several fields.
- Other production calls adapt imported/prebuilt descriptors or factory-owned
  descriptors whose constructor is inaccessible. The checker rejects a new
  direct creator stage unless its exact file and field sequence is reviewed.

Key correction:
The first List migration made its Indent override static. The full suite caught
that configured `targetPluginNames: ['callout']` stopped propagating. Restoring
`.extend(({ plugin }) => ({ override: ... }))` is correct because the stage
reads resolved consumer configuration. The focused List file passes 48/48.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Discussion constructor ownership | yes | Docs and live source show selectors directly in `createPlatePlugin` |
| Exhaustive source audit | yes | Passed across 4,699 source/docs files |
| Checker regression suite | yes | 24/24 passed |
| Focused runtime contracts | yes | 134/134 passed across Core resolve/create and List |
| Package artifact graph | yes | 57/57 builds and 57/57 package typechecks passed |
| Docs parser | yes | `www build:source` passed |
| Browser routes | yes | Both routes returned 200; standalone editor and Discussions UI rendered |
| Browser console | yes | Zero warnings and zero errors |
| Lint | yes | 4,510 files checked; one existing oversized artifact warning |
| Doctrine | yes | Plate Next v10 valid: 41 active, 1 retired |
| Barrels | no | No new/moved public export files in this constructor sweep |
| Release artifacts | yes | Existing API changesets and registry release prose carry the public shape |
| Full fast suite | partial | 3,235 tests passed; the only in-scope List failure was fixed; 15 shared-tree failures remain outside this constructor audit |
| Structured review | yes | Final helper result recorded in Verification evidence |

Verification evidence:
- `node tooling/scripts/check-plate-schema-adoption.mjs --audit`: passed,
  4,699 files, generated/template roots excluded.
- Checker tests: 24 passed, 0 failed.
- Focused Core/List tests: 134 passed, 0 failed, 325 expectations.
- List package: typecheck, declaration build, and 48/48 focused tests passed
  after the dynamic override correction.
- `pnpm typecheck`: 57 package builds and 57 package typechecks passed.
- `pnpm --filter www build:source`: passed.
- Browser: `/docs/discussion` rendered constructor-owned selectors;
  `/blocks/discussion-demo` rendered the editor, Discussions panel, comments,
  suggestions, and discussion badge; console warnings/errors were empty.
- `pnpm lint:fix`: passed across 4,510 files with only the existing 1.2 MiB
  Wordgard coverage-manifest size warning.
- Plate Next registry: v10, 41 active, 1 retired.
- Structured review on the final tree: `patch is correct`, confidence 0.52,
  with no actionable findings. The reviewer noted only the bundle size and
  that its read-only run did not execute the full suite; the owning verification
  above records both the green gates and the unrelated suite failures.

Reboot status:
No reboot or environment reset is required. Package resolution, declaration
emit, docs generation, and Browser runtime all work in the current checkout.

Open risks:
The shared full fast suite still has 15 failures in Markdown serialization,
codec diagnostics, AI snapshots, MDX deserialization, and Tabbable configuration.
The only failure in the constructor-first scope was List override propagation;
it is repaired and covered by 48/48 focused tests. No surviving `.extend()`
classification is unproved.

Final handoff:
- Best shape: constructor owns all initial fields; `.extend()` is exceptional
  staged adaptation; `.configure()` is the terminal consumer override.
- Rejected shape: `.extend()` used merely for selectors, callback context,
  visual grouping, or field taxonomy.
- No Plite gap remains. The Core builder now carries the constructor inference
  needed by Plate packages and emitted consumers.
- No compatibility alias was added. Deleted specialized builder verbs stay
  deleted.
