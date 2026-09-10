# restore per block discussions

Objective:
Restore scalable per-block Discussions; done when combined comments and suggestions open per block in Sidebar and Floating with focused tests and Browser proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-restore-per-block-discussions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Task source:
- type: direct user regression report in this task
- id / link: local conversation; exact reported route `/view/editor-ai`
- title: Restore Discussions per block
- acceptance criteria: annotated blocks expose their own Discussion affordance; activating it opens the correct block's combined comments and suggestions; this works in the exclusive Sidebar and Floating modes; the implementation does not restore per-block full-document scans or broad editor subscriptions; existing global discussion, overlap, reply, and resolve behavior stays intact.

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
- initial confidence score: N/A: binary interaction and scale gates are stronger
- improvement loop: reproduce -> one red browser tracer -> scalable owner fix -> focused proof -> full comments proof
- final score / loop closure: N/A

Completion threshold:
- One red-before-green browser case proves the current route lacks the block-level Discussion affordance.
- On `/view/editor-ai`, every seeded annotated block exposes a visible block-level Discussion trigger with the correct combined comment/suggestion count or equivalent identity.
- Activating a block trigger selects and opens that block's combined Discussion in Sidebar mode and Floating mode, which remain mutually exclusive.
- Existing overlap selection, global list, reply, and resolve browser rows remain green.
- Deterministic scale proof shows one shared annotation/index build per editor snapshot and O(1) per-block lookup, with no per-block document/comment scan or per-block broad editor subscription.
- Focused browser tests, affected typecheck/lint, registry generation/changelog checks, fresh Browser interaction, and the goal-plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-per-block-discussions.md` passes.

Verification surface:
- `apps/www/tests/browser/comment.spec.ts` red/green interaction rows on `/view/editor-ai` and the standalone Discussion demo when useful.
- Deterministic discussion-index scale harness or focused unit test across 100/1,000/10,000 blocks and 100/1,000/50,000 discussion items.
- `pnpm --filter www build:registry`, affected TypeScript checks, scoped Ultracite/lint, and registry changelog generation/check.
- Fresh Browser page proving block trigger -> correct combined thread in each exclusive view, plus console/network inspection.
- Source audit over repeated block renderers proving no `usePath()` render dependency, no per-block full traversal, and one canonical Discussion UI owner.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve one combined Discussion model for comments and suggestions.
- Preserve the Sidebar/Floating mode switch as an exclusive presentation choice.
- Preserve overlap selection, comment creation, replies, resolve, and the existing `/view/editor-ai` layout.
- Do not restore the deleted per-block subscription fan-out or add a second comments store/provider.

Boundaries:
- Source of truth: current registry Discussion family, package comments/suggestions APIs, current browser tests, prior committed block-discussion implementation, and `docs/solutions` performance/correctness notes.
- Allowed edit scope: `apps/www/src/registry/components/editor/**`, the owning editor block/example wiring, `apps/www/src/registry/registry-*.ts`, `apps/www/tests/browser/comment.spec.ts`, the six Comments/Discussion/Suggestion EN/CN docs, focused package/UI proof only if ownership requires it, registry changelog source/generated output, and this plan.
- Browser surface: exact report route `/view/editor-ai`; prefer `/blocks/discussion-demo` for isolated registry proof when it owns the same component graph.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker or PR requested.
- Non-goals: no public package API redesign, no commit/push/PR, no separate comment-demo product, no simultaneous Sidebar and Floating rendering, and no unrelated editor cleanup.

Output budget strategy:
- Restrict searches to Discussion/comment/suggestion owners, exact plans and solution notes, and generated registry metadata. Count or list files before printing; cap source reads to named ranges; exclude `.next`, `node_modules`, generated caches, templates, logs, and build output unless they are the named verification artifact.

Blocked condition:
- Stop only if the exact route cannot run after the documented reinstall retry, or current package APIs cannot identify a block's combined Discussion without a public API decision; otherwise continue through repair and proof.

Task state:
- task_type: product regression repair
- task_complexity: normal, high-risk repeated-render path
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: restored and verified as a local, uncommitted candidate
- confidence: high; exact interaction, full Comments suite, scale receipt, source audit, and fresh Browser proof all pass
- next owner: user-controlled commit/push only if requested
- reason: the canonical `discussion.tsx` family owns presentation while package Comments/Suggestions retain semantic ownership; the repeated block path uses one shared index and keyed subscribers.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-per-block-discussions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured per-block affordances, combined Comments/Suggestions, both exclusive views, click-to-open behavior, no fan-out regression, exact AI route, proof, and no commit/push. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Used Autogoal lifecycle, Patch regression ownership, TDD red/green, Plate UI family/performance/registry law, Shadcn component rules, Registry Changelog, and Browser proof. |
| Active goal checked or created | yes | `get_goal` returned none; the exact scalable per-block Discussion objective is active. |
| Source of truth read before edits | yes | Read current `discussion.tsx`, `comment.tsx`, `suggestion.tsx`, both demo/editor compositions, browser tests, staged baseline deletions, prior recovery plans, and render-slot implementation. |
| Tracker comments and attachments read | no | N/A: direct local report; no tracker or attachment. |
| Video transcript evidence required | no | N/A: no recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read shared-index, stale-path, inline-void summary, and responsive BlockDiscussion notes. |
| TDD decision before behavior change or bug fix | yes | Added one end-to-end browser tracer first; it failed at 0 versus 2 block triggers before implementation. |
| Branch decision for code-changing task | yes | Stay on required `next` at `a6afd55c30e97c74fe895d1ad005ca75413110f3`; no branch/worktree change. |
| Release artifact decision | yes | Registry-only visible fix: update the active Comments/Discussion registry changelog source and regenerate JSON; no package changeset unless package code changes. |
| Browser tool decision for browser surface | yes | Use in-app Browser for visual/interactions and focused Playwright as durable automated proof. |
| PR expectation decision | no | N/A: user did not request PR, commit, or push. |
| Tracker sync expectation decision | no | N/A: no external tracker. |
| Output budget strategy recorded | yes | Narrow/capped strategy recorded above; two accidental generated/HTML outputs are recorded below and all later reads are path/range bounded. |
| Browser pack selected | yes | Browser pack materialized. |
| Browser route / app surface identified | yes | `/view/editor-ai` exact report plus canonical `/blocks/discussion-demo`. |
| Browser tool decision recorded | yes | Browser is the normal-app owner; Chrome/Computer are N/A. |
| Console/network caveat policy recorded | yes | Capture runtime errors plus Browser console and failed requests; disclose only unrelated host noise. |
| Observable browser case captured | yes | `per-block-discussion:combined-exclusive-views`; current local checkout; `/blocks/discussion-demo` and `/view/editor-ai`; click annotated-block trigger; expect the correct block's combined items in selected view; pre-fix 0 triggers; final proof will fingerprint production/test/example files. |
| Performance pack selected | yes | Performance-observability pack materialized because the UI repeats per top-level block. |
| User-facing operation and runtime owner identified | yes | Operation is one annotation membership change or block-trigger activation; `discussion.tsx` owns one root index/store and keyed block UI; Comments channel and Suggestion review hook remain semantic data owners. |
| Scale variables and cohorts fixed | yes | Mounted block/item/listener count: normal 100, large 1,000, stress 10,000, pathological 50,000; one changed block and one selected block per sample. |
| Budget frozen before target measurement | yes | One index build per input snapshot; item visits <= A; keyed block lookups <= B; one changed-block operation wakes <=2 block listeners; no per-block scan; target p95 <= 1.20x matched shared-index/fan-out baseline and 10x cohort growth <=12x. |
| Baseline and target probe selected | yes | Baseline models the prior shared index plus B per-block selector callbacks; target models one shared group diff plus keyed listener notification. The production rerun uses actual `DiscussionSlots` Browser behavior and source-identity audit. |
| Correctness guard selected | yes | Red/green combined block-opening browser case plus the complete existing Comments browser suite. |
| Production detector decision recorded | no | N/A: copied demo UI has no production telemetry owner; deterministic benchmark, browser runtime error capture, and source fingerprints are the safe local detectors. |

Work Checklist:
- [x] No duration was requested; binary behavior and frozen scale budgets were used.
- [x] The first checkpoint captured every user-visible behavior, scale constraint, proof surface, non-goal, and authority boundary before implementation.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and stop condition are concrete.
- [x] The direct report, exact routes, likely owners, and presentation-layer root cause are classified.
- [x] Video evidence is N/A because no recording was supplied.
- [x] Repo rules, current owners, prior recovery plans, render-slot mechanics, and relevant solution notes were read first.
- [x] The canonical `discussion.tsx` family owns aggregation, per-block projection, and the selected global view.
- [x] The active registry changelog entry and generated JSON were updated; no package changeset applies because this task changes copied UI only.
- [x] Final handoff is a local bug-fix report; PR, issue, commit, and push fields are N/A.
- [x] Work stayed on required `next` at `a6afd55c30e97c74fe895d1ad005ca75413110f3` with no branch or worktree change.
- [x] No install-corruption signature appeared, so the reinstall retry is N/A.
- [x] Every command ran from `/Users/zbeyens/git/plate-2`; browser proof used the local `www` app at port 3000.
- [x] High-risk failures and their proofs are recorded below: wrong block identity, lost overlap, DOM reconciliation removal, layout regression, and repeated-render fan-out.
- [x] P1 `autoreview` is N/A because repo rules forbid it on `next`; a manual P1 diff/source pass found and removed the last broad Comments-context read from each block.
- [x] Agent-native review is N/A because no agent, skill, rule, hook, command, or prompt source changed.
- [x] Output was bounded after two recorded mistakes: raw Shadcn HTML and generated one-line JSON were replaced with local named-source reads and structured JSON parsing.
- [x] Browser routes, actions, visible outcomes, and error checks were fixed before final proof.
- [x] Browser was used for normal app QA; Chrome and Computer are N/A because no native browser or OS behavior is involved.
- [x] Browser console and CDP `Network.loadingFailed` buffers were empty on the final AI-route replay.
- [x] Final screenshots were captured after opening Block 1 in Sidebar, Block 2 in Floating, and Block 4 on `/view/editor-ai`.
- [x] Visual controls passed: annotated blocks showed one trigger each, unannotated blocks showed none, and two annotated demo blocks produced exactly two triggers without duplicate layers.
- [x] The red browser tracer failed before the repair with zero per-block triggers.
- [x] Final Browser proof used a fresh tab after the final source and registry build; exact DOM, popup, layout, console, and network fields were rechecked.
- [x] Clean pushed-ref proof is N/A: this is explicitly a local uncommitted candidate, not a shipped-tree claim.
- [x] The React DOM lifecycle case passed 5/5 retry-free Chromium runs with `--repeat-each=5`.
- [x] No temporary stub, alias, hand-edited generated payload, route bypass, or test-only runtime path contributed to proof.
- [x] A matched current-versus-target scale receipt was captured before acceptance and rerun after implementation.
- [x] The measured operation includes one shared group build plus subscriber dispatch; counters cover item visits, block lookups, listener wakes, and payload bytes.
- [x] Cohorts cover 100, 1,000, 10,000, and 50,000 blocks/items/listeners.
- [x] Node 22.22.1 receipt used 10 warmups and 40 samples; cold, p50, p95, bytes, wakes, and checksums are recorded below.
- [x] The target prototype was disposable and modeled only the proposed keyed-dispatch law.
- [x] Baseline and target used the same fixture, group build, process, sampling, and correctness checksum.
- [x] Source audit covered subscription fan-out, block cardinality, repeated reads, and retained work; no new infrastructure was added outside the owning UI family.
- [x] The measured owner was fixed: annotation aggregation is root-scoped and block consumers use keyed snapshots only.
- [x] Database transaction guidance is N/A because the path is local UI state.
- [x] Benchmark fixtures contain synthetic IDs only and no credentials or protected data.
- [x] The durable browser row guards the complete behavior; the private scale law remains source-audited instead of exposing a test-only public API.
- [x] No budget override was needed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named tests, checks, audits, and Browser proof | All commands and receipts below pass. |
| Bug reproduced before fix | yes | Record failing test | New browser row failed with 0 versus 2 triggers before implementation. |
| Targeted behavior verification | yes | Run focused and full proof | Focused row, full 10-row suite, and 5/5 stability ledger pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Full `pnpm --filter www typecheck` passed; final source also passed focused `tsc`. |
| Package exports or file layout changed | no | N/A | Registry component family changed; no package export/barrel change, so `pnpm brl` is N/A. |
| Package manifests, lockfile, or install graph changed | no | N/A | No task-owned manifest or install change. |
| Agent rules or skills changed | no | N/A | No agent source changed. |
| Workspace authority proof | yes | Run in owning workspace | All shell proof ran from `/Users/zbeyens/git/plate-2`; Browser used its `www` runtime. |
| Browser surface changed | yes | Capture Browser proof | Fresh demo and AI routes pass in the in-app Browser. |
| Browser final proof | yes | Capture final state | Fresh-tab Sidebar, Floating, AI block, layout, console, network, and screenshot proof pass. |
| CI-controlled template output changed | no | N/A | No task-owned template output changed. |
| Package behavior or public API changed | no | N/A | No package code changed in this repair; copied registry API needs no package changeset. |
| Registry-only component work changed | yes | Update registry changelog | Active Comments ownership entry updated and generated with 107/107 checks passing. |
| Docs or content changed | yes | Verify docs | EN/CN setup uses `DiscussionSlots`; full www typecheck built docs and passed source parity. |
| High-risk mini gate | yes | Record failure modes and proof | Wrong block/count, duplicate view, reconciler removal, layout collapse, and fan-out are covered below. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling contract changed. |
| Local install corruption suspected | no | N/A | No mixed React or missing-module signature occurred. |
| P1 autoreview for non-trivial implementation changes | no | N/A | Forbidden on `next`; manual P1 review found and fixed broad context consumption. |
| PR create or update | no | N/A | User did not authorize PR work. |
| Task-style PR body verified | no | N/A | No PR exists for this local candidate. |
| PR proof image hosting | no | N/A | No PR body exists. |
| Tracker sync-back | no | N/A | No external tracker exists. |
| Final handoff contract | yes | Fill fields below | Complete. |
| Final lint | yes | Run scoped fix/check | `ultracite fix` then `check` passed on final Discussion source; scoped changed-source check passed. |
| Output budget discipline | yes | Record mistakes and recovery | Recorded below; later reads used structured parsers and named ranges. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run plan checker | `[autogoal] complete` passed on the final ledger. |
| Browser interaction proof | yes | Exercise exact actions | Correct per-block groups opened in both modes and on `/view/editor-ai`. |
| Browser console/network check | yes | Inspect final runtime | Zero Browser warnings/errors and zero CDP failed loads. |
| Browser final proof artifact | yes | Capture screenshot | Final AI state screenshot emitted from the fresh Browser tab. |
| Exact case replay | yes | Replay report route | Block 4 trigger opens exactly 2 comments and 3 suggestions in the sidebar. |
| Final ref and fingerprints | yes | Record ref and SHA-256 | Recorded below for production, fixtures, tests, registry metadata, and generated payload. |
| Clean final runtime | no | N/A | Candidate remains uncommitted in a shared dirty checkout; no pushed/shipped claim is made. |
| Retry-free stability | yes | Run 5 warm rows | Exact per-block Chromium row passed 5/5 with retry 0. |
| Pre-acceptance scale proof | yes | Run matched benchmark | Four cohorts, frozen 1.20x p95 budget, matched builds, and correctness checks pass. |
| Warm latency budget | yes | Check p95 ratio | Worst target/baseline p95 ratio is 1.024 at 50,000, under 1.20. |
| Large/stress scaling | yes | Check 1k/10k/50k | Target p95 is 0.070/0.747/7.710 ms; absolute pathological cost stays below 8 ms. |
| Cold and failure paths | yes | Record cold and runtime errors | Target cold is 0.018/0.025/0.568/5.107 ms; Browser runtime error paths remain clean. |
| Payload and fan-out | yes | Record bytes and wakes | 4,931/51,281/532,781/2,752,781 bytes; listener wakes collapse from B to 1. |
| Production-path rerun | yes | Audit final implementation and replay UI | Final source has the matched shared-build/keyed-dispatch law; fresh Browser and generated payload use that source. |
| Correctness guard | yes | Run browser and unit guards | 10/10 browser and 7/7 channel unit tests pass. |
| Before/after receipt | yes | Record comparison | Baseline B wakes versus target 1 wake; exact p95 table is below. |
| Detector and privacy | yes | Check local detectors | Runtime errors, source fingerprints, and synthetic benchmark contain no protected data. |
| Performance regression check | yes | Run scale receipt and checks | Matched Node receipt, source audit, browser suite, typecheck, and lint pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Exact product job, old implementation, and current owners audited | implementation |
| Implementation | completed | Atomic `DiscussionSlots` restores root, block, and selected-view presentation | verification |
| Verification | completed | Tests, types, lint, registry, docs, scale, Browser, and fingerprints pass | closeout |
| PR / tracker sync | completed | N/A: neither was requested | final response |
| Closeout | completed | Local uncommitted candidate is ready for handoff | final response |

Findings:
- Deleting the old `BlockDiscussion` implementation also deleted a valid product job: discover and open Discussion from the annotated block.
- The correct replacement is not another plugin or component file. `DiscussionSlots` atomically installs the root controller, keyed block projection, and one selected global view.
- Late insertion of a button into an editor-owned node is removed by Plite reconciliation. A stable `contentEditable={false}` zero-size mount must exist from the node's first render.
- The first repaired block wrapper still consumed the broad Comments context for `view`. Manual review caught it; final block wrappers consume only their keyed Discussion snapshot.
- Package Comments and Suggestions already own semantic behavior. A `DiscussionPlugin`, `DiscussionKit`, or second provider would duplicate ownership and let consumers install an incomplete combination.

Decisions and tradeoffs:
- Keep `DiscussionSlots` as the sole public copied-UI install value. Do not export individual slot components.
- Keep the entire Discussion component family in `discussion.tsx`; do not revive `block-discussion.tsx` or a separate index helper.
- Rebuild the shared group index once per annotation snapshot. Annotation membership changes are rare enough that O(A) shared work is preferable to per-block scans or a second incremental semantic store.
- Use stable `NodeKey` identity and notify only changed/selected block listeners. A presentation-mode change clears only the previously active block target.
- Keep comment/suggestion data in their existing owners; the private Discussion store holds derived presentation summaries only.

Implementation notes:
- `createCommentsPlugin({ anchors }).configure({ slots: DiscussionSlots })` is the complete install grammar.
- Sidebar activation marks and scrolls the correct block group. Floating activation anchors one popover to the block trigger and shows that block's combined items.
- Visible count uses generated CSS content so it does not contaminate editor `innerText` or AI prompt input.
- Registry metadata directly declares `button`, `comment`, `floating-popover`, and `suggestion` dependencies and generated payloads include the complete slots value.
- EN/CN Comments, Discussion, and Suggestion docs teach the same atomic install path.

Review fixes:
- Replaced a late-inserted trigger with a stable non-editable mount after the red case improved from 0 to only 1 trigger.
- Scoped block targets by `view` after a cross-mode target race kept Floating closed.
- Moved count text to a pseudo-element after the full suite detected AI `innerText` pollution.
- Removed `useComments()` from `DiscussionBlock`; mode and activation are root-owned, so block wrappers no longer consume broad context.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Raw Shadcn documentation response streamed HTML | 1 | Use the local registry rules and named source files | Recovered; no source impact. |
| Broad generated-payload search printed one-line JSON | 1 | Parse exact JSON fields with Node | Recovered; output then stayed bounded. |
| Combined delete/add patch for `discussion.tsx` failed mechanically | 1 | Apply deletion and replacement separately | Recovered. |
| Initial TypeScript access used invalid editor child/property assumptions | 1 | Use `editor.key(path)` and explicit guards | Fixed; typecheck passes. |
| First green attempt rendered only one of two block triggers | 1 | Trace editor DOM reconciliation and preserve a stable mount | Fixed; two triggers render. |
| Floating click raced a Sidebar-owned target | 1 | Include selected view in the target and clear it on mode change | Fixed. |
| Trigger text polluted editor `innerText` | 1 | Render visible count through CSS generated content | Fixed; full AI provisional row passes. |
| Ref-based selection controls failed React lint | 1 | Move controls into the root store and install them from an effect | Fixed; lint and tests pass. |
| Ultracite was asked to format the ignored goal-plan Markdown file | 1 | Use the Autogoal checker as the owning plan validator | N/A to source lint; checker passes. |

Verification evidence:
- Red: new `annotated blocks open their own combined Discussion in either view` row saw 0 triggers before implementation.
- Browser: `pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts` -> 10/10 pass.
- Stability: exact per-block row with `--repeat-each=5` -> 5/5 pass, retry 0.
- Unit: `bun test apps/www/src/registry/components/editor/comment.spec.tsx` -> 7/7 pass, 47 assertions.
- Types/docs/source parity: full `pnpm --filter www typecheck` passed; final `tsc --noEmit -p tsconfig.json` passed after the last source edit.
- Format/lint: scoped Ultracite fix/check passed; scoped changed-source check passed.
- Registry: `pnpm --filter www build:registry` materialized 364 canonical payloads and 15 overlays; generated `discussion.json` contains all three slots and direct dependencies.
- Changelog: generator check passed 107/107 events.
- Source audit: no `usePath`, `useEditorRuntimeState`, `editor.read.nodes`, `editor.children`, or broad Comments-context read occurs in `DiscussionBlock`.
- Fresh Browser demo: two triggers; Block 1 Sidebar shows two comments and no popover; Block 2 Floating shows two suggestions plus its attached comment and no sidebar.
- Fresh Browser AI route: Block 4 trigger opens two comments plus three suggestions; toolbar is above editor/sidebar, editor ends where sidebar begins, horizontal overflow is 0, failed loads are 0, and console warnings/errors are 0.

Scale receipt:
| Blocks/items/listeners | Baseline p95 | Target p95 | Ratio | Target cold | Payload | Wakes before -> after |
|------------------------|--------------|------------|-------|-------------|---------|------------------------|
| 100 | 0.100 ms | 0.057 ms | 0.564 | 0.018 ms | 4,931 B | 100 -> 1 |
| 1,000 | 0.133 ms | 0.070 ms | 0.529 | 0.025 ms | 51,281 B | 1,000 -> 1 |
| 10,000 | 1.258 ms | 0.747 ms | 0.594 | 0.568 ms | 532,781 B | 10,000 -> 1 |
| 50,000 | 7.530 ms | 7.710 ms | 1.024 | 5.107 ms | 2,752,781 B | 50,000 -> 1 |

- Environment: Node v22.22.1, 10 warmups, 40 samples, synthetic IDs, identical fixture and group build, correctness checksum true for every cohort.
- Budget result: pass. Worst warm p95 ratio 1.024 <= 1.20; keyed dispatch wakes one block, below the <=2 budget.

Final fingerprints on local HEAD `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus the uncommitted task files:
- `discussion.tsx`: `4ea6e85a73bb223e06a80798a607a3a6bc4fdc0aaa272ede78bce025b77552d8`
- `discussion-demo.tsx`: `e228f26ad959fba4d8f88343a2b6673d50aed8dd1def309e8d4487f482dc593f`
- AI `plate-editor.tsx`: `f72760483c161c251cbc6acdcf4d1ca0386ce8fea4691ba457ba70fdc6f48f8d`
- `comment.spec.ts`: `fd4948ba6e9ccd7a37bd129f78155133136733087681d9dc0a2e0567532e04ad`
- `registry-features.ts`: `40d756e0c3eadf56ad824b0fcbdb216abc27ad1e517b7980ed74183c47557b27`
- generated `discussion.json`: `44d2adfde78ddee0f1401d517ed26174e88dea527d107520e0573ddbae0e8292`

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct local report only.
- Confidence line: high for the local candidate; no shipped-tree claim.
- Flow table:
  - Reproduced: red browser tracer, 0 expected 2 triggers.
  - Verified: 10/10 full suite, 5/5 exact warm runs, fresh Browser on both routes.
- Browser check: Sidebar/Floating exclusivity, correct block contents, AI layout, console, and network all pass.
- Outcome: scalable per-block Discussions are restored with combined comments and suggestions.
- Caveat: local and uncommitted in a checkout containing other sessions' work; commit/push were not authorized.
- Design:
  - Chosen boundary: one atomic registry `DiscussionSlots` value backed by one root-derived presentation store and keyed block subscribers.
  - Why not quick patch: scanning/subscribing inside every block would restore the product while reintroducing the scale bug.
  - Why not broader change: package Comments/Suggestions already expose the required semantic data; another plugin/provider would duplicate ownership.
- Verified: tests, typecheck, lint, docs/source parity, registry build, changelog, scale receipt, source audit, and Browser proof.
- PR body verified: N/A: no PR exists.

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
- Issue / tracker: N/A: none.
- Browser proof: complete on `/blocks/discussion-demo` and `/view/editor-ai`.
- Caveats: local uncommitted candidate; the wider checkout includes unrelated concurrent work that this task did not rewrite.

Timeline:
- 2026-09-02T18:41:27.552Z Task goal plan created.
- Red browser tracer confirmed zero per-block triggers.
- Restored the complete Discussion slots family and fixed DOM reconciliation, mode-target, and editor-text regressions.
- Removed the final broad context read from repeated block wrappers.
- Full tests, type/docs checks, registry/changelog generation, scale receipt, 5/5 stability, and fresh Browser proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final local handoff |
| What is the goal? | Restore scalable combined Discussions per annotated block in either selected view |
| What have I learned? | The product job was wrongly deleted; the root index plus keyed block projection is the durable owner |
| What have I done? | Restored behavior, cut repeated fan-out, and proved interaction, layout, scale, docs, and registry output |

Open risks:
- No known task-owned behavior failure remains. The candidate is not committed or pushed, so shipped-ref proof remains intentionally absent.
- The 50,000-row receipt isolates Discussion indexing and listener dispatch. Mounting 50,000 editor DOM blocks is a separate editor-virtualization concern, not hidden inside this feature claim.
