# Plate plugin transforms hard cut

Objective:
Hard-cut the public Plate plugin transforms authoring API. Plate plugin authors should extend read/service surfaces with `api` and replayable document mutations with `tx`. The legacy public `extendTransforms` / `extendEditorTransforms` / `getTransforms` authoring path is cut unless an internal bridge row owns it with a deletion gate.

Completion threshold:
- Public Plate plugin authoring no longer exposes `transforms`, `extendTransforms`, `extendEditorTransforms`, `newExtensions.transforms`, or `getTransforms` as current API guidance.
- Feature packages touched by the cut keep type inference through inline `extendTx` / `extendTxGroup` groups, without `[x: string]` helper widening.
- Internal `editor.tf` / `editor.transforms` / `plugin.transforms` storage is documented as private current-runtime migration debt, not public Plate v2 API.
- Focused package typecheck/build/test proof and public docs audit are green.

Verification surface:
- Source API owners: `packages/core/src/lib/plugin/**`, `packages/core/src/react/plugin/**`, `packages/core/src/lib/editor/**`, `packages/core/src/react/editor/**`.
- Feature packages: `basic-nodes`, `list-classic`, `code-block`, `date`, `math`, `callout`, `media`, `mention`, `tag`, `docx-io`, `comment`, `footnote`, `ai`, `link`, `toggle`, `plate`.
- Public docs: `content/**` and package READMEs.
- Package proof: Plite/core/feature package typecheck, build, and tests.

Constraints:
- Plite substrate APIs win over old Plate command facades.
- No public compat aliases or docs for old transform authoring names.
- Private bridges are allowed only when they are not exported as final API and have an owner plus deletion gate.
- Do not remove the internal current-runtime `transforms` store in this packet; that belongs to the broader Plate runtime migration.

Boundaries:
- Kept: `api` for read/service/editor-scoped capabilities; `tx` for replayable document mutations.
- Cut: public Plate plugin transform authoring methods and docs.
- Deferred with owner: internal `editor.tf` / `editor.transforms` plumbing in `withPlite`, `createPlateRuntimeEditor`, and `legacyRuntimeUpdateBridge`.
- Plite boundary: `@platejs/plite` may still model extension transforms internally; Plate plugin authoring should not teach that layer as a product command API.

Blocked condition:
No blocker remained. The exact hard-cut boundary is smaller than deleting every internal transform store: the store is still used by the current Plate runtime bridge and editor interception path, so deleting it here would turn this packet into the full Plate runtime migration.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked which of `api` / `transforms` / `tx` to prune; closure target is hard-cut public `transforms`, keep `api` and `tx`. |
| Active goal checked or created | yes | Active goal objective matched this file and required this closure record. |
| Source of truth read before edits | yes | Core plugin/editor owners and public docs were audited with `rg` and focused file reads. |
| Plite/Plate boundary surface identified | yes | Plite substrate can keep internal transform mechanics; Plate public plugin authoring moves to `api` and `tx`. |
| API conflict ledger needed | yes | Ledger below closes authoring, runtime bridge, package, docs, and proof surfaces. |
| Planning vs execution mode decided | yes | Execution packet: source/docs changed and verified. |
| Browser proof needed | no | Type/package/docs API packet; no browser behavior claim. |
| External research needed | no | Local source owns this API decision. |

Work Checklist:
- [x] Explicit prompt requirement copied into the plan: prune `transforms`, keep the right public surfaces, and preserve inference.
- [x] Public API target recorded: `api` for read/service, `tx` for replayable mutations.
- [x] Public transform authoring methods cut from current source/docs.
- [x] Inline plugin tx inference preserved without helper widening.
- [x] Internal bridges recorded with owner, deletion gate, and proof route.
- [x] Public docs no longer teach removed transform authoring names.
- [x] Package proof run for Plite, core, affected feature packages, `platejs`, and docs.
- [x] Source audits run for stale authoring names across core/plugin/editor and feature package source.
- [x] Scorecard recorded with no dimension below closure threshold.
- [x] Final handoff items captured: changed list, proof, risks, and user-review focus.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement capture | complete | Plan records exact prune decision and non-goals. | source audit |
| Source API cut | complete | Core plugin/editor source audits have no current public authoring names. | package migrations |
| Package repair | complete | Footnote, docx, link, and feature package tests pass after tx/API repairs. | docs audit |
| Docs cleanup | complete | Public content/README audit has no stale removed names. | final proof |
| Final verification | complete | Typecheck/build/test/docs/audit commands passed. | handoff |

API conflict ledger:
| Surface | Current shape after packet | Verdict | Proof / adoption answer |
|---------|----------------------------|---------|-------------------------|
| Plugin authoring commands | `extendApi`, `extendTx`, `extendTxGroup`, `overrideEditor` | keep | Core source audit has no `extendTransforms` / `extendEditorTransforms` names. |
| Replayable mutations | Inline tx groups; plugin commands execute through `editor.update(tx => ...)` | keep | Feature package batch tests passed; footnote uses tx plus `afterCommit` for caret repair. |
| Read/service APIs | `editor.api` plus plugin API namespaces | keep | `docx-io` dispatches current `editor.api.docxExport` at call time and passes focused tests. |
| Public transform authoring | No current public docs/source API names | cut | Public content/README audit returned no matches. |
| Internal `editor.tf` / `editor.transforms` | Current-runtime implementation and bridge plumbing | private bridge | Kept only under core runtime/editor internals; deletion gate is full Plate runtime/default-route migration. |
| Plite extension transform substrate | Lower-level Plite/core storage and legacy bridge compatibility | defer | Not a Plate product command surface; deleting it here would break runtime interception before the migration owner is ready. |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | User impact | Migration route | Proof |
|-------|--------------|-------------------------|-------------|-----------------|-------|
| Remove public transform authoring names | They conflict with Plite tx/update semantics and encourage mutations outside replayable groups. | Aliases and wrappers would preserve fake compatibility. | Plugin authors move document mutations to `extendTx` / `extendTxGroup`. | Inline tx groups; no create-helper over-extraction. | Source/docs audits and feature package tests passed. |
| Keep private runtime bridge | Current Plate runtime still depends on legacy editor method plumbing. | Deleting it here would be broad runtime migration, not a contained hard cut. | No public API commitment. | Full Plate runtime migration removes bridge later. | Core typecheck/build/test and feature package tests passed. |

Private bridge and deletion gates:
| Bridge | Owner | Why temporary | Public exposure check | Deletion gate | Proof |
|--------|-------|---------------|-----------------------|---------------|-------|
| `packages/core/src/lib/editor/legacyRuntimeUpdateBridge.ts` | Plate runtime migration | Lets current runtime execute tx groups while packages migrate. | Not documented as public authoring API. | Remove after default Plate runtime uses Plite tx/update directly. | Core build/typecheck/tests and feature package tests passed. |
| `editor.tf` / `editor.transforms` in `createPlateRuntimeEditor.ts` and `withPlite.ts` | Plate runtime/default-route migration | Current editor interception still stores method wrappers there. | Docs/source authoring audit no longer teaches removed names. | Remove when runtime override/normalizer/operation paths are Plite-native. | Source audit classifies it as internal only. |
| `plugin.transforms` internal store | Core runtime internals | Needed for existing override/interception merging. | Public config types omit `transforms` from authoring config. | Remove with the same runtime migration, not this packet. | `createPlatePlugin` and `createPlitePlugin` config types omit `transforms`. |

Package / feature package target:
| Package / feature | Target API | Proof command | Verdict |
|-------------------|------------|---------------|---------|
| `packages/footnote` | Transactional insert through `extendTxGroup`, caret via `context.afterCommit` | `pnpm turbo test --filter=./packages/footnote --filter=./packages/link` | keep |
| `packages/docx-io` | API dispatch through current `editor.api.docxExport` | `pnpm turbo test --filter=./packages/docx-io` | keep |
| Feature package batch | No public transform authoring calls remain | 16-package turbo test batch | keep |
| Plite/core/foundation | `EditorUpdateContext` passed into tx groups | Plite/core/selection/utils tests and typecheck/build | keep |

Proof matrix:
| Claim | Cwd | Command / proof | Expected signal | Status |
|-------|-----|-----------------|-----------------|--------|
| Core formatting/build works | repo root | `pnpm exec biome check --fix ...` and `pnpm --filter @platejs/core build` | passes | complete |
| Plite tx context compiles | repo root | `pnpm --filter @platejs/plite build` | passes | complete |
| Footnote/link regressions pass | repo root | `pnpm turbo test --filter=./packages/footnote --filter=./packages/link` | link 85 pass, footnote 25 pass | complete |
| Docx API regression passes | repo root | `pnpm turbo test --filter=./packages/docx-io` | 93 pass | complete |
| Feature package batch passes | repo root | `pnpm turbo test --filter=./packages/basic-nodes --filter=./packages/list-classic --filter=./packages/code-block --filter=./packages/date --filter=./packages/math --filter=./packages/callout --filter=./packages/media --filter=./packages/mention --filter=./packages/tag --filter=./packages/docx-io --filter=./packages/comment --filter=./packages/footnote --filter=./packages/ai --filter=./packages/link --filter=./packages/toggle --filter=./packages/plate` | 16 successful tasks | complete |
| Foundation packages pass | repo root | `pnpm turbo test --filter=./packages/plite --filter=./packages/core --filter=./packages/selection --filter=./packages/utils` | slate 1007 pass / 85 skip, core 951 pass, selection/utils pass | complete |
| Public package facade builds | repo root | `pnpm --filter platejs build` | passes | complete |
| Public docs compile | repo root | `pnpm --filter www check:docs` | passes | complete |
| Public docs do not teach removed names | repo root | `rg -n "extendTransforms\|extendEditorTransforms\|getTransforms\|newExtensions\\.transforms\|transforms\\?: Deep2Partial" content packages/*/README.md --glob '*.md' --glob '*.mdx'` | no matches | complete |
| Core source has no removed authoring methods | repo root | `rg -n "extendTransforms\|extendEditorTransforms\|getTransforms\|newExtensions\\.transforms\|transforms\\?: Deep2Partial" packages/core/src/lib/plugin packages/core/src/react/plugin packages/core/src/internal/plugin packages/core/src/lib/editor packages/core/src/react/editor --glob '!**/dist/**'` | no matches | complete |
| Feature source has no removed authoring calls | repo root | `rg -n "\\.extendTransforms\|\\.extendEditorTransforms\|getTransforms\\(\|newExtensions\\.transforms\|transforms\\?: Deep2Partial" packages/*/src --glob '!**/dist/**' --glob '!packages/plite/**' --glob '!packages/plite-react/**' --glob '!packages/slate-legacy/**'` | no matches | complete |

Verification evidence:
Fresh final proof passed. The strongest gates were the 16-feature-package test batch, Plite/core/selection/utils test batch, public docs source parity, and three stale-name audits. The only stale-name hits left are in `docs/plans/**` historical planning artifacts, which are not public API docs and intentionally preserve prior decisions/evidence.

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.94 | Plate authoring uses `api`/`tx`; Plite/internal runtime transforms are fenced as private bridge debt. |
| Plate API/DX quality | 0.20 | 0.93 | Inline tx groups preserve inference and avoid create-helper boilerplate. |
| Runtime, performance, and testability | 0.20 | 0.91 | No browser claim; package/runtime tests prove current route behavior. |
| Minimal breaking-change strategy | 0.15 | 0.94 | Cut public names without forcing the full runtime migration into this packet. |
| Product/plugin/docs/examples coherence | 0.15 | 0.92 | Public docs no longer teach removed names. |
| Source evidence and proof completeness | 0.10 | 0.95 | Focused and broad package proof plus stale-name audits passed. |

Reboot status:
Current and closed. If resumed, start from the remaining private bridge rows, not from public `extendTransforms` removal; that authoring path is already cut.

Open risks:
`EditorUpdateContext` as the third tx group factory argument is a real substrate API addition and deserves user review. Internal `editor.tf` / `editor.transforms` remains private runtime debt until the broader Plate runtime migration removes it.

Final handoff outline:
- Changed: public Plate plugin transform authoring is cut; docs teach `extendApi` / `extendTx`; footnote/docx repaired against the new boundary; tx groups receive `EditorUpdateContext`.
- Needs review: `EditorUpdateContext.afterCommit` and the private bridge deletion gates.
- Not claimed: complete deletion of internal current-runtime transform storage.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run package proof, docs proof, and stale-name audits | Commands in proof matrix passed. |
| Plite/Plate boundary rows closed | yes | Split public authoring from private runtime internals | Boundary map and bridge table closed. |
| API conflict ledger closed | yes | Verdict every relevant surface | Ledger rows all have keep/cut/defer verdicts. |
| Breaking changes accepted | yes | Explain smaller options and migration route | Minimal breaking-change matrix complete. |
| Private bridges controlled | yes | Owner, deletion gate, no public docs | Bridge table complete. |
| Package/source execution changed | yes | Run focused owner typecheck/build/test | Package proof matrix complete. |
| Docs/content changed | yes | Run docs check and public docs stale-name audit | `pnpm --filter www check:docs` passed; public docs audit passed. |
| Browser behavior claim | no | Record reason | No browser behavior or UI claim in this packet. |
| Agent rules or skills changed | no | Record reason | No agent rule or skill edits. |
| Autoreview for implementation changes | no | Record reason | This packet used source audits and package proof; no separate autoreview requested for this goal. |
| Final user-review handoff | yes | Record review focus | Handoff outline and open risks name review focus. |
| Goal plan complete | yes | Run autogoal checker | Run after this file update. |
