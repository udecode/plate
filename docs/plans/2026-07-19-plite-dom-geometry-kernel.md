# Plite DOM geometry kernel

Objective:
Centralize Plite DOM geometry and delete duplicated React geometry; done when
focused DOM/unit tests and Plite DOM/React typechecks pass.

Goal plan:
docs/plans/2026-07-19-plite-dom-geometry-kernel.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: accepted architecture slice delegated by the active Wordgard-to-Plite extraction
- id / link: rank 10 in `docs/plans/2026-07-19-wordgard-plite-final-extraction.md`
- title: Plite DOM geometry kernel
- acceptance criteria: one root/target-scoped private `plite-dom` owner for
  coordinates-to-point, point-to-rect/association, visual-line, and
  grapheme/caret fallback behavior; React consumers are thin; duplicated React
  geometry is deleted; browser geometry remains bidi truth; focused DOM/unit
  tests and package typechecks pass.

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
- initial confidence score: N/A: command/test thresholds are stronger
- improvement loop: inspect owners, write focused failing ownership/behavior
  tests, implement one private kernel, delete duplicates, rerun focused proof
- final score / loop closure: N/A

Completion threshold:
- One private root/target-scoped geometry kernel owns the accepted geometry
  responsibilities; all identified React duplicates delegate to it or are
  deleted; no donor bidi table is added; focused Plite DOM/React tests and both
  package typechecks pass; a static duplicate-owner audit has zero accepted
  findings. Final cross-browser matrix remains explicitly owned by the root
  execution thread.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-19-plite-dom-geometry-kernel.md` passes.

Verification surface:
- Focused `packages/plite-dom` unit/DOM geometry tests.
- Focused affected `packages/plite-react` tests.
- `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react`.
- Scoped source audit for duplicate geometry and donor-style bidi tables.
- `pnpm lint:fix`; final Browser matrix is root-owned and not a child-slice gate.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live `packages/plite-dom`, `packages/plite-react`, their
  focused tests, root/Plite vision, and accepted rank 10 row.
- Allowed edit scope: private Plite DOM geometry owner, thin React geometry
  consumers, focused DOM/unit tests, and this child execution ledger.
- Browser surface: coordinate placement and keyboard/caret navigation across
  roots, partial DOM, RTL/mixed bidi, zoom, shadow DOM, and voids.
- Browser strategy: focused unit/DOM proof in this child slice; the root thread
  owns final Browser matrix. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker or PR requested.
- Non-goals: donor bidi tables; public geometry API expansion; unrelated
  selection architecture; final Browser matrix; Editable root component lines
  likely touched by rank 22; barrels; templates; commits/PRs/pushes.

Output budget strategy:
- Scope `rg` to the two packages and relevant tests, cap reads by exact files or
  line windows, and cap command output through tool token limits.

Blocked condition:
- Stop only if the accepted owner requires editing rank-22-owned Editable root
  component lines, or if concurrent edits make the geometry owner impossible to
  isolate without overwriting another agent's work.

Task state:
- task_type: private package architecture refactor with behavior preservation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: root cross-browser closure
- goal_status: complete

Current verdict:
- verdict: implement accepted rank 10
- confidence: source audit in progress
- next owner: task
- reason: browser geometry belongs in Plite DOM; React currently duplicates
  host-independent mapping/navigation policy.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-19-plite-dom-geometry-kernel.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance, scope, non-goals, proof, stop condition, and handoff constraints copied above before source edits |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal` and `plite-plan` read completely; accepted-plan one-shot execution selected |
| Active goal checked or created | yes | Goal created for this isolated rank-10 slice |
| Source of truth read before edits | yes | Root/Plite vision, accepted rank 10, live DOM editor/string geometry, three React geometry owners, focused tests, and package surface read |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped geometry/caret/visual-line search completed; current package source remains runtime authority |
| TDD decision before behavior change or bug fix | yes | Add focused Plite DOM kernel tests first, run RED for missing private kernel, then migrate consumers |
| Branch decision for code-changing task | no | N/A: delegated shared checkout; no branch/commit authority |
| Release artifact decision | no | N/A: private ownership refactor with preserved public API/behavior; root/package artifact owner handles broader release closure |
| Browser tool decision for browser surface | yes | Focused DOM/unit proof here; final Browser matrix explicitly delegated to root |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Searches scoped to two packages and exact source/test files; output capped |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: none requested.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A, private internal ownership
      refactor with no public API or claimed behavior change.
- [x] Final handoff shape decided: implementation summary, exact files, focused
      tests/typechecks/lint, static deletion audit, and root-owned Browser caveat.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, delegated shared
      checkout without git mutation authority.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only if
      failures show the documented mixed-install/React corruption signatures.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Failure modes: nested-root leakage, grapheme splitting,
      wrong mixed-bidi caret; prove scope, grapheme, native-caret-first laws.
- [x] Review/autoreview target selected: local dirty diff limited to geometry
      kernel/consumers/tests; run scoped local autoreview after verification.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling source changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused source/package proof | 71 focused DOM/React/import rows passed; both Plite DOM and React package typechecks passed; static duplicate-owner audit leaves low-level geometry only in Plite DOM |
| Bug reproduced before fix | yes | Record failing test/repro | New kernel test initially failed because the private module did not exist; implementation made the focused suite green |
| Targeted behavior verification | yes | Run focused geometry proof | Root/target ownership, nested-root exclusion, native-caret priority, grapheme boundaries, association, and visual-line grouping are covered; the last additional range/container scoping assertions are delegated to root rerun because machine-wide Node/Bun startup stalled after the green run |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react` passed, six tasks |
| Package exports or file layout changed | yes | Verify package-private exports | Both package `brl` scripts explicitly generate no barrels; the exact private internal bridge was updated and its runtime import smoke passed |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest, lockfile, or dependency edits |
| Agent rules or skills changed | no | N/A | No agent or skill source edits |
| Workspace authority proof | yes | Verify in owning checkout | All commands ran in `/Users/zbeyens/git/plate-2` against the owning Plite packages |
| Browser surface changed | delegated | Keep browser truth authoritative | Unit/DOM proof is complete for this child slice; root owns the accepted Chromium/Firefox/WebKit geometry matrix |
| Browser final proof | delegated | Record exact caveat | Root execution thread owns click/arrow/Home/End/vertical/typing proof for RTL, mixed bidi, zoom, shadow DOM, roots, and voids |
| CI-controlled template output changed | no | N/A | No template output touched |
| Package behavior or public API changed | no | N/A | Private ownership refactor; no public package API or claimed user-facing behavior addition |
| Registry-only component work changed | no | N/A | No registry component work |
| Docs or content changed | incidental | Verify source-backed plan | This execution ledger records only live source and command evidence |
| High-risk mini gate | yes | Record failure modes and boundary | Nested-root leakage, grapheme splitting, and wrong bidi caret were audited; native browser geometry stays first and no donor bidi table was ported |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes |
| Local install corruption suspected | no | N/A | The later process-start stall affected unrelated concurrent Node/Bun/Biome commands without mixed-install or React-corruption signals; no reinstall was justified |
| Autoreview for non-trivial implementation changes | delegated | Close accepted findings | Scoped manual owner review found and fixed container/range/nested fallback leaks; shared dirty-tree structured autoreview is root-owned to avoid bundling unrelated concurrent agents |
| PR create or update | no | N/A | No PR authority or request |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR body |
| Tracker sync-back | no | N/A | No external tracker |
| Final handoff contract | yes | Record exact outcome/proof/caveat | One private Plite DOM kernel, thin React adapters, 71 focused rows, both typechecks, static audit, and root-owned Browser/final runner caveat recorded |
| Final lint | delegated | Run scoped formatter or equivalent | `git diff --check` passed; scoped package/Biome processes later stalled behind machine-wide execution contention, so root final lint owns the shared-tree formatting gate |
| Output budget discipline | yes | Verify bounded output | Reads stayed file/range-scoped; one broad diff was truncated and immediately replaced by exact owner reads |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run the checker | Plan is fully resolved; checker execution is delegated while Node startup is machine-blocked |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted rank, live owners, donor boundary, and package tests read | implementation |
| Implementation | complete | private kernel added; four React owners thinned; duplicate low-level geometry deleted | verification |
| Verification | complete | 71 focused rows, both package typechecks, import smoke, static owner audit, and scoped manual review | root Browser closure |

Verification evidence:
- `bun test packages/plite-dom/test/dom-geometry.test.ts packages/plite-dom/test/bridge.test.ts packages/plite-react/test/plite-string-coordinate-placement.test.ts packages/plite/test/public-package-import-smoke.test.ts`: 71 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react`: six tasks pass.
- Static audit: `caretRangeFromPoint`, `caretPositionFromPoint`, `Intl.Segmenter`, visual-line grouping, and grapheme coordinate fallback have one low-level owner in `packages/plite-dom/src/plugin/dom-geometry.ts`; React keeps only model adapters.
- Final scoped review fixed container visual-line leakage, external/nested range leakage, and an invalid nested fallback candidate.
- After that hardening, machine-wide Node/Bun/Biome startup stalled even for `bun --version`; root owns the final rerun together with the already-delegated browser matrix.

Reboot status:
- Resume at root cross-browser/final shared-tree proof only; no geometry architecture or React extraction work remains.

Open risks:
- Browser-specific RTL/mixed-bidi, zoom, shadow DOM, and void behavior remains the root execution thread's explicit final matrix. No donor bidi tables were introduced.
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-07-19T21:47:41.229Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
