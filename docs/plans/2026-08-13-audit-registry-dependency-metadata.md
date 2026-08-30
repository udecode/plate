# audit registry dependency metadata

Objective:
Audit every `apps/www/src/registry/registry-*.ts` dependency declaration; done when all items have source-backed package and registry dependency verdicts and every mismatch is reported.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-audit-registry-dependency-metadata.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current Codex task
- title: Audit all registry dependency metadata
- acceptance criteria: enumerate every `registry-*.ts` file and item; compare each
  item's direct runtime package imports with `dependencies` and copied-registry
  imports/style requirements with `registryDependencies`; report every missing,
  stale, duplicate, self, or unresolved declaration without editing source.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: 0.70
- improvement loop: inventory, parse metadata, map registered source closure,
  validate declarations, manually review exceptions and dynamic imports
- final score / loop closure: 0.99; all 246 live/internal items and all ten
  `registry-*.ts` owners were inventoried, with two independent closure passes

Completion threshold:
- 100% of files matching `apps/www/src/registry/registry-*.ts` and 100% of
  declared items are inventoried; automated and manual checks cover direct
  package dependencies, direct registry dependencies, missing targets,
  duplicates, self-dependencies, and suspicious stale declarations; every
  accepted finding names the owner and exact correction.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-audit-registry-dependency-metadata.md` passes.

Verification surface:
- Existing registry checker(s), a source-derived import/declaration comparison,
  exact `rg` audits for unresolved/duplicate/self declarations, and manual
  inspection of all mismatches and non-import style dependencies.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/www/src/registry/registry-*.ts`, registered source
  files, registry schema/types, and registry validation scripts.
- Allowed edit scope: read-only source audit; only this goal ledger may change.
- Browser surface: none.
- Browser strategy: N/A: metadata/source audit with no runtime mutation. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker.
- Non-goals: fixing findings, changing registry metadata/source, generated
  registry output, package dependency audits outside copied registry items,
  UI/runtime behavior, and classic-surface modernization.

Output budget strategy:
- Count and inventory first; write machine-readable audit output under `/tmp`
  when large; inspect only mismatch summaries and capped source slices. Exclude
  generated registry output, `.next`, `node_modules`, and templates.

Blocked condition:
- Block only if registry metadata cannot be parsed from source and no existing
  checker/schema exposes the declaration graph; otherwise fall back to a
  conservative source audit and label unresolved dynamic cases.

Task state:
- task_type: read-only registry dependency audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: not all good; published metadata has 8 missing npm package pairs,
  23 install-closure registry dependency pairs, one additional direct-ownership
  registry drift, and two published duplicate dependency rows
- confidence: 0.99
- next owner: plate-ui registry wiring audit
- reason: existing checks pass but validate target existence and selected
  topology rules, not complete source-import closure.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-audit-registry-dependency-metadata.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full registry wildcard scope, both dependency fields, read-only audit, and final mismatch report recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `plate-ui` owns registry wiring; `autogoal` owns exhaustive audit closure; generic shadcn lookup N/A |
| Active goal checked or created | yes | `get_goal` returned no active goal; create after this shell is filled |
| Source of truth read before edits | yes | Plate UI registry and ownership rules read; registry sources/checkers are the next bounded read |
| Tracker comments and attachments read | no | N/A: no tracker or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: read-only metadata audit with a direct current source of truth |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change or fix authorized |
| Branch decision for code-changing task | no | N/A: source remains read-only |
| Release artifact decision | no | N/A: audit report only; no package or registry change |
| Browser tool decision for browser surface | no | N/A: no rendered surface changes |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Count first, artifact large results under `/tmp`, print mismatches only |

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
      is recorded with reason. N/A: user requested an audit, so no source repair
      was authorized; findings name the exact metadata owners.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: audit verdict with counts, P0-P2 findings,
      exact files/items, false-positive exclusions, and recommended corrections;
      PR/tracker fields N/A.
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
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Two exploratory reports exceeded the desired output cap; both
      were replaced by compact fixed-point summaries before conclusions.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 10 metadata owners, 246 items, and 304 unique registered files inventoried; all mismatch classes recorded below |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: audit only |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no behavior change |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: source remains read-only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All scripts/checks ran in `/Users/zbeyens/git/plate-2/apps/www` or repo root against `apps/www/src/registry` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: read-only metadata audit |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no source change |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry source change |
| Docs or content changed | yes | Verify audit ledger source claims; no rendered docs proof needed | Goal ledger only; final checker required |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: read-only audit |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A |
| P2 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: read-only audit |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Audit verdict, counts, exact owners, proof, false-positive policy, and caveats completed below |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no source changed; `git diff --check` covers the audit ledger |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Two oversized exploratory reports are recorded in Error attempts; final evidence uses compact grouped output |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-audit-registry-dependency-metadata.md` | Final checker run after this evidence update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plate UI rules, registry aggregation, checker, tests, metadata owners, and install docs read | audit |
| Implementation | N/A | Read-only audit; no source changes authorized | verification |
| Verification | complete | fixed-point import closure, direct-declaration pass, topology checks, existing checker/tests | closeout |
| PR / tracker sync | N/A | no PR or tracker requested | final response |
| Closeout | complete | exact findings and residual risks recorded | final response |

Findings:
- Inventory: 246 items total, comprising 192 published and 54
  `meta.registry: false` items, with 304 unique registered files.
- Owner counts: `registry.ts` 2; blocks 4; components 7; examples 67; hooks 4;
  kits 71; lib 3; styles 2; UI 86. `registry-pro.ts` contains 13 docs-only
  metadata rows. `registry-icons.ts` contains 37 complete two-library mappings
  but has no consumer.
- Existing registry source checks and 11 focused registry tests pass, but they
  do not compare every registered file import with the full install closure.

Confirmed published npm package gaps:

| Item | Missing `dependencies` |
|------|------------------------|
| `code-drawing-node` | `lodash` |
| `equation-node` | `@platejs/selection` |
| `excalidraw-node` | `@excalidraw/excalidraw` |
| `ai-api` | `@ai-sdk/gateway`, `zod` |
| `use-chat` | `ai@6` |
| `huge-document-demo` | `slate`, `slate-react` |

Confirmed published registry install-closure gaps:

| Item | Missing `registryDependencies` |
|------|--------------------------------|
| `block-context-menu` | `@plate/transforms` |
| `block-draggable` | `button` |
| `emoji-toolbar-button` | `button` |
| `fixed-toolbar` | `@plate/history-toolbar-button` |
| `media-toolbar` | `@plate/caption` |
| `callout-node` | `button` |
| `column-node` | `button`, `popover`, `separator`, `tooltip` |
| `date-node` | `popover` |
| `equation-node` | `button` |
| `media-audio-node` | `@plate/resize-handle` |
| `media-file-node` | `@plate/resize-handle` |
| `toc-node` | `button` |
| `autoformat` | `@plate/autoformat-kit` |
| `ai-api` | `@plate/editor-base-kit`, `@plate/use-chat` |
| `plate-to-html` | `@plate/editor-kit`, `@plate/fixed-toolbar-kit`, `@plate/floating-toolbar-kit` |
| `multiple-editors-demo` | `@plate/align-kit` |
| `version-history-demo` | `@plate/basic-marks-kit` |

- Direct-ownership drift masked by transitivity: `comment-toolbar-button`
  imports `toolbar` but declares only `comment-kit`; the seven-item
  collaboration dependency cycle happens to pull `toolbar` in indirectly.
- Duplicate dependency rows: published `editor-basic` and
  `installation-next-demo` each declare `@platejs/basic-nodes` twice; internal
  `installation-next-03-elements-demo` does the same.
- Package ownership/removal candidates after the missing owners are repaired:
  `ai-menu` (`ai`, `@faker-js/faker`), `comment-toolbar-button`
  (`@platejs/comment`), `link-toolbar` (`@platejs/comment`,
  `@platejs/suggestion`), `code-block-node` (`lowlight`), `emoji-node`
  (`@emoji-mart/data`), media image/audio/embed/file/video nodes
  (`@platejs/resizable`, plus unused `@platejs/dnd` on embed), `table-node`
  (`@radix-ui/react-popover`), `excalidraw-kit`
  (`@excalidraw/excalidraw`), both autoformat kits' code-block/list packages,
  `docx-export-kit` (`@platejs/basic-nodes`), `ai-api` (`@ai-sdk/react`),
  `editor-basic` (`@platejs/basic-nodes`), `copilot-demo` (`@platejs/ai`,
  `@platejs/markdown`), `select-editor-demo` (`@platejs/tag`),
  `multiple-editors-demo` (`@platejs/basic-nodes`, `@platejs/media`), and
  `version-history-demo` (`@platejs/basic-nodes`).
- `tabbable-demo` declares `@platejs/tabbable` but neither imports nor installs
  `tabbable-kit`; this is semantic drift, not a safe metadata-only removal.
- Clear registry over-declarations: `block-context-menu -> calendar`,
  `font-color-toolbar-button -> separator`, `block-draggable -> use-mounted`,
  `select-editor -> command`, `link-toolbar -> input/popover`,
  `media-toolbar -> input`, `column-node -> resize-handle`,
  `suggestion-node -> suggestion`, `media-video-node -> media-toolbar`,
  `table-node -> resize-handle`, `media-base-kit -> caption`,
  `editor-base-kit -> editor`, `editor-kit -> basic-nodes-kit`,
  `editor-ai -> basic-nodes-kit`, `editor-basic -> basic-marks-kit`, and
  `installation-next-demo -> paragraph-node`.
- One published malformed catalog row exists outside the two dependency fields:
  `block-suggestion` declares `@platejs/suggestion` but ships no files or
  registry dependencies; its actual source file is owned by `block-discussion`.
- The published Plate registry graph has one strongly connected component:
  `block-discussion`, `comment-kit`, `comment-node`,
  `comment-toolbar-button`, `discussion-kit`, `suggestion-kit`, and
  `suggestion-node`. It is currently resolvable but makes transitive dependency
  correctness fragile.
- Internal-only drift: `single-block-demo` lacks `checkbox`, `label`, and
  `editor`; `list-demo` lacks `floating-toolbar-kit`;
  `exit-break-demo` imports an unbundled table value. Forty-one other unresolved
  imports are shared internal demo/config files and are filtered from the
  public registry.
- No duplicate item names, duplicate file rows, duplicate
  `registryDependencies`, self-dependencies, missing declared targets, or
  conflicting package version specifiers were found.

Decisions and tradeoffs:
- Audit direct runtime imports and copied-registry/style dependencies separately;
  package manifests do not substitute for per-item install metadata.
- Judge published correctness by fixed-point install closure, while separately
  reporting direct-owner drift. This preserves intentional kit, toolbar,
  optional-feature, style, and teaching dependencies instead of falsely calling
  every non-imported declaration dead.
- Treat documented Plate UI/shadcn bootstrap packages (`platejs`, React, Next,
  Lucide, and CVA) as prerequisites; do not inflate the missing-package count
  with them.

Implementation notes:
- N/A: audit only.

Review fixes:
- Corrected the early grep attribution: the duplicate is not in
  `block-selection-demo`; exact runtime item parsing identifies the three owners
  listed above.
- Replaced direct-only dependency comparison with fixed-point Plate + shadcn
  registry closure, then retained one separate direct-owner finding.
- Replaced hard-coded alias slice offsets with prefix-length resolution and
  required resolved paths to be files, eliminating false missing/unresolved rows.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `/dev/stdin` treated TypeScript syntax as JavaScript | 1 | Use plain JavaScript entry code while the tsx loader handles imported TS modules | Resolved |
| TypeScript 7 package did not expose the expected parser module | 1 | Use the installed Babel TypeScript parser | Resolved |
| Hard-coded alias prefix offsets dropped the first path character | 1 | Slice by `prefix.length` and rerun | Resolved; missing registry count corrected |
| Two exploratory reports exceeded the desired output cap | 2 | Print grouped counts and only final mismatch maps | Resolved; final fixed-point output was compact |
| Quick grep attributed a duplicate to the wrong item | 1 | Parse runtime item objects and locate exact source rows | Resolved |

Verification evidence:
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` at repo root -> passed.
- `bun test apps/www/src/registry/registry.test.ts apps/www/scripts/registry-dependencies.test.mts` at repo root -> 11/11 passed.
- Babel-parser import audit plus fixed-point Plate/shadcn dependency closure in
  `apps/www` -> 192 published items, 8 missing npm pairs, 23 missing registry
  pairs, zero unknown published imports.
- Independent direct-declaration pass -> one extra transitive-only direct-owner
  drift, three dependency duplicates, and the listed over-declarations.
- Tarjan SCC audit -> one seven-item published registry cycle.
- Runtime metadata inventory -> 246 items, 304 unique files, zero duplicate item
  names or per-item file rows.
- `registry-icons.ts`/`registry-pro.ts` audit -> 37 complete icon mappings, 13
  docs-only pro rows, and zero dependency-bearing pro rows.

Final handoff contract:
- PR line: N/A: read-only audit
- Issue / tracker line: N/A
- Confidence line: 99%
- Flow table:
  - Reproduced: source-to-install-closure mismatches enumerated; browser N/A
  - Verified: existing checks plus two source graph passes; browser N/A
- Browser check: N/A: no source or rendered behavior changed
- Outcome: registry dependency metadata is not fully correct; exact repair set is recorded
- Caveat: intentional composition/style/teaching dependencies were preserved as
  non-findings unless source and install closure proved them redundant
- Design:
  - Chosen boundary: registry source metadata and registered-file import closure
  - Why not quick patch: user requested audit, not mutation
  - Why not broader change: package manifests and UI runtime are outside this metadata verdict
- Verified: commands and source audits listed above
- PR body verified: N/A

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A: read-only audit
- Caveats: package removals must follow missing-owner additions so transitive install coverage is not accidentally reduced

Timeline:
- 2026-08-13T19:23:50.626Z Task goal plan created.
- 2026-08-13 Registry source checker and 11 focused tests passed.
- 2026-08-13 Fixed-point audit closed all 246 item rows and classified published
  versus internal-only dependency drift.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Exhaustively audit every registry metadata dependency owner |
| What have I learned? | Existing checks pass while complete install closure still has material gaps |
| What have I done? | Inventoried all owners/items/files, ran two graph passes, classified every mismatch, and preserved source read-only |

Open risks:
- Some over-declarations encode product composition rather than a source import;
  those were deliberately retained unless clearly stale. Actual repair should
  add/move missing owners first, then rerun a CLI install matrix before removal.
