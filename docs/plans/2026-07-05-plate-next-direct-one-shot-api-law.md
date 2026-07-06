# plate-next direct one-shot API law

Objective:
Teach Plate Next to reject one-line Plite callback boilerplate, then clean the current Utils examples where direct read/update methods already exist.

Goal plan:
docs/plans/2026-07-05-plate-next-direct-one-shot-api-law.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- plate-next named skill repair
- autogoal lifecycle checkpoint

Plate Next source:
- prompt / link: user asked why `editor.update((tx) => { tx.normalize({ force: true }); })` and `editor.read((state) => state.children())` are used instead of direct one-shot methods, called that dirty boilerplate, and asked to update `plate-next`.
- mode: named skill-rule repair plus same-smell cleanup.
- target surface: `.agents/rules/plate-next.mdc`, generated `plate-next` mirror, `docs/plans/templates/plate-next.md`, and current `packages/utils` one-shot callback usage.
- review target: direct one-shot Plite API by default; callback form only for grouped transaction/snapshot logic.
- broad Core sweep: no.
- correction-triggered related Core sweep: exact source audit for the same one-line callback/read smell in Utils and Core.
- package review mode: scoped Utils cleanup only, not a full package file-by-file review.
- package review target: `packages/utils`.
- package file checklist gate: N/A; this is not `plate-next packages/utils` package review mode.
- completion threshold summary: skill/source/template patched, generated mirror synced, obvious Utils one-shot callbacks replaced, focused proof green, and autogoal check complete.

First checkpoint:
- Explicit requirement: update `plate-next` so one-line `editor.update` callbacks are rejected when a direct method exists.
- Explicit requirement: direct method example is `editor.update.normalize()`.
- Explicit requirement: one-line `editor.read((state) => state.children())` should use direct `editor.read.children()`.
- Scope boundary: do not redesign Plite, Plate package migration, or broad Core cleanup.
- Stop condition: stop when the skill/template are synced, current obvious Utils examples are fixed, and verification passes.
- Final handoff: changed files, proof commands, remaining direct-callback audit results, and anything needing user attention.

Timed checkpoint:
- requested duration: none.
- semantics: finish this scoped repair, not a timed loop.
- initial confidence score: 86; the rule is clear, but proof must confirm direct methods are typed in current Utils tests.
- improvement loop: patch rule, patch template, patch obvious call sites, verify, update plan.
- final score / loop closure: 98; skill law, template, generated mirror, Utils cleanup, audits, and proof are complete. Core follow-up candidates remain intentionally deferred to Core review scope.

Completion threshold:
- `.agents/rules/plate-next.mdc` contains a Direct one-shot Plite API rule with accepted callback exceptions.
- `docs/plans/templates/plate-next.md` contains the same audit/checklist requirement.
- Generated `.agents/skills/plate-next/SKILL.md` is synced from source.
- Obvious one-line Utils direct read/update wrappers are replaced where direct APIs exist.
- Remaining one-line callback audit results are recorded and either zero in the target scope or justified as grouped transaction/snapshot logic.
- Focused Utils typecheck/test/build and `pnpm check:core` pass, or any failure is explained as outside the edited scope.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-direct-one-shot-api-law.md` passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./packages/utils`; `pnpm --filter @platejs/utils test`; `pnpm --filter @platejs/utils build`.
- package proof: Utils focused typecheck/test/build.
- shared Core gate: `pnpm check:core`.
- source audits: exact `rg -U` searches for one-line update/read wrappers in `packages/utils/src`.
- related Core sweep query / match count / patched count / deferred count: `rg -n -U "editor\\.update\\(\\(tx\\) => \\{\\s*tx\\.[A-Za-z0-9_.]+\\([^;]*\\);\\s*\\}\\);" packages/core/src` found 6 Core files with same-class candidates; patched count 0 in Core because this packet is scoped to the skill law and Utils examples; deferred to the next Core review under the new scoring rule.
- package file manifest / row count / checked count / deferred count: N/A for this named skill repair.
- Plite/Plate gap ledger: N/A; direct methods exist for the cleaned Utils calls.
- broad Core drift ledger gate: N/A.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-direct-one-shot-api-law.md`.

Constraints:
- Direct one-shot methods are the preferred API for one-line Plite reads/writes.
- Callback form is valid for grouping multiple writes, sharing a transaction, composing multiple reads under one snapshot, branching/looping, or calling behavior without a direct one-shot API.
- Do not add explicit callback parameter types to force this cleanup; preserve inference.
- Do not broaden into package migration, Core file scoring, or Plite API redesign unless direct methods are missing.
- Do not hand-edit generated skill mirrors; patch source rules and run the generator through repo scripts.
- No browser proof: no UI route changed.

Boundaries:
- allowed edit scope: `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, generated skill mirror via repo script, this plan, and safe Utils call-site cleanup.
- package/API surfaces: direct `editor.read.*` and `editor.update.*` one-shot methods.
- docs/browser surfaces: no public docs or browser surfaces.
- non-goals: no broad Core sweep, no package migration, no public API rename, no Plite redesign unless a missing direct method blocks proof.
- out-of-scope package errors: non-Utils/non-Core-package failures are out of scope unless caused by this change.

Output budget strategy:
- Use exact `rg` audits and focused proof summaries.
- Do not stream every Core match into the final answer.

Blocked condition:
- Blocked only if current Plite types do not expose direct one-shot methods for the cleaned calls and fixing that would require Plite API design beyond this skill-rule repair.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 98
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: direct one-shot Plite API is the cleaner Plate Next review law; callbacks are too much ceremony for one operation, and proof stayed green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copies the explicit one-line callback complaint, direct method expectation, scope, stop condition, and handoff. |
| `plate-next` skill/rule read | yes | `.agents/rules/plate-next.mdc` and generated skill content inspected before patching. |
| Active goal checked or created | yes | Active goal created for direct one-shot API law repair. |
| Mode classified as named packet vs broad Core sweep | yes | Named skill repair plus scoped Utils cleanup; broad Core sweep is N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Target is direct Plite one-shot read/update API, no legacy callback ceremony. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Source rule and template only; generated mirror via repo script. |
| Output budget strategy recorded | yes | Exact audits and proof summaries. |
| Public API fork routing checked | yes | No public API fork; direct methods already expected to exist. |
| Gap policy checked | yes | Missing direct method would be a Plite gap. |
| Related Core sweep policy checked | yes | Same-smell audit will record Utils/Core matches. |
| Review-mode rename freeze checked | yes | No renames. |
| Package review checklist initialized when in scope | N/A | Not package review mode. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before implementation.
- [x] Mode classified as named skill-rule repair with scoped same-smell cleanup.
- [x] Best Plate v2 call recorded: prefer direct one-shot Plite read/update methods; callbacks only for grouped/composed logic.
- [x] `plate-next` source rule updated.
- [x] Plate Next autogoal template updated.
- [x] Generated Plate Next skill mirror synced from source.
- [x] Obvious Utils one-line update/read wrappers replaced with direct methods where available.
- [x] Direct one-shot source audit recorded with match counts, patched counts, and justified leftovers.
- [x] Focused Utils proof passes.
- [x] Shared `pnpm check:core` proof passes.
- [x] Changed list, needs-attention rows, and next owner are filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Capture requirements | done | First checkpoint filled before implementation. |
| Patch skill law | done | Source rule and template updated; generated skill mirror synced by `pnpm prepare`. |
| Cleanup call sites | done | Safe Utils one-shot callbacks replaced with direct read/update methods. |
| Verify | done | Utils focused proof and `pnpm check:core` passed. |
| Close autogoal | done | Final evidence recorded in this plan. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Skill source updated | yes | Patch `.agents/rules/plate-next.mdc` | Direct one-shot law added. |
| Template updated | yes | Patch `docs/plans/templates/plate-next.md` | Direct one-shot audit checklist added. |
| Generated mirror synced | yes | Run repo script and audit generated skill | `pnpm prepare`; `rg` found the rule in `.agents/skills/plate-next/SKILL.md`. |
| Same-smell cleanup | yes | Replace safe Utils one-line callback wrappers | Utils specs/hooks now use direct `editor.update.*` and `editor.read.*` where available. |
| Source audit | yes | Run exact one-line callback/read audits | Utils exact one-line update/read audits returned no matches; grouped callback audit has 4 intentional grouped callbacks. |
| Package proof | yes | Run Utils typecheck/test/build | `pnpm turbo typecheck --filter=./packages/utils`; `pnpm --filter @platejs/utils test`; `pnpm --filter @platejs/utils build`. |
| Shared Core gate | yes | Run `pnpm check:core` | Passed after formatting fix. |
| Goal plan complete | yes | Run `check-complete.mjs` | This plan is ready for final check. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `.agents/rules/plate-next.mdc` | 2 | main-parity-cleanup | plate-next | One-line callback law missing. | Patch source rule. |
| `docs/plans/templates/plate-next.md` | 2 | main-parity-cleanup | plate-next | Template lacked one-shot audit. | Patch template. |
| `packages/utils/src` one-line callbacks | 2 | main-parity-cleanup | packages/utils | Exact `rg -U` found wrappers around direct calls. | Replace safe direct-method calls. |
| `packages/core/src` one-line candidates | 2 | defer-with-owner | plate-next Core review | Exact Core audit found 6 files with same-class candidates. | Use the new rule in the next Core-scoped pass. |

Verification evidence:
- `pnpm install`: passed, workspace already up to date.
- `pnpm prepare`: passed, Skiller regenerated Codex/Claude skill mirrors.
- `rg -n "one-shot|editor\\.update\\.normalize|editor\\.read\\.children|callback form" .agents/skills/plate-next/SKILL.md .agents/rules/plate-next.mdc docs/plans/templates/plate-next.md`: found synced source/template/generated rule.
- `pnpm turbo typecheck --filter=./packages/utils`: passed.
- `pnpm --filter @platejs/utils test`: passed, 57 tests.
- `pnpm --filter @platejs/utils build`: passed.
- `pnpm --filter @platejs/utils lint:fix`: fixed formatting only.
- `pnpm check:core`: passed after formatting fix; Core 703 tests, Plite 1900 pass / 85 skip, Utils 57 tests.
- `rg -n -U "editor\\.update\\(\\(tx\\) => \\{\\s*tx\\.[A-Za-z0-9_.]+\\([^;]*\\);\\s*\\}\\);" packages/utils/src`: no matches.
- `rg -n -U "editor\\.read\\(\\(state\\) => state\\.[A-Za-z0-9_.]+\\([^;]*\\)\\)" packages/utils/src`: no matches.
- `rg -n "editor\\.update\\(" packages/utils/src`: 4 remaining callbacks, all grouped: toolbar clear/toggle transaction, single-line cleanup loop, two-break grouped runtime spec, conditional replace+normalize.

Changed list:
- `.agents/rules/plate-next.mdc`: added direct one-shot Plite API law and scoring cap for avoidable callback wrappers.
- `.agents/skills/plate-next/SKILL.md`: regenerated mirror from source.
- `docs/plans/templates/plate-next.md`: added direct one-shot audit requirement.
- `docs/plans/2026-07-05-plate-next-direct-one-shot-api-law.md`: recorded autogoal plan and evidence.
- `packages/utils/src/react/hooks/useRemoveNodeButton.ts`: direct `editor.update.nodes.remove`.
- `packages/utils/src/react/hooks/useMarkToolbarButton.spec.tsx`: direct mark update/read in tests.
- `packages/utils/src/react/hooks/useSelection.ts`: direct selection reads.
- `packages/utils/src/react/hooks/useEditorString.ts`: direct text string read.
- `packages/utils/src/lib/plugins/ExitBreakPlugin.ts`: direct `editor.read.nodes.above`.
- `packages/utils/src/lib/plugins/ExitBreakPlugin.spec.ts`: direct exit-break tx calls.
- `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts`: direct entries/hasPath reads.
- `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.spec.tsx`: direct normalize/break/read calls.
- `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx`: direct normalize/break/read calls.
- `packages/utils/src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts`: direct normalize/break/read calls where one-shot; grouped two-break callback kept.
- `packages/utils/src/lib/plugins/trailing-block/TrailingBlockRuntimePlugin.spec.ts`: direct normalize/read calls.
- `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesRuntimePlugin.spec.ts`: direct normalize/read calls.
- `packages/utils/src/lib/plugins/__tests__/normalizeRoot.ts`: direct read after grouped transaction.

Needs attention:
- Core has same-class one-shot callback candidates in 6 files. This packet did not patch Core to avoid turning a skill-law repair into a broad Core sweep, but `plate-next` now has the rule that should cap those files below `100` in the next Core review.

Open risks:
- No known risk in Utils; focused proof and `check:core` passed. Remaining Core candidates are review debt, not a regression from this packet.

Reboot status:
- Current thread owns the scoped repair. No handoff needed.
