# plate-next editable props adapter cleanup

Objective:
Remove fake PlateContent Editable prop alias; done when adapter owner is typed
and Core proof passes.

Goal plan:
docs/plans/2026-07-04-plate-next-editable-props-adapter-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "wtf is type LegacyEditableComponentProps =
  React.ComponentProps<typeof Editable>; ??"
- mode: named file/API cleanup packet
- target surface:
  `packages/core/src/react/components/PlateContent.tsx`,
  `packages/core/src/react/hooks/useEditableProps.ts`,
  `packages/core/src/lib/types/EditableProps.ts`, and Plite editable decorate
  type if it is the real owner
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user named one concrete smell, not broad Core review
- correction-triggered related Core sweep: required for
  `LegacyEditableComponentProps`, `EditableProps` casts, and decorate typing
- completion threshold summary: remove the local legacy alias/cast from
  `PlateContent`, move any necessary adapter type to the owning source, run
  focused Core/Plite proof, and record any remaining gap

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `LegacyEditableComponentProps` is removed.
- `PlateContent` no longer casts `editableProps` at the `<Editable>` call site.
- The owning type mismatch is fixed where it belongs, or a named Plite/Plate
  gap is recorded.
- Focused Core/Plite tests and package typechecks pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editable-props-adapter-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `PlateContent.spec.tsx`, `PlateTest.spec.tsx`,
  `useEditableProps.spec.tsx`, `pipeDecorate.spec.ts`,
  `projections-and-selection-contract.tsx` decorate rows if Plite is touched
- package proof: `pnpm --filter @platejs/core typecheck` and
  `pnpm --filter @platejs/plite-react typecheck` when Plite is touched
- source audits: `rg -n "LegacyEditableComponentProps|as unknown as .*Editable|editableProps as"`
- related Core sweep query / match count / patched count / deferred count:
  pending
- Plite/Plate gap ledger: fill after source review
- broad Core drift ledger gate: N/A: named packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editable-props-adapter-cleanup.md`

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
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: PlateContent, useEditableProps, Core EditableProps,
  decorate adapter/type owner, focused tests
- package/API surfaces: `@platejs/core` editable props and
  `@platejs/plite-react` `Editable.decorate` typing if needed
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no public API rename pass, no old Slate
  compatibility
- out-of-scope package errors: ignore unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if fixing the alias requires a public editable API redesign beyond
  the current Plate/Plite decorate contract.

Current verdict:
- verdict: complete
- confidence: high for the named smell
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: the alias was removed, Plite `Editable.decorate` now accepts the
  current range shape, and `useEditableProps` owns the remaining Plate-to-Plite
  prop adaptation without a call-site cast

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | User target, scope, stop condition, and proof copied above |
| Source owner read | complete | Read PlateContent, useEditableProps, Core EditableProps, Plite EditableProps, and Plite decoration reader |
| Implementation | complete | Removed alias/cast, fixed Plite decorate type/normalizer, wrapped scroll callback in hook |
| Verification | complete | Focused tests, typechecks, source proof, touched-file Biome check, and source audit passed |
| Goal closure | complete | This plan records decisions, evidence, risks, and handoff |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact user complaint and alias target copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | no active goal found; new micro goal created |
| Mode classified as named packet vs broad Core sweep | yes | named file/API cleanup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | constraints keep Plite owner and no compatibility alias |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | workspace `/Users/zbeyens/git/plate-2`; source owner is current Plate/Plite code plus `origin/main` as evidence if needed |
| Output budget strategy recorded | yes | targeted file reads and exact `rg` audits only |
| Public API fork routing checked | yes | route only if editable decorate contract needs redesign |
| Gap policy checked | yes | gap ledger required below |
| Related Core sweep policy checked | yes | sweep for same adapter/cast smell required |
| Review-mode rename freeze checked | yes | no rename pass |

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
| Named verification threshold | yes | Run the proof commands named in this plan | focused tests, Core/Plite typechecks, source proof, and audits passed |
| Broad Core drift ledger coverage | no | Record manifest command only when broad Core sweep applies | N/A: named alias cleanup packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | review matrix below |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recommendation below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no remaining gap for this alias; Plite owner patched |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | sweep rows below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core and Plite React typechecks passed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify them | Plite React full lint has unrelated existing failures; touched-file Biome passed |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | bad alias/cast audit returned no matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename |
| Extracted-file inventory | no | Record untracked/extracted file command when in scope | N/A: no new file |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: micro typed-boundary packet; proof commands are the gate |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint passed; touched-file Biome passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | ledgers below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editable-props-adapter-cleanup.md` | run after final ledger update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `PlateContent.tsx` alias/cast | 3 | hard-cut | PlateContent | `LegacyEditableComponentProps` and cast removed | none |
| `useEditableProps.ts` output type | 2 | keep-in-plate | Plate editable adapter hook | hook returns Plite `EditableProps`, adapts Plate `scrollSelectionIntoView` by closing over the Plate editor | none |
| `Editable.decorate` type | 2 | move-to-plite | Plite React `Editable` | Plite type now accepts `PliteRangeDecoration`, matching decoration source contract | none |
| `readEditableDecorations` normalization | 2 | move-to-plite | Plite React decoration reader | reader now uses `toPliteRangeDecorations` so plain ranges become projection decorations | none |
| `RenderTextProps.attributes.ref` | 1 | main-parity-cleanup | Core render text props | `ref` is optional to match Plite React rendered text attributes | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| PlateContent editable props | `PlateContent` should pass the hook output directly to `<Editable>` | local `React.ComponentProps<typeof Editable>` alias, `unknown` cast, or "Legacy" adapter | The hook is the adapter owner; the component should render | no |
| Plite decorate contract | `Editable.decorate` accepts plain ranges or `{ range, data, key }` objects | forcing every Plate decorate result into `{ range }` at the call site | Plite decoration sources already support both shapes | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no remaining gap | no workaround kept | N/A | N/A | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `LegacyEditableComponentProps` | `rg -n "LegacyEditableComponentProps|as unknown as .*Editable|editableProps as|React\\.ComponentProps<typeof Editable>|type EditableDecoration<T = unknown> = Omit<PliteDecoration"` in Core/Plite React src | 0 | alias/cast and old decoration type removed | 0 | none |
| Plite decorate type changed | Core focused tests plus direct `readEditableDecorations` plain-range proof | all passed | Plite source owner patched | 0 | Bun contract file still blocked by unrelated runtime-init issue |

Core drift ledger:
- Applies: no
- Manifest command: not run; not a broad Core sweep
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: named matrix only
- Top drift rows: `PlateContent` cast was score 3 and is fixed

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | broad sweep not requested | plate-next | named matrix above | none |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Editable props adapter | PlateContent / useEditableProps / Plite React | fake component-props alias was hiding real owner mismatch | patched files and proof commands below | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no new file | N/A | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/plite-react` full lint | 114 unrelated existing lint errors in restore-dom/test files | touched-file Biome check passed; errors are not caused by this packet | plite-react lint cleanup lane |
| `projections-and-selection-contract.tsx` Bun file | focused rows fail before assertions with "Editor runtime has not been initialized" | failure happens before decoration behavior; direct source proof covers this packet | plite-react contract test/runtime-init lane |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `PlateContent.tsx`, `useEditableProps.ts`, `RenderTextProps.ts`, `editable-text-blocks.tsx`, `editable-decorations.ts` |
| tests/proof | no test file added; existing focused tests and direct source proof used |
| docs/templates/skills | this goal plan |
| reverted/quarantined packets | no final code quarantine; one failed Plite contract command recorded as out-of-scope runtime-init issue |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Plite React contract file cannot run the decorate rows currently | It fails on editor runtime initialization before this packet's assertions | `packages/plite-react/test/projections-and-selection-contract.tsx` | fix in a separate test-runtime lane if needed |

Findings:
- `LegacyEditableComponentProps` was exactly the wrong shape: a component-local
  type alias hiding a Plate-to-Plite prop adapter.
- The deeper Plite type bug was that `Editable.decorate` did not accept plain
  ranges even though Plite decoration sources already do.
- Core also needed one real adapter: `scrollSelectionIntoView` closes over the
  Plate editor before passing a Plite-compatible callback to `Editable`.

Decisions and tradeoffs:
- Removed the component-local alias instead of renaming it.
- Fixed Plite React `EditableDecoration` to use `PliteRangeDecoration`.
- Kept Plate's public `EditableProps` as Plate-facing input for now; the hook
  returns Plite-facing props.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite React Vitest focused command | 1 | Use the package's actual include shape or direct source proof | Vitest found no file because the contract filename is not `.test.tsx` |
| Plite React Bun contract rows | 2 | Build Plite dist once, then if still failing use direct source proof | Still fails before assertions with editor runtime init issue; recorded out-of-scope |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/PlateTest.spec.tsx src/react/hooks/useEditableProps.spec.tsx src/static/utils/pipeDecorate.spec.ts`:
  9 pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/plite-react typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- `pnpm exec biome check packages/plite-react/src/components/editable-text-blocks.tsx packages/plite-react/src/components/editable-decorations.ts packages/core/src/react/components/PlateContent.tsx packages/core/src/react/hooks/useEditableProps.ts packages/core/src/lib/types/RenderTextProps.ts`:
  pass.
- Direct source proof:
  `cd packages/plite-react && bun --eval "...readEditableDecorations plain range ok"`:
  pass.
- Source audit:
  `rg -n "LegacyEditableComponentProps|as unknown as .*Editable|editableProps as|React\\.ComponentProps<typeof Editable>|type EditableDecoration<T = unknown> = Omit<PliteDecoration" packages/core/src packages/plite-react/src --glob '!**/dist/**'`:
  no matches.

Final handoff contract:
- target surface and mode: named `PlateContent` editable prop adapter packet
- files/APIs reviewed: `PlateContent`, `useEditableProps`, Core
  `EditableProps`/`RenderTextProps`, Plite React `EditableProps` and decoration
  reader
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: adapter belongs in `useEditableProps` and
  Plite should type the decorate contract it already supports
- verdict matrix summary: 5 rows, all fixed/kept with proof
- Plite/Plate gaps or blockers: none for this alias; separate Plite React
  contract runtime-init issue remains
- related Core sweep query/matches/patched/deferred: bad alias/cast audit has
  zero matches
- changes made: changed list above
- tests/proof commands: verification evidence above
- old compatibility names audited: alias/cast audit passed
- needs attention: only the unrelated Plite React contract runtime-init issue
- next best Plate Next packet: continue one-by-one Core review only when user
  points at the next smell

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout |
| Where am I going? | Close the editable props adapter cleanup goal |
| What is the goal? | Remove the fake `LegacyEditableComponentProps` alias and prove the real adapter owner |
| What have I learned? | Plite `Editable.decorate` type was too narrow; Core hook owns Plate-to-Plite prop adaptation |
| What have I done? | Patched Plite/Core types, removed alias/cast, ran focused proof |

Timeline:
- 2026-07-04T09:17:57.171Z Goal plan created.
- 2026-07-04 Read PlateContent/useEditableProps/Core EditableProps/Plite EditableProps/decoration reader.
- 2026-07-04 Removed `LegacyEditableComponentProps`, patched Plite decorate types, and adapted scroll callback in the hook.
- 2026-07-04 Ran focused tests, typechecks, touched-file lint, direct source proof, and source audit.

Open risks:
- Plite React's existing contract file `projections-and-selection-contract.tsx`
  currently fails before the decorate assertions with an editor runtime
  initialization error. This packet did not fix that unrelated test-lane issue.
