# audit oxlint next-line suppressions

Objective:
Audit every `oxlint-disable-next-line`; done when each occurrence is counted,
listed, and classified as keep local, pattern override, global override, or
fix/remove, with test suppressions reviewed explicitly.

Goal plan:
docs/plans/2026-08-20-audit-oxlint-next-line-suppressions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- none

Task source:

- type: direct user request
- id / link: current Codex task
- title: audit all Oxlint next-line suppressions
- acceptance criteria: scan the entire owned source tree; list every
  `oxlint-disable-next-line`; recommend whether each remains source-local,
  moves to a stable per-file/pattern override, moves global, or should be
  fixed/removed; explicitly scrutinize test suppressions.

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- Every owned-source occurrence is reconciled by two independent searches.
- Every directive has file, line, rule, target construct, and one concrete
  disposition: keep local, move to a narrow override, move global, or
  fix/remove.
- Test directives receive an explicit owner-pattern review; repetition alone
  is not accepted as a reason to disable a rule.
- No occurrence remains unreviewed, and any excluded tree is named.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-audit-oxlint-next-line-suppressions.md` passes.

Verification surface:

- Two independently implemented repository searches with matching directive
  and file counts.
- A parser-produced inventory checked against source context and the active
  `oxlint.config.ts` rule/override ownership.
- Count reconciliation by rule, source/test owner, and recommendation.
- No runtime tests, typecheck, or browser proof: this is a read-only policy
  audit and does not change executable behavior or Oxlint configuration.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not edit source or Oxlint configuration in this audit.
- Never recommend disabling a rule because of diagnostic volume.
- Prefer a direct code fix, then an exact local exception, then a stable owner
  pattern; recommend a global override only for a proven repository-wide rule
  defect or valid doctrine.

Boundaries:

- Source of truth: current repository source, `oxlint.config.ts`, and the
  migrate-to-ultracite rule policy/playbook.
- Allowed edit scope: this goal plan only; all product/tooling/config source is
  read-only.
- Scan scope: all repository-owned text source, including hidden source trees;
  exclude `.git`, dependencies, caches, build output, coverage, and prior audit
  artifacts. Identify generated/CI-owned source separately if encountered.
- Browser surface: N/A: no browser behavior or app files change.
- Browser strategy: N/A.
- Tracker sync: N/A: no external tracker or PR requested.
- Non-goals: applying recommendations, changing rule severity, running bulk
  fix, or claiming that a repeated suppression is automatically config-worthy.

Output budget strategy:

- Count before printing. Parse the bounded match set into compact TSV/JSON in
  `/tmp`, inspect grouped summaries plus targeted source windows, and avoid
  streaming unrelated source or full lint output.

Blocked condition:

- Block only if repository files cannot be read or independent inventory
  methods disagree after excluding the same non-source trees.

Task state:

- task_type: read-only tooling policy audit
- task_complexity: moderate
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: complete audit; tune one global rule option, add one JavaScript
  pattern exception and three exact-file owners, keep the other directives
  source-local, and add no global rule disable
- confidence: 99%
- next owner: user for implementation authorization
- reason: two independent scans reconcile at 92 directives in 65 files and
  every occurrence has a source-backed disposition

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-audit-oxlint-next-line-suppressions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria, boundaries, and completion threshold above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | task, autogoal, and migrate-to-ultracite instructions read |
| Active goal checked or created | yes | no active goal found; creation follows this checkpoint |
| Source of truth read before edits | yes | Ultracite playbook and full compact rule policy read; repository scan remains read-only |
| Tracker comments and attachments read | no | N/A: direct request only |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no implementation or behavior diagnosis |
| TDD decision before behavior change or bug fix | no | N/A: read-only audit |
| Branch decision for code-changing task | no | N/A: no code/config change |
| Release artifact decision | no | N/A: no package or registry behavior change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: user did not request PR work |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | compact counted inventory in `/tmp`; targeted context reads |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      Repository instructions plus the full Ultracite policy are the owners.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. N/A: no implementation; recommendations follow
      exact semantic owners instead of diagnostic volume.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no package/registry behavior change.
- [x] Final handoff shape decided: a count-reconciled audit report with every
      location grouped by disposition; PR/tracker fields are N/A.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: read-only audit.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no package/runtime command failed and no install signal appeared.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: no executable or policy change.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: no implementation.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: audit does not change those owners.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Match output was bounded to 92 directives; source reads were
      next-line windows or targeted regions.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Reconcile two searches and source-context classifications | `rg`: 65 files / 92 directives; independent `find` + `grep`: 65 / 92; 95 rule suppressions across 22 rules |
| Bug reproduced before fix | no | N/A: not a bug-fix task | N/A |
| Targeted behavior verification | no | N/A: no behavior change | N/A |
| TypeScript or typed config changed | no | N/A: read-only | N/A |
| Package exports or file layout changed | no | N/A: read-only | N/A |
| Package manifests, lockfile, or install graph changed | no | N/A: read-only | N/A |
| Agent rules or skills changed | no | N/A: read-only | N/A |
| Workspace authority proof | yes | Run source audit from `/Users/zbeyens/git/plate-2` | all inventory/config/schema commands ran from the repository root |
| Browser surface changed | no | N/A: read-only audit | N/A |
| Browser final proof | no | N/A: no browser surface | N/A |
| CI-controlled template output changed | no | N/A: no template edits | N/A |
| Package behavior or public API changed | no | N/A: no behavior/API change | N/A |
| Registry-only component work changed | no | N/A: no registry change | N/A |
| Docs or content changed | no | N/A: plan is workflow state, not product docs | N/A |
| High-risk mini gate | no | N/A: no implementation | N/A |
| Agent-native review for agent/tooling changes | no | N/A: no owner changes | N/A |
| Local install corruption suspected | no | N/A: no repo command failure | N/A |
| P1 autoreview for non-trivial implementation changes | no | N/A: read-only audit | N/A |
| PR create or update | no | N/A: not requested | N/A |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR/browser proof | N/A |
| Tracker sync-back | no | N/A: no tracker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | completed below |
| Final lint | no | N/A: lint/fix would mutate source and is outside this audit | N/A |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | all searches were counted/capped; one broad policy read truncated and was replaced by complete compact `jq` reads |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-audit-oxlint-next-line-suppressions.md` | all required fields closed; final checker rerun is the closeout command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | prompt contract and Ultracite policy captured | audit |
| Audit | completed | 92 directives reviewed against their target construct and active config | verification |
| Verification | completed | independent scans agree; disposition counts sum to 92 | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | final report prepared | final response |

Findings:

- Raw text scan: 93 matches. One is prose in
  `docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md:701`, leaving
  92 active next-line directives in 65 files.
- Rule-level total: 95 suppressions across 22 rules because three directives
  each name two rules.
- Standard test globs own 21 directives in 10 files. Two more directives are
  test-runner/support code outside those globs.
- Disposition reconciliation:
  - 21: remove after configuring `prefer-const` with
    `ignoreReadBeforeAssign: true`; the rule remains enabled globally.
  - 2: move `typescript/use-unknown-in-catch-callback-variable` into the
    existing unchecked-JavaScript extension override; JavaScript cannot express
    the TypeScript annotation demanded by the rule.
  - 9: replace with three exact-file overrides: four module-mocking directives
    in the keyboard contract, three two-rule dynamic-evaluation directives in
    the benchmark-source contract, and two console directives in DebugPlugin.
  - 60: keep source-local because the exception belongs to one exact API use,
    role, allocation, compatibility boundary, host error, mock property, or
    plugin false positive.
  - 0: move to a global rule-off.
- Full directive inventory by disposition:
  - Global option, `prefer-const` (21):
    `packages/plite/src/editor-runtime-view.ts:343`,
    `packages/plite/src/create-editor.ts:440`,
    `packages/plite/src/core/snapshot-index.ts:1410`,
    `packages/plite/src/core/editor-lifecycle-api.ts:367`,
    `packages/plite/src/core/public-state.ts:2873,3899`,
    `packages/plite/src/core/extension-registry.ts:202,231`,
    `packages/plite/src/core/schema-compiler.ts:592,621`,
    `packages/plite/src/core/change/document-change.ts:198,239`,
    `packages/plite/src/core/schema-contribution-registry.ts:75`,
    `packages/plite-react/src/editable/dom-repair-queue.ts:148`,
    `packages/plite-react/src/editable/runtime-selection-engine.ts:163`,
    `packages/plite/test/extension-configuration.test.ts:159`,
    `packages/plite/test/command-spec.test.ts:663,665,1018`,
    `packages/core/src/internal/plugin/resolvePlugins.ts:954`, and
    `packages/core/src/internal/plugin/plateModelPublication.spec.ts:163`.
  - JavaScript pattern override (2):
    `tooling/scripts/check-plite-release-artifacts.mjs:1170` and
    `tooling/scripts/bench-targets.mjs:842`.
  - Exact-file overrides (9):
    `packages/plite-react/test/keyboard-input-strategy-contract.test.ts:2415,2489,2587,2597`
    (`anti-slop/no-module-mocking`),
    `packages/plite/test/core-benchmark-scripts-contract.ts:230,249,348`
    (`no-new-func` plus `typescript/no-implied-eval`), and
    `packages/core/src/lib/plugins/debug/DebugPlugin.ts:41,44`
    (`no-console`).
  - Keep local, `jsx-a11y/prefer-tag-over-role` (21):
    `apps/www/src/registry/components/editor/settings-dialog.tsx:384`,
    `apps/www/src/registry/components/editor/code-block.tsx:231`,
    `apps/www/src/registry/components/editor/font-color-toolbar-button.tsx:408,486,565,624`,
    `apps/www/src/registry/components/editor/toolbar.tsx:163,265`,
    `apps/www/src/registry/components/editor/table-toolbar-button.tsx:303,334`,
    `apps/www/src/registry/bases/base/editor/toolbar.tsx:150,252`,
    `apps/www/src/registry/bases/aria/editor/toolbar.tsx:156,258`,
    `apps/www/src/registry/components/editor/dnd.tsx:504`,
    `apps/www/src/components/ui/input-group.tsx:20,65`,
    `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx:482`,
    `packages/plite-react/src/dom-strategy/segment-placeholder.tsx:298`,
    `packages/plite-react/src/components/editable.tsx:665`, and
    `packages/resizable/src/Resizable.tsx:252`.
  - Keep local, `typescript/no-deprecated` (12):
    `apps/www/src/components/copy-button.tsx:51`,
    `packages/markdown/src/lib/mdast.ts:6`,
    `packages/plite-dom/src/plugin/dom-geometry.ts:795,797`,
    `packages/core/src/react/__tests__/createPlateTestEditor.ts:111`,
    `packages/core/src/react/components/PlateContent.tsx:226`,
    `packages/plite-react/src/editable/selection-controller.ts:964`,
    `packages/floating/src/floating-ui.ts:72`,
    `packages/table/src/react/TablePlugin.tsx:327`,
    `packages/code-drawing/src/lib/download.spec.ts:5`,
    `packages/browser/src/playwright/ime.ts:31`, and
    `packages/udecode/cmdk/src/cmdk.tsx:734`.
  - Keep local, `unicorn/no-new-array` (6):
    `packages/yjs/src/core/controller.ts:90`,
    `packages/yjs/src/core/canonical-split.ts:197`,
    `packages/plite/src/core/value-codec.ts:224`,
    `packages/plite-dom/src/utils/range-list.ts:142`,
    `packages/table/src/lib/internal/codec.ts:116`, and
    `packages/browser/test/core/scenario.test.ts:742`.
  - Keep local, `typescript/no-misused-promises` (3):
    `packages/yjs/test/provider-contract.spec.ts:91,107` and
    `packages/plite/test/update-policy-contract.ts:292`.
  - Keep local, `typescript/only-throw-error` (3):
    `apps/plite/scripts/plite-browser-runner.mjs:296`,
    `packages/yjs/src/core/extension.ts:83`, and
    `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:332`.
  - Keep local, `typescript/no-unsafe-assignment` (2):
    `oxlint.config.ts:46` and
    `apps/www/src/app/(app)/docs/examples/server-side/page.tsx:62`.
  - Keep local, `typescript/prefer-promise-reject-errors` (2):
    `packages/cli/src/watch.ts:345,352`.
  - Keep local, `unicorn/no-document-cookie` (2):
    `apps/www/src/components/context/theme-provider.tsx:49` and
    `apps/www/src/components/ui/sidebar.tsx:96`.
  - Keep local, one each:
    `packages/core/src/react/__tests__/createPlateTestEditor.ts:96`
    (`no-console`),
    `packages/code-drawing/src/lib/download.spec.ts:25`
    (`accessor-pairs`),
    `packages/plite/src/editor/before.ts:103`
    (`array-callback-return`),
    `packages/media/src/react/media/insertMediaUrl.ts:58` (`no-alert`),
    `packages/plite-hyperscript/src/hyperscript.ts:84`
    (`prefer-object-spread`),
    `apps/www/src/registry/components/editor/dnd.tsx:292`
    (`react-doctor/no-pass-live-state-to-parent`),
    `packages/browser/test/core/scenario.test.ts:435`
    (`unicorn/no-array-fill-with-reference-type`),
    `packages/code-drawing/src/lib/download.ts:10`
    (`unicorn/prefer-add-event-listener`), and
    `packages/core/src/react/utils/pluginRenderElement.tsx:92`
    (`unicorn/prefer-regexp-test`).

Decisions and tradeoffs:

- Do not add any rule to the broad test override. Tests are not exempt from
  promise, deprecation, console, accessor, allocation, or unsafe-eval rules.
- Exact-file overrides are justified only when the whole file owns the valid
  pattern. A per-line exception remains better when another occurrence in the
  same file should still be reviewed.
- Registry accessibility directives stay beside the exact role. Registry code
  is copied downstream; root config does not travel with it, and file-wide
  suppression would hide new role mistakes.
- `typescript/no-deprecated` stays local rather than becoming a large allow
  list. The compatibility reason belongs to each API use and future deprecated
  calls should still fail.
- No diagnostic count was used as a disable reason.

Implementation notes:

- Read-only audit. No product, tooling, or Oxlint config source was changed.
- If authorized, the config cleanup should add the `prefer-const` option, add
  the JavaScript rule to the existing unchecked-JS override, and add three
  exact-file overrides. The benchmark contract also contains one same-owner
  `oxlint-disable-line` at line 770 that the exact-file override would remove,
  though it is outside this next-line inventory.

Review fixes:

- N/A: no implementation diff; source contexts and policy decisions were
  reviewed directly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| One unpruned recursive `grep` produced no result | 1 | prune dependency/cache/output directories explicitly | `find` + pruned `grep` completed and independently matched 65 files / 92 directives |

Verification evidence:

- `rg` actual-directive scan: 65 files, 92 directives.
- Independent pruned `find` + `grep`: 65 files, 92 directives.
- Rule parser: 95 suppressions, 22 unique rules.
- Disposition parser: 21 global-option + 2 JavaScript-pattern + 9 exact-file +
  60 keep-local = 92.
- Source ownership read: each directive plus its target line; deeper source
  windows for the non-obvious callback and recursive-closure constructs.
- Config ownership read: all active override blocks in `oxlint.config.ts`.
- Installed Oxlint schema proves `prefer-const` supports
  `ignoreReadBeforeAssign` and `typescript/use-unknown-in-catch-callback-variable`
  has no rule option.

Final handoff contract:

- PR line: N/A: none requested or created
- Issue / tracker line: N/A: direct task only
- Confidence line: 99%; both inventories reconcile and all rows are classified
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: source audit passed, browser N/A
- Browser check: N/A: no browser surface changed
- Outcome: complete 92-directive inventory with 32 config-removal candidates,
  60 justified local exceptions, and zero global rule-off recommendations
- Caveat: recommendations were not applied or lint-tested because the user
  requested an audit, not mutation
- Design:
  - Chosen boundary: rule option for read-before-assign, unchecked-JS pattern
    for impossible TypeScript syntax, exact-file overrides for whole-file
    owners, and inline comments for exact constructs
  - Why not quick patch: fake sentinel returns, assertion wrappers, and API
    rewrites would only launder lint diagnostics
  - Why not broader change: broad test or global rule-offs would hide unrelated
    regressions
- Verified: independent counts, source context, active config, and installed
  rule schema
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

- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: no recommendations applied in this read-only audit

Timeline:

- 2026-08-20T10:43:43.679Z Task goal plan created.
- 2026-08-20: Ultracite policy and active Oxlint overrides read.
- 2026-08-20: Independent inventories reconciled at 65 files and 92 active
  next-line directives.
- 2026-08-20: All directives classified and final disposition counts
  reconciled to 92.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final response ready |
| Where am I going? | Return the full audit to the user; implementation requires a new authorization |
| What is the goal? | Audit and classify every active `oxlint-disable-next-line`, with explicit test-owner judgment |
| What have I learned? | See Findings |
| What have I done? | Reconciled every occurrence and recorded its exact disposition; see Timeline and Verification evidence |

Open risks:

- None within the read-only audit. Applying the 32 cleanup recommendations
  still requires editing the config/directives and rerunning lint/check.
