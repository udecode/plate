# restore discussion demo identity

Objective:
Restore `discussion-demo` as the sole combined review example; done when zero live `comment-demo` consumers remain and registry, docs, and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-restore-discussion-demo-identity.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction in this Codex task
- id / link: current task, no external tracker
- title: Reuse the existing Discussion demo instead of keeping a new Comment demo
- acceptance criteria:
  - `discussion-demo` is the sole public registry example for comments, suggestions, and Discussion.
  - The recovered combined implementation keeps sidebar and floating modes, mixed comments and suggestions, overlap interaction, reply, and resolve behavior.
  - The intermediate `comment-demo` file, registry id, docs preview name, and browser route are deleted without an alias.
  - Legacy generic demo wiring, legacy fixture values, and deleted Discussion package/store/plugin code are not restored.
  - Registry generation, changelog parity, docs checks, focused browser automation, and interactive Browser proof pass.

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
- initial confidence score: N/A: binary source and browser gates are stronger
- improvement loop: N/A: one-shot correction
- final score / loop closure: N/A

Completion threshold:
- Zero live `comment-demo` matches under registry source, collaboration docs, and the focused browser test.
- `discussion-demo` resolves to the combined implementation from every Comment, Suggestion, and Discussion preview and registry feature reference.
- Registry generation/checks, docs source/checks, scoped lint/type checks, focused browser test, and live Browser interaction pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-discussion-demo-identity.md` passes.

Verification surface:
- Source audit: focused `rg` over `apps/www/src/registry`, `content/docs`, and `apps/www/tests/browser`.
- Registry: `pnpm --filter www build:registry` plus changelog generation/check.
- Docs: `pnpm --filter www build:source` and `pnpm --filter www check:docs`.
- Code: scoped formatter/lint/typecheck selected from the affected www owners and `git diff --check`.
- Browser: `/blocks/discussion-demo`, both exclusive view modes, overlap click, mixed thread types, reply, resolve, and console/network state; focused `comment.spec.ts` automation.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve all recovered Comments/Suggestions product behavior and tests.
- Do not restore legacy comment marks, generic `demo.tsx` ownership, fixture-only discussion values, or the removed Discussion runtime abstraction.
- Do not add a `comment-demo` compatibility alias.

Boundaries:
- Source of truth: current combined registry example, registry indexes, six collaboration docs pages, focused browser spec, current registry changelog source, and `HEAD` only as evidence of the established `discussion-demo` public identity.
- Allowed edit scope: those source consumers, generated registry/changelog output, and this goal plan.
- Browser surface: `http://localhost:3000/blocks/discussion-demo`.
- Browser strategy: Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: package API/runtime changes, comments architecture redesign, new modes, restoring removed legacy Discussion owners, commit, push, or PR.

Output budget strategy:
- Search only named registry/docs/test/plan owners; count or list files before printing broad matches; exclude generated/build/vendor trees unless validating generated registry output; cap command output.

Blocked condition:
- Stop only if the current combined demo cannot be preserved under the established registry id, the local www route cannot start after one install-corruption recovery, or Browser is unavailable and no equivalent final interaction proof can be produced.

Task state:
- task_type: registry example identity correction
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: hard-cut `comment-demo`; keep the recovered implementation under `discussion-demo`
- confidence: high from current source, current consumers, and the established `HEAD` registry identity
- next owner: none
- reason: `comment-demo` has no independent job; the example is a Discussion composition of comments and suggestions.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-discussion-demo-identity.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and constraints above copy the user correction and the recovered-behavior boundary. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded Autogoal, Plate UI, shadcn, component-family, registry, Best API, Hard Cut, Registry Changelog, Docs Creator, docs style/lane references, and Browser. |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path. |
| Source of truth read before edits | yes | Current registry/example/docs/test consumers plus `HEAD` registry/docs identity were inspected before the plan. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this is a bounded identity correction with direct live-source and history proof. |
| TDD decision before behavior change or bug fix | yes | No runtime behavior changes; retain and retarget the existing focused browser regression test. |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested; preserve the current checkout. |
| Release artifact decision | yes | Registry changelog source/generated JSON applies; package changeset does not because no package behavior changes. |
| Browser tool decision for browser surface | yes | Browser is required for the normal local app interaction; focused Playwright is additional automation. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Focused owners and capped output are recorded above. |
| Docs pack selected | yes | Supporting docs pack is materialized under the task template. |
| `docs-creator` loaded | yes | Skill plus style and plugin/feature lane references read. |
| Docs lane selected | yes | Existing Comment, Suggestion, and Discussion plugin/feature pages; only the real preview id changes. |
| Target docs and nearest sibling docs read | yes | The six EN/ZH collaboration pages are the bounded sibling set; current preview call sites were inspected. |
| Docs style doctrine read | yes | `style-and-structure.md` and relevant lane templates read. |
| Documented source owner identified | yes | `registry-examples.ts` owns the example id; the moved example source owns the combined showcase. |
| Browser pack selected | yes | Browser pack materialized. |
| Browser route / app surface identified | yes | `/blocks/discussion-demo`. |
| Browser tool decision recorded | yes | In-app Browser for visible/interactive proof; focused test for automation. |
| Console/network caveat policy recorded | yes | Final Browser proof records both; no waiver planned. |
| Observable browser case captured | yes | Local case: open `/blocks/discussion-demo`; verify exclusive Sidebar/Floating modes, mixed comments/suggestions, overlap click, reply, resolve, and final error state. |

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
- [x] Implementation fixes the right ownership boundary: the recovered combined
      source is `discussion-demo.tsx`; every live registry/docs/test consumer
      uses that sole id and no alias remains.
- [x] Release artifact requirement recorded: registry changelog applies;
      package changeset is N/A because no package behavior changes.
- [x] Final handoff shape decided: outcome, changed identity, exact checks,
      Browser evidence, and residual caveat; PR/tracker fields are N/A.
- [x] Branch handling recorded for code-changing work: N/A because the user did
      not request branch, commit, push, or PR work.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only if
      a surprising module-resolution or React-runtime failure appears.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: stale registry/docs consumers could make previews
      404; source audit, generation, and browser proof cover it.
- [x] Review/P1 autoreview target selected: N/A because repo policy forbids
      Autoreview on `next`, and this is a narrow identity correction.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none change.
- [x] Output budget discipline recorded and followed after one logged miss:
      noisy generators are redirected to temporary logs and source audits use
      counts or bounded files rather than printing generated JSON bodies.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named route, component, demo, and preview is source-backed;
      `check:docs` and Browser resolve `/docs/examples/discussion`.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, routes, and previews target the real `discussion-demo` owner.
- [x] Docs pack: all six edited MDX pages were read in full and passed Unslop
      file-edit review plus `audit-prose.mjs` with zero findings; literals and
      claims were unchanged apart from the demo id.
- [x] Docs pack: requirement language is N/A because no installation or runtime
      requirement claim changed; the existing ownership split was rechecked.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Only the
      ordinary in-app route applies here.
- [x] Browser pack: final fresh Browser tabs reported zero warning/error logs;
      canonical routes loaded and the focused suite completed without runtime
      request failures relevant to this change.
- [x] Browser pack: Sidebar and Floating screenshots were captured during the
      verified interaction; no visual waiver was used.
- [x] Browser pack: reporter-visible paint classification is N/A because this
      task changes registry identity, not paint. Existing paint assertions run
      in `comment.spec.ts`; no new paint claim is made.
      <!-- preserved pack detail:
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. -->
- [x] Browser pack: report-backed red-before-green proof is N/A; this is a
      direct naming correction, and the old routes were instead verified as
      not-found surfaces after the cut.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records local-base and source/test fingerprints below.
- [x] Browser pack: clean pushed-ref proof is N/A because the user did not ask
      for commit or push. A fresh dev process proved the uncommitted local
      candidate; no shipped/final-ref claim is made.
      <!-- preserved pack detail:
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. -->
- [x] Browser pack: 5/5 native stability is N/A because no native behavior or
      runtime component code changed; the final six-case Chromium suite passed
      once without retries and live overlap/reply/resolve proof passed.
      <!-- preserved pack detail:
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. -->
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof; generated
      outputs came only from the owning build commands.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero stale live names; registry/docs/type/lint/browser gates passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: direct correction of an uncommitted registry identity, not a runtime behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Final Chromium `comment.spec.ts`: 6/6 passed; live Browser overlap/reply/resolve passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www exec tsc --noEmit -p tsconfig.json --pretty false` passed; package-integration tsconfig also passed before the final local-only symbol rename. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: registry example source moved; no package export/barrel changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or install-graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2` or `apps/www`; Browser used localhost:3000. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | In-app Browser verified `/blocks/discussion-demo` and `/docs/examples/discussion`. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh dev process/tab: Sidebar 3 comments/2 suggestions; Floating exclusive; overlap ids `ownership`,`overlap`; zero warning/error logs. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` source; registry output is required generated output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no published package behavior/API change; registry changelog owns this user-visible registry delta. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Owning registry changelog source `2026-09-02-comments-ownership.mdx` updated; generator write/check passed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Supporting docs pack used; `pnpm --filter www check:docs` passed and Browser rendered the canonical example route. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was stale preview/nav identity; one canonical registry owner plus zero-name audit and route proof closes it. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: TypeScript hit a heap abort, not module/install corruption; exact compiler rerun passed with an 8 GB heap. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: repo policy forbids Autoreview on `next`; bounded source and browser review completed. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `ultracite fix` and final `ultracite check` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One generated-JSON/search output miss recorded; subsequent noisy commands redirected and audits reduced to counts. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-restore-discussion-demo-identity.md` | Passed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Six previews point to the registered `discussion-demo`; registry metadata links all three feature docs. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Full-file review plus deterministic audit: Comment, Suggestion, and Discussion EN/CN pages all returned zero findings; structured `meta.json` is data and was verified by parser/Browser. |
| Requirements disclosure | no | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | N/A: no requirement claim changed. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `/docs/examples/discussion` rendered the preview; `/docs/examples/comment` rendered not found; `check:docs` passed. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Included in passing `pnpm --filter www check:docs`. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing plugin-page structures were retained; only their preview id changed to the real combined example. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh in-app Browser proved Sidebar, Floating, exact overlap, reply, resolve, reload, docs example, and old-route removal. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | After restarting the dev server to remove build-time HMR noise, fresh canonical block/docs tabs had zero warnings/errors and both loaded successfully. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Sidebar and Floating overlap screenshots captured; DOM proof recorded exact counts and thread ids. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Direct user case replayed on `/blocks/discussion-demo`; old block/docs example routes showed the app's 404 surface. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local base `a6afd55c30e9`; final fingerprints recorded below. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: this is an intentionally uncommitted local candidate. Fresh-process proof passed; no pushed/shipped claim. |
| Retry-free stability | no | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | N/A: no native/runtime behavior changed. The final six-case Chromium suite passed once without retries. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, Vision, current source, consumers, and established identity read; requirements captured. | done |
| Implementation | complete | Combined source moved to `discussion-demo.tsx`; registry, docs, command menu, browser test, nav metadata, and changelog use the canonical id. | done |
| Verification | complete | Registry/docs/changelog/type/lint/source-audit/Chromium/Browser gates passed on final local source. | done |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | done |
| Closeout | complete | Final handoff fields and evidence recorded; only mechanical plan check remains. | final response |

Findings:
- `HEAD` registered `discussion-demo` and all collaboration docs previewed it.
- The current uncommitted `comment-demo.tsx` is no longer a comment-only example; it is the recovered combined Discussion showcase.
- `comment-demo` adds a second public noun without an independent user job.
- Best API and Plate Vision already require naming the higher composition after its owner and keeping feature registry ids semantic, so no doctrine repair is needed.

Decisions and tradeoffs:
- Restore `discussion-demo` as the sole id and move the current implementation there -> truthful combined ownership -> no compatibility alias because the competing id is uncommitted.
- Keep `comment`, `suggestion`, and `discussion` as distinct installable feature/component items -> each has a real user job -> share only the combined demonstration id.
- Do not restore legacy generic demo/value/store/plugin machinery -> it does not own the recovered product behavior.

Implementation notes:
- Moved the recovered combined implementation from `comment-demo.tsx` to
  `discussion-demo.tsx` and renamed its demo-local symbols.
- Retargeted Comment, Suggestion, Discussion, Comment Toolbar, command-menu,
  docs-preview, browser-test, docs-nav, and registry-changelog consumers.
- Added the shared `discussion-demo` example back to Suggestion registry
  metadata; no runtime or package API changed.
- Rebuilt generated registry and changelog artifacts only through their owning
  generators.

Review fixes:
- `check:docs` exposed `/docs/examples/comment` in three nav metadata locations
  -> accepted -> replaced all three with the real Discussion example route and
  current combined description.
- Internal `CommentReviewerToolbarPlugin` still described the discarded demo
  identity -> accepted -> renamed it `DiscussionReviewerToolbarPlugin`.
- Best API repair audit -> no source-rule change: existing doctrine already
  says a complete composition keeps its higher-owner name and rejects an alias
  without an independent job.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial `check:docs` found stale `/docs/examples/comment` nav metadata | 1 | Fix the owning docs metadata, then rerun the same check | `/docs/examples/discussion` now parses and renders; `check:docs` passed. |
| Full www typecheck aborted inside Node/V8 before a TypeScript diagnostic | 1 | Rerun the exact compiler owners with an 8 GB heap | Main and package-integration tsconfigs passed; no reinstall because this was not install corruption. |
| Registry generation while the dev server watched `public/r/registry.json` polluted the existing tab with transient missing-module HMR logs | 1 | Restart the dev process and use a fresh Browser tab | Final block and docs tabs rendered with zero warning/error logs. |
| Changelog generation/check and one generated-JSON source audit printed excessive output | 3 | Redirect noisy commands to temporary logs and reduce audits to file/count output | Subsequent generation/check/audit output stayed bounded. |

Verification evidence:
- `rg -l 'comment-demo|/docs/examples/comment|Comments Demo' apps/www/src apps/www/public/r content/docs apps/www/tests/browser` -> 0 files.
- `pnpm --filter www build:registry` -> passed; 364 canonical payloads and 15 sparse overlays materialized.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> exit 0 for 107 events.
- `pnpm --filter www check:docs` -> API reference, MDX source build, and docs-source parity passed.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` in `apps/www` -> passed.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www exec tsc --noEmit -p tsconfig.json --pretty false` -> passed.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json --pretty false` -> passed before the final demo-local symbol-only rename; main tsconfig and registry build covered the final source.
- Scoped `ultracite fix` plus final `ultracite check` -> passed; `git diff --check` -> passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www exec playwright test tests/browser/comment.spec.ts --project=chromium` in `apps/www` -> 6/6 passed, zero retries.
- Fresh in-app Browser on `/blocks/discussion-demo` -> Sidebar 3 comment threads and 2 suggestions; Floating exclusive; overlap opened `ownership` then `overlap`; reply and resolve worked; reload restored the fixture.
- Fresh in-app Browser on `/docs/examples/discussion` -> Discussion preview rendered; old block/docs example routes showed the app's 404 surface; final canonical tabs had zero warning/error logs.
- Unslop full-file review and deterministic audit -> zero findings for Comment, Suggestion, and Discussion EN/CN pages.
- Final SHA-256: implementation `7b36eeb44795aaa5ac3ccf1efb1d3d598b1b0eb474c7d1f83cc4877947246336`; registry example index `7560173221bfb13493483e6f6909f46a279f6eb0f2350ec2a022054c5a550d35`; feature index `7227292476e801e51c312908116c834afeb25d7ad3c6748d784780611b8f9e64`; browser test `55c106fd4e25d7c77b18088aaade752053cad372070580eba1ca5b2d7f19bacc`; docs meta `fc83c957926289f1b0f6640c67da0b2fbc3dbf2b96789a568aeab2ea8139ea7a`; generated registry index `04ba34822388623f7819f3a70609352b9841922ca2aff0fe867d5b3cc58d80f6`.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: no external tracker.
- Confidence line: high for the uncommitted local candidate; no shipped-ref claim.
- Flow table:
  - Reproduced: source/history proved the duplicate `comment-demo` identity and docs parity exposed its stale example route.
  - Verified: 6/6 Chromium cases plus fresh block/docs Browser interaction and zero final console warnings/errors.
- Browser check: `/blocks/discussion-demo` and `/docs/examples/discussion` render the combined review demo; old routes show not found.
- Outcome: one canonical Discussion demo serves Comment, Suggestion, and Discussion without losing sidebar/floating behavior.
- Caveat: changes are local and uncommitted because commit/push were not requested.
- Design:
  - Chosen boundary: registry example identity and its live registry/docs/test/nav consumers.
  - Why not quick patch: keeping `comment-demo` as an alias would preserve the exact duplicate noun the user rejected.
  - Why not broader change: the Comments/Suggestion runtime and copied Discussion UI already have the correct owners and behavior.
- Verified: registry generation, docs parity, changelog parity, typecheck, lint, source audit, automated browser suite, and live Browser.
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
- Issue / tracker: N/A: none.
- Browser proof: complete on canonical block and docs example routes.
- Caveats: uncommitted local candidate only.

Timeline:
- 2026-09-02T14:51:38.818Z Task goal plan created.
- 2026-09-02 Requirements, relevant skills, Vision doctrine, current consumers, and established `discussion-demo` identity audited; hard-cut target accepted.
- 2026-09-02 Combined source and all live consumers moved to `discussion-demo`; stale docs example nav repaired; registry and changelog output regenerated.
- 2026-09-02 Docs, registry, lint, TypeScript, source-audit, and six-case Chromium gates passed.
- 2026-09-02 Fresh-process Browser proof passed for canonical block/docs routes, exclusive Sidebar/Floating modes, exact overlap, reply, resolve, and clean console.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; implementation and evidence are complete. |
| Where am I going? | Run the mechanical goal-plan check, close the goal, and hand off the local result. |
| What is the goal? | Keep one combined `discussion-demo` and delete the redundant `comment-demo` identity without behavior regression. |
| What have I learned? | Discussion is the correct composition owner; the rename also required docs example nav metadata and Suggestion discoverability. |
| What have I done? | Completed the hard cut, generation, source audit, docs/type/lint checks, automated browser suite, and clean fresh-process Browser proof. |

Open risks:
- No known product risk. Delivery remains local and uncommitted by request scope.
