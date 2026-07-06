# plate-next raw plugin extension options

Objective:
Support raw plugin extension options; done when plugin builders default missing
extension names to the plugin key, real plugins use the new shape, and focused
proof passes.

Goal plan:
docs/plans/2026-07-05-plate-next-raw-plugin-extension-options.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: "why do we use defineEditorExtension({ in plugins: we should
  support both existing extensions but also just return defineEditorExtension
  options: so we dont need to call defineEditorExtension . without the name
  field: its the plugin field."
- mode: named API packet
- target surface: `createBasePlugin` / `createPlatePlugin` extension callback
  typing and runtime normalization
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, focused extension boilerplate
  audit
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: builder accepts built extensions and raw
  extension options; raw options without `name` use the owning plugin key; at
  least one real plugin omits `defineEditorExtension`; focused Core/Utils proof
  passes.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `extendExtension` accepts both existing built editor extensions and raw
  editor extension options.
- Raw options that omit `name` are normalized to the owning plugin key.
- Existing explicit extension names are preserved.
- Plugins whose extension name equals their plugin key no longer need
  `defineEditorExtension({ name: key, ... })` boilerplate.
- Plate Next rule/template records this as a recurring API law.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-raw-plugin-extension-options.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm check:core`
- package proof: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`;
  package tests/build as needed after source read
- shared Core gate: yes, builder/core API changed
- source audits: `rg -n "defineEditorExtension\\(" packages/core/src
  packages/utils/src`
- related Core sweep query / match count / patched count / deferred count:
  focused extension callback boilerplate audit before handoff
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: N/A unless source read proves a missing primitive
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-raw-plugin-extension-options.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no fake casts/local helper types, no compat sludge, correct
  Plite/Plate ownership, accepted owner/name/path drift, and focused proof or
  justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.

Boundaries:
- allowed edit scope: Core plugin builder/resolver/types, real Core/Utils
  plugin call sites, Plate Next source rule/template, generated skill mirror
  through `pnpm install`.
- package/API surfaces: `packages/core`, `packages/utils`; Plite only if the
  callback input type must come from Plite.
- docs/browser surfaces: no app/docs/browser route changes expected.
- non-goals: broad Core sweep, package-by-package migration, public docs
  rewrite, naming cleanup unrelated to extension options.
- out-of-scope package errors: non-Core/non-Utils failures are not blockers
  unless caused by this API change.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the builder cannot preserve extension inference without a
  larger public API fork that needs `plate-plan`/user review.

Current verdict:
- verdict: keep
- confidence: 100 for this named API packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Builder tests prove built extensions and raw callback options; real
  Utils plugins use raw options without explicit extension names; focused
  Core/Utils gate passed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact user requirement copied into Plate Next source and completion threshold. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` started this plan-backed objective. |
| Mode classified as named packet vs broad Core sweep | yes | Named API packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Builder should own ergonomic raw options; no compatibility shim. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Source files under `/Users/zbeyens/git/plate-2`; rule source is `.agents/rules/plate-next.mdc`. |
| Output budget strategy recorded | yes | Targeted `sed`/`rg`; no broad Core manifest. |
| Public API fork routing checked | yes | No separate plan needed unless source read proves inference cannot be preserved. |
| Gap policy checked | yes | Any missing Plite/Core extension type support will be named before workaround. |
| Related Core sweep policy checked | yes | Focused `defineEditorExtension`/`extendExtension` sweep required. |
| Review-mode rename freeze checked | yes | No renames intended. |
| Package review checklist initialized when in scope | no | N/A: not package review mode. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed; focused Core/Utils tests and typecheck passed. |
| Broad Core drift ledger coverage | no | N/A: named API packet, not broad Core sweep | Broad Core sweep not requested. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Named packet score 100; no high-drift rows in scoped review. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | See recommendation table below. |
| Plite/Plate gap ledger | no | N/A: no blocker found | Builder already supported the runtime model; tests and call sites made it explicit. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `rg -n "defineEditorExtension\\(\\{\\s*name:\\s*KEYS\\.|defineEditorExtension\\(\\{\\s*name:\\s*plugin|defineEditorExtension\\(\\{\\s*name:\\s*['\\\"]plate:" packages/core/src packages/utils/src --glob '!**/dist/**'` returned no matches. |
| Package file checklist | no | N/A: not package review mode | Named API packet only. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`; focused Core and Utils tests passed. |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Existing `pnpm check:core` covers Core, Plite, and Utils; passed. |
| Non-Core package error triage | no | N/A: no non-Core errors surfaced | Proof commands passed. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Boilerplate audit returned no plugin-owned `defineEditorExtension({ name: KEYS.* })` / `plate:*` wrappers in Core/Utils. |
| Rename ledger | no | N/A: no rename in this packet | No path/name rename performed. |
| Extracted-file inventory | no | N/A: no extracted Core/Plate source files in this named packet | No new helper/source extraction performed. |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Self-review diff and focused proof completed; no separate autoreview needed for this narrow builder/call-site packet. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed and includes Core/Plite/Utils lint. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-raw-plugin-extension-options.md` | Will run after this update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugin/createBasePlugin.spec.ts` | 0 | keep-in-plate | Core plugin builder proof | Added tests for raw callback options and built extensions; focused Core spec passed. | keep |
| `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts` | 0 | main-parity-cleanup | Utils plugin owner | Removed plugin-owned `defineEditorExtension({ name: KEYS.normalizeTypes })`; Utils focused tests passed. | keep |
| `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts` | 0 | main-parity-cleanup | Utils plugin owner | Removed plugin-owned `defineEditorExtension({ name: KEYS.trailingBlock })`; Utils focused tests passed. | keep |
| `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts` | 0 | main-parity-cleanup | Utils plugin owner | Inlined raw extension options to preserve contextual typing; focused tests and typecheck passed. | keep |
| `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts` | 0 | main-parity-cleanup | Utils plugin owner | Inlined raw extension options to preserve contextual typing; focused tests and typecheck passed. | keep |
| `.agents/rules/plate-next.mdc` / generated skill / template | 0 | keep-in-plate | Plate Next workflow owner | Added recurring plugin extension options law; `pnpm install` and `pnpm prepare` synced generated skill. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `extendExtension` plugin-owned extensions | Accept built extensions and raw extension options. Raw options without `name` default to plugin key. | Requiring every plugin to call `defineEditorExtension({ name: KEYS.foo })`; adding explicit callback parameter types; extracted untyped helpers that lose inference. | The plugin builder owns plugin identity; call sites should preserve inference and stay small. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | N/A | focused tests + typecheck + `check:core` | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove plugin-owned `defineEditorExtension({ name: ... })` boilerplate | `rg -n "defineEditorExtension\\(\\{\\s*name:\\s*KEYS\\.|defineEditorExtension\\(\\{\\s*name:\\s*plugin|defineEditorExtension\\(\\{\\s*name:\\s*['\\\"]plate:" packages/core/src packages/utils/src --glob '!**/dist/**'` | 0 after patch | 4 Utils plugin files | 0 | Remaining `defineEditorExtension` calls are standalone runtime/test/plugin-extension cases, not plugin-owned key boilerplate. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Named API packet | complete | Builder tests, Utils plugin tests, typecheck, source audit, and `pnpm check:core` passed. | none |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A: broad Core sweep not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core sweep not requested. | N/A |

Package file checklist:
- Applies: N/A
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] `N/A` — score: N/A — verdict: N/A — owner: N/A —
      evidence: not package review mode — next: N/A

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| raw plugin extension options | Core plugin builder + Utils plugins + Plate Next workflow | Plugin-owned extension options should not require `defineEditorExtension({ name: KEYS.foo })`; the builder should own default plugin names and inference. | Core builder spec, Utils plugin call sites, Plate Next rule/template; focused tests, typecheck, `check:core`. | keep | next Plate Next package review can use this rule. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | No new extracted source file in this packet. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | proof passed | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Simplified `NormalizeTypesPlugin`, `TrailingBlockPlugin`, `SingleBlockPlugin`, and `SingleLinePlugin` to return raw extension options from `extendExtension`. |
| tests/proof | Added `createBasePlugin` tests for function-returned raw extension options and built `defineEditorExtension` objects. |
| docs/templates/skills | Added Plate Next rule/template law for plugin editor extension options; synced generated `plate-next` skill with `pnpm install` + `pnpm prepare`; updated this goal plan. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | none | This is the shape you asked for and proof passed. | N/A | keep |

Findings:
- `extendExtension` already had runtime normalization for raw option objects and
  plugin-derived names. The missing part was explicit proof, workflow law, and
  cleaning plugin code that taught the wrong habit.
- Extracting a raw extension options object into an untyped helper loses nested
  `next`/`tx` contextual typing. Keeping the object inline in
  `extendExtension` preserves inference without explicit annotations.

Decisions and tradeoffs:
- Default raw extension names to plugin key. Use explicit names only for
  secondary/keyed/standalone extension identities.
- Keep built `defineEditorExtension(...)` support because standalone Plite
  extensions and tests still need it.
- Do not introduce public compat shims or local callback annotations.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Typecheck failed after extracting SingleBlock/SingleLine raw options into helper functions; nested `next`/`tx` lost contextual typing. | 1 | Inline the extension object in `extendExtension` instead of annotating callback parameters. | Fixed; `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts`
  -> 24 pass.
- `pnpm --filter @platejs/utils exec bun test src/lib/plugins/normalize-types/NormalizeTypesPlugin.spec.ts src/lib/plugins/trailing-block/TrailingBlockPlugin.spec.ts src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx src/lib/plugins/single-block/SingleLinePlugin.spec.tsx`
  -> 23 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`
  -> 11 successful tasks.
- `pnpm --filter @platejs/utils build` -> passed.
- `pnpm install` -> already up to date.
- `pnpm prepare` -> Skiller apply completed successfully.
- `rg -n "defineEditorExtension\\(\\{\\s*name:\\s*KEYS\\.|defineEditorExtension\\(\\{\\s*name:\\s*plugin|defineEditorExtension\\(\\{\\s*name:\\s*['\\\"]plate:" packages/core/src packages/utils/src --glob '!**/dist/**'`
  -> no matches.
- `pnpm check:core` -> passed: Core type/lint/tests, Plite type/lint/tests,
  Utils type/lint/tests.

Final handoff contract:
- target surface and mode: named API packet for plugin `extendExtension`.
- files/APIs reviewed: Core plugin builder tests, Utils plugin extension call
  sites, Plate Next rule/template.
- broad Core drift score coverage: N/A, not requested.
- package file checklist coverage: N/A, not package review mode.
- best Plate v2 recommendation: builder accepts built extensions and raw
  options; omitted `name` defaults to plugin key.
- verdict matrix summary: keep-in-plate / main-parity-cleanup, no gaps.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: exact boilerplate audit,
  0 matches after patch, 4 files patched, 0 deferred.
- changes made: see Changed list.
- tests/proof commands: see Verification evidence.
- old compatibility names audited: no plugin-owned `defineEditorExtension`
  `KEYS.*`/`plate:*` wrappers remain in scoped Core/Utils source.
- needs attention: none.
- next best Plate Next packet: continue package review under this law.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal closure |
| Where am I going? | Final `check-complete` and goal completion |
| What is the goal? | Support raw plugin extension options with plugin-key defaults and proof. |
| What have I learned? | Existing runtime normalization was mostly right; call sites and rules were teaching too much boilerplate. |
| What have I done? | Added tests, simplified Utils plugin extension call sites, updated Plate Next rule/template, and passed proof. |

Timeline:
- 2026-07-05T18:35:36.296Z Goal plan created.
- Created active goal for raw plugin extension options.
- Read Plate Next and Autogoal skills.
- Filled checkpoint zero as a named API packet.
- Added builder tests for raw callback options and built extensions.
- Removed plugin-owned `defineEditorExtension({ name: ... })` wrappers from
  NormalizeTypes, TrailingBlock, SingleBlock, and SingleLine plugins.
- Added Plate Next rule/template law and regenerated the skill mirror.
- Ran focused tests, typecheck, source audit, and `pnpm check:core`.

Open risks:
- None for this packet.
