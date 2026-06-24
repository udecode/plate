# plite public release final source mining plan

Objective:
Close Plite public-release source-mining plan; done when Plite Plan closure
gates pass and this plan is user-review-ready.

Goal plan:
docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md

Template:
docs/plans/templates/slate-plan.md

Flow mode:
agent-led plan hardening

Completion threshold:
- Plite Plan closure score is `0.9285`, with no dimension below `0.91`.
- Every planning phase is complete with evidence.
- The plan records a high-confidence negative public-release verdict.
- Public-release approval remains blocked by named proof/docs gates; that is the
  decision, not unfinished planning work.
- Final user-review handoff is recorded and emitted in chat.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`
  passes.

Verification surface:
- Plan artifact:
  `docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`.
- Source-mining prompt and dossier attachments.
- Compiled research under `docs/research/**`.
- Issue/accounting ledgers under `docs/plite-issues/**` and
  `docs/plite/**`.
- Live current Plite source/tests/examples under `.tmp/plite/**`.
- Mechanical closure checker:
  `.agents/skills/autogoal/scripts/check-complete.mjs`.

Constraints:
- Planning mode only; no `.tmp/plite` implementation edits in this goal.
- No broadening exact `Fixes` or `Improves` claims from anonymized product
  evidence.
- No stable/public-release claim for `plite-layout`.
- No Yjs/provider/awareness/product collaboration policy in raw Plite.
- No comments, suggestions, AI review, DOCX/RTF cleaning, template resolution,
  worker pools, export allow-lists, or app cost constants in core.

Boundaries:
- Editable planning artifact: this plan file.
- Read-only evidence: attachments, `docs/**`, and `.tmp/plite/**`.
- Future implementation proof belongs to a separate execution-mode goal after
  user acceptance.

Output budget strategy:
- Use targeted `sed`, `nl`, and `rg` reads with explicit paths.
- Avoid broad generated bundle scans; when a search is noisy, switch to curated
  ledgers and source owners.
- Record broad proof commands as future execution gates instead of streaming
  unrelated test output into the planning goal.

Blocked condition:
- Block only if the plan path, source-mining dossier, or required local Plite
  source/ledger evidence becomes unreadable and no narrower source-grounding move
  remains.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis | yes | Read `plite-plan` and `autogoal` skill bodies plus checker behavior. |
| Active goal | yes | `get_goal` shows the matching active Plite Plan goal. |
| Source of truth | yes | Read the attached source-mining dossier, compiled research, issue/reference ledgers, and live `.tmp/plite` source/tests/examples. |
| Planning boundary | yes | No implementation code changed; only this plan artifact changed. |

Work Checklist:
- [x] Requirements copied into the plan before closure.
- [x] Current live source and existing proof rows read.
- [x] Source-mining dossier mapped to keep/revise/reject decisions.
- [x] Issue accounting recorded without fake fixed-issue claims.
- [x] Public-release blockers named with minimum exit proof.
- [x] Rearchitecture decision recorded.
- [x] Plan-confidence score and public-release readiness score separated.
- [x] Final user-review handoff prepared.
- [x] Mechanical checker run after final evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Plan closure score | yes | Score must be at least `0.92` with no dimension below `0.85` | Closure scorecard records `0.9285`; lowest dimension `0.91`. |
| Public-release decision | yes | Decide release readiness without overclaiming | Verdict is `not public-release-ready`; blockers and execution packet are named. |
| Issue/reference sync | yes | Avoid fake claim churn | No exact issue claim changed; PR/ledger files unchanged for a recorded reason. |
| Implementation proof | no | Defer to execution mode | Planning mode touched no `.tmp/plite` implementation; future commands are named as beta gates. |
| Final handoff | yes | Emit exhaustive user-review handoff | `final_handoff_status: complete`; final response lists decisions and next execution owner. |
| Goal plan complete | yes | Run autogoal mechanical checker | Final checker command passes after this section is recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source-mining evidence read | complete | Attachments and live source/ledger reads recorded | done |
| Issue/accounting pass | complete | No exact issue claim broadened; release pressure mapped to non-claim blockers | done |
| Intent/boundary and decision brief | complete | Negative public-release verdict plus app/core boundaries recorded | done |
| Research/ecosystem synthesis | complete | Existing ProseMirror/Lexical/VS Code/Pretext/TanStack decisions reconciled with dossier | done |
| Pressure and objection pass | complete | Blocker stack, hard cuts, and maintainer objections recorded | done |
| Closure score and final gates | complete | Plan closure score, verification evidence, reboot status, and risks recorded | done |

Verification evidence:
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`
  initially failed because required colon-labeled sections were missing; this
  plan now records those sections.
- Final rerun:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`
  passes.
- Targeted `rg` scan found no leftover template markers, stale pass wording, or
  unresolved generated placeholders after the first closure repair.
- Live source and docs reads are recorded in `Source-Backed Current State`,
  `Issue Accounting`, and `Verification Workspace Gate`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Final Plite Plan closure | Stop for user review, not implementation | User-review-ready source-mining plan | Architecture is mostly right; public beta is blocked by proof/docs gates | Plan updated with decision, blocker stack, execution packet, scores, evidence, and risks |

Open risks:
- Public beta remains blocked until the named execution packet passes.
- Real CRDT/Yjs provider proof remains a future package/adapter lane, not a raw
  core claim.
- Transaction atomicity needs an explicit no-mid-normalize invariant before
  public release approval.
- `plite-layout` must not be marketed as stable.
- Resolved root design must stay guarded: public docs/examples must not teach
  `root: 'main'`.

## Requirement Extraction Checkpoint

The first checkpoint is requirement extraction because Codex compacting the
prompt is the known failure mode.

Explicit requirements copied from the user/request:

- Run a final `plite-plan` loop before a public release.
- Base the pass on the attached source-mining prompt and the external
  source-mining dossier.
- Use the dossier as evidence for Plite, not as a product migration plan.
- Feel free to recommend rearchitecture if the evidence requires it.
- Keep Plite unopinionated; product-specific behavior stays Plate/app layer
  unless it reveals a low-level Plite primitive.
- Treat live source as truth; docs are secondary when they conflict.
- Do not invent features from vibes; every claim needs source evidence or a
  `gap`.
- This activation is planning mode: no `.tmp/plite` implementation patches.
- Run the Plite Plan pass to a final public-release decision artifact.
- Public release is not ready just because the score looks good; all pass rows
  and completion gates must close.

## Public Release Approval Threshold

Public-release approval is legal only when all are true:

- score >= 0.92;
- no scorecard dimension below 0.85;
- every phase row is complete or explicitly skipped with evidence;
- issue/reference sync rows are closed;
- final user-review handoff exists;
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`
  passes.

This plan may still close as a decision artifact with a negative release verdict.
That is the correct outcome when the evidence says "not yet."

## Verification Surface

- Planning artifact integrity in `plate-2`.
- Source-mining evidence:
  `/Users/zbeyens/.codex/attachments/6d1da467-252e-4a5d-8723-78a39922a824/pasted-text.txt`
  and
  `/Users/zbeyens/.codex/attachments/08604679-0127-4bad-905e-bc501fe53397/pasted-text.txt`.
- Compiled research layer: `docs/research/**`.
- Issue/accounting layer: `docs/plite-issues/**`,
  `docs/plite/ledgers/**`, and `docs/plite/references/pr-description.md`.
- Live Plite source/proof under `.tmp/plite/**`.
- Any future implementation claim must name the exact `.tmp/plite` command.

## Constraints

- Planning mode may edit only `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`, and
  `docs/plite/references/**`.
- No implementation patch until the plan is user-review-ready and the user
  explicitly invokes execution mode.
- Do not broaden `Fixes` claims from external pressure. Exact issue closure
  still needs exact proof.
- Do not promote `plite-layout` as stable while its package/docs call it
  experimental.
- Do not add Yjs/provider/awareness/product collaboration policy to raw Plite.
- Do not add comments, suggestions, AI review, DOCX/RTF cleaning, template
  resolution, worker pools, export allow-lists, or app-specific cost constants
  to core.

## Boundaries

Allowed files this pass:

- this plan file;
- read-only evidence under attachments, `docs/**`, and `.tmp/plite/**`.

Blocked condition:

- only blocked if local Plite source or the required planning ledgers become
  unreadable and no source-grounding move remains.

## Plite Plan Lane State

- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete
- final_handoff: emitted in final chat response

## Current Verdict

- verdict: not public-release-ready under Plite Plan yet
- confidence: high
- keep / cut / revise call: keep the architecture direction; revise release
  gates and docs/proof priorities
- reason: the source-mining dossier validates the current v2 substrate, but
  public release still needs tighter proof and clearer docs around provenance,
  state-field collaboration policy, runtime ids, atomic transactions, editable
  islands, controlled history, clipboard middleware, remote selection
  subscriptions, and `plite-layout` experimental scope.

Harsh take: this is not a "rewrite v2" signal. It is a "stop selling substrate
without proof/docs for the exact product pressures it was built to solve" signal.

Final release decision:

- do not ship a public beta from this tree yet;
- do not rearchitect the core document model;
- do not absorb product features from the dossier into raw Plite;
- do run one focused public-release proof/docs execution packet before beta;
- keep `plite-layout` experimental;
- keep annotations as an external-channel / Plate/app pattern unless a later
  proof packet proves a smaller core primitive;
- keep the resolved root rule guarded: primary root is omission-only, internal
  sentinels stay private, and no user-facing path teaches `root: 'main'`.

## Start Gates

| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `plite-plan` and `autogoal`; `plite-plan` requires planning-mode discipline, and `autogoal` requires template-backed checkpoints. |
| Active goal checked or created | yes | `get_goal` returned null; created active goal for this plan. |
| Source of truth read before edits | yes | Read attached prompt/dossier, `docs/research` entrypoints, issue ledgers/references, relevant solutions, and live `.tmp/plite` source/tests. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read root/public API hard-cut, migration real-source, migration-backbone proof, and Yjs-readiness notes. |
| Live `.tmp/plite` grounding needed for current-state claims | yes | Read live Plite source/tests/examples listed below. |

## Work Checklist

- [x] Short objective plus lane outcome, pass schedule, planning-mode policy,
      completion threshold, verification surface, constraints, boundaries, and
      blocked condition are concrete.
- [x] Final public-release decision pass completed.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper-style accounting applied from existing issue
      requirements and PR reference ledgers; no exact issue claim was broadened.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecards recorded with evidence; plan closure score passes and public
      release readiness score remains below approval threshold.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD marked N/A for this planning-only pass; future proof changes need
      tests first.
- [x] Browser proof marked N/A for this planning-only pass; future browser
      release claims need focused browser commands.

## Completion Gates

| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Plan closure threshold passes; public-release approval remains blocked by named beta gates | complete negative release decision |
| Plite source/runtime/browser/package/public API claim | yes | Record exact execution commands before beta approval | deferred to separate execution-mode goal |
| Issue ledger or PR reference changed | no | No issue/reference file changed; no exact claim widened | N/A |
| Autoreview for implementation changes | no | Planning-only doc edit | N/A: no implementation patch |
| Final user-review handoff | yes | Emit final decision and blocker list | complete |
| Goal plan complete | yes | `check-complete.mjs` passes for the planning artifact; public-release proof is a separate execution packet | complete |

## Phase / Pass Table

| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | This plan; source/dossier/live-code evidence below | issue discovery |
| Related issue discovery | complete | `requirements-from-issues.md`, `issue-intelligence-master-plan.md`, `pr-description.md`, issue coverage rows | issue-ledger pass |
| Issue-ledger pass | complete | No new exact `Fixes` / `Improves`; source-mining rows are release-pressure and non-claim blockers | intent/boundary pass |
| Intent/boundary and decision brief | complete | Public release negative verdict; app/product features rejected from core | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Existing ProseMirror/Lexical/VS Code/Pretext/TanStack decisions reconciled with dossier | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Release blockers named below; no blanket rearchitecture recommended | objection ledger |
| Plite maintainer objection ledger | complete | Objections recorded below | high-risk pass |
| High-risk deliberate mode | complete | `plite-layout`, annotations, CRDT proof, public root/docs called out | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | External systems used as pressure, not copy targets | revision pass |
| Revision pass | complete | Plan upgraded from initial score to final release decision | issue sync accounting |
| Issue sync accounting | complete | No PR/issue claim files changed because no exact closure changed | closure score and final gates |
| Closure score and final gates | complete negative | Score below release threshold; public beta blocked | final handoff |

## Plite Plan Closure Scorecard

This score measures whether the plan is user-review-ready and source-backed,
not whether Plite is approved for public release.

| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.93 | Current private-alpha runtime proof, huge-doc claim limits, and future proof commands are recorded without upgrading them to public-release claims. |
| Plite-close unopinionated DX | 0.20 | 0.94 | The resolved public root model, app-layer product cuts, and Plite-close `Value` shape are recorded with live source evidence and guard rows. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.92 | Provenance, state fields, runtime ids, remote replay, and Yjs non-claim boundaries are separated from provider support. |
| Regression-proof testing strategy | 0.20 | 0.92 | Existing proof rows are distinguished from future beta gates; stale dossier gaps are corrected against live tests. |
| Research evidence completeness | 0.15 | 0.93 | Source-mining dossier is reconciled with compiled research, issue requirements, PR reference rows, and live `.tmp/plite` source. |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Example/doc complexity risk is named, while product semantics stay outside raw Plite. |

Weighted total: 0.9285.

Plan closure status: ready for user review. The plan is closed because it gives
a high-confidence negative release verdict with exact follow-up gates.

## Public Release Readiness Scorecard

| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.86 | Private-alpha runtime proof is materially strong and current docs record huge-doc guardrails, but public release still needs exact claim-width reruns instead of relying on prior green ledgers. |
| Plite-close unopinionated DX | 0.20 | 0.88 | Public root hard cuts, `InitialValue` primary `children`, `root` omitted for primary, and app-layer cuts align with Plite taste; release docs still need a brutally clear runtime-id/state-field/root story. |
| Plate and slate-yjs migration backbone | 0.15 | 0.85 | Fake collab adapter, collab state patches, remote history skip, runtime ids, and browser contracts exist; real Yjs/package proof remains out of raw core and must stay explicitly unclaimed. |
| Regression-proof testing strategy | 0.20 | 0.86 | The dossier is stale about editable-island/state-field proof; current coverage is stronger, but release-width proof still needs exact command reruns and a no-mid-normalize transaction invariant. |
| Research evidence completeness | 0.15 | 0.87 | The dossier agrees with compiled ProseMirror/Lexical/VS Code/Pretext decisions and existing issue requirements; anonymized product source still limits exact local validation. |
| shadcn-style composability and minimalism | 0.10 | 0.86 | Examples and hooks are composable; release risk is example/doc complexity, not missing primitives. |

Weighted total: 0.8645.

Release status: public-release blocked. This is a good private-alpha score and
a bad beta-release score. The public threshold remains `>= 0.92` with no
dimension below `0.85`; the only honest move is a focused proof/docs execution
packet, not celebratory shipping.

## Source-Backed Current State

External dossier:

- The dossier says the biggest validation is operation provenance:
  `EditorUpdateMetadata.origin`, `collab.origin`, update tags, and state-field
  collab policy replacing `editor.apply` hijacking
  (`pasted-text.txt` lines 19-27).
- It says state outside document content should map to state fields and patches,
  while product features stay app layer (`pasted-text.txt` lines 28-40).
- Its P0 backlog names provenance, atomic transactions, runtime ids, editable
  islands, state fields, controlled history, clipboard middleware, remote
  subscription correctness, `plite-layout`, and commit dirtiness
  (`pasted-text.txt` lines 340-355).
- Its open questions include real CRDT state-field proof, surviving range
  annotation, mid-transaction normalization, `plite-layout` stability, and
  remote selection subscription proof (`pasted-text.txt` lines 517-533).
- It explicitly says comments, AI, DOCX/RTF cleaning, template resolution,
  Yjs/WebRTC binding, worker pools, export allow-lists, and CRDT history stay
  Plate/app layer (`pasted-text.txt` lines 561-572).

Live Plite source:

- `InitialValue` is either a short children array or `{ children, roots, state }`;
  root reads omit the primary root (`.tmp/plite/packages/plite/src/interfaces/editor.ts:90-157`).
- State fields expose `collab: 'local' | 'shared'`, `history: 'push' | 'skip'`,
  patch hooks, and persisted state shape
  (`.tmp/plite/packages/plite/src/interfaces/editor.ts:103-141`).
- Update metadata exposes history, collaboration, origin, selection policy, and
  tags (`.tmp/plite/packages/plite/src/interfaces/editor.ts:202-240`).
- Runtime APIs expose `idAt` and `pathOf`, plus internal `getRuntimeId` /
  `getPathByRuntimeId` without rebuilding snapshots
  (`.tmp/plite/packages/plite/src/interfaces/editor.ts:474-478`,
  `2009-2035`).
- `EditorCommit` carries operations, metadata, tags, state patches, dirty state
  keys, dirty paths, runtime dirtiness, and affected runtime ids
  (`.tmp/plite/packages/plite/src/interfaces/editor.ts:1727-1777`).
- State patch policy filters collaboration-visible state patches by
  `collab === 'shared'` and rejects large shared/history values without patch
  hooks (`.tmp/plite/packages/plite/src/core/public-state.ts:513-664`).
- History has transaction APIs, state patch replay, metadata skip/push/merge,
  and remote-origin history suppression
  (`.tmp/plite/packages/plite-history/src/history-extension.ts:31-60`,
  `338-420`, `1153-1170`).
- `usePliteHistory` rejects public `root: 'main'`, proving the resolved public
  rule: callers omit root for the primary document
  (`.tmp/plite/packages/plite-react/src/hooks/use-slate-history.ts:183-201`).
- The document-state example demonstrates shared state fields, history, remote
  state replay metadata, and commit summary output
  (`.tmp/plite/site/examples/ts/document-state.tsx:19-33`, `140-161`).
- The editable-voids example demonstrates `void: 'editable-island'`,
  `contentRoot: { slot: 'body' }`, `usePliteChildRoot`, and same-runtime child
  roots (`.tmp/plite/site/examples/ts/editable-voids.tsx:67-121`,
  `180-215`).
- Clipboard middleware is demonstrated by the images extension
  (`.tmp/plite/site/examples/ts/images.tsx:149-181`).
- `plite-layout` has explicit page layout types, root validation, and Pretext
  integration, but also an internal `MAIN_ROOT_KEY` sentinel
  (`.tmp/plite/packages/plite-layout/src/index.ts:1-36`, `38-220`).

Live proof found:

- Collab state patches replay remotely without local undo history, and local
  fields are filtered from collaboration payloads
  (`.tmp/plite/packages/plite/test/collab-document-state-contract.ts:63-138`).
- State-only field commits undo/redo as history batches, history-skip state
  fields stay out of history, and large state fields use compact patch hooks
  (`.tmp/plite/packages/plite-history/test/document-state-history-contract.ts:35-155`,
  `237-290`).
- Three peers converge across text, mark, delete, and move commits while remote
  replays skip history (`.tmp/plite/packages/plite/test/collab-history-runtime-contract.ts:287-322`).
- Runtime ids are local and rebase/null across remote remove/move operations
  without serializing ids into operations
  (`.tmp/plite/packages/plite/test/collab-history-runtime-contract.ts:623-678`).
- A fake collab adapter exports local commits and suppresses remote/skipped loops
  without monkey-patching `apply`, `onChange`, or a Yjs-specific API
  (`.tmp/plite/packages/plite/test/collab-adapter-extension-contract.ts:65-190`).
- Runtime `idAt`/`pathOf` and rollback cache invalidation are already tested
  (`.tmp/plite/packages/plite/test/state-tx-public-api-contract.ts:271-370`).
- Browser proof for editable islands covers same-runtime child-root editing,
  focus retention, projected selection extension, child-root paste/drop, and
  ignoring parent selections crossing into child roots
  (`.tmp/plite/playwright/integration/examples/editable-voids.test.ts:439-560`,
  `917-1042`, `1123-1235`, `1258-1310`).
- Document-state browser proof covers metadata edits, undo/redo, remote state,
  and body-content separation
  (`.tmp/plite/playwright/integration/examples/document-state.test.ts:512-585`).
- `plite-layout` docs/tests mark the package experimental and proof-gated
  (`.tmp/plite/packages/plite-layout/README.md:1-23`,
  `.tmp/plite/packages/plite-layout/test/page-layout-contract.test.ts:117-143`).

Prior local decisions:

- Public root cuts should keep internal helpers private and avoid replacing a
  deleted API with a prettier public alias before downstream need is proven
  (`docs/solutions/developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md:44-99`).
- Migration planning must ground public seams in real source, not reference
  proposals (`docs/solutions/developer-experience/2026-04-18-plite-migration-must-take-transaction-seams-from-real-draft-source-not-reference-proposals.md:52-95`).
- Migration-backbone claims need browser contracts and retry-disabled reruns
  before completion (`docs/solutions/developer-experience/2026-04-28-plite-migration-backbone-lanes-need-browser-contracts-before-completion.md:47-126`).
- Yjs readiness belongs to raw core contracts first; real provider objects stay
  outside raw Plite (`docs/solutions/developer-experience/2026-05-13-plite-yjs-readiness-needs-core-contracts-before-package-work.md:54-168`).

## Plan Deltas From Source-Mining

Keep / promote:

- Operation provenance as a public DX story: `metadata.collab`, `metadata.origin`,
  and tags are not internal trivia; docs/examples should show adapter filtering
  without `editor.apply` monkey-patches.
- State fields as first-class non-content document state: title/settings/page
  settings/review-state substrate, with clear `local` vs `shared` examples.
- Runtime ids as the answer to "node I started editing moved": document runtime
  id vs persisted app id explicitly.
- Transaction boundary as an atomic edit contract: one update, one coherent
  commit, no mid-transaction normalization side effect visible to plugins.
- Editable islands as same-runtime child roots, not nested independent editors.
- Clipboard middleware as the generic seam for app content cleaning and transient
  mark exclusion.
- Commit dirtiness as the binding/diff substrate.

Revise / harden:

- The dossier's "no editable-void test" is stale against current source.
  Editable-island browser proof is strong; release plan should still require a
  docs/example review and exact command run before closure.
- The dossier's "state fields unproven" is partially stale. Core tests prove
  shared/local state patch filtering and remote replay without history, but not
  a real CRDT/Yjs binding round-trip. Keep this as a package-adapter proof gate,
  not a core rewrite gate.
- `plite-layout` should be documented as experimental off-editor layout substrate
  and not marketed as stable static rendering.
- Range annotation should stay a documented app/Plate pattern for now unless a
  later pass proves a minimal core primitive beats mark + external store +
  range refs.
- Internal `MAIN_ROOT_KEY = 'main'` remains an implementation sentinel. The
  public API decision is already resolved: omit root for the primary document.
  Only docs/examples need guard scans so the internal sentinel does not leak
  back into teaching material.

Reject:

- comments/suggestion threads in core;
- AI review semantics in core;
- DOCX/RTF/unit cleaning in core;
- template/data-binding in core;
- Yjs/WebRTC/provider/awareness in core;
- worker-pool static rendering infra in core;
- ephemeral node-type registry in core;
- notes column/layout UI in core;
- export allow-list policy in core;
- CRDT history in core.

## Public API Target

| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Initial value | `Value` or `{ children, roots?, state? }` | Short array stays Plite-close; object form is for extra roots/state | No public `main` root | `interfaces/editor.ts:90-101`; `use-slate-history.ts:183-201` | keep |
| Root targeting | omit `root` for primary; pass root only for extra roots | "roots are additional document roots" | `main` internal only | `usePliteHistory` throws for `root: 'main'` | resolved; guard docs/examples |
| State fields | `defineStateField({ key, initial, persist, history, collab, diff/applyPatch/invertPatch })` | non-content document state without hidden nodes | no product stores in core | state-field source/tests | keep, docs/examples harden |
| Provenance | `metadata.collab`, `metadata.origin`, `tag` | adapter-safe commit routing | no `editor.apply` monkey-patch | editor metadata and fake adapter test | keep, promote |
| Runtime ids | `state.runtime.idAt`, `state.runtime.pathOf`, `Editor.getRuntimeId`, `Editor.getPathByRuntimeId` | stable runtime handles without schema ids | distinguish from persisted app ids | runtime source/tests | keep, docs harden |
| Editable islands | `void: 'editable-island'`, `contentRoot`, `usePliteChildRoot` | rich same-runtime child content inside void shell | not nested editor compatibility | editable-void example/tests | keep |
| Clipboard middleware | extension-owned `clipboard.insertData` | normalize/coerce/strip at boundaries | product policies stay out | images example and clipboard contracts | keep, add docs recipe |
| `plite-layout` | experimental derived layout + `plite-layout/react` | off-editor/paged layout proof lane | no stable pagination claim | layout README/tests | keep experimental |

## Internal Runtime Target

| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Commit provenance | `slate` core | commit metadata + tags | adapter monkey-patches | editor metadata, collab adapter test | keep |
| Runtime identity | `slate` core | WeakMap runtime ids + snapshot/live indexes | persisted id pollution | runtime id source/tests | keep |
| State patches | `slate` core | state field patch log + collab/history filters | invisible nodes for scalar state | state patch source/tests | keep |
| History | `plite-history` | transaction history batches + state patch replay | CRDT history in core | history tests | keep |
| Child roots | `plite-react` + core roots | contentRoot ownership and root views | nested independent editors for same runtime content | editable void tests | keep |
| Layout | `plite-layout` | derived reader/store | layout fragments in document model | layout tests/docs | keep experimental |

## Plate / slate-yjs Migration Backbone Target

| Pressure | Plite substrate target | Adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------|----------|---------|---------|
| collaboration provenance | commits/tags/metadata | future adapter exports local commits and imports remote commits | no Yjs objects in core | fake adapter and Yjs-readiness note | keep |
| shared non-content state | state patches + collab filter | adapter sends `Editor.getCollabStatePatches` output | no product stores in core | collab document state test | keep |
| remote selection | selection metadata, side-effect policy, projection sources | provider owns awareness/cursor UI | no awareness transport in core | selection-side-effect and projected collab tests | keep; exact browser proof later |
| moved node targeting | runtime id lookup + bookmarks/range refs | adapter/application resolves current path from runtime id or durable anchor | no persisted node-id requirement | runtime id and bookmark tests | keep |
| app annotations | marks/range refs/external stores | Plate owns threads/comment service | no comment system in raw Plite | collaborative annotation decision | keep external |

## Issue Accounting

| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| provenance/collab clusters | related/improves only | adapter-safe commits without monkey-patching | source-mining validates need; existing issue requirements emphasize collaboration/history/runtime pressure | fake adapter + collab state tests; future real adapter proof | no ledger change this pass | PR already names collab/runtime substrate without new exact issue count |
| editable islands / void roots | exact current proof exists; release docs still pending | same-runtime child-root editable islands work in browser | dossier pressure maps directly to current example; current browser rows already cover more than dossier thought | focused editable-voids browser command before beta | no ledger change this pass | PR already has editable-island architecture rows |
| state fields | substrate proof exists | non-content state can be shared/local and history-aware | product hand-rolled this repeatedly; current tests/browser route prove the raw substrate | package + browser document-state commands before beta | no ledger change this pass | PR state-field section already names non-claim follow-up and current proof |
| layout/static render | experimental only | layout is a derived substrate, not stable static-render promise | package and docs self-label experimental | layout tests and docs proof map | no ledger change this pass | keep experimental wording |
| range annotation | non-claim | app/Plate external-channel pattern unless smaller primitive is proven | existing research decision already accepts external channels | annotation-store/source-scoped invalidation proof before stronger claim | no ledger change this pass | do not add Fixes/Improves |
| transaction atomicity | release blocker | one `editor.update` must prove no plugin-visible mid-normalize corruption | product corruption case is the dossier's strongest runtime warning | add or link exact no-mid-normalize invariant before beta | no ledger change this pass | PR transaction language needs proof link |
| runtime ids | release docs blocker | runtime ids are engine-owned live handles, not persisted app ids | product used persisted/path ids because old Plite lacked better runtime identity | docs/example scan plus package runtime-id command | no ledger change this pass | PR already names runtime identity |

Issue-accounting decision:

- no `docs/plite/references/pr-description.md` claim edit in this planning
  pass;
- no exact `Fixes` or `Improves` count changes;
- source-mining pressure maps to release blockers and docs/proof gates, not new
  issue closure.

That is the right call. The dossier is anonymized product evidence, not a
GitHub issue oracle.

## Public Release Blocker Stack

These are the blockers I would close before a public beta.

| Priority | Blocker | Why it blocks public beta | Minimum exit proof |
|----------|---------|---------------------------|--------------------|
| P0 | Public docs/API guard for `InitialValue`, primary-root omission, extra `roots`, and `state` | The root model is already resolved; beta docs must not accidentally reintroduce `main` as public API | docs/example scan plus public API smoke |
| P0 | Transaction atomicity / no-mid-normalize invariant | The dossier's corruption case is exactly the kind of bug v2 claims to eliminate | focused `slate` package test with extension normalizer/commit listener proof |
| P0 | Provenance/collab substrate docs and fake-binding command rerun | Public users will assume Yjs is solved unless wording is sharp | fake adapter + collab state/history commands, docs say substrate not provider |
| P0 | State-field release docs and browser rerun | This is a real differentiator and easy to misunderstand as app state in core | document-state browser proof plus state/history/collab package bundle |
| P1 | Runtime id vs persisted id example/docs | This is the sharpest Plate migration concept break | id-anchored transform example or focused docs with command-backed test |
| P1 | Editable-island docs/examples rerun | Current proof is strong, but the public story must teach same-runtime roots, not nested editors | focused editable-voids browser proof and docs review |
| P1 | `plite-layout` wording gate | It is useful but not stable enough to sell as pagination solved | layout package tests and docs scan preserve `experimental` |
| P1 | Annotation external-channel decision | Prevents accidental comment-system-in-core drift | docs decision linked from release notes/docs; no core product API added |
| P2 | Serialization round-trip for `{ children, roots, state }` | Public value shape should survive import/export without folklore | focused package test or exact existing proof link |

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|-------|--------|--------------|---------|
| Product dossier | attached source-mining reply | real Plate/Plite pressure | provenance, state fields, runtime ids, islands, middleware | product semantics | proof/docs gates | strong but anonymized |
| ProseMirror | compiled research and prior decisions | mapped ranges/bookmarks/transactions | transaction and anchor discipline | ProseMirror plugin worldview | unopinionated Plite substrate | keep as comparison |
| Lexical | compiled research and prior decisions | read/update and dirty reconciliation | explicit dirty/runtime lanes | Lexical node ecosystem policy | React runtime consumers | keep as comparison |
| Tiptap/Plate | compiled research | extension docs/product composition | extension DX lessons | product APIs in raw Plite | examples/docs only | keep boundary |

## Legacy Regression Proof Matrix

| Regression class | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-------------|-------|--------|
| provenance/collab loops | local/remote/skip metadata never loops or pollutes history | package fake adapter + future real adapter/browser | `slate` / future adapter | partial |
| non-content state | shared/local state fields are patchable, history-aware, serializable | package + document-state browser | `slate`, `plite-history`, `plite-react` | partial |
| editable islands | child roots edit/focus/select/paste/drop without stealing parent selection | editable-voids browser | `plite-react` | strong |
| transaction atomicity | one `editor.update` emits one coherent commit and no mid-normalize plugin-visible side effect | package test still needed for explicit no-mid-normalize invariant | `slate` | partial |
| runtime ids under concurrency | id targets rebase/null under remote ops | package tests plus future id-addressed transform example | `slate` | partial |
| static/off-editor rendering | layout is derived and experimental | layout package tests/docs | `plite-layout` | partial |

## Browser Stress / Parity Strategy

| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| document-state | shared/local state fields, remote state, history, body separation | Chromium/Firefox/WebKit where applicable | focused `document-state.test.ts` | state commits and remote tags correct | deferred beta gate |
| editable-voids | child-root editing, focus, selection extension, paste/drop, cross-root selection ignore | Chromium/Firefox/WebKit where applicable | focused `editable-voids.test.ts` | model/native/view selection agree | deferred beta gate |
| collab substrate | fake adapter, collab state patches, remote history skip | package tests | `collab-*.ts`, `document-state-history-contract.ts` | local exported, remote skipped, state filtered | deferred beta gate |
| layout | experimental docs + page layout contracts | package tests | `plite-layout` tests | no stable claim leak | deferred beta gate |

## Verification Workspace Gate

| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| current pass is planning-only | `plate-2` | source reads + plan edit | complete | slate-plan |
| provenance/collab release gate | `.tmp/plite` | `bun test ./packages/plite/test/collab-adapter-extension-contract.ts ./packages/plite/test/collab-document-state-contract.ts ./packages/plite/test/collab-history-runtime-contract.ts --bail 1` | deferred beta execution | slate-plan execution |
| document state release gate | `.tmp/plite` | `bun test ./packages/plite/test/collab-document-state-contract.ts ./packages/plite-history/test/document-state-history-contract.ts --bail 1` plus focused `document-state.test.ts` Playwright grep | deferred beta execution | slate-plan execution |
| transaction atomicity release gate | `.tmp/plite` | add/link focused no-mid-normalize invariant, then `bun test ./packages/plite/test/transaction-contract.ts --bail 1` | deferred beta execution | slate-plan execution |
| runtime ids release gate | `.tmp/plite` | `bun test ./packages/plite/test/state-tx-public-api-contract.ts ./packages/plite/test/collab-history-runtime-contract.ts --bail 1` | deferred beta execution | slate-plan execution |
| editable island release gate | `.tmp/plite` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts` | deferred beta execution | slate-plan execution |
| layout experimental gate | `.tmp/plite` | `bun test ./packages/plite-layout/test/page-layout-contract.test.ts --bail 1` plus docs scan for experimental wording | deferred beta execution | slate-plan execution |
| public docs/API scan | `.tmp/plite` + `plate-2` | scan docs/examples for public `root: 'main'`, stale value shapes, overbroad `plite-layout` claims | deferred beta execution | slate-plan execution |

## Applicable Implementation-Skill Review Matrix

| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | later | deferred beta execution | React runtime hooks/subscriptions need pressure pass | keep for React subscription pass |
| performance-oracle | later | deferred beta execution | layout/selection/runtime dirtiness claims need metric proof before public claims | keep |
| performance | later | deferred beta execution | `plite-layout` and huge-doc lanes must not be overstated | keep |
| tdd | later | deferred beta execution | missing proof gaps require tests before implementation | keep |
| shadcn | later | deferred beta execution | examples should stay composable and not product-heavy | keep |
| react-useeffect | later | deferred beta execution | remote selection/effect lanes need review | keep |

## High-Risk Pre-Mortem

| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| provenance oversold | docs claim CRDT binding solved | users expect Yjs package support | call substrate only; add fake adapter and later real adapter gates | collab tests + docs wording | open |
| `plite-layout` oversold | public release calls it stable | beta users treat pagination/static rendering as mature | keep experimental label and proof gates | layout docs/tests | open |
| runtime ids misunderstood | docs imply persisted ids | apps store runtime ids in DB | document runtime vs persisted id split | docs/example | open |
| annotations overbuilt | core adds comment service or new primitive prematurely | raw Plite becomes product framework | keep app/Plate pattern unless objection pass proves minimal primitive | decision/objection pass | open |
| hidden `main` leaks | public examples mention `root: 'main'` | docs contradict the resolved design | keep internal sentinel private; docs say omit root | public-surface tests/docs scan | guarded beta check |

## Plite Maintainer Objection Ledger

| Change | Objection | Tradeoff | Evidence | Answer | Verdict |
|--------|-----------|----------|----------|--------|---------|
| state fields | "This is app state, not Plite" | Plite owns document-adjacent state patches, not product stores | product pressure + current tests | restrict to keyed fields, collab/history/persist policy | keep |
| provenance metadata | "Tags are ad hoc" | adapters need routing without monkey-patches | product ephemeral origin + fake adapter | canonical tags plus custom tags | keep |
| editable islands | "Nested editing is product complexity" | same-runtime child roots are lower-level than nested editors | product nested editors + current browser proof | core provides root ownership, app renders shell | keep |
| runtime ids | "Plite paths are enough" | paths break under moves/concurrency | product NodeId pressure + runtime tests | runtime ids are engine-owned, not serialized | keep |
| layout | "Pagination is product" | layout substrate can be generic but is experimental | current package/docs | keep experimental, no stable promise | keep narrow |
| annotations | "Comments do not belong in core" | agreed | research decision | docs pattern only unless later proof | reject core product feature |

## Hard Cuts And Rejected Alternatives

| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| public `root: 'main'` | already cut | primary root is omitted publicly | low | usePliteHistory throws | guard docs/examples |
| Yjs objects in core | reject | raw core must be adapter substrate | medium | Yjs readiness solution | future package only |
| comment service in core | reject | permissions/threading are app/service policy | high | annotation decision | docs pattern |
| DOCX/RTF cleaners in core | reject | content policy and imports are app/Plate | high | dossier hard cuts | clipboard recipe |
| stable `plite-layout` claim | reject for beta | package is experimental | medium | layout README/tests | wording gate |
| product cost constants | reject | heuristics are not core law | low | dossier perf notes | app docs only |

## Open Questions And Decision-Changing Evidence

| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Does a real CRDT/Yjs binding round-trip shared state fields? | decides how strong collab docs can be | adapter-level proof or explicit non-claim | future execution | open; not a raw-core blocker if docs say substrate only |
| Do React selection subscriptions capture remote-origin commits across realistic provider UI? | product had a custom Yjs selection hook | focused package/browser proof | future execution | open; block any "Yjs selection solved" claim |
| Is mark + external store + range refs enough for annotations? | prevents accidental core comment framework | objection pass plus docs/API audit | slate-plan | answered for beta: keep external-channel pattern |
| Is there an explicit no-mid-normalize transaction invariant test? | product corruption class depends on it | package test or exact existing proof link | future execution | open; blocks beta |
| Is serialization round-trip for `{ children, roots, state }` release-grade? | value API is a beta-facing design | focused package/browser/docs proof | future execution | open; blocks beta docs/API approval |
| Should internal `MAIN_ROOT_KEY` be renamed to reduce confusion? | public design is resolved: no public `main` | source audit only if a leak is proven | later execution | closed for beta; do not rename unless public leakage recurs |

## Rearchitecture Decision

No large rearchitecture is justified by the source-mining dossier.

The dossier validates the current spine:

- simple Plite document model;
- transaction-first execution;
- operation provenance;
- state fields for non-content document state;
- runtime ids for live identity;
- same-runtime editable islands;
- clipboard middleware;
- derived layout as a separate package.

The only architectural revisions I would allow before beta:

1. Add or link a stronger transaction atomicity/no-mid-normalize invariant.
2. Guard public docs/examples so the already-resolved root rule stays visible:
   primary root is omission-only and `main` never appears as user-facing API.
3. Keep `plite-layout` visibly experimental.
4. Keep annotation/comment payloads external and document the anchor pattern.
5. Add a serialization/value-shape proof if none already exists.

Everything else in the dossier is product/Plate/app layer. Pulling it into raw
Plite would make v2 worse.

## Public Beta Execution Packet

This is the exact packet I would run before public beta.

1. Public API/doc scan:
   - value shape: `Value` array and `{ children, roots?, state? }`;
   - no public `root: 'main'`;
   - no stable `plite-layout` claim;
   - no docs that imply Yjs/provider support is built in.
2. Transaction proof:
   - add/link no-mid-normalize invariant;
   - rerun `transaction-contract.ts`.
3. Collab/state proof:
   - rerun fake adapter, collab history/runtime, collab document state, and
     document state history contracts.
4. Browser proof:
   - rerun document-state and editable-voids focused Playwright rows with
     retries disabled.
5. Layout proof:
   - rerun layout package tests and docs wording guard.
6. Final public-release wording pass:
   - public docs describe the latest state only;
   - no migration chatter;
   - exact claims only.

## Implementation Phases With Owners

| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Related issue discovery | slate-plan | map dossier pressure to Plite issue clusters | current pass complete | issue rows and exact/non-claim categories drafted | docs/plite-issues reads |
| Issue-ledger pass | clawsweeper + slate-plan | sync related rows without fake Fixes claims | discovery complete | ledgers/reference rows updated or N/A | ledger diff |
| Public release proof packet | slate-plan execution | add/repair tests/docs only after plan acceptance | plan accepted | focused commands green | `.tmp/plite` commands |
| API/doc hardening packet | hard-cut + docs-creator | public docs/root/runtime wording | proof packet named | docs match current API only | public-surface tests |
| Objection/closure packet | slate-plan | maintainer objections and score closure | all proof rows done | score >= 0.92 and checker passes | check-complete |

## Fast Driver Gates

| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | this plan | requirements captured and final decision recorded | complete |
| source-mining evidence | plate-2 | attachments read | outside pressure ingested | complete |
| live source grounding | plate-2 | read `.tmp/plite` source/tests | current-state claims grounded | complete |
| Plite behavior check | .tmp/plite | focused commands deferred to beta execution | release proof | deferred beta gate |

## Final User-Review Handoff Outline

- changed files
- current verdict and score
- pass completed
- proof found vs proof still missing
- release blockers
- implementation/rearchitecture recommendations
- exact next pass
- commands run
- anything needing user attention

## Current Handoff Notes For This Activation

Changed files:

- `docs/plans/2026-06-15-plite-public-release-final-source-mining-plan.md`

Pass completed:

- Final Plite Plan source-mining public-release decision.

Commands run:

- `wc -l` on both skills and both attachments.
- `sed`/`nl`/`rg` source reads over `plite-plan`, `autogoal`, attachments,
  `docs/research/**`, `docs/plite-issues/**`, `docs/plite/**`,
  `docs/solutions/**`, and `.tmp/plite/**`.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template slate-plan --title "plite public release final source mining plan"`.
- Additional targeted `rg` / `nl` reads over issue requirements, PR reference,
  architecture claim docs, proof ledgers, research decisions, and live
  `.tmp/plite` package/tests/examples.

Not run:

- No `.tmp/plite` tests or browser commands; this was a planning decision
  pass, not the beta execution packet.
- No public-beta execution packet; public-release approval is intentionally
  blocked by the proof/docs gates above.

Needs user attention:

- Do not public-release yet under the Plite Plan bar.
- This is not a panic and not a rewrite signal. The architecture is mostly
  right; the public release story is not tight enough.
- The beta blockers are public docs/API shape, transaction atomicity proof,
  provenance/collab wording plus command reruns, state-field docs/proof,
  runtime-id docs, editable-island focused browser proof, experimental
  `plite-layout` wording, annotation external-channel wording, and
  `{ children, roots?, state? }` serialization/value proof.
- Root design is resolved. The beta task is only to guard public docs/examples
  so the internal primary-root sentinel never appears as user-facing API.

Next pass:

- None for this planning goal. For implementation, review this plan and invoke
  `plite-plan` again with this accepted plan path to run the Public Beta
  Execution Packet under a separate execution-mode goal.
