# keep row drag handle for one row selection

Objective:
Keep row drag handles for selections within one row; hide them only when selection spans at least two rows; prove both sides of the boundary in the current table demo.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-keep-row-drag-handle-for-one-row-selection.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction to the preceding local table-selection repair
- id / link: N/A: no public issue or tracker item
- title: Keep row drag handle when selecting fewer than two rows
- acceptance criteria: a selection spanning multiple cells in one row keeps `Select or move row` visible; a selection spanning two rows hides it; generic block and removed selected-cell handles remain absent during expanded cell selection

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary boundary proof is stronger
- improvement loop: N/A: one-shot correction
- final score / loop closure: N/A: close on named test and Browser gates

Completion threshold:
- Existing exact browser coverage proves one-row selection keeps one visible row handle and two-row selection keeps zero visible row handles, with two selected cells and no runtime errors.
- The corrected boundary fails before the product edit, then passes 5/5 retry-free after the edit.
- Fresh Browser replay proves both one-row and two-row interaction outcomes on `/blocks/table-demo`.
- Registry changelog source/generated JSON and generated registry payloads match the final source.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-keep-row-drag-handle-for-one-row-selection.md` passes.

Verification surface:
- `apps/www/tests/browser/table-selection.spec.ts` focused Chromium proof, including one-row and two-row pointer drags.
- Fresh in-app Browser at `http://localhost:<port>/blocks/table-demo`, with visible accessible-label counts and console-error inspection.
- `pnpm --filter www typecheck`, scoped Ultracite, changelog generation/check, and `pnpm --filter www build:registry` on branch `next`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep generic `Drag block` and removed `Move selected cells` affordances absent for every expanded table-cell selection.
- Keep row moving available outside selections spanning at least two rows.
- Do not edit `templates/**`, packages, public APIs, or other tasks/chats.

Boundaries:
- Source of truth: `apps/www/src/registry/components/editor/table.tsx` plus the existing exact table-selection browser test.
- Allowed edit scope: table registry source, existing browser test, existing 2026-08-26 registry changelog entry, generated changelog JSON, generated registry payloads, and this plan.
- Browser surface: `/blocks/table-demo`.
- Browser strategy: in-app Browser because this is ordinary interactive app UI; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker/public issue in scope.
- Non-goals: no package/API redesign, no selected-cell move trigger restoration, no release/git mutation, no template edits.

Output budget strategy:
- Read only the table owner, exact test, existing changelog entry, and any directly referenced table-selection helper. Use targeted `rg`/`sed` with capped output; exclude generated/build trees until verification.

Blocked condition:
- Block only if the current table demo cannot reproduce the one-row/two-row boundary or the selection model exposes no stable row-span data; otherwise continue autonomously.

Task state:
- task_type: local browser-visible regression correction
- task_complexity: micro
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: completed locally
- confidence: high
- next owner: user for any git/release action
- reason: canonical row bounds now control only row-handle suppression; exact RED/GREEN, 5/5, full corpus, Browser, typecheck, lint, changelog, and registry build pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-keep-row-drag-handle-for-one-row-selection.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact `<2 rows` boundary, preserved handles, exclusions, proof, and handoff are recorded above. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Autogoal + Patch + Plate UI; Plate UI required shadcn ownership check and Registry Changelog. |
| Active goal checked or created | yes | No active goal existed; this goal and plan were created before product inspection/edits. |
| Source of truth read before edits | yes | Read `table.tsx`, `TableSelectionView`/`TableGridAnchor`, exact Playwright case, and existing changelog source. `view.bounds.minRow/maxRow` is the canonical row-span signal. |
| Tracker comments and attachments read | N/A | Direct user correction only; no tracker. |
| Video transcript evidence required | N/A | No video or recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Micro correction to source and test just completed in the same task context. |
| TDD decision before behavior change or bug fix | yes | Extend the existing exact Playwright case to the one-row/two-row boundary; prove new one-row assertion red before source edit. |
| Branch decision for code-changing task | yes | Continue on current `next` checkout; no branch/git mutation authorized. |
| Release artifact decision | yes | Registry-only user-visible change updates the existing registry changelog entry; no package changeset. |
| Browser tool decision for browser surface | yes | In-app Browser for ordinary local app QA. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker item. |
| Output budget strategy recorded | yes | Exact files and capped output only. |
| Browser pack selected | yes | Materialized in this plan. |
| Browser route / app surface identified | yes | `/blocks/table-demo` in `apps/www`. |
| Browser tool decision recorded | yes | Browser; no native Chrome/OS surface. |
| Console/network caveat policy recorded | yes | Browser console errors must be zero; blocking route/network errors fail proof. |
| Observable browser case captured | yes | Case `table:row-handle-two-row-threshold`: on current dirty ref, drag cell 0→1 within row then cell 0→4 across rows; selected count 2; row-handle visible counts 1 then 0; final proof fingerprints source/test/fixture/harness. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove both row-span states and stability | pass: exact RED/GREEN, full 4/4, receipt 5/5, Browser boundary proof |
| Bug reproduced before fix | yes | Record failing exact test | pass: one-row visible row-handle count expected 1, received 0 |
| Targeted behavior verification | yes | Run focused test/proof | pass: exact case green and 5/5 retry-free |
| TypeScript or typed config changed | yes | Run relevant typecheck | pass: `pnpm --filter www typecheck` exit 0 |
| Package exports or file layout changed | N/A | No package export or file-layout change | N/A: no `pnpm brl` needed |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lock/install change | N/A: no install graph mutation |
| Agent rules or skills changed | N/A | No agent workflow change | N/A: no generated skill sync needed |
| Workspace authority proof | yes | Run proof in owning repo/app/route | pass: cwd `/Users/zbeyens/git/plate-2`, app `www`, route `/blocks/table-demo` |
| Browser surface changed | yes | Capture Browser proof | pass: fresh in-app Browser replayed one-row and two-row drags |
| Browser final proof | yes | Record exact Browser outcome | pass: counts 0/0/1 then 0/0/0 with two selected cells |
| CI-controlled template output changed | N/A | No `templates/**` output touched | N/A: boundary respected |
| Package behavior or public API changed | N/A | Registry-only copied UI | N/A: no package changeset |
| Registry-only component work changed | yes | Update current registry changelog owner | pass: existing entry source updated; 87-event generation/check passed |
| Docs or content changed | N/A | No public docs/content change | N/A: changelog uses its dedicated owner |
| High-risk mini gate | yes | Record realistic browser failure and boundary | pass: risk was hiding row controls for one-row selection; canonical selection bounds and exact transient Browser proof close it |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling change | N/A: product/test/changelog only |
| Local install corruption suspected | N/A | No install-corruption signal | N/A: commands failed only for expected RED/capture timeout |
| P1 autoreview for non-trivial implementation changes | N/A | Branch `next` forbids autoreview | N/A: direct source review plus exact tests/Browser used |
| PR create or update | N/A | No PR requested | N/A: no git mutation |
| Task-style PR body verified | N/A | No PR exists | N/A |
| PR proof image hosting | N/A | No PR body | N/A |
| Tracker sync-back | N/A | No tracker/public issue | N/A |
| Final handoff contract | yes | Fill exact local handoff | pass: PR/tracker/test/Browser/outcome/caveat/design fields resolved |
| Final lint | yes | Run scoped equivalent | pass: Ultracite on table source and exact test |
| Output budget discipline | yes | Keep discovery exact and output capped | pass: exact owners only; generator's bounded 87-event output was expected |
| Timed checkpoint | N/A | No duration requested | N/A |
| Goal plan complete | yes | Run Autogoal checker | pass: final command recorded after checklist closure |
| Browser interaction proof | yes | Exercise exact route/interactions | pass: fresh page cell 0→1 then cell 0→4 |
| Browser console/network check | yes | Inspect errors | pass: console errors empty and route loaded without blocking network failure |
| Browser final proof artifact | yes | Record DOM/route proof | pass: fresh DOM snapshots and accessible-button counts; screenshot N/A because DOM presence is the owner |
| Exact case replay | yes | Prove both transient/end states | pass: Playwright asserts during drag and after release; Browser confirms final states |
| Final ref and fingerprints | yes | Record ref/input digest/receipt | pass: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`, 12 inputs, digest and receipt recorded |
| Clean final runtime | N/A | No pushed ref/immutable artifact without unauthorized git mutation | N/A: fresh final local process proves local completion only; uncommitted/unpushed |
| Retry-free stability | yes | Run 5/5 warm Chromium executions | pass: 5/5, retries 0 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | owners, row bounds, exact test, changelog, shadcn boundary read | implementation |
| Implementation | completed | renamed predicate/context and added row-span boundary test | verification |
| Verification | completed | exact RED/GREEN, full 4/4, receipt 5/5, Browser, typecheck, lint, generators | closeout |
| PR / tracker sync | N/A | no PR/tracker/git mutation requested | closeout |
| Closeout | completed | plan gates and handoff resolved | final response |

Findings:
- `hasCellSelection` is table-local context used only to omit row drag/drop controls; its name and predicate are broader than its actual job.
- `TableSelectionView.bounds` already exposes canonical `minRow`/`maxRow`, including span closure. No new scan, hook, package API, or path inference is needed.
- The existing exact case drags cell 0→4 across two rows and correctly expects every drag affordance hidden, but it lacks the one-row positive boundary.
- shadcn search found no table drag-handle item. Its Table component owns semantic table composition only, so this remains Plate-specific copied UI.

Decisions and tradeoffs:
- Rename the context field to `hasMultiRowSelection` and derive it from a valid complete expanded selection plus `bounds.maxRow > bounds.minRow`.
- Extend the existing exact case with cell 0→1 first: generic/cell handles stay absent and exactly one row handle remains visible. Keep cell 0→4 as the two-row forbidden state.
- Update the existing registry changelog event; do not create a second entry for the same unreleased correction.

Implementation notes:
- `TableSelectionView.bounds.maxRow > bounds.minRow` replaces generic expanded-selection state for row-control visibility.
- One-row and two-row assertions live in the existing `table:hide-block-handles-during-cell-selection` case to keep one executable behavior owner.
- Existing changelog source updated and generated JSON/registry payloads rebuilt; no package or template changes.

Review fixes:
- Direct source review: keep. The predicate uses the canonical cached selection view, adds no subscription or scan, and the name now matches its only consumer.
- P1 autoreview: N/A because repo policy forbids autoreview on branch `next`.
- Agent-native review: N/A because no agent workflow changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First parallel typecheck call outlived its 30-second capture window | 1 | Rerun as a yielded command and wait for its explicit exit | resolved: final typecheck exit 0 |

Verification evidence:
- RED: exact Playwright case failed before source edit with `Expected 1 visible row handles`, expected 1 and received 0.
- GREEN: exact case passed after source edit; full `table-selection.spec.ts` passed 4/4.
- Stability receipt: 5/5 retry-free, digest `sha256:7294f1dcbcff510a4b0d3cb47a60ed08be3712dad2f4d290966dfc7b8d04f8d8`, receipt `sha256:5710dae61babbe26d5c533d3ec0d5d60c15d92ebd7c72a733d25c2b0058a1185`.
- Fresh Browser: one-row selection selected 2 cells with visible counts `Drag block=0`, `Move selected cells=0`, `Select or move row=1`; two-row selection selected 2 cells with all three counts 0; console errors empty.
- `pnpm --filter www typecheck`, scoped Ultracite, changelog check (87 events), and `pnpm --filter www build:registry` all passed.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local request
- Confidence line: high; exact boundary and affected corpus proved
- Flow table:
  - Reproduced: test red before source edit; one-row row-handle count 0 instead of 1
  - Verified: exact green and 5/5; Browser one-row count 1 and two-row count 0
- Browser check: pass; fresh route/page, two sequential pointer drags, zero console errors
- Outcome: row drag handle remains for selections within one row and disappears only when selection spans at least two rows
- Caveat: local uncommitted/unpushed checkout; no CI/integration/release claim
- Design:
  - Chosen boundary: table-local selection view context in copied registry UI
  - Why not quick patch: the predicate name and meaning both needed correction so callers cannot repeat the broad behavior
  - Why not broader change: canonical row bounds already exist; no package/API/UI abstraction is missing
- Verified: RED/GREEN, 5/5, full file, Browser, typecheck, lint, changelog, registry build
- PR body verified: N/A: no PR

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested
- Issue / tracker: N/A: none
- Browser proof: pass on fresh `http://localhost:3001/blocks/table-demo`
- Caveats: local uncommitted/unpushed only

Timeline:
- 2026-08-26T14:40:50.160Z Task goal plan created.
- 2026-08-26 source audit found the over-broad predicate and canonical row-span bounds; shadcn has no competing owner.
- 2026-08-26 exact boundary test failed red with row-handle count 0 instead of 1.
- 2026-08-26 table context switched to canonical multi-row bounds; exact green and full file 4/4 passed.
- 2026-08-26 changelog/registry generated, 5/5 receipt captured, Browser boundary replay passed, and final typecheck/lint passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local implementation and verification complete |
| Where am I going? | Mechanical plan closeout, goal completion, final response |
| What is the goal? | Keep row handles for one-row selections and hide them for selections spanning at least two rows |
| What have I learned? | `TableSelectionView.bounds` is the canonical row-span owner |
| What have I done? | Proved RED, patched canonical owner, passed exact/full/stability/Browser/type/lint/generator gates |

Open risks:
- Local bytes remain uncommitted and unpushed; no pushed-ref, CI, integration, or release proof exists.
