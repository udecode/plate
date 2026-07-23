# Fix EditorKit accessor publication

Objective:
Fix EditorKit descriptor accessor publication; done when exact repro, Core/WWW
checks, and `/docs/table` plus `/blocks/table-demo` browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-fix-editorkit-accessor-publication.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: parent-agent integration delegation
- id / link: `/root` task handoff, no public tracker
- title: Fix EditorKit accessor publication before Table initialization
- acceptance criteria: reproduce the failure; identify the exact descriptor or
  option accessor; fix its owning configuration boundary without weakening Core
  accessor rejection or restoring live object identity; add regression coverage;
  pass affected package/WWW checks and focused Browser proof for `/docs/table`
  and `/blocks/table-demo`; do not edit Table.

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
- initial confidence score: N/A: binary repro and proof gates are stronger
- improvement loop: fix the highest owning boundary exposed by each red repro
- final score / loop closure: N/A: exact checks and two browser routes close work

Completion threshold:
- One deterministic EditorKit construction regression goes red for the rejected
  accessor before the fix and green after it.
- The exact accessor owner is corrected without editing Table, weakening Core
  accessor rejection, or preserving live caller-owned identity.
- Relevant typechecks/tests/lint pass and both named routes render without the
  publication error, console errors, or failed app requests.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-fix-editorkit-accessor-publication.md` passes.

Verification surface:
- A focused EditorKit/editor-construction regression.
- Affected package and `apps/www` source-first typechecks/tests and scoped lint.
- Source audit proving no Table edits and no accessor-rejection weakening.
- Browser proof for `/docs/table` and `/blocks/table-demo`, including console and
  failed-network checks.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not edit Table source.
- Do not weaken Core descriptor accessor rejection.
- Do not reintroduce live object identity; computed values belong in contextual
  configuration/factories unless source proves a truly opaque resource.

Boundaries:
- Source of truth: EditorKit plugin graph plus Core descriptor publication and
  the two failing table routes.
- Allowed edit scope: the exact non-Table accessor owner, its focused tests,
  this execution ledger, and generated barrels only if exports change.
- Browser surface: `apps/www` routes `/docs/table` and `/blocks/table-demo`.
- Browser strategy: Browser for both ordinary app routes. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR authorized.
- Non-goals: Table implementation changes; Core policy weakening; compatibility
  bridges; broad plugin graph refactors; commits, pushes, or PRs.

Output budget strategy:
- Start with route/EditorKit filenames and accessor descriptor counts; exclude
  generated output and dependencies; cap reads to exact ranges and command
  output to 12k tokens. Use counts/file lists before any wider source print.

Blocked condition:
- Stop only if both local construction and Browser routes cannot reproduce and
  no exact error/log is available after three distinct evidence paths, or if the
  correct owner is actively locked by another writer and cannot be coordinated.

Task state:
- task_type: runtime bug fix
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: pending
- confidence: 0.45 before reproduction
- next owner: task
- reason: exact accessor owner is not identified yet

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-fix-editorkit-accessor-publication.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Delegation copied into acceptance criteria, constraints, boundaries, and proof rows |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal` for lifecycle and `diagnosing-bugs` for red-capable repro/fix loop |
| Active goal checked or created | yes | Goal `019f8bd7-b04e-7ad2-b860-992aa0e38563` created for this exact plan |
| Source of truth read before edits | yes | Read EditorKit composition, Core `snapshotPlatePluginSources`/publication, option snapshot owner, and accessor contract tests |
| Tracker comments and attachments read | no | N/A: parent-agent handoff contains the full task; no tracker |
| Video transcript evidence required | no | N/A: deterministic runtime error, no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped accessor/snapshot search found no directly applicable prior solution |
| TDD decision before behavior change or bug fix | yes | Build minimal EditorKit construction repro before applying fix |
| Branch decision for code-changing task | no | N/A: shared subagent checkout; no branch operation authorized |
| Release artifact decision | pending | Decide after exact owner/public impact is known |
| Browser tool decision for browser surface | yes | Use bundled Browser; no native Chrome behavior involved |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker supplied |
| Output budget strategy recorded | yes | Exact files/counts first; 12k output cap; generated/dependency trees excluded |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `apps/www`: `/docs/table`, `/blocks/table-demo` |
| Browser tool decision recorded | yes | Browser for normal route/DOM/console/network proof |
| Console/network caveat policy recorded | yes | Completion requires no route-related console errors or failed app requests |

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
- [ ] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | yes | Record failing test/repro | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | yes | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | yes | Capture Browser proof for both named app routes | pending |
| Browser final proof | yes | Record route, DOM, console, and failed-network evidence | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | no | N/A: no PR requested | no repository mutation outside source fix |
| Task-style PR body verified | no | N/A: no PR requested | no PR body |
| PR proof image hosting | no | N/A: no PR requested | local Browser proof only |
| Tracker sync-back | no | N/A: no tracker supplied | parent-agent handoff only |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | no | N/A: no duration requested | binary proof gates govern closure |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-fix-editorkit-accessor-publication.md` | pending |
| Browser interaction proof | yes | Exercise both named routes with Browser | pending |
| Browser console/network check | yes | Record console and failed-network state | pending |
| Browser final proof artifact | yes | Record route/DOM proof; screenshot only if it adds evidence beyond DOM | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- Core deliberately rejects accessors in both descriptor graphs and plain option
  graphs; existing contract tests lock both errors.
- Static getter scan found no Table or registry plugin-source getter. Candidate
  accessor is therefore likely nested data contributed by another EditorKit
  plugin or imported option object.
- Direct TSX/Bun imports are blocked before editor construction by unrelated
  ESM-only `remark-emoji` and CSS imports; a Bun loader-stub harness is the next
  deterministic repro path.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root `pnpm exec tsx` unavailable | 1 | Use apps/www-owned `tsx` binary | Runner found; import then hit ESM dependency boundary |
| apps/www TSX import stops at ESM-only `remark-emoji` | 1 | Use Bun with CSS loader stubs | pending |
| apps/www Bun import stops at Excalidraw CSS | 1 | Register Bun CSS resolver/loader before dynamic import | pending |

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
- 2026-07-22T23:51:37.481Z Task goal plan created.
- 2026-07-23 Source owners read; Core rejection confirmed intentional; static
  Table/registry getter scan clean; exact runtime path still being minimized.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Fix the non-Table EditorKit accessor owner and prove both Table routes |
| What have I learned? | Core policy is correct; offending accessor is outside Table and hidden in imported EditorKit data |
| What have I done? | Established source boundary and three progressively narrower repro attempts |

Open risks:
- Pending.
