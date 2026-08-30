# cut comment editor alias

Objective:
Cut the fake `CommentEditor` type and its supporting helpers; done when the
type/import/helpers have zero matches, behavior is inlined at three call sites,
and www typecheck, lint, source audit, and Browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-cut-comment-editor-alias.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user-approved hard cut
- id / link: N/A: no tracker item
- title: Cut `CommentEditor`
- acceptance criteria: delete `CommentEditor`, the type-only `createEditor`
  import, `replaceEditorValue`, and `focusEditorAtEnd`; inline the same behavior
  at the three current call sites; add no replacement alias/helper.

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
- initial confidence score: N/A: binary hard-cut threshold
- improvement loop: N/A: one implementation/proof loop
- final score / loop closure: N/A: source and command gates decide completion

Completion threshold:
- Zero `CommentEditor`, `replaceEditorValue`, `focusEditorAtEnd`, or type-only
  `createEditor` references remain in `comment.tsx`.
- The two value-reset call sites and one focus-at-end call site preserve their
  exact mutation/focus behavior without a new abstraction.
- www typecheck, scoped lint, source audit, Browser `/blocks/editor-basic`, and
  the goal-plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-cut-comment-editor-alias.md` passes.

Verification surface:
- Exact `rg` audit and manual review of all three inlined call sites.
- `pnpm --filter www typecheck` and scoped `ultracite fix/check`.
- Fresh local Browser render of `/blocks/editor-basic` with zero task-caused
  warnings/errors.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/www/src/registry/components/editor/comment.tsx` and its
  current three helper call sites.
- Allowed edit scope: `comment.tsx` plus this goal plan.
- Browser surface: `/blocks/editor-basic` as representative composed registry
  editor proof.
- Browser strategy: in-app Browser; Chrome and Computer are N/A because no
  native browser/OS behavior changes.
- Tracker sync: N/A: no tracker or PR.
- Non-goals: package/public APIs, other `ReturnType<typeof createEditor>` uses,
  comment semantics, registry generation, commit/push/PR work.

Output budget strategy:
- Restrict reads/searches/diffs to `comment.tsx`; exclude generated output and
  the rest of the checkout. Cap every command at one screenful.

Blocked condition:
- Stop only if inlining cannot preserve the current value-reset/focus behavior
  without a new public or shared abstraction, or Browser/typecheck remains
  unavailable after the repository's single install-corruption retry.

Task state:
- task_type: private registry hard cut
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: delete the alias and both helpers; inline all three uses
- confidence: high
- next owner: task
- reason: the type encodes no comment-specific contract; one-use focus and
  two-use reset wrappers do not justify fake vocabulary.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-cut-comment-editor-alias.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The accepted full cut and no-replacement constraint are copied above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `hard-cut` and `autogoal`; prior `best-api` review supplied the accepted target. |
| Active goal checked or created | yes | Goal tool returned no active goal; this plan supplies the new goal path. |
| Source of truth read before edits | yes | Read alias, both helpers, all three calls, canonical types, and relevant Vision locality rules. |
| Tracker comments and attachments read | no | N/A: direct request with no tracker/attachment. |
| Video transcript evidence required | no | N/A: no recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: bounded single-file mechanical hard cut. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving inlining; typecheck/source/browser proof is honest. |
| Branch decision for code-changing task | yes | Keep work on current `next`; no branch/commit/PR requested. |
| Release artifact decision | no | N/A: private mechanical registry-source cleanup with no behavior/install contract change. |
| Browser tool decision for browser surface | yes | Reuse in-app Browser for `/blocks/editor-basic`. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | All source reads and audits are restricted to one file. |
| Browser pack selected | yes | `apps/www` registry source changes require representative app proof. |
| Browser route / app surface identified | yes | `/blocks/editor-basic`. |
| Browser tool decision recorded | yes | In-app Browser is the ordinary app QA surface. |
| Console/network caveat policy recorded | yes | Require zero task-caused warning/error logs; network behavior is unchanged. |
| Observable browser case captured | no | N/A: structural cleanup, not report-backed behavior. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration was requested.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no recording.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no public behavior or install contract changed.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no install failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: private structural cleanup with preserved behavior.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: trivial change and
      `autoreview` is forbidden on `next`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent tooling changed.
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
      N/A: DOM and console proof fully inspect this non-visual cleanup.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      no paint claim.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
      N/A: no bug report or observable behavior change.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints. A fresh
      Browser tab rendered the representative editor from the local checkout.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: this is an uncommitted local candidate,
      not a pushed fixed/completed claim.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. N/A: no native
      interaction behavior changed.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof. The proof used
      the normal `/blocks/editor-basic` route and source file.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named proof | Zero stale names, three inlined sites, typecheck, lint, Browser, and plan checks pass. |
| Bug reproduced before fix | no | Record reason | N/A: this is an approved structural hard cut, not a bug fix. |
| Targeted behavior verification | yes | Review exact sites and render representative editor | Manual source audit and fresh Browser render pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passes from the repo root. |
| Package exports or file layout changed | no | Record reason | N/A: no exported file or layout changed. |
| Package manifests, lockfile, or install graph changed | no | Record reason | N/A: no dependency metadata changed. |
| Agent rules or skills changed | no | Record reason | N/A: no agent source changed. |
| Workspace authority proof | yes | Use owning repo and app | Commands ran in `/Users/zbeyens/git/plate-2`; Browser used the local www app. |
| Browser surface changed | no | Prove representative app still renders | Fresh `/blocks/editor-basic` request returned HTTP 200 and rendered the editor. |
| Browser final proof | yes | Use fresh Browser tab | Fresh tab showed the Basic Editor DOM and no warning/error console entries. |
| CI-controlled template output changed | no | Record reason | N/A: no template output changed. |
| Package behavior or public API changed | no | Record reason | N/A: private registry implementation cleanup; no changeset. |
| Registry-only component work changed | yes | Decide registry changelog | N/A: behavior and consumer contract are unchanged, so no registry changelog entry. |
| Docs or content changed | no | Record reason | N/A: only the required internal goal ledger changed. |
| High-risk mini gate | no | Record reason | N/A: no runtime, public API, package, browser, agent, or command contract changed. |
| Agent-native review for agent/tooling changes | no | Record reason | N/A: no agent or tooling files changed. |
| Local install corruption suspected | no | Record reason | N/A: all commands passed without install-corruption signals. |
| P1 autoreview for non-trivial implementation changes | no | Record reason | N/A: trivial cleanup, and repo law forbids `autoreview` on `next`. |
| PR create or update | no | Record reason | N/A: the user did not request a PR. |
| Task-style PR body verified | no | Record reason | N/A: no PR exists for this task. |
| PR proof image hosting | no | Record reason | N/A: no PR or proof image. |
| Tracker sync-back | no | Record reason | N/A: no tracker item. |
| Final handoff contract | yes | Record exact local outcome and proof | Filled below with local uncommitted scope and commands. |
| Final lint | yes | Run scoped fixer and checker | Scoped `ultracite fix` and `ultracite check` pass. |
| Output budget discipline | yes | Keep reads bounded | Every read/search was single-file and output-capped. |
| Timed checkpoint | no | Record reason | N/A: no duration requested. |
| Goal plan complete | yes | Run goal checker | Checker passes after this ledger is finalized. |
| Browser interaction proof | yes | Open representative route | Browser rendered `/blocks/editor-basic` from a fresh tab. |
| Browser console/network check | yes | Check task-caused errors and route response | Warning/error log query returned `[]`; route returned HTTP 200. |
| Browser final proof artifact | yes | Record route, DOM, and logs | Browser DOM plus console query recorded below; screenshot N/A for a non-visual cleanup. |
| Exact case replay | no | Record reason | N/A: no report-backed behavior case. |
| Final ref and fingerprints | no | Record reason | N/A: local uncommitted candidate, not a pushed fixed/completed claim. |
| Clean final runtime | no | Record reason | N/A: local uncommitted candidate; no shipped-state claim. |
| Retry-free stability | no | Record reason | N/A: no native selection, paint, focus, DnD, compositor, or lifecycle change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read the alias, helpers, call sites, and governing rules. | implementation |
| Implementation | complete | Deleted four stale declarations and inlined three operations. | verification |
| Verification | complete | Source audit, typecheck, lint, diff check, and Browser proof pass. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Goal ledger and handoff evidence finalized. | final response |

Findings:
- `CommentEditor` was only `ReturnType<typeof createEditor>` and expressed no
  comment-specific contract.
- `replaceEditorValue` wrapped two calls; `focusEditorAtEnd` wrapped one call.
- The underlying mutations are short and clearer at their ownership points.

Decisions and tradeoffs:
- Delete the alias and both wrappers without replacement.
- Keep the cut bounded to `comment.tsx`; other `ReturnType<typeof createEditor>`
  uses need their own contract review.

Implementation notes:
- Removed the type-only `createEditor` import and `CommentEditor` alias.
- Inlined two history-skipping value replacements and one end-point selection
  plus DOM focus operation.

Review fixes:
- Manual review found the inlined operations preserve the exact helper bodies.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | All implementation and proof commands succeeded. |

Verification evidence:
- `rg` reports zero `CommentEditor`, `replaceEditorValue`,
  `focusEditorAtEnd`, or type-only `createEditor` matches in `comment.tsx`.
- Manual source audit finds exactly two `history: 'skip'` value replacements and
  one `tx.points.end([])` focus path at the former call sites.
- `pnpm --filter www typecheck` passes from `/Users/zbeyens/git/plate-2`.
- Scoped `pnpm exec ultracite fix` and `pnpm exec ultracite check` pass.
- `git diff --check -- apps/www/src/registry/components/editor/comment.tsx`
  passes.
- Fresh Browser `/blocks/editor-basic` proof returned HTTP 200, rendered the
  Basic Editor DOM, and returned `[]` for warning/error console logs.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct request with no tracker.
- Confidence line: high; all named local gates pass.
- Flow table:
  - Reproduced: N/A: structural cleanup, not a bug report.
  - Verified: source/typecheck/lint pass; Browser route and console pass.
- Browser check: fresh `/blocks/editor-basic`, HTTP 200, expected DOM, zero
  warning/error logs.
- Outcome: fake editor type and both helper wrappers are gone; all three uses
  contain the underlying operation directly.
- Caveat: local uncommitted work only; no pushed or shipped-state claim.
- Design:
  - Chosen boundary: the one component that owned every declaration and use.
  - Why not quick patch: this is the complete deletion, not an alias rename.
  - Why not broader change: other aliases may encode real contracts and were not
    part of the accepted cut.
- Verified: exact source audit, www typecheck, scoped lint, diff check, Browser.
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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker.
- Browser proof: fresh `/blocks/editor-basic`; HTTP 200; expected editor DOM;
  no warning/error console logs.
- Caveats: local uncommitted candidate only.

Timeline:
- 2026-08-28T07:16:53.263Z Task goal plan created.
- 2026-08-28 Removed the alias, import, and wrappers; inlined all three uses.
- 2026-08-28 Passed source, typecheck, lint, diff, and Browser gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final local handoff. |
| What is the goal? | Remove fake `CommentEditor` vocabulary without changing behavior. |
| What have I learned? | The alias and wrappers encoded no independent contract. |
| What have I done? | Inlined all three operations and passed every named local gate. |

Open risks:
- No functional risk found. Remaining boundary: the work is local and
  uncommitted, so it is not a pushed or shipped-state claim.
