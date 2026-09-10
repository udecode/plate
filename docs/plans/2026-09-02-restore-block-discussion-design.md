# restore block discussion design

Objective:
Restore the established Block Discussion design without undoing the Floating-only architecture; done when old affordances and current behaviors pass source, test, and browser proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-restore-block-discussion-design.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user-reported local product regression
- id / link: local:block-discussion-design-regression
- title: Restore the established Block Discussion product design
- acceptance criteria: The Block Discussion trigger, popover, comment threads,
  suggestion reviews, reply composer, spacing, and action affordances retain the
  established design from `HEAD:apps/www/src/registry/components/editor/block-discussion.tsx`.
  The new shared comment channel/index/store architecture stays internal. No
  Sidebar, view switch, second presentation owner, or product redesign returns.

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
- initial confidence score: 0.75 after source comparison exposed generic bordered cards and a new block header
- improvement loop: red browser assertion -> restore historical presentation over current data model -> focused proof -> browser proof
- final score / loop closure: 0.98; the source-backed presentation, interaction suite, type/unit/lint/registry lanes, and fresh Browser inspection pass. The remaining 0.02 is the explicit lack of immutable pushed-ref and pixel-classifier proof for this local uncommitted repair.

Completion threshold:
- Restore the established source-backed design: zero generic per-thread card
  borders, zero new `Block N · items` header, the historical 380px zero-padding
  popover, historical compact trigger geometry/icons/count, avatar/name/time
  thread rows, excerpt treatment, reply layout, dividers, and suggestion actions.
- Preserve every current behavior row: overlap opens together, per-block combined
  comments and suggestions, comment create/reply/edit/delete/resolve, suggestion
  accept/reject/comments, outside close, AI draft, narrow layout, and static/read-only rendering.
- Keep the current Floating-only architecture and `DiscussionSlots`; do not
  restore Sidebar/view APIs, the removed plugin-owned data store, or a separate
  `block-discussion.tsx` owner.
- A focused browser assertion must fail on the current regressed design and pass
  after restoration. The complete comment browser suite, component tests,
  typecheck, scoped lint, registry generation, and live Browser proof must pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-block-discussion-design.md` passes.

Verification surface:
- Source audit against `git show HEAD:apps/www/src/registry/components/editor/block-discussion.tsx`.
- `apps/www/tests/browser/comment.spec.ts` red/green presentation and behavior proof.
- `apps/www/src/registry/components/editor/comment.spec.tsx` channel behavior proof.
- `pnpm --filter www typecheck`, scoped Ultracite, `pnpm --filter www build:registry`, and `pnpm --filter www rd`.
- Browser proof on `/blocks/discussion-demo` and `/view/editor-ai`, including
  screenshots/geometry/accessible affordances and console errors.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Product baseline is the established Block Discussion. Internal improvement
  must be invisible unless it is a strict product improvement.
- Do not alter the current public Comments API, shared channel, source-scoped
  anchors, `DiscussionSlots`, or Floating-only product decision.

Boundaries:
- Source of truth: historical `block-discussion.tsx` presentation plus the
  current comment/suggestion data model and existing browser behavior suite.
- Allowed edit scope: `apps/www/src/registry/components/editor/discussion.tsx`,
  presentation helpers in `comment.tsx` / `suggestion.tsx` only if needed,
  `apps/www/tests/browser/comment.spec.ts`, generated registry output, this plan,
  and an existing registry changelog entry only if its current-state description needs correction.
- Browser surface: `/blocks/discussion-demo` and `/view/editor-ai`.
- Browser strategy: Browser for normal app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: local direct report, no issue or PR requested.
- Non-goals: Sidebar, view switch, API redesign, storage redesign, separate
  BlockDiscussion file, migration compatibility, commit, push, PR, or unrelated cleanup.

Output budget strategy:
- Read exact owner files and bounded line ranges. Use focused `rg` with generated,
  build, and dependency trees excluded. Cap command output; save screenshots and
  traces as files instead of streaming binary/large output.

Blocked condition:
- Block only if the historical source cannot be reconciled with the current data
  model after three materially different attempts, or the required local route
  cannot run after the repository's one reinstall recovery.

Task state:
- task_type: local product regression repair
- task_complexity: non-trivial browser UI behavior
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: confirmed regression
- confidence: high
- next owner: patch with Plate UI presentation ownership
- reason: the current generic bordered cards and block heading replace the
  established source-backed Block Discussion composition.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-block-discussion-design.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Restore old design; only internal improvements; no regression |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Patch owns regression; Plate UI owns copied UI; Autogoal owns durable plan; Shadcn check preserves installed primitives; Browser owns live proof |
| Active goal checked or created | yes | No active goal found; create after this checkpoint |
| Source of truth read before edits | yes | Historical `block-discussion.tsx`, old `comment.tsx`, current `discussion.tsx`, current cards/tests |
| Tracker comments and attachments read | no | N/A: direct local report without attachments |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | No matching Block Discussion solution found |
| TDD decision before behavior change or bug fix | yes | Add focused failing Browser assertion before product edit |
| Branch decision for code-changing task | yes | Stay on user-mandated `next`; no branch/worktree |
| Release artifact decision | yes | Registry changelog applies; package changeset does not because registry-only UI is changed |
| Browser tool decision for browser surface | yes | Browser plugin; no native Chrome surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact files, bounded ranges, capped output |
| Browser pack selected | yes | `browser` |
| Browser route / app surface identified | yes | `/blocks/discussion-demo`, `/view/editor-ai` |
| Browser tool decision recorded | yes | Browser plugin |
| Console/network caveat policy recorded | yes | Runtime console errors are blockers; expected third-party avatar/network noise will be classified |
| Observable browser case captured | yes | `local:block-discussion-design-regression`; open block trigger on `/blocks/discussion-demo`; current generic cards/header are bad; historical source is oracle; final local fingerprints required |

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
- [x] Implementation fixes the right ownership boundary: presentation stays in
      the existing Comment/Suggestion/Discussion component family while the
      shared channel/index/store remains the single data owner.
- [x] Release artifact requirement recorded: update the existing registry changelog entry; no package changeset.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: stay on `next` per user constraint; no branch/worktree.
- [x] Local-env-rot retry policy recorded. N/A: no install-corruption signature;
      an isolated fresh server resolved stale HMR/generated-registry state, so
      `pnpm run reinstall` was not warranted.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: product presentation can regress while semantic tests stay green; source-backed visible affordances and live Browser proof are mandatory.
- [x] Review/P1 autoreview marked N/A: root instructions prohibit Autoreview on `next`; perform manual scoped diff review.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none touched.
- [x] Output budget discipline recorded and followed except one bounded but
      oversized `rg` against one-line generated JSON; recovery used exact files
      and capped output, and no further broad generated search was streamed.
- [x] Browser pack: route, interaction path, and expected visible outcome were
      recorded before proof: open each block trigger on `/blocks/discussion-demo`
      and `/view/editor-ai`; expect the compact unboxed Discussion composition.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: runtime errors were monitored by the browser harness; fresh
      final runs reported none. Network classification beyond route/runtime
      success is N/A because no network-backed product behavior changed.
- [x] Browser pack: fresh live Browser screenshots/AX inspection were captured;
      no visual waiver was used.
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: N/A for a pixel-perfect paint claim. This repair claims
      source-backed composition, geometry, and interaction parity, not classified
      pixel identity; DOM/style assertions plus live Browser inspection are the
      governing proof.
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: the exact observable case failed before the fix because the
      popover rendered `Block 1 · 2 items`, then passed after restoration.
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof used a fresh Browser tab on final local code and
      rechecked the opened popover after the interaction; final ref and source,
      test, fixture, integration, and generated payload fingerprints are recorded.
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: N/A for clean pushed-ref certification. This is a local,
      uncommitted shared-checkout repair; final claims explicitly stop at local proof.
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: N/A for native selection/focus/DnD/compositor/React lifecycle.
      The applicable visual design row nevertheless passed 5/5 warm Chromium
      runs without retry.
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, route bypass, or unshipped
      scaffolding was used. Generated registry payloads came from the canonical
      registry build command and are retained as required output.
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named source, focused/full behavior, type/unit/lint/registry, and Browser lanes | Passed; evidence below |
| Bug reproduced before fix | yes | Fail the exact observable case | Red on `Block 1 · 2 items` |
| Targeted behavior verification | yes | Run focused and complete comment browser proof | 5/5 design; 10/10 behavior; 1/1 localized routes |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | N/A: no package export/file-layout change | No `pnpm brl` required |
| Package manifests, lockfile, or install graph changed | no | N/A: registry dependency metadata only; no package manifest/lock/install graph | No install required |
| Agent rules or skills changed | no | N/A: none touched | No skill sync required |
| Workspace authority proof | yes | Run all proof from repo root against the owning www app | Passed in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Capture Browser proof | Fresh `/blocks/discussion-demo` and `/view/editor-ai` inspection passed |
| Browser final proof | yes | Exercise final code in fresh Browser state | Open popovers showed compact unboxed mixed discussion rows with no injected heading |
| CI-controlled template output changed | no | N/A: no `templates/**` output touched | N/A |
| Package behavior or public API changed | no | N/A: registry presentation only; public Comments API unchanged | No changeset |
| Registry-only component work changed | yes | Use owning registry changelog entry | Existing draft `2026-09-02-comments-ownership` owns this current behavior |
| Docs or content changed | no | N/A: no user-facing docs/content changed | Goal plan only |
| High-risk mini gate | yes | Prove source-backed appearance and full interactions | Exact red/green, full suite, and live Browser proof passed |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling files changed | N/A |
| Local install corruption suspected | no | N/A: fresh isolated server resolved stale HMR state; no corruption signature | No reinstall |
| P1 autoreview for non-trivial implementation changes | no | N/A: root instructions prohibit Autoreview on `next` | Manual scoped review found and removed per-message subscription fan-out |
| PR create or update | no | N/A: user did not request PR | No PR |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR | N/A |
| Tracker sync-back | no | N/A: direct local report; no tracker | N/A |
| Final handoff contract | yes | Fill exact local result and caveat | Filled below |
| Final lint | yes | Run scoped equivalent | Scoped Ultracite passed |
| Output budget discipline | yes | Record accidental oversized output and recovery | One one-line generated JSON search overflowed; subsequent reads were exact and capped |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run plan checker | `[autogoal] complete` |
| Browser interaction proof | yes | Open block triggers on standalone and AI routes | Passed in fresh Browser tabs |
| Browser console/network check | yes | Check applicable runtime errors | Harness runtime monitor passed; no relevant network-backed behavior changed |
| Browser final proof artifact | yes | Record route and visible final state | Fresh live screenshot/AX inspection recorded in task session |
| Exact case replay | yes | Replay exact Block Discussion presentation plus behavior rows | Passed: 5/5 design, 10/10 behavior, 1/1 routes |
| Final ref and fingerprints | yes | Record HEAD plus issue-owned fingerprints | Recorded below for `a6afd55c30e97c74fe895d1ad005ca75413110f3` |
| Clean final runtime | no | N/A: local uncommitted shared checkout, not a pushed immutable ref | Final claim is local only |
| Retry-free stability | yes | Run applicable design case 5/5 | 5/5 warm Chromium runs, no retry |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | historical and current owners compared | implementation |
| Implementation | complete | presentation restored in existing owners; subscription fan-out removed | verification |
| Verification | complete | source, browser, unit, type, lint, and registry lanes passed | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | final ledger and fingerprints recorded | final response |

Findings:
- Historical Block Discussion used a 380px, `p-0` popover with dividers and
  unboxed thread/suggestion rows. Current code uses generic bordered cards,
  `p-2`, a new `Block N · items` header, 25rem width, and different action density.
- The compact three-icon trigger grammar remains conceptually correct, but the
  current `size="xs"` primitive changes exact geometry from the historical
  `h-6 !px-1.5 py-0` contract.
- Current channel/index/store behavior is stronger and stays. Presentation is
  the only regression owner.
- Shadcn project inspection confirms the existing new-york/Radix Button,
  Avatar, and menu primitives are installed. No component install or overwrite
  is needed.

Decisions and tradeoffs:
- Restore presentation in the existing `discussion.tsx` family, not a separate
  file -> preserves the user's accepted single-owner architecture -> requires
  current data to feed historical view components.
- Remove the new popover header and card shells -> they were redesigns, not
  architectural requirements -> accessible trigger labels remain for clarity.

Implementation notes:
- `discussion.tsx` owns the compact 380px zero-padding popover and trigger.
- `comment.tsx` owns the historical unboxed comment rows, excerpt rail,
  hover-only resolve/overflow actions, replies, and composer.
- `suggestion.tsx` owns the flat suggestion review row and inline comments.
- The shared source-scoped store/index and `DiscussionSlots` remain unchanged.
- Subscription fan-out was improved: `CommentThreadCard` reads store-derived
  excerpt/status/mine once and passes them to rows instead of every message
  subscribing independently.
- Registry dependency metadata includes the dropdown menu used by the restored
  overflow actions; canonical payloads were regenerated, never hand-edited.

Review fixes:
- Manual scoped review found per-message store subscriptions in the first
  restoration. Those subscriptions were collapsed to one per thread before
  final typecheck and Browser proof.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite browser runner reported zero files for a www test path | 1 | Use the owning www browser command with an explicit temporary base URL | Resolved; www focused red/green lane runs |
| Existing localhost:3000 dev server accepted connections but never responded | 1 | Start isolated www dev server on port 3101 | Resolved; route and browser tests run on 3101 |
| Full suite timed out waiting for restored hover-only actions | 1 | Hover the exact message/suggestion before clicking its action | Resolved; both affected interaction tests pass |

Verification evidence:
- RED: `PLAYWRIGHT_BASE_URL=http://localhost:3101 pnpm --filter www test:www-browser:chromium comment.spec.ts --grep "Floating Discussion preserves"` failed because the regressed UI rendered `Block 1 · 2 items`.
- GREEN: the same focused command passed 1/1 after restoration.
- Interaction repair: focused create/edit/delete/resolve and suggestion accept/reject rows passed 2/2.
- Retry-free design proof: the focused design row passed 5/5 with
  `--repeat-each=5`.
- Complete product browser proof: 10/10 rows passed with `--grep-invert
  "English and Chinese"`, covering overlaps, per-block mixed threads,
  create/reply/edit/delete/resolve, suggestion accept/reject/comments, outside
  close, static/source recovery/performance bounds, AI drafts/layout, narrow
  layout, and HTML suggestion markup.
- Localized docs routes: 1/1 English/Chinese route matrix passed.
- Unit: `bun test apps/www/src/registry/components/editor/comment.spec.tsx`
  passed 7 tests and 47 assertions.
- Type: `pnpm --filter www typecheck` passed after the subscription cleanup.
- Lint: scoped `pnpm exec ultracite check` passed for all owned sources/tests.
- Registry: `pnpm --filter www build:registry && pnpm --filter www rd` passed
  with 364 canonical payloads and 15 sparse overlays.
- Whitespace: scoped `git diff --check` passed.
- Live Browser: fresh `/blocks/discussion-demo` and `/view/editor-ai` tabs
  showed the compact trigger and unboxed mixed Discussion popover without the
  injected Block heading or editor layout regression.
- Final local ref: `a6afd55c30e97c74fe895d1ad005ca75413110f3`.
- Final SHA-256 fingerprints:
  - `comment.tsx`: `c314009a41081c03cec9a40ee4cc61d1a6031e38328e8bf6efaef1f999f974e6`
  - `suggestion.tsx`: `2c5c1af4a71f3370a62ff17027a05c4ec65ebbd7019aa7c71562464f3f45f97b`
  - `discussion.tsx`: `ddbe2192eeb5940663c40381bc1d08ee5da321cdf38056bc1e93e7f48f8bbffb`
  - `registry-features.ts`: `c70dedf87cd0c2882428130a70ab7033b50e5581159887d0faae0fb4f8377e98`
  - `comment.spec.ts`: `66b81746689f8f9bb9ccfd372c38275c3c6e5442cd9cb69f09c42c8ce71d18dc`
  - `discussion-demo.tsx`: `594f8542f985deea14834491025a4c220dcbfd561de9fdd3c66db22f6891bb44`
  - AI integration: `d0c981274ceff93a7dba8bdbb8e7c28607164cd468eea3eb67800199d63fc7d6`
  - generated `comment.json`: `9bb1add6761cb3771d7ad9cc2ac0e12a44976b09d7f3fcd78409625dec956eba`
  - generated `discussion.json`: `ccab765e4361df56153f497143fc04d2373ccc2742589da712d9b7a088a92a9a`
  - generated `suggestion.json`: `1c7e214bf9e4531942916561756ba4e3e72a8794d3684dc52bfdc93650323ee0`

Final handoff contract:
- PR line: N/A: local uncommitted repair; no PR requested
- Issue / tracker line: N/A: direct local report
- Confidence line: 98% local confidence
- Flow table:
  - Reproduced: exact Browser test red on the injected Block heading
  - Verified: 5/5 design, 10/10 behavior, 1/1 localized routes
- Browser check: fresh standalone Discussion and AI editor inspection passed
- Outcome: established Block Discussion design restored over the stronger shared Comments architecture
- Caveat: local uncommitted shared checkout; no immutable pushed-ref or pixel-classifier claim
- Design:
  - Chosen boundary: restore presentation inside existing Discussion/Comment/Suggestion owners
  - Why not quick patch: removing only the Block heading would leave card shells, spacing, actions, and composer regressions
  - Why not broader change: current shared channel/store/index and Floating-only ownership are improvements and are not the regression
- Verified: exact red/green, full interactions, unit/type/lint/registry, and live Browser proof
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
- Issue / tracker: N/A: direct local report
- Browser proof: passed on `/blocks/discussion-demo` and `/view/editor-ai`
- Caveats: local uncommitted proof only; the user or a later task must request commit/push

Timeline:
- 2026-09-02T21:22:11.432Z Task goal plan created.
- 2026-09-02 Source comparison confirmed exact visual regression in current cards/popover.
- 2026-09-02 Exact presentation test failed before the fix and passed after restoration.
- 2026-09-02 Full source, interaction, Browser, type, unit, lint, and registry proof completed.
- 2026-09-02 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final local handoff |
| What is the goal? | Restore historical Block Discussion presentation over current architecture |
| What have I learned? | Generic cards/header caused the regression; current data architecture is not the culprit |
| What have I done? | Restored the historical presentation in current owners; all named proof lanes pass |

Open risks:
- No known local product regression remains in the named surface. The only
  residual risk is integration drift before these uncommitted files are
  committed; final fingerprints make that drift detectable.
