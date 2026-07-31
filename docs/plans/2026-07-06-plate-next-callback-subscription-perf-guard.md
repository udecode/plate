# plate-next callback subscription perf guard

Objective:
Guard callback-only subscriptions in Plate Next; done when the rule is synced
and Core/Utils usage audit passes.

Goal plan:
docs/plans/2026-07-06-plate-next-callback-subscription-perf-guard.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user: "`packages/utils/src/react/hooks/useRemoveNodeButton.ts`
  `useNodePath` would affect performance: NEVER subscribe to values for
  callback only: loss of perf for no gain. add that rule to `$plate-next` then
  review all such usage in core/utils"
- mode: named perf-rule repair plus Core/Utils source audit
- target surface: `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`, `packages/core/src`, and
  `packages/utils/src`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, targeted subscription-pattern sweep only
- correction-triggered related Core sweep: yes, sweep callback-only
  subscription hooks in Core/Utils
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: source rule synced, unsafe callback-only
  subscription usage patched or classified, focused proof passes

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
- semantics: N/A: user did not request timed work
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `.agents/rules/plate-next.mdc` contains a recurring rule forbidding
  subscription hooks for callback-only data.
- Generated `.agents/skills/plate-next/SKILL.md` is synced from source.
- Core/Utils usage of `useNodePath`, `useEditorSelector`, `useEditorValue`,
  `useEditorReadOnly`, and sibling subscription hooks is audited for
  callback-only misuse.
- `packages/utils/src/react/hooks/useRemoveNodeButton.ts` no longer subscribes
  to node path only for click callback data.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-callback-subscription-perf-guard.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: targeted package typecheck/lint/test as needed
- package proof: `@platejs/utils` proof when Utils code changes
- shared Core gate: not required unless Core code changes; Core source audit is
  required
- source audits: exact `rg` searches for subscription hooks in Core/Utils
- related Core sweep query / match count / patched count / deferred count:
  recorded in Related Core sweep ledger
- package file manifest / row count / checked count / deferred count: N/A:
  not package review mode
- Plite/Plate gap ledger: no gap
- broad Core drift ledger gate: N/A: targeted audit, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-callback-subscription-perf-guard.md`

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
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.

Boundaries:
- allowed edit scope: Plate Next source rule/mirror, goal plan, and only unsafe
  Core/Utils callback-only subscription code
- package/API surfaces: no public API redesign unless audit exposes a real
  missing non-subscribing primitive
- docs/browser surfaces: none
- non-goals: no broad package migration, no Core full sweep, no unrelated hook
  refactor
- out-of-scope package errors: classify and stop unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Blocked only if Core/Utils has callback-only subscription usage that cannot
  be fixed without a missing Plate/Plite non-subscribing primitive; record the
  gap and owner instead of keeping the subscription.

Current verdict:
- verdict: keep
- confidence: 100 for the targeted callback-only subscription packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Source rule is synced, unsafe hook subscription is removed, stale
  path regression passes, and Core/Utils same-class audit found no remaining
  callback-only subscription misuse.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies the exact `useRemoveNodeButton` / callback-only subscription requirement and the Core/Utils audit scope. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`; source rule will be patched in `.agents/rules/plate-next.mdc`. |
| Active goal checked or created | yes | Created active goal for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named perf-rule repair plus targeted Core/Utils source audit; not broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Best shape: render-state subscription hooks are allowed only when the component renders from that value; callback-only values must be read inside the callback. |
| Broad Core drift ledger initialized when in scope | no | N/A: user asked targeted callback-only subscription audit, not broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Source rule is `.agents/rules/plate-next.mdc`; workspace `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Use exact `rg` counts and inspect matching files; do not stream full manifests. |
| Public API fork routing checked | yes | No public API fork expected unless missing non-subscribing primitive is found. |
| Gap policy checked | yes | Missing primitive becomes Plite/Plate gap instead of subscription workaround. |
| Related Core sweep policy checked | yes | Sweep same smell in `packages/core/src` and `packages/utils/src`. |
| Review-mode rename freeze checked | yes | No rename in this packet. |
| Package review checklist initialized when in scope | no | N/A: not package review mode. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: source rule + Core/Utils audit
      scope copied above.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Patch Plate Next source rule with callback-only subscription perf law.
      Evidence: rule present in `.agents/rules/plate-next.mdc`.
- [x] Regenerate generated skill mirror with `pnpm install`.
      Evidence: `pnpm install` and `pnpm run prepare`; rule present in
      `.agents/skills/plate-next/SKILL.md`.
- [x] Audit Core/Utils subscription hook usage for callback-only data.
      Evidence: `rg` audit recorded in source audit and sweep ledger.
- [x] Patch `useRemoveNodeButton` and any same-class unsafe matches.
      Evidence: `useRemoveNodeButton` reads path inside `onClick`; no
      same-class unsafe matches remain.
- [x] Run focused source audits and package proof.
      Evidence: focused hook tests, Utils typecheck, Utils lint, source audits.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: callback-only
      subscription usage is `hard-cut`; render-state subscription usage is
      `keep-in-plate`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence:
      no compat alias added.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
      Evidence: `useRemoveNodeButton` now uses direct callback-time
      `editor.read.nodes.pathOf(element)`.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
      Evidence: no Plite/Plate gap found.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
      N/A: targeted Core/Utils source audit, not broad Core sweep.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
      N/A: targeted Core/Utils source audit, not broad Core sweep.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
      N/A: targeted Core/Utils source audit, not broad Core sweep.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
      N/A: targeted Core/Utils source audit, not broad Core sweep.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
      N/A: not package review mode.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
      N/A: not package review mode.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
      N/A: not package review mode.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
      N/A: no `check:core` package coverage change required for this targeted
      Utils hook repair.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
      N/A: packet target is callback-only subscription perf, not one-shot API
      boilerplate.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
      N/A: no plugin exports touched.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
      N/A: no plugin configs touched.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
      N/A: no editor extension code touched.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
      N/A: no bridge file touched.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
      N/A: no public API fork.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
      Evidence: no rename in packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
      N/A: no new/extracted file in this packet.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
      N/A: no exports/barrels changed.
- [x] Old compatibility names are source-audited when cut.
      N/A: no compatibility name cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused hook tests pass; Utils typecheck and lint pass; source audit recorded. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: targeted Core/Utils callback-only subscription audit. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | One unsafe row fixed to score 100; render-state rows classified keep. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Callback-only data must be read inside callbacks; rejected `useNodePath` subscription. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: existing `editor.read.nodes.pathOf(element)` is enough. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `rg` subscription-hook audit across Core/Utils recorded. |
| Package file checklist | no | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | N/A: not package review mode. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/utils`; focused Utils hook tests; `pnpm --filter @platejs/utils lint`. |
| Shared Core gate coverage | no | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | N/A: no Core gate package membership changed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Full `@platejs/utils test` fails in `@platejs/test-utils/dist` resolution; focused touched tests pass. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` for `useNodePath`, selectors, and callback/event handlers in Core/Utils. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no new/extracted file created. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: small source-rule + hook repair, verified by focused proof. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/utils lint` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-callback-subscription-perf-guard.md` | Ready for final mechanical check after this evidence update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/utils/src/react/hooks/useRemoveNodeButton.ts` | 100 | `hard-cut` callback-only subscription | Utils hook | Removed `useNodePath`; click handler reads `editor.read.nodes.pathOf(element)` at execution time. | keep |
| `packages/utils/src/react/hooks/useRemoveNodeButton.spec.tsx` | 100 | proof repair | Utils hook tests | Added stale-path regression: path is resolved when clicked after node movement. | keep |
| `packages/utils/src/react/hooks/useMarkToolbarButton.ts` | 100 | `keep-in-plate` render-state subscription | Utils toolbar hook | `useEditorSelector` drives rendered `pressed`; callback uses state from hook API. | keep |
| `packages/utils/src/react/hooks/useSelection*.ts` / `useEditorString.ts` | 100 | `keep-in-plate` render-state subscription | Utils hooks | Hooks return selection/string derived state for render consumers. | keep |
| `packages/core/src/react/utils/pipeRenderElement.tsx` | 100 | `keep-in-plate` render-state subscription | Core render pipeline | `useNodePath` feeds `ElementProvider`, render props, injected attributes, and element rendering. | keep |
| Core `useEditorReadOnly` render utility call sites | 100 | `keep-in-plate` render-state subscription | Core render pipeline | Used to decide render/props, not only delayed callbacks. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Callback-only editor data in React hooks | Read the current value inside the callback from `editor.read.*` / `editor.api.*`; subscribe only when render/effects need that state. | `useNodePath`, `useEditorSelector`, `useEditorValue`, or view selectors just to close over values for `onClick` / command callbacks. | Subscriptions rerender on editor changes and can capture stale data; callback-time reads are cheaper and more correct. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | Existing `editor.read.nodes.pathOf(element)` covers the callback-time lookup. | N/A | focused Utils hook test | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `useNodePath` callback-only subscription from `useRemoveNodeButton` | `rg -n "useNodePath\\(|useEditorSelector\\(|useEditorValue\\(|useEditorReadOnly\\(|useElementSelector\\(" packages/core/src packages/utils/src --glob '!**/dist/**' --glob '!**/*.spec.ts' --glob '!**/*.spec.tsx'` | 21 production matches | 1 | 0 | Remaining matches are render-state hooks or render pipeline props. |
| Checked event callback surfaces for subscribed values captured only for callbacks | `rg -n "onClick|onMouseDown|onKeyDown|useCallback|setTimeout|requestAnimationFrame|addEventListener" packages/core/src packages/utils/src --glob '!**/dist/**' --glob '!**/*.spec.ts' --glob '!**/*.spec.tsx'` | 24 matches | 0 | 0 | No same-class callback-only subscription found after patch. |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Targeted audit only; no broad Core sweep. | N/A |

Package file checklist:
- Applies: no
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

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Targeted callback-only subscription guard | complete | Source rule synced, unsafe hook patched, source audits and focused proof pass. | Handoff |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| callback-only subscription perf guard | Plate Next / Utils | `useNodePath` in `useRemoveNodeButton` subscribes only for later `onClick` data | rule sync, hook patch, focused hook tests, typecheck, lint | keep | next Plate Next package/file review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no new/extracted files | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter @platejs/utils test` | Full package test reaches unrelated `@platejs/test-utils/dist` resolution error: `Cannot find module '@platejs/plite'` from `packages/test-utils/dist/index.js`; focused touched hook tests pass. | Failure is in broader test harness/package-resolution path, not the changed hook; this packet proved touched hook behavior directly. | Test harness / package-resolution cleanup, not this callback-only subscription packet. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/utils/src/react/hooks/useRemoveNodeButton.ts`: removed callback-only `useNodePath` subscription; compute path inside `onClick`. |
| tests/proof | `packages/utils/src/react/hooks/useRemoveNodeButton.spec.tsx`: added click-time path regression. |
| docs/templates/skills | `.agents/rules/plate-next.mdc` and generated `.agents/skills/plate-next/SKILL.md`: added callback-only subscription perf law; goal plan updated. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full `@platejs/utils test` harness failure | Broader package test currently trips `@platejs/test-utils/dist` resolving `@platejs/plite`; focused touched tests pass. | `pnpm --filter @platejs/utils test` | Route separately if you want full package test harness cleanup. |

Findings:
- `useRemoveNodeButton` was the only production Utils hook subscribing to node
  path only for callback data.
- Core `useNodePath` usages in `pipeRenderElement` feed render providers,
  render props, injected attributes, and default element rendering, so they are
  render-state subscriptions, not callback-only data.
- Other Utils selectors return rendered selection/string/pressed state.

Decisions and tradeoffs:
- Subscription hooks are valid for rendered/effect state. They are forbidden
  for callback-only data because they rerender on editor changes and may capture
  stale state.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `@platejs/utils test` hit unrelated `@platejs/test-utils/dist` module resolution error | 1 | Run focused touched hook tests with the repo preload and classify broader harness failure separately. | Focused tests, typecheck, and lint passed. |

Verification evidence:
- `pnpm install` -> pass; then `pnpm run prepare` -> generated skill mirror
  synced.
- `rg -n "Never subscribe a component|callback-only data|perf regression" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` -> rule present in source and generated mirror.
- `rg -n "useNodePath\\(|useEditorSelector\\(|useEditorValue\\(|useEditorReadOnly\\(|useElementSelector\\(" packages/core/src packages/utils/src --glob '!**/dist/**' --glob '!**/*.spec.ts' --glob '!**/*.spec.tsx'` -> 21 production matches reviewed; only unsafe Utils callback-only match patched.
- `rg -n "useNodePath" packages/utils/src/react/hooks/useRemoveNodeButton.ts packages/utils/src packages/core/src --glob '!**/dist/**' --glob '!**/*.spec.ts' --glob '!**/*.spec.tsx'` -> no `useNodePath` in `useRemoveNodeButton`; remaining production matches are Core render pipeline/hooks.
- `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useRemoveNodeButton.spec.tsx ./src/react/hooks/useMarkToolbarButton.spec.tsx ./src/react/hooks/useSelection.spec.tsx ./src/react/hooks/useSelectionFragment.spec.tsx ./src/react/hooks/useEditorString.spec.tsx` -> 13 pass.
- `pnpm turbo typecheck --filter=./packages/utils` -> pass.
- `pnpm --filter @platejs/utils lint` -> pass.

Final handoff contract:
- target surface and mode: Plate Next rule repair plus targeted Core/Utils
  callback-only subscription audit.
- files/APIs reviewed: `useRemoveNodeButton`, Utils selector hooks, Core render
  pipeline selector/path/readOnly usages, event callback surfaces.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: subscribe for render/effect state only; read
  callback-only data inside callbacks.
- verdict matrix summary: one `hard-cut` fixed; remaining matches
  `keep-in-plate`.
- Plite/Plate gaps or blockers: none for this repair.
- related Core sweep query/matches/patched/deferred: 21 subscription-hook
  matches reviewed, 1 patched, 0 deferred; 24 event callback matches reviewed,
  0 patched, 0 deferred.
- changes made: source rule/mirror, Utils hook, Utils hook test, plan.
- tests/proof commands: focused hook tests, Utils typecheck, Utils lint, source
  audits.
- old compatibility names audited: N/A.
- needs attention: broader `@platejs/utils test` harness failure noted.
- next best Plate Next packet: continue package-by-package review when user
  names the next package/file.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after targeted rule repair and Core/Utils source audit. |
| Where am I going? | Final `check-complete` and handoff. |
| What is the goal? | Guard callback-only subscription perf in Plate Next. |
| What have I learned? | `useRemoveNodeButton` was the unsafe callback-only path subscription; other matches are render-state. |
| What have I done? | Patched rule, synced skill, patched hook, added stale-path proof, ran focused proof. |

Timeline:
- 2026-07-06T10:16:05.195Z Goal plan created.
- 2026-07-06 Source rule patched and generated `plate-next` skill synced.
- 2026-07-06 Patched `useRemoveNodeButton` to compute path on click.
- 2026-07-06 Added stale-path regression test and ran proof.

Open risks:
- Broader `@platejs/utils test` currently hits an unrelated
  `@platejs/test-utils/dist` resolution error. Focused touched hook tests,
  package typecheck, and lint are green.
