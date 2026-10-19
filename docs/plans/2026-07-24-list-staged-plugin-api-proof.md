# List staged plugin API proof

Objective:
Prove staged List plugin APIs; done when dependent inference, focused behavior
tests, package typecheck, lint, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-list-staged-plugin-api-proof.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user instruction
- id / link: current Codex task
- title: Try staged `.extendApi` / `.extendTx` capability inference in List
- acceptance criteria:
  - Move List previous/next traversal into an early scoped query API.
  - Consume that inferred API from later List builder stages.
  - Prove a plugin with `dependencies: [BaseListPlugin]` sees the query type.
  - Preserve current List behavior.
  - Do not repair or edit skills in this packet; skill repair happens later.

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
- initial confidence score: N/A: command threshold is stronger
- improvement loop: Run a failing dependent proof, implement the narrow staged
  chain, then iterate on focused tests/typecheck/lint/review.
- final score / loop closure: N/A: close on the named binary gates

Completion threshold:
- `BaseListPlugin` publishes inferred flat `getPrevious` and `getNext` query
  methods from an early `.extendApi()` stage.
- Later List API, tx, and behavior stages consume the accumulated `api` type
  without casts or explicit callback parameter annotations.
- A required dependent plugin compiles and exercises the List query API.
- Focused List fast/slow tests, `@platejs/list` build/typecheck, scoped lint,
  browser smoke, source audit, and autoreview have no accepted actionable
  failures.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-list-staged-plugin-api-proof.md` passes.

Verification surface:
- `packages/list/src/lib/BaseListPlugin.spec.tsx`
- `packages/list/src/lib/BaseListPlugin.slow.tsx`
- `packages/list/src/react/ListPlugin.spec.tsx`
- `pnpm turbo typecheck --filter=./packages/list`
- `pnpm --filter @platejs/list build`
- `pnpm --filter @platejs/list lint:fix`
- Browser smoke at `/blocks/list-demo`
- Focused source audit for staged APIs, stale raw calls, skill immutability, and
  package exports
- Dirty-local autoreview of the bounded List packet

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not edit `.agents/**` or any skill source/generated file.
- Do not add casts, explicit `editor`/`tx` callback annotations, compatibility
  wrappers, new files, or nested API taxonomy.
- Keep transaction reads correct against the active `tx` snapshot.

Boundaries:
- Source of truth: `packages/list/src/lib/BaseListPlugin.tsx`, its existing test
  families, Core builder/type tests, and `origin/main` package exports.
- Allowed edit scope: `packages/list/src/lib/BaseListPlugin.tsx`, existing List
  test families, `.changeset/list-scoped-api.md`, and this goal plan.
- Browser surface: `/blocks/list-demo`.
- Browser strategy: Browser smoke after package proof. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local request, no issue/Linear target.
- Non-goals: skill repair, Core builder redesign, React API redesign, unrelated
  stale List docs, commits, pushes, or PR creation.

Output budget strategy:
- Read exact List/Core files and bounded line ranges; cap searches with
  `--glob`, `head`, and tool output limits; exclude generated/public registry,
  templates, build output, `node_modules`, `.next`, and `.turbo`.

Blocked condition:
- Stop only if the Core builder cannot carry accumulated generic query methods
  into dependent contexts without a broader public generic redesign, or the
  shared checkout prevents all focused List verification after one prescribed
  reinstall retry.

Task state:
- task_type: package API refactor and inference proof
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: implement the accepted staged capability chain
- confidence: high
- next owner: plate-plugin-creator
- reason: Core already proves multiple `.extendApi()` calls accumulate types;
  List needs package-owned adoption and dependent proof.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-list-staged-plugin-api-proof.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and explicit no-skill-edit boundary copied above before implementation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `plate-plugin-creator`, its three required references, `best-api` target from the immediately preceding review, `autogoal`, and `changeset`; no skill edits allowed |
| Active goal checked or created | yes | `get_goal` returned none; created this goal |
| Source of truth read before edits | yes | Read current List owner, Core staged API test/types, current docs contract, existing changeset, and `origin/main` List barrels |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused `rg` found no applicable List staged-API solution |
| TDD decision before behavior change or bug fix | yes | Add dependent inference/runtime proof before source refactor; preserve existing behavior suites |
| Branch decision for code-changing task | no | N/A: user requested edits in the current checkout and no PR/branch |
| Release artifact decision | yes | Update existing `.changeset/list-scoped-api.md` against `origin/main` |
| Browser tool decision for browser surface | yes | Browser smoke on `/blocks/list-demo`; Chrome/Computer not needed |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact bounded reads/searches only; generated/build trees excluded |
| Package/API pack selected | yes | `package-api` materialized |
| Public surface or package boundary identified | yes | `@platejs/list` scoped API on `BaseListPlugin` |
| Release artifact path selected | yes | Existing `.changeset/list-scoped-api.md` |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` before release edit |
| Barrel/export impact decision recorded | yes | No public file/export topology change; no barrel generation expected |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      is recorded with reason. List owns the early query family; Core already
      carries staged and dependency-tree inference correctly.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: concise local feature/refactor result, exact
      tests/browser proof, and caveats; no PR/tracker.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: current checkout requested;
      no PR or branch operation authorized.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. Run `pnpm run reinstall`
      once only for the documented missing-module/mixed-install failure shape.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All package commands run from
      `/Users/zbeyens/git/plate-2`; browser proof uses its local `www` app.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: transaction-aware reads could accidentally use
      `editor.read`; proof must exercise an explicit active transaction state.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work: staged query block and replacements in
      `BaseListPlugin.tsx`, two new query tests, and query prose added to the
      existing List changeset; exclude prior List/shared-checkout work and plan.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: user explicitly deferred skill work; source audit must prove no
      `.agents/**` edits.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: update the existing List package changeset.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: package source.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: published API delta exists.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Hard cut from raw main-era helpers to scoped flat methods; no aliases.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. Existing List changeset updated; no barrel topology change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Pass: 112/112 tests, 14/14 typecheck tasks, build, lint, Browser, source audit, diff check, and autoreview |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Red proof: 44 pass, 1 fail because `editor.api.list.getPrevious` was absent |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Fast/React 49/49; slow 63/63; active-transaction and required-dependent rows pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/list` -> 14/14 tasks |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no file or export topology change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, dependency, or install-graph change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: user deferred skill repair; no `.agents/**` write occurred in this packet |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Package commands ran in `/Users/zbeyens/git/plate-2`; Browser used its local `www` app |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | `/blocks/list-demo` rendered and List outdent interaction preserved |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | HTTP 200; Disc item became paragraph after Home+Backspace; 0 console errors/warnings |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Existing `.changeset/list-scoped-api.md` updated for flat scoped queries |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: package source change, not registry-only |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no user reference docs/content change; only changeset and goal ledger |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Active transaction could read stale state; dedicated tx test proves the explicit state view sees uncommitted insertion |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Bounded dirty-local review exited 0 with no accepted/actionable findings |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request PR work |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: direct local request, no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/list lint:fix` -> pass |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches/review were bounded; one broad skill-mtime probe overflowed and was abandoned without affecting source |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-list-staged-plugin-api-proof.md` | Pass recorded after ledger closure |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Two staged APIs, one tx, one extension; no stale `getPreviousList`/`getNextList`; no export topology change |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/list` API/type/runtime delta |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `@platejs/list` major changeset updated; no forbidden package/version |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package changeset applies |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | 112/112 tests; typecheck 14/14; package build passes |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file or barrel change |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements, skills, source, baseline, release owner, and failing proof recorded | implementation |
| Implementation | complete | early query API, dependent use, tx use, and lazy extension use implemented without casts | verification |
| Verification | complete | 112/112 List tests, typecheck 14/14, build/lint, Browser interaction, source audit, diff check, and autoreview green | closeout |
| PR / tracker sync | complete | N/A: neither requested nor linked | closeout |
| Closeout | complete | Final contract filled; completion checker passes | final response |

Findings:
- Core's staged builder already accumulates API types across multiple
  `.extendApi()` calls.
- Current List docs claim previous/next domain queries while the current
  descriptor publishes neither method.
- Required dependency installation works at runtime; the new dependent test
  reaches `editor.api.list`, then fails exactly at the missing query.
- `extendExtension` factories are assembled before plugin API publication.
  Destructuring `{ api }` there snapshots the empty pre-publication value;
  retaining the typed context and reading `context.api` inside runtime
  callbacks resolves the published API lazily. `.extendApi` and `.extendTx`
  stages can destructure accumulated `api`.

Decisions and tradeoffs:
- Publish `getPrevious` and `getNext` as one early query family; keep the generic
  sibling traversal algorithm lexical inside that factory.
- Keep the optional state-view parameter so later tx/behavior stages can read
  the active transaction snapshot instead of stale `editor.read`.
- Do not publish `getSibling`: its callback-heavy shape is traversal machinery,
  not a clean dependent job.

Implementation notes:
- Added one early inferred query stage and retained later API/tx/behavior stages.
- Kept `getSibling` lexical because dependents need domain queries, not the
  callback-heavy traversal mechanism.
- Kept extension access lazy through `context.api` because eager destructuring
  occurs before API publication.

Review fixes:
- Autoreview accepted the staged publication, dependent inference,
  transaction-state propagation, lazy extension access, flat names, and lack
  of compatibility aliases; no source fix required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected red test: `editor.api.list.getPrevious is not a function` | 1 | Add the early staged query API, then rerun the exact test | Resolved: dependent proof passes |
| Eager `{ api }` destructuring in `extendExtension` captured the pre-publication empty API and caused 22 focused failures | 1 | Preserve the extension context and read `context.api` lazily inside runtime callbacks | Resolved: focused suite 46/46, then full fast/React 49/49 and slow 63/63 |

Verification evidence:
- Red proof: `bun test ./packages/list/src/lib/BaseListPlugin.spec.tsx` in
  `/Users/zbeyens/git/plate-2` -> 44 pass, 1 fail at the dependent call because
  the query is not yet published.
- `bun test ./packages/list/src/lib/BaseListPlugin.spec.tsx` -> 46 pass after
  staged API and lazy extension-context repair.
- `bun test ./packages/list/src/lib/BaseListPlugin.spec.tsx ./packages/list/src/react/ListPlugin.spec.tsx` -> 49 pass.
- `bun test ./packages/list/src/lib/BaseListPlugin.slow.tsx` -> 63 pass.
- `pnpm turbo typecheck --filter=./packages/list` -> 14/14 tasks.
- `pnpm --filter @platejs/list build` -> pass.
- `pnpm --filter @platejs/list lint:fix` -> 13 files checked, one formatted.
- Browser `/blocks/list-demo` -> HTTP 200; `Disc 1` changed from
  `plite-indent-1 plite-listStyleType-disc`, role `listitem`, to paragraph
  styling with no role after Home+Backspace; console errors/warnings: 0.
- `git diff --check -- <bounded files>` -> pass.
- Focused source audit -> two `.extendApi()` stages; one `.extendTx()`; one
  `.extendExtension()`; no stale `getPreviousList`, `getNextList`, or extracted
  sibling helper under `packages/list/src`.
- Dirty-local autoreview of the bounded packet -> exit 0, no
  accepted/actionable findings.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local request
- Confidence line: high; all named gates pass
- Flow table:
  - Reproduced: red dependent test, 44 pass / 1 fail; browser N/A before source
  - Verified: 112/112 List tests and live Browser interaction
- Browser check: `/blocks/list-demo` HTTP 200, list-to-paragraph interaction
  preserved, 0 console errors/warnings
- Outcome: staged plugin APIs propagate through later stages and required
  dependents without Core changes, casts, or callback annotations
- Caveat: `extendExtension` must access `context.api` lazily at runtime; eager
  destructuring captures the pre-publication API
- Design:
  - Chosen boundary: early List-owned flat query API
  - Why not quick patch: raw lexical calls cannot be inferred by dependents
  - Why not broader change: Core already accumulates staged and dependency-tree
    types correctly
- Verified: tests, typecheck, build, lint, Browser, source audit, diff check,
  autoreview
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
- Issue / tracker: N/A: no target
- Browser proof: `/blocks/list-demo` interaction green, console clean
- Caveats: skill doctrine repair intentionally deferred by the user

Timeline:
- 2026-07-24T11:08:18.985Z Task goal plan created.
- 2026-07-24 Red proof added and run: required dependent resolves List but
  `getPrevious` is absent.
- 2026-07-24 Staged API implemented; diagnosed extension publication timing and
  switched runtime behavior callbacks to lazy `context.api`.
- 2026-07-24 Package tests/typecheck/build/lint and live browser interaction
  passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | Prove staged List API inference through a required dependent without skill edits |
| What have I learned? | Staged API/dependency inference works; editor-extension API access must stay lazy until runtime publication |
| What have I done? | Implemented the query family and passed tests, typecheck, build, lint, Browser, source audit, and autoreview |

Open risks:
- No open source blocker. Public third-parameter state is an advanced
  composition escape, but the focused transaction test proves it reads
  inserted uncommitted nodes. Skill doctrine repair remains intentionally
  deferred.
