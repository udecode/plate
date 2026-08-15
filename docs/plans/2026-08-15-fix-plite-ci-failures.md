# fix plite ci failures

Objective:
Fix all three current Plite CI failures; done when focused regressions,
`pnpm check:plite`, and `pnpm check` pass; plan
docs/plans/2026-08-15-fix-plite-ci-failures.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-fix-plite-ci-failures.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request following a fresh CI verification
- id / link: N/A: no issue or PR supplied
- title: Fix the three current Plite CI failures
- acceptance criteria: repair the internal export contract, deduplicate the
  pending changeset policy violation, and preserve node-key allocation across a
  discarded structural transaction spec; rerun focused proof, strict Plite CI,
  root CI, barrels when affected, and P2 autoreview.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: exact failing contracts define the threshold
- improvement loop: fix one owner at a time, run its focused proof, then run
  strict Plite and root CI; pivot to the next root cause on every red exit.
- final score / loop closure: N/A: binary CI gates own closure.

Completion threshold:
- The three reproduced failures pass in focused runs with their surrounding
  contract files.
- `pnpm check:plite` exits 0, including package tests, contracts, and Chromium.
- `pnpm check` exits 0, `pnpm brl` introduces no drift when exports change,
  the release artifact is valid, and P2 autoreview has no accepted actionable
  findings.
- Any downstream Plite-family failure uncovered only after the original early
  exit is repaired at its owner and included in the same strict rerun.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-fix-plite-ci-failures.md` passes.

Verification surface:
- `packages/plite/test/public-package-import-smoke.test.ts`,
  `packages/plite/test/runtime-contracts.test.ts`, and
  `packages/plite/test/native-transaction-spec-contract.test.ts`.
- `pnpm --filter @platejs/plite test`, `pnpm check:plite`, `pnpm check`, and
  `pnpm brl` when export files change.
- Current-checkout P2 autoreview over the exact repair diff.

Constraints:
- Preserve the accepted internal exports unless source evidence proves they
  escaped accidentally; do not hide a real export with a stale test edit.
- Preserve stable node keys while preventing discarded speculative work from
  advancing runtime identity.
- Deduplicate changeset release intent relative to `main`; do not delete
  unrelated user-visible release notes.
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the three failing Plite contracts, their runtime/export
  owners under `packages/plite/src`, and pending `.changeset/*.md` relative to
  `main`.
- Allowed edit scope: owning Plite runtime/export/test sources, the smallest
  existing changeset consolidation owner, generated barrels if required, and
  this goal ledger.
- Browser surface: no manual UI change; strict Plite Chromium proof is required
  because `pnpm check:plite` owns it.
- Browser strategy: use the repo-owned automated Chromium command inside the
  strict Plite gate; no manual Browser route is needed for model/export policy.
- Tracker sync: N/A: no issue or PR supplied.
- Non-goals: no unrelated API migration, registry edits, docs rewrite, release,
  commit, push, or PR.

Output budget strategy:
- Read exact failing tests and direct runtime owners only. Capture broad test,
  CI, build, and review output under `/tmp/plate-fix-ci-*.log`; inspect bounded
  failure tails and summary lines.

Blocked condition:
- Block only if the same owner cannot be made correct after three distinct
  source-backed attempts or an external release/server-only state prevents a
  required local gate; ordinary failing tests remain actionable.

Task state:
- task_type: Plite regression cluster
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: green; all locally reproducible CI gates pass
- confidence: 100% from focused, strict Plite, root, barrel, browser, and review
  evidence
- next owner: user for any commit or PR decision
- reason: stale contracts and duplicate release metadata were repaired without
  changing the already-correct runtime behavior.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-fix-plite-ci-failures.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Fix means all three known failures plus the full strict/root CI gates. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `patch` owns the runtime regression; `changeset` owns release prose; `autogoal` owns closure. |
| Active goal checked or created | yes | Prior verification goal was complete; a new matching goal will use this plan. |
| Source of truth read before edits | yes | Fresh failing outputs and exact test assertions were captured in the preceding verification turn. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment supplied. |
| Video transcript evidence required | no | N/A: no video supplied. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Searched node-key, transaction-spec, internal-export, and changeset solutions; no exact fix recipe overrides current source. |
| TDD decision before behavior change or bug fix | yes | Existing failing behavior contracts are the RED tests; strengthen only if the runtime root cause exposes a missing invariant. |
| Branch decision for code-changing task | no | N/A: user did not request branch, commit, or PR work. |
| Release artifact decision | yes | Consolidate the duplicate Core patch note into `.changeset/core-next-sync-runtime.md`; no new Plite changeset because production behavior/API is unchanged. |
| Browser tool decision for browser surface | yes | Strict Plite automated Chromium proof owns browser verification. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker supplied. |
| Output budget strategy recorded | yes | Broad output goes to `/tmp` with bounded summaries. |
| Package/API pack selected | yes | Package exports, runtime behavior, and changeset policy are affected. |
| Public surface or package boundary identified | yes | `@platejs/plite/internal` export contract plus Plite runtime behavior; no public call-shape change intended. |
| Release artifact path selected | yes | `.changeset/core-next-sync-runtime.md` retains the heading-family user impact; no registry changelog. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before source edits; one package per file and `main`-relative user impact apply. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` if export owner/barrel changes; otherwise prove N/A. |

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
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits;
      no package-local `AGENTS.md` exists.
- [x] Implementation fixes the right ownership boundary: stale exact contracts
      and duplicate release metadata; runtime allocation remains unchanged.
- [x] Release artifact requirement recorded: consolidate existing Core
      changeset intent; no new Plite package delta.
- [x] Final handoff shape decided: root cause, files, focused/full tests,
      Chromium, changeset/barrel status, and P2 autoreview; no tracker or PR.
- [x] Branch handling recorded: N/A because no branch/commit/PR was requested.
- [x] Local-env-rot retry policy recorded: reinstall only for documented
      corruption signals; deterministic assertions do not qualify.
- [x] Workspace authority recorded: all commands run in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: speculative transactions must not consume keys,
      while committed identity and internal export compatibility must remain.
- [x] Review/P2 autoreview target selected: isolated exact repair bundle for the
      four current files plus the deleted duplicate changeset, excluding all
      unrelated shared-checkout WIP.
- [x] Agent-native review decision recorded: N/A unless the repair unexpectedly
      changes agent/tooling sources.
- [x] Output budget discipline recorded: exact owners and bounded `/tmp` logs.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects existing Core `.changeset` consolidation.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows package/version/prose rules.
- [x] Package/API pack: registry changelog is N/A because no registry-only work is planned.
- [x] Package/API pack: no new Plite artifact is required because production
      runtime/API did not change; only stale tests changed.
- [x] Package/API pack: compatibility decision is no public call-shape change; internal export allowlist must match intended owner.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded in
      Verification evidence.
- [x] Package/API pack: `pnpm brl` passed with zero introduced drift and the
      Core release note was consolidated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused, strict Plite, root CI, barrels, and review | All passed; evidence below. |
| Bug reproduced before fix | yes | Record failing test/repro | Original three failures plus masked Plite React failure recorded with exact assertions. |
| Targeted behavior verification | yes | Run focused proof | 774/774 Plite contracts and 54/54 Plite React surface tests passed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no production types changed; Plite package and strict-family typechecks passed anyway. |
| Package exports or file layout changed | no | Run `pnpm brl` | No export owner changed; `pnpm brl` passed with zero introduced drift. |
| Package manifests, lockfile, or install graph changed | no | Run install checks | N/A: no manifest, lockfile, or dependency change. |
| Agent rules or skills changed | no | Run skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run in owning workspace | Every source and proof command ran in `/Users/zbeyens/git/plate-2`; review used an exact isolated bundle. |
| Browser surface changed | no | Capture manual Browser proof or N/A | N/A: no browser behavior changed. |
| Browser final proof | yes | Run CI-owned browser proof | Strict Plite reused the matching complete Chromium proof: 698 passed, 6 skipped. |
| CI-controlled template output changed | no | Restore templates or N/A | N/A: no templates touched. |
| Package behavior or public API changed | no | Add changeset or N/A | N/A: runtime/API unchanged; existing Core release prose was only consolidated. |
| Registry-only component work changed | no | Update registry changelog or N/A | N/A: no registry work. |
| Docs or content changed | no | Verify docs or N/A | N/A: only internal goal ledger and existing release prose consolidation. |
| High-risk mini gate | yes | Record realistic failure and owner | Prevented false cross-editor key equality, preserved scoped keys, and kept intentional internal bridge consumers; strict Plite and review passed. |
| Agent-native review for agent/tooling changes | no | Run agent-native review or N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Reinstall or N/A | N/A: deterministic assertions; no install-corruption signature. |
| P2 autoreview for non-trivial implementation changes | yes | Run isolated P2 autoreview | Clean: no accepted/actionable findings, patch correctness 0.98. |
| PR create or update | no | Run check before PR work | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body | N/A: no PR. |
| PR proof image hosting | no | Host proof image or N/A | N/A: no PR or image proof. |
| Tracker sync-back | no | Sync tracker or N/A | N/A: no tracker supplied. |
| Final handoff contract | yes | Fill exact proof and caveats | Complete below. |
| Final lint | yes | Run lint or scoped equivalent | Scoped Biome passed; final `pnpm check` lint passed. |
| Output budget discipline | yes | Keep broad output bounded | CI and review logs were captured under `/tmp`; only bounded tails were read. |
| Timed checkpoint | no | Continue for requested duration or N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `check-complete.mjs` | Passed. |
| Public API / package boundary proof | yes | Audit API/export impact | Intentional internal bridge exports are test-covered; no public root call shape changed. |
| Release artifact classification | yes | Classify release delta | Release-metadata consolidation only; no new Plite package delta. |
| Published package changeset | yes | Keep one package/bump entry | Core heading-family note now lives in the single Core patch changeset; duplicate contract passed. |
| Registry changelog | no | Use registry changelog or N/A | N/A: no registry-only change. |
| No release artifact | yes | Record no-new-artifact reason | No new Plite artifact: test expectations changed, production runtime/API did not. |
| Package typecheck/build/test | yes | Run owning checks | Plite typecheck and 1,438 tests passed; strict Plite builds/contracts passed. |
| Barrel/export generation | yes | Run `pnpm brl` | Exit 0, 56 tasks, zero introduced drift. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | exact failures and owners classified | implementation |
| Implementation | done | contract expectations and changeset consolidation repaired | verification |
| Verification | done | focused 774/774; Plite package 1,438/1,438; strict Plite pass | review |
| Review | done | isolated P2 autoreview clean at 0.98 correctness | root CI |
| PR / tracker sync | done | N/A: neither requested nor supplied | closeout |
| Closeout | done | root `pnpm check` and all completion evidence passed | final response |

Findings:
- `getNodeKeyDOMValue` is intentionally consumed by Plite React and tests, and
  `preserveCompiledSchemaPropertyIdentity` is intentionally consumed by Plate
  Core; the exact internal-export expectation was stale.
- The discarded-spec test compared full node keys across different editors.
  Full keys intentionally carry distinct editor scopes; both local ordinals
  were already `n4`, so runtime allocation was correct and the assertion was
  wrong.
- Core had two patch changesets. The focused heading-family note belongs as a
  bullet in the existing Core patch changeset, leaving one Core patch entry.
- Strict Plite CI then exposed a masked Plite React source-contract assertion:
  rendered `data-*` attributes correctly use `string` after editor scope is
  removed for SSR/hydration, but the contract still expected branded `NodeKey`.

Decisions and tradeoffs:
- Keep editor-scoped runtime keys globally distinct and compare only their DOM
  values when a test intentionally checks cross-editor allocation order.
- Update the internal export allowlist rather than deleting bridge exports
  required by Plite React and Plate Core.
- Consolidate release prose instead of deleting the heading-family user impact.
- Review scope baseline: request is to clear the current CI failures; violated
  invariants are exact internal exports, editor-scoped key comparisons, DOM
  attribute typing, and one-release-row-per-package. Owner boundary is Plite
  contracts plus Core release metadata; unrelated shared WIP is excluded.

Implementation notes:
- Added the two intentional internal exports to the exact smoke contract.
- Changed the discarded-spec assertion to compare `getNodeKeyDOMValue` across
  editors.
- Merged `.changeset/fix-heading-family-renderer-types.md` into
  `.changeset/core-next-sync-runtime.md`.
- Updated the Plite React surface contract to the current string-valued DOM
  attribute shape.

Review fixes:
- P2 autoreview reported no accepted/actionable findings; no review fix was
  required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First strict Plite rerun failed in a previously masked Plite React contract | 1 | Inspect the current rendered-attribute owner before editing the assertion | Confirmed DOM attributes use unbranded `string`; updated the stale contract. |
| First Plite React focused command targeted the helper file, not the `.test.tsx` entrypoint | 1 | Run the importing test entrypoint | Correct command passed 54/54. |

Verification evidence:
- Focused three-file contract run: 774 passed, 0 failed.
- `pnpm --filter @platejs/plite test`: 1,438 passed, 0 failed.
- `pnpm --filter @platejs/plite typecheck`: exit 0.
- Plite React surface contract: 54 passed, 0 failed.
- `pnpm check:plite`: exit 0; family typechecks/tests, 135 proof contracts,
  builds/public types, and matching Chromium proof all passed.
- Chromium proof: 698 passed, 6 skipped.
- `pnpm brl`: exit 0, 56 tasks, zero introduced package drift.
- Scoped Biome over three changed test files: exit 0.
- Isolated `autoreview --mode local --max-priority P2`: clean, no
  accepted/actionable findings, correctness 0.98.
- `pnpm check`: exit 0, including lint, root typecheck, fast/slow tests, and
  slow-test budget checks.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue or tracker supplied.
- Confidence line: 100% for the current local CI matrix.
- Flow table:
  - Reproduced: four deterministic contract failures; browser was already green.
  - Verified: focused contracts, full package, strict Plite, barrels, P2 review,
    and root CI all pass.
- Browser check: matching complete Chromium proof, 698 passed / 6 skipped.
- Outcome: all locally reproducible CI gates are green.
- Caveat: GitHub event-only policy jobs still require their real server context;
  no local red gate remains.
- Design:
  - Chosen boundary: stale contracts and duplicate release metadata.
  - Why not quick patch: deleting intentional exports or changing runtime key
    allocation would have hidden the actual test error.
  - Why not broader change: production runtime already satisfied the intended
    scoped-key invariant.
- Verified: exact commands and results recorded above.
- PR body verified: N/A: no PR.

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
- PR: N/A: no PR.
- Issue / tracker: N/A: no tracker.
- Browser proof: strict Plite matching Chromium proof, 698 passed / 6 skipped.
- Caveats: only GitHub event-context checks remain external.

Timeline:
- 2026-08-15T08:42:25.002Z Task goal plan created.
- 2026-08-15 Original three failures repaired; focused and package proof passed.
- 2026-08-15 Masked Plite React contract repaired; strict Plite CI passed.
- 2026-08-15 P2 autoreview, barrels, scoped formatting, and root CI passed.
- 2026-08-15 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for final response. |
| Where am I going? | Final response. |
| What is the goal? | Make the current locally reproducible CI matrix green. |
| What have I learned? | Runtime keys were correct; stale contracts and duplicate release metadata caused the failures. |
| What have I done? | Repaired four contract failures, consolidated the changeset, and passed every local gate plus P2 review. |

Open risks:
- None in the local CI matrix. GitHub-only event policy still needs its normal
  workflow context, but it cannot overturn the now-green local gates.
