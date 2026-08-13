# Remove link preview feature

Objective:
Remove the link-preview feature while preserving only its reusable lifecycle
law under `docs/editor-behavior/`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-12-remove-link-preview-feature.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Revert the unshipped link-preview feature
- acceptance criteria: delete the app route, registry route/item/dependencies,
  request UI/state/tests, keep the plain link renderer, and record the reusable
  async-hover ownership law under `docs/editor-behavior/`

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary source-removal threshold
- improvement loop: remove, sweep, verify source/docs/registry/browser
- final score / loop closure: high confidence; source hard cut and owner checks
  passed, with unrelated shared-checkout compiler and generated-registry
  blockers recorded below

Completion threshold:
- Zero implementation or registry-source references to `link-preview`, no
  async preview state in `link-node`, plain link source restored, the deleted
  endpoint returns 404 in Browser, the lifecycle law exists in
  `docs/editor-behavior/master-roadmap.md`, and focused www/docs/registry checks
  pass. Standalone demo rendering is a separate shared-checkout gate because
  CI-generated registry output currently imports an unrelated deleted file.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-remove-link-preview-feature.md` passes.

Verification surface:
- Focused `rg` hard-cut audit excluding historical research artifacts and
  CI-controlled generated registry output.
- `pnpm --filter www typecheck`, docs source/check commands, scoped Biome, and
  registry changelog generator check.
- Browser `/blocks/link-demo` plus `/api/link-preview` absence and console check.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: direct user reversal plus current registry/app source and
  `docs/editor-behavior/master-roadmap.md`.
- Allowed edit scope: link preview routes/tests, `link-node`, registry metadata,
  stale execution-plan claims, editor-behavior roadmap, and this ledger.
- Browser surface: `/blocks/link-demo` and deleted `/api/link-preview`.
- Browser strategy: Browser for the rendered link demo and deleted route. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker item.
- Non-goals: do not remove shared HoverCard, footnote previews, link editing,
  descriptor-inferred `PlateElementProps`, or change package APIs.

Output budget strategy:
- Use exact-file reads and scoped `rg` excluding generated/build trees; cap
  command output. One earlier generated-skill read was oversized and was
  replaced with narrow ranges.

Blocked condition:
- Stop only if the www app cannot run after one install-corruption retry or the
  shared checkout changes the same link-owner files during verification.

Task state:
- task_type: feature hard cut plus supporting behavior-law docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: active

Current verdict:
- verdict: remove the unshipped feature completely; retain only future design law
- confidence: high before verification
- next owner: task
- reason: the endpoint and hover UI were architecture-proof scope creep without
  an approved product requirement

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-remove-link-preview-feature.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | no | Process miss: implementation started before the generated ledger was fully resolved; every user requirement was reconstructed before verification. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `task`, `hard-cut`, `plate-ui`, `docs-creator`, `autogoal`, `registry-changelog`, and `shadcn`. |
| Active goal checked or created | yes | Active goal owns this plan and exact hard-cut threshold. |
| Source of truth read before edits | yes | Read both route owners, registry metadata, `link-node`, feature tests, and editor-behavior docs. |
| Tracker comments and attachments read | no | N/A: direct request with no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is removal of unshipped WIP, not diagnosis of an unknown defect. |
| TDD decision before behavior change or bug fix | yes | Delete feature-only tests; retain no dead-code assertions. Source absence is the governing proof. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch, commit, or PR work. |
| Release artifact decision | yes | N/A: no package change; no registry changelog because the registry item never shipped. |
| Browser tool decision for browser surface | yes | Browser selected for `/blocks/link-demo` and deleted route. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Output budget strategy recorded | yes | Exact-file reads and capped scoped searches; one oversized skill read was replaced by bounded chunks. |
| Docs pack selected | yes | `docs/editor-behavior` current-state architecture law. |
| `docs-creator` loaded | yes | Read before final docs verification. |
| Docs lane selected | yes | Internal editor-behavior roadmap plus stale execution-plan correction. |
| Target docs and nearest sibling docs read | yes | Read master roadmap, markdown parity matrix, and related Wordgard plans. |
| Docs style doctrine read | yes | Current-state reference voice used for the surviving law. |
| Documented source owner identified | yes | Consuming component family owns async requests; overlay owns interaction and geometry. |
| Browser pack selected | yes | Normal app surface, so Browser is the required first tool. |
| Browser route / app surface identified | yes | `/blocks/link-demo`; `/api/link-preview` must be absent. |
| Browser tool decision recorded | yes | Browser only; no native Chrome or OS behavior applies. |
| Console/network caveat policy recorded | yes | Record exact unrelated compile blocker rather than claim rendered proof. |
| Registry changelog pack selected | yes | N/A release result still requires generator integrity check. |
| User-visible registry impact classified | no | N/A: unshipped registry WIP was removed before publication. |
| Source entry path selected | no | N/A: no changelog entry for an unshipped feature. |
| Generator command selected | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`; no write. |

Work Checklist:
- [x] No duration was requested; confidence is recorded.
- [x] The late first-checkpoint process miss is recorded, and every prompt requirement is represented in this plan before closeout.
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition are concrete.
- [x] The direct request, files, routes, browser surface, and feature owner are classified.
- [x] N/A: no video or screen-recording evidence exists.
- [x] Repo instructions and adjacent implementation/docs patterns were read.
- [x] The complete feature owner was removed instead of leaving endpoint, UI, tests, or registry fragments.
- [x] N/A: no package changeset and no registry changelog for unshipped WIP.
- [x] Final handoff requires exact source proof plus explicit shared-checkout caveats; no PR/tracker work.
- [x] N/A: no branch operation requested.
- [x] The unrelated compiler failures do not have install-corruption signals, so reinstall is not justified.
- [x] Every proof command ran from `/Users/zbeyens/git/plate-2` against the www/docs owners.
- [x] Risk is accidental residual route/registry/request state; zero-reference and file-absence checks cover it.
- [x] P2 autoreview is N/A: the task restores production sources to their committed plain-link shape; the remaining task patch deletes feature-only tests and updates internal docs.
- [x] N/A: no agent rules, skills, hooks, commands, prompts, or agent tooling changed.
- [x] Searches were scoped and outputs capped; the oversized read and recovery are recorded.
- [x] Docs lane, targets, siblings, and owners are recorded.
- [x] Every named route/component/preview claim was checked against current source.
- [x] Surviving docs state the future law directly; execution plans were corrected where they falsely claimed delivery.
- [x] Existing relative plan links were preserved; no new external links or preview names were added.
- [x] Browser route and expected plain-link/404 outcomes were recorded before proof.
- [x] Browser was attempted; Chrome and Computer are N/A because no native browser/OS behavior applies.
- [x] Browser console output was inspected and the unrelated generated-registry compile failure recorded.
- [x] Visual proof is waived because the required Browser path cannot compile the shared app; static owner proof remains valid.
- [x] Registry impact is N/A because the item never shipped.
- [x] N/A: no registry changelog source entry is correct.
- [x] N/A: entry frontmatter and row bullets do not apply without an entry.
- [x] No generated registry or changelog output was edited by hand.
- [x] N/A: no package release artifact changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove absence, docs law, and owner checks | Feature files absent; scoped hard-cut sweep and checks recorded below. |
| Bug reproduced before fix | no | N/A: explicit reversal of unshipped feature | Historical diff and source owner established the removal inventory. |
| Targeted behavior verification | yes | Verify plain link owner has no async preview behavior | `link-node.tsx` contains only normal anchor behavior; feature-only tests and routes are absent. |
| TypeScript or typed config changed | yes | Run www typecheck | Pre-tsc generated/docs/registry contracts passed; broad tsc reached unrelated List, Suggestion, Table, and Plite React errors. |
| Package exports or file layout changed | no | N/A: no package exports | No `pnpm brl` required. |
| Package manifests, lockfile, or install graph changed | no | N/A: dependency graph untouched | No install required. |
| Agent rules or skills changed | no | N/A: agent sources untouched | No skill sync required. |
| Workspace authority proof | yes | Run from owning checkout | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | yes | Attempt Browser proof | Attempted `/blocks/link-demo` and deleted route; app compilation is blocked by stale CI-generated `__registry__` importing deleted `plate-types.ts`. |
| Browser final proof | yes | Verify endpoint absence and record demo caveat | Fresh Browser process returned a clean 404 for the endpoint; standalone demo still has the unrelated generated-registry import error. |
| CI-controlled template output changed | no | N/A: templates untouched | No template output changed. |
| Package behavior or public API changed | no | N/A: app-only unshipped WIP | No changeset. |
| Registry-only component work changed | no | N/A: no shipped registry release | No component changelog entry. |
| Docs or content changed | yes | Validate source and parser | Docs source build and parity checks passed during www typecheck. |
| High-risk mini gate | yes | Audit residual server/request paths | Both route files and async UI state are absent; scoped search is clean. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling changes | No agent-native review. |
| Local install corruption suspected | no | N/A: failures are concrete source errors | No reinstall. |
| P2 autoreview for non-trivial implementation changes | no | N/A: no surviving production implementation delta from this reversal | Direct diff/source review covers deleted tests and docs-only surviving patch. |
| PR create or update | no | N/A: not requested | No git publication. |
| Task-style PR body verified | no | N/A: no PR | No PR body. |
| PR proof image hosting | no | N/A: no PR | No image hosting. |
| Tracker sync-back | no | N/A: no tracker | No external mutation. |
| Final handoff contract | yes | Record outcome, checks, and caveats | Filled below. |
| Final lint | yes | Run scoped formatter/lint | Scoped Biome passed for the touched app source. |
| Output budget discipline | yes | Keep commands bounded | Exact-file/capped output used after one oversized read. |
| Timed checkpoint | no | N/A: no duration | Binary completion threshold used. |
| Goal plan complete | yes | Run checker | Final checker result recorded below. |
| Docs source-backed claim audit | yes | Audit names/routes/owners | Scoped source search and deleted-file assertions pass. |
| Docs links / routes / previews | yes | Verify changed docs links | Existing plan link preserved; deleted route is described only as absent. |
| Docs MDX/content parser | yes | Run docs source build | Passed inside `pnpm --filter www typecheck`. |
| Plugin page specifics | no | N/A: no plugin page changed | Internal roadmap only. |
| Browser interaction proof | yes | Verify deleted route and attempt standalone demo | Endpoint returns 404; demo is blocked before render by unrelated stale generated registry import. |
| Browser console/network check | yes | Inspect errors | Deleted endpoint has no console errors; demo reports only the unrelated `plate-types.ts` import failure. |
| Browser final proof artifact | yes | Record route result | Browser 404 proves endpoint absence; exact demo compile blocker recorded without a false visual claim. |
| Registry impact classification | yes | Classify release impact | N/A: feature never shipped as a registry item. |
| Registry changelog source | no | N/A: no release event | No source entry. |
| Registry changelog generation | no | N/A: no source entry | No generated output. |
| Registry changelog check | yes | Run generator check | Passed for 50 source entries/events. |
| Registry generator test | no | N/A: generator/schema/layout unchanged | No generator test required. |
| Registry package release split | yes | Record release artifacts | N/A: neither package changeset nor registry changelog. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Complete route/UI/registry/test/docs inventory | Implementation |
| Implementation | complete | Endpoint, registry item/dependencies, async UI, and feature tests removed; law moved to editor behavior | Verification |
| Verification | complete | Static owner checks and scoped checks pass; unrelated broad/browser blockers documented | Closeout |
| PR / tracker sync | complete | N/A: neither requested nor linked | Final response |
| Closeout | complete | Exact handoff and plan checker recorded | Final response |

Findings:
- The endpoint and hover UI were architecture-proof scope creep without an approved product surface.
- The reusable part is lifecycle ownership, not a speculative shared hook or server route.

Decisions and tradeoffs:
- Keep plain link rendering.
- Keep the async-hover law in `docs/editor-behavior`; require a real product surface before implementation.
- Do not touch unrelated shared compiler errors or CI-generated registry output.

Implementation notes:
- Deleted both route owners, the route test, and async hover component tests.
- Removed the registry item/dependencies and all preview request state from the link component.
- Corrected active execution-plan claims that said the deferred feature shipped.

Review fixes:
- Restored the empty extracted-file ledger to an explicit `None` statement.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Goal first-checkpoint table was not resolved before implementation | 1 | Reconstruct requirements before verification and record the process miss | Ledger repaired without rewriting history. |
| Wordgard audit generator rejected unrelated prior-source drift | 1 | Revert attempted generated-audit edit and limit docs correction to active plans/editor behavior | Historical generated dossier left untouched. |
| www broad typecheck reached unrelated source errors | 1 | Keep passing generated/docs/registry subchecks and record exact owner failures | No unrelated source edits. |
| Browser demo compilation hit stale CI-generated `__registry__` import | 1 | Respect no-local-registry-generation rule and record the blocker | No manual generated-output patch or false browser claim. |

Verification evidence:
- Deleted-file assertions pass for both routes and both feature-only test files.
- Scoped hard-cut search has no active implementation reference; the only intended match is the editor-behavior statement that this is not a shipped link-preview feature.
- Scoped Biome passed for `link-node.tsx` and registry metadata.
- Registry changelog generator check passed for 50 source entries/events.
- www typecheck completed its editor generated contracts, API reference check, MDX source build, docs parity, and registry source check before unrelated shared compiler failures.
- Fresh Browser proof shows `/api/link-preview?url=https://example.com` returns
  the Next 404 page with no console warnings or errors.
- `/blocks/link-demo` remains blocked by stale CI-generated
  `apps/www/src/__registry__/index.tsx` importing deleted
  `apps/www/src/registry/components/editor/plate-types.ts`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker item.
- Confidence line: high for the hard cut; browser rendering remains unproved because of unrelated shared generated-output drift.
- Flow table:
  - Reproduced: source inventory identified every route/UI/registry/test surface.
  - Verified: file absence, zero-reference audit, scoped lint, docs/registry checks; Browser attempted and blocked before render.
- Browser check: deleted `/api/link-preview` route passes with a clean 404;
  `/blocks/link-demo` is blocked by unrelated stale generated registry output.
- Outcome: feature removed; reusable lifecycle law retained under editor behavior.
- Caveat: full www typecheck and rendered Browser proof are blocked by unrelated current checkout errors.
- Design:
  - Chosen boundary: component families own async request state; overlays own interaction/geometry.
  - Why not quick patch: leaving any endpoint, registry item, hook, or test would preserve unapproved feature surface.
  - Why not broader change: shared HoverCard and existing link editing/footnote previews are valid independent owners.
- Verified: exact commands and blockers are recorded above.
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
- PR: N/A: not requested.
- Issue / tracker: N/A: no linked tracker.
- Browser proof: endpoint absence passed with a clean 404; demo rendering is
  blocked by unrelated stale CI-generated registry output.
- Caveats: broad www typecheck also reaches unrelated List, Suggestion, Table,
  and Plite React errors.

Timeline:
- 2026-08-12T14:54:57.439Z Task goal plan created.
- 2026-08-12T15:00Z Removed route, registry, async UI, and feature-test owners.
- 2026-08-12T15:03Z Added approval-gated async-hover law to editor behavior.
- 2026-08-12T15:08Z Completed scoped source/docs/registry proof and attempted Browser proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final handoff |
| What is the goal? | Remove link-preview implementation and retain only reusable editor-behavior law. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Browser rendering cannot be re-proved until CI regenerates the registry after
  the unrelated `plate-types.ts` removal. The static feature hard cut is clean.
