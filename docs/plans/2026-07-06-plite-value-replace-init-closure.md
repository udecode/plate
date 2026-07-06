# plite value replace init closure

Objective:
Close Plite value replacement/init split; done when code/docs/tests prove old SlateExtension contracts land in right owners.

Goal plan:
docs/plans/2026-07-06-plite-value-replace-init-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: chat instruction
- id / link: current Codex thread
- title: Plite value replacement/init closure after removing SlateExtensionPlugin
- acceptance criteria:
  - Plite `editor.update.value.replace(...)` supports selection intents and direct update options so Core does not hand-roll path walking/text-point repair.
  - Core init keeps Plate-owned concerns only: HTML string value, default paragraph value, async value, `transformInitialValue`, and `onReady`.
  - `pipeTransformInitialValue` uses the Plite replacement path without custom reset/init semantics.
  - Old `SlateExtensionPlugin` contracts are represented by better owners or parity tests: value init/set, reset/lift block, exit break, redecorate, change handlers, element state.
  - Docs that teach replacement/update API match the new public shape.
  - Focused Plite/Core/utils tests and typechecks pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: concrete pass/fail verification owns this packet
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Plite value replacement accepts `selection: 'start' | 'end' | Selection | null` and direct options for history/normalization/tag/metadata.
- Core init no longer owns custom point traversal or separate selection update for auto-select.
- Focused tests prove Plite replacement, Core init, change-handler parity, element-state parity, and ExitBreak ownership.
- Docs examples mention the direct one-shot API where appropriate.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-value-replace-init-closure.md` passes.

Verification surface:
- Source audit: `rg` for old `SlateExtensionPlugin` and Core init helper drift.
- Tests:
  - `pnpm --filter @platejs/plite exec bun test test/state-tx-public-api-contract.ts test/transforms-contract.ts test/extension-change-events-contract.test.ts`
  - `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/internal/plugin/plateChangeHandlers.spec.tsx src/lib/plugins/element-state/ElementStatePlugin.spec.tsx`
  - `pnpm --filter @platejs/utils exec bun test src/lib/plugins/ExitBreakPlugin.spec.ts`
- Typecheck:
  - `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/utils`
- Docs:
  - focused source-backed docs audit for changed snippets.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live Plite/Core/utils source, `origin/main` old `SlateExtensionPlugin` contract, relevant tests/docs.
- Allowed edit scope: `packages/plite/**`, `packages/core/**`, `packages/utils/**`, `content/docs/**`, this plan, generated barrels if required.
- Browser surface: N/A: no visible route/UI changed.
- Browser strategy: N/A: package/runtime/docs API packet only. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A
- Non-goals: no resurrected `SlateExtensionPlugin`, no old `editor.tf`, no compatibility aliases, no broad package migration.

Output budget strategy:
- Use focused `rg` and `sed` ranges for Plite/Core/utils owners only; cap command output; avoid broad repo dumps and generated folders.

Blocked condition:
- Block only if focused tests reveal a public API fork that needs user taste or a Plite invariant prevents safe replacement-selection intent.

Task state:
- task_type: package runtime/API cleanup
- task_complexity: major public API/runtime boundary packet
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_close

Current verdict:
- verdict: accepted split implemented
- confidence: 0.97 after `check:core`, docs checks, and stale-reference audit
- next owner: Plate package-by-package migration can consume the direct Plite value replacement API
- reason: old mixed SlateExtension behavior is split into Plite replacement semantics, Core init plumbing, Utils exit-break ownership, and parity tests.

Completion rule:
- Goal can close after this file passes `check-complete`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, boundaries, non-goals, verification commands, and stop conditions copied into this plan before implementation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `plite-plan`, `plate-next`, and `autogoal` before implementation; read `docs-creator` and `changeset` before docs/release-artifact edits |
| Active goal checked or created | yes | `create_goal` created this objective |
| Source of truth read before edits | yes | Read Plite interfaces/public-state/lifecycle API, Core `withPlite`, change handlers, element state, utils exit-break tests, and old `origin/main` SlateExtension contracts |
| TDD decision before behavior change | yes | Added/repaired Plite, Core, and Utils contract tests during the patch |
| Release artifact decision | yes | Extended existing beta changesets for `@platejs/plite` and `@platejs/core`; no new file needed |
| Browser tool decision | no | N/A: runtime/API/docs text packet, no runnable route or UI behavior changed |
| Docs pack selected | yes | Incidental docs update; source owner and target docs read before editing |
| Package/API pack selected | yes | Public `@platejs/plite` value replacement API and `@platejs/core` init behavior changed |
| Barrel/export impact decision | yes | No exported file layout changed; no `pnpm brl` needed |

Work Checklist:
- [x] First checkpoint captured every explicit prompt requirement, boundary, stop condition, and verification surface.
- [x] Nearby implementation patterns and source owners read before edits.
- [x] Plite owns snapshot replacement selection repair and direct one-shot options.
- [x] Core init no longer owns custom point traversal for auto-select or replacement selection repair.
- [x] `pipeTransformInitialValue` uses Plite value replacement while preserving live selection through transform wrapping.
- [x] Old SlateExtension contracts are represented by better owners or tests: value replacement, transform init, change handlers, element state, exit break, reset/lift block coverage.
- [x] Docs pack complete: target docs, sibling Core CN mirror, and source owner checked; docs use current-state voice.
- [x] Package/API pack complete: public API impact, changeset ownership, typecheck/build/test proof, and no-barrel decision recorded.
- [x] Release artifact requirement recorded: existing Core/Plite beta changesets extended.
- [x] Final handoff shape decided: no PR/tracker; concise changed list plus proof and caveats.
- [x] Branch handling recorded: N/A, user did not request branch, PR, commit, or push.
- [x] Browser proof recorded: N/A, no visual/browser route changed.
- [x] Local-env-rot retry recorded: N/A, failures were code/test/docs issues, not install corruption.
- [x] Workspace authority recorded: all commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: public API/runtime boundary changed; risk covered by contract tests, typecheck, `check:core`, docs check, and changeset.
- [x] Autoreview recorded: N/A for this bounded user-directed implementation packet; full package review belongs to the next Plate migration review lane.
- [x] Agent-native review recorded: N/A, no `.agents/**`, skill, prompt, hook, or user-action tooling changed.
- [x] Output budget discipline recorded and followed; one `check:core` output was truncated but command completed and final status was captured.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests plus final gate | `pnpm check:core` passed |
| Bug reproduced before fix | yes | Capture failing contract before fix | Core test failed: `withPlite.spec.ts` lost selection through transformed initial value; fixed and reran |
| Targeted behavior verification | yes | Run focused Plite/Core/Utils tests | Plite state/tx + transforms + change-events passed; Core init/change/element-state passed; Utils ExitBreak passed |
| TypeScript changed | yes | Run package typecheck | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/utils` passed |
| Package exports or file layout changed | no | No barrel generation | N/A: no exported file layout change |
| Package manifests or install graph changed | no | No install required | N/A: no manifest or lockfile change |
| Agent rules or skills changed | no | No skill sync required | N/A |
| Workspace authority proof | yes | Verify in owning repo/package | All proof commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Browser proof not applicable | N/A: runtime/API/docs text packet only |
| CI-controlled template output changed | no | No template output touched | N/A |
| Package behavior or public API changed | yes | Release artifact update | Existing `.changeset/prepare-v54-beta-plite.md` and `.changeset/prepare-v54-beta-core.md` extended |
| Docs or content changed | yes | Verify docs parse/source parity | `pnpm --filter www build:source` passed; `pnpm --filter www check:docs` passed |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: selection or history metadata regression during whole-value replace; covered by Plite direct replacement tests and Core init selection test |
| Local install corruption suspected | no | No reinstall needed | N/A: failures were deterministic code/test issues |
| Autoreview for implementation changes | no | Defer to next review lane | N/A: bounded implementation packet, no commit requested |
| PR create or update | no | No PR work | N/A |
| Final lint | yes | Run scoped lint | `pnpm check:core` ran Core/Plite/Utils lint successfully |
| Timed checkpoint | no | No duration requested | N/A |
| Goal plan complete | yes | Run autogoal check | Ready for `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-value-replace-init-closure.md` |
| Docs source-backed claim audit | yes | Audit API names | `rg` found no stale `editor.update((tx) => tx.value.replace(input))` in Core/Plite API docs after update |
| Plugin page specifics | no | Not a plugin page | N/A |
| Public API / package boundary proof | yes | Source-audit API and package impact | `EditorValueReplaceOptions`, `SnapshotSelectionInput`, and `editor.update.value.replace` source audited |
| Registry changelog | no | No registry-only work | N/A |
| Package typecheck/build/test | yes | Run owning package gate | `pnpm check:core` passed |
| Barrel/export generation | no | No exported file layout change | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source owners and old contract read | implementation |
| Implementation | complete | Plite/Core/docs/changeset patches applied | verification |
| Verification | complete | `pnpm check:core`, docs checks, focused tests passed | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | plan updated and ready for autogoal check | final response |

Findings:
- `pipeTransformInitialValue` was clearing selection by replacing the document with `selection: null`.
- Plite needed direct value replacement options and selection intents so Core did not own snapshot repair logic.
- Some Core tests used invalid selection fixtures against empty text nodes; those now use valid text so they test the intended behavior.

Decisions and tradeoffs:
- Keep `tx.value.replace` for grouped transactions, but teach and expose `editor.update.value.replace(input, options?)` for one-shot replacement.
- Put selection repair in Plite `replaceSnapshot`, not Core init.
- Extend existing beta changesets instead of adding noisy extra release files.

Implementation notes:
- Added `SnapshotSelectionInput` and `EditorValueReplaceOptions`.
- Added direct `editor.update.value.replace(input, options?)`.
- Core init and transform-initial-value path now use Plite-owned replacement semantics.
- Docs updated in Plite transforms/editor/saving pages and Core PlateEditor API pages.

Review fixes:
- Fixed Plite import syntax after tsdown parser error.
- Preserved selection offset when a replacement wraps a text node under the same path.
- Updated stale CN Core API reference to the direct replacement shape.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun test paths without `./` only ran matching `.test` files | 1 | Rerun with `./test/...` paths | Focused Plite tests passed |
| Core init selection lost through `transformInitialValue` | 1 | Preserve live selection through Plite replacement and repair element-path points | Core tests passed |
| `check:core` Plite lint formatting failed | 1 | Run `pnpm --filter @platejs/plite lint:fix` | Final `check:core` passed |
| Core tests used invalid offset against empty text | 1 | Repair fixtures to valid text content | Final `check:core` passed |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/state-tx-public-api-contract.ts`: 24 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts`: 30 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/extension-change-events-contract.test.ts`: 2 pass.
- `pnpm --filter @platejs/core exec bun test ./src/lib/editor/withPlite.spec.ts ./src/internal/plugin/plateChangeHandlers.spec.tsx ./src/lib/plugins/element-state/ElementStatePlugin.spec.tsx`: 36 pass.
- `pnpm --filter @platejs/utils exec bun test ./src/lib/plugins/ExitBreakPlugin.spec.ts`: 5 pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/utils`: passed.
- `pnpm --filter www build:source`: passed.
- `pnpm --filter www check:docs`: passed.
- `pnpm check:core`: passed; includes typecheck, lint, Core tests 707 pass, Plite tests 1903 pass / 85 skip, Utils tests 59 pass.
- Source audit: no stale `editor.update((tx) => tx.value.replace(input))` remains in Core/Plite API docs.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: 97% after focused tests, docs checks, source audit, and `check:core`.
- Browser check: N/A, no visual/browser route changed.
- Outcome: Plite owns direct value replacement options and selection repair; Core init uses that owner instead of custom traversal.
- Caveat: Browser proof not run because no UI route changed.
- Design:
  - Chosen boundary: Plite owns snapshot replacement; Core owns Plate setup orchestration.
  - Why not quick patch: Core path repair would recreate the deleted mixed SlateExtension behavior.
  - Why not broader change: ExitBreak, element state, and change handlers already have proper owners/tests; no need to reopen plugin topology.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A, no PR.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A, package/runtime/docs text packet only
- Caveats: no known caveats after verification

Timeline:
- 2026-07-06T09:13:20.887Z Task goal plan created.
- 2026-07-06T09:xxZ Implemented Plite direct replacement API and Core init cleanup.
- 2026-07-06T09:xxZ Repaired tests and docs, extended existing changesets, and passed final gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after autogoal check |
| What is the goal? | Close Plite value replacement/init split without resurrecting SlateExtensionPlugin |
| What have I learned? | Selection repair belongs in Plite replacement; Core should preserve selection through transform init but not compute text points itself |
| What have I done? | Implemented API/runtime/docs/tests/changesets and verified with package gates |

Open risks:
- None known after final `check:core`; next risk is broader Plate package migration consuming the new direct API incorrectly, which belongs to the next plate-next review packet.
