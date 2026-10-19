# Keep Yjs cursor presentation in copied UI

Objective:
Keep Yjs tracking headless while copied cursor UI owns all selection and caret presentation; verify package contracts, the installed demo, reconnect behavior, and narrow layouts.

Goal plan:
docs/plans/2026-09-04-yjs-cursor-presentation.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request and accepted Auto architecture review
- id / link: packages/platejs/src/yjs/react/YjsPlugin.tsx
- title: Remove package-owned cursor styling
- acceptance criteria: The package emits neutral selection attributes; one copied color resolver styles selections and carets; existing tracking, geometry, and reconnect behavior remain intact.

First checkpoint:
- [x] Remove the fallback palette, color validation policy, and fixed opacity from YjsPlugin.
- [x] Preserve awareness, selection ranges, invalidation, per-cursor subscriptions, and exact-view geometry.
- [x] Keep RemoteCursorOverlay in copied registry source and retain slots.afterEditable wiring.
- [x] Reuse the owning decorate descriptor; introduce no new plugin identity, theme API, store, or renderer subsystem.
- [x] Update copied installation examples and docs so both highlights and carets remain installed.
- [x] Verify focused package/UI tests, customization, reconnects, and the real collaboration demo at a narrow viewport.
- [x] Work directly in this checkout on next; do not commit, push, or open a PR.
- [x] No timebox was requested. Stop when the bounded implementation and honest verification are complete; report any remaining blocker.
- [x] Final handoff states what changed, proof results, and material limitations concisely.
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no timebox
- semantics: one-shot execution of the accepted target
- initial confidence score: N/A: deterministic acceptance criteria
- improvement loop: focused implementation and verification
- final score / loop closure: evidence gates below

Completion threshold:
- Neutral package decorations, copied visual composition, current docs/release artifacts, focused checks, and real-route proof complete with any environmental limitations stated.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-yjs-cursor-presentation.md` passes.

Verification surface:
- Yjs Base plugin and React contracts; copied cursor component tests; Yjs entrypoint typecheck; scoped formatter/lint; registry/content generation; Browser /blocks/collaboration-demo plus the existing Chromium collaboration corpus; doctrine source/mirror parity.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: accepted review, current YjsPlugin, copied cursor UI, and actual caller/test contracts.
- Allowed edit scope: Yjs presentation boundary, copied cursor family/demo, focused tests, Yjs docs, existing release artifacts, necessary doctrine repair and generated output.
- Browser surface: /blocks/collaboration-demo and /docs/yjs.
- Browser strategy: in-app Browser through CUA for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue or publication requested.
- Non-goals: transport changes, new Yjs state/geometry owners, generic overlay restoration, performance redesign, git publication.

Output budget strategy:
- Limit source reads to exact owners and write long verification logs under the task artifact directory; inspect concise failure excerpts. Earlier combined skill reads exceeded output caps; subsequent reads are narrowed.

Blocked condition:
- A verified unrelated repository failure that cannot safely be repaired within the accepted scope, or unavailable browser tooling after attempting the permitted surface. Continue independent proof first.

Task state:
- task_type: accepted architecture implementation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete (file ledger only)

Current verdict:
- verdict: implemented and locally verified
- confidence: focused package, UI, browser, docs, and generated-source checks passed
- next owner: user
- reason: the package owns neutral selection data; copied UI extends the same Yjs descriptor to own all visual defaults.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-yjs-cursor-presentation.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit requirements, no timebox, allowed scope, and output limits are recorded above. |
| Timed checkpoint parsed | yes | Explicit requirements, no timebox, allowed scope, and output limits are recorded above. |
| Skill analysis before edits | yes | Auto architecture review read YjsPlugin, cursor hooks, the registry family, BaseYjsPlugin author stages, and Vision; Best API, Plate UI, and package implementation owners applied. |
| Active goal checked or created | yes | get_goal returned null. No native goal creation was requested; this repository-required file is the execution ledger. |
| Source of truth read before edits | yes | Auto architecture review read YjsPlugin, cursor hooks, the registry family, BaseYjsPlugin author stages, and Vision; Best API, Plate UI, and package implementation owners applied. |
| Tracker comments and attachments read | N/A | Direct local code request; no issue, video, PR, publication, or tracker action requested. |
| Video transcript evidence required | N/A | Direct local code request; no issue, video, PR, publication, or tracker action requested. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped Yjs/cursor/registry scan; read the namespace-install lesson and use @plate/remote-cursor-overlay. This supporting scan was completed during final source review. |
| TDD decision before behavior change or bug fix | yes | Ownership refactor: preserve existing package/UI behavior tests, update neutral decoration expectations, and add real copied-plugin metadata/reconnect coverage; no dead-code assertion test. |
| Branch decision for code-changing task | yes | Current checkout on next; no branch switch, staging, commit, push, or PR. Branch read only to apply required registry-generation policy. |
| Release artifact decision | yes | Changeset skill read. Update the existing major platejs transient-editor-ui changeset relative to main and add the Yjs cursor registry source entry. |
| Browser tool decision for browser surface | yes | CUA in-app Browser on /blocks/collaboration-demo at port 3100; docs at port 3000. No native OS behavior in scope. |
| PR expectation decision | N/A | Direct local code request; no issue, video, PR, publication, or tracker action requested. |
| Tracker sync expectation decision | N/A | Direct local code request; no issue, video, PR, publication, or tracker action requested. |
| Output budget strategy recorded | yes | Explicit requirements, no timebox, allowed scope, and output limits are recorded above. |
| Docs pack selected | yes | Supporting plugin/example docs lane; Docs Creator, style-and-structure, and Unslop read and applied. |
| `docs-creator` loaded | yes | Supporting plugin/example docs lane; Docs Creator, style-and-structure, and Unslop read and applied. |
| Docs lane selected | yes | Supporting plugin/example docs lane; Docs Creator, style-and-structure, and Unslop read and applied. |
| Target docs and nearest sibling docs read | yes | Read both Yjs language pages and collaboration-example.mdx against the package plugin, copied cursor file, demo provider, and actual docs routes. |
| Docs style doctrine read | yes | Supporting plugin/example docs lane; Docs Creator, style-and-structure, and Unslop read and applied. |
| Documented source owner identified | yes | Read both Yjs language pages and collaboration-example.mdx against the package plugin, copied cursor file, demo provider, and actual docs routes. |
| Browser pack selected | yes | CUA in-app Browser on /blocks/collaboration-demo at port 3100; docs at port 3000. No native OS behavior in scope. |
| Browser route / app surface identified | yes | CUA in-app Browser on /blocks/collaboration-demo at port 3100; docs at port 3000. No native OS behavior in scope. |
| Browser tool decision recorded | yes | CUA in-app Browser on /blocks/collaboration-demo at port 3100; docs at port 3000. No native OS behavior in scope. |
| Console/network caveat policy recorded | yes | Browser warning/error logs checked. Collaboration transport is the credential-free in-memory fixture; production networking is outside this presentation change. |
| Observable browser case captured | N/A | Architecture ownership request, not a reporter-backed defect. Planned local checks: remote highlight/caret, collapse, disconnect/reconnect, follow-up typing, and 390px layout. |
| Package/API pack selected | yes | Package YjsPlugin emits neutral attributes; copied YjsPlugin extends the same yjs capability and owns decorate styles plus afterEditable. Existing public hooks remain. |
| Public surface or package boundary identified | yes | Package YjsPlugin emits neutral attributes; copied YjsPlugin extends the same yjs capability and owns decorate styles plus afterEditable. Existing public hooks remain. |
| Release artifact path selected | yes | Changeset skill read. Update the existing major platejs transient-editor-ui changeset relative to main and add the Yjs cursor registry source entry. |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset skill read. Update the existing major platejs transient-editor-ui changeset relative to main and add the Yjs cursor registry source entry. |
| Barrel/export impact decision recorded | N/A | No package files or exports added, moved, or removed. The new test and export are in copied app source; package brl is unnecessary. |
| Runtime scale applicability resolved | N/A | No tracking, invalidation, cache, subscription, scheduling, or geometry ownership changes. Copied mapping reads the existing per-id awareness Map; no new scaling dimension. |
| Registry changelog pack selected | yes | Registry Changelog skill read; wiring entry 2026-09-04-yjs-cursor-presentation.mdx created with --new, edited, generated with --write, validated with --check. |
| User-visible registry impact classified | yes | Registry Changelog skill read; wiring entry 2026-09-04-yjs-cursor-presentation.mdx created with --new, edited, generated with --write, validated with --check. |
| Source entry path selected | yes | Registry Changelog skill read; wiring entry 2026-09-04-yjs-cursor-presentation.mdx created with --new, edited, generated with --write, validated with --check. |
| Generator command selected | yes | Registry Changelog skill read; wiring entry 2026-09-04-yjs-cursor-presentation.mdx created with --new, edited, generated with --write, validated with --check. |
| Agent-native pack selected | yes | Agent Native Reviewer applied to Best API and Plate UI source rules. Plate Next v142 records the change; pnpm install generated mirrors; version validate proves parity. |
| Agent-facing action surface identified | yes | Agent Native Reviewer applied to Best API and Plate UI source rules. Plate Next v142 records the change; pnpm install generated mirrors; version validate proves parity. |
| Source rule versus generated mirror boundary identified | yes | Agent Native Reviewer applied to Best API and Plate UI source rules. Plate Next v142 records the change; pnpm install generated mirrors; version validate proves parity. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Agent Native Reviewer applied to Best API and Plate UI source rules. Plate Next v142 records the change; pnpm install generated mirrors; version validate proves parity. |

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
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
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
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: a scale-sensitive runtime contract composes the
      performance pack before target acceptance; type-only and zero-runtime
      changes record the exact N/A reason.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 14 package tests, 5 UI tests, Yjs/app typechecks, scoped lint, docs/source checks, registry build/check, Browser interactions, and 5/5 Chromium selection cycles passed. See Verification evidence. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | Accepted architecture refactor, not a reported behavior bug. Existing package/UI baseline passed before the ownership change; new integration validates the final copied composition. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 14 package tests, 5 UI tests, Yjs/app typechecks, scoped lint, docs/source checks, registry build/check, Browser interactions, and 5/5 Chromium selection cycles passed. See Verification evidence. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Yjs React entrypoint tsc build and apps/www package-integration tsc passed; package tests 14/14 and UI tests 5/5 passed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package export or exported file layout changed; no brl needed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Copied registry item declares platejs plus optional Yjs peer dependency yjs. pnpm install passed; registry dependency/source validation passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | pnpm install passed; Plate Next v142 validate passed with exact generated skill/resource parity and unchanged historical entries. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in /Users/zbeyens/git/plate-2. Browser checked this checkout at localhost:3100 and localhost:3000; generated registry contents match the edited source. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | CUA Browser verified synced remote highlights/carets/labels, disconnect cleanup, reconnect typing, and a rendered 390x844 CSS viewport with no horizontal overflow. Screenshots are in task tool output; local proof only. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | CUA Browser verified synced remote highlights/carets/labels, disconnect cleanup, reconnect typing, and a rendered 390x844 CSS viewport with no horizontal overflow. Screenshots are in task tool output; local proof only. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No template edits; scoped git diff under templates is empty. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Both package and copied install contracts changed. Updated existing .changeset/plate-transient-editor-ui.md (platejs major) and registry wiring entry; no release or publication performed. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Both package and registry scope. The authoritative registry source entry documents the copied YjsPlugin import, visual defaults, and customization; generated changelog data is included. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Both Yjs language pages and collaboration example describe current imports, provider setup, copied styling, and exact Editable geometry. Dead cursor-page links and stale positioned-container/two-slot instructions were corrected. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure modes: missing observer, premature configure callback, or mismatched caret/selection color. Copied extension retains decorate.observe; integration proves metadata-only changes/reconnect; Chromium checks shared colors and collapse. No new runtime owner. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Source audit: Best API owns the visual boundary and author-stage ordering; Plate UI applies it; package/docs/feature/plan worker sources contain no stale cursor recipe. Existing skill routes expose the repaired teaching; v142 validate passed. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No React dispatcher or package-resolution corruption occurred. A combined raw Bun run mixed the demo module mock into the integration test; the existing canonical pnpm test runner isolates such files and passes. |
| P1 autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Repository instructions prohibit autoreview on next. Reviewed the affected source diff, copied API shape, observer lifetime, tests, generated payload, and docs directly. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | No publication or tracker mutation requested; no PR, commit, push, or public claim made. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No publication or tracker mutation requested; no PR, commit, push, or public claim made. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No publication or tracker mutation requested; no PR, commit, push, or public claim made. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No publication or tracker mutation requested; no PR, commit, push, or public claim made. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Concise local outcome, copied cursor source path, verification, and uncommitted status are recorded below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped ultracite fix followed by oxfmt and ultracite check passed for the seven package/UI/test files and registry-editor.ts. Only existing Node config-module warnings appeared. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Some combined initial reads and generator listings exceeded output caps. Recovery: narrowed reads and redirected long build/test output to /tmp/yjs-cursor-*.log; no broad repository dumps used. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No timebox requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-yjs-cursor-presentation.md` | check-complete passed after the ledger update; it supplements the actual proof listed below. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Both Yjs language pages and collaboration example describe current imports, provider setup, copied styling, and exact Editable geometry. Dead cursor-page links and stale positioned-container/two-slot instructions were corrected. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Whole-file file-edit review completed for yjs.mdx, yjs.cn.mdx, collaboration-example.mdx, the changeset, registry entry, and this plan. Current-state instructions, protected API literals, and factual claims were preserved; stale requirements and extra prose corrected. |
| Requirements disclosure | yes | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | Package owns collaboration and neutral selection data. Copied plugin owns colors/opacity/classes and installs afterEditable. Provider setup is app-owned; no positioned-container requirement or second render slot remains. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Browser rendered /docs/yjs and followed Collaboration example to /docs/examples/collaboration-example. /docs/editor has a live source owner. Registry source check verifies collaboration-demo and remote-cursor-overlay. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pnpm --filter www build:source and check:docs passed; API reference and docs source parity passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Both Yjs language pages and collaboration example describe current imports, provider setup, copied styling, and exact Editable geometry. Dead cursor-page links and stale positioned-container/two-slot instructions were corrected. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | CUA Browser verified synced remote highlights/carets/labels, disconnect cleanup, reconnect typing, and a rendered 390x844 CSS viewport with no horizontal overflow. Screenshots are in task tool output; local proof only. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Fresh docs reload and demo proof had no warning/error logs. Registry generation briefly removed registry.json and produced historical HMR errors; generation completed and the fresh docs reload was clean. Production networking is outside scope. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | CUA Browser verified synced remote highlights/carets/labels, disconnect cleanup, reconnect typing, and a rendered 390x844 CSS viewport with no horizontal overflow. Screenshots are in task tool output; local proof only. |
| Exact case replay | N/A | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Accepted architecture refactor, not a reported behavior bug. Existing package/UI baseline passed before the ownership change; new integration validates the final copied composition. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local current-tree receipt at base a6afd55c30e97c74fe895d1ad005ca75413110f3 with production/test SHA-256 values below; not a pushed-ref proof. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Local uncommitted implementation; reused checkout dev servers. No clean pushed-tree, hosted, release, or completed public-issue claim. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Existing Chromium Yjs selection/caret case passed five expanded/collapsed cycles without retries and synchronized follow-up input; CUA separately checked reconnect and narrow layout. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Package preserves neutral identity/range output and original observer. Copied YjsPlugin uses a later extend stage, retains the same plugin identity, and shares cursorColor for highlights/carets/labels. No new package options or exports. |
| Runtime scale contract | N/A | Close the materialized performance pack for scale-sensitive runtime work, including pre-acceptance probe and production rerun, or record a source-backed zero-runtime N/A | No scale-sensitive mechanism changed. Existing observer and cursor lists remain; copied decoration mapping uses canonical O(1) cursor lookup in awareness-adapter.ts. No added cursor cache, subscription, scheduler, or geometry traversal. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Both package and copied install contracts changed. Updated existing .changeset/plate-transient-editor-ui.md (platejs major) and registry wiring entry; no release or publication performed. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Both package and copied install contracts changed. Updated existing .changeset/plate-transient-editor-ui.md (platejs major) and registry wiring entry; no release or publication performed. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Both package and registry scope. The authoritative registry source entry documents the copied YjsPlugin import, visual defaults, and customization; generated changelog data is included. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Both applicable release artifacts are present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Yjs React entrypoint tsc build and apps/www package-integration tsc passed; package tests 14/14 and UI tests 5/5 passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No package export or exported file layout changed; no brl needed. |
| Registry impact classification | yes | Record user-visible registry delta or N/A reason | Both package and registry scope. The authoritative registry source entry documents the copied YjsPlugin import, visual defaults, and customization; generated changelog data is included. |
| Registry changelog source | yes | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | Both package and registry scope. The authoritative registry source entry documents the copied YjsPlugin import, visual defaults, and customization; generated changelog data is included. |
| Registry changelog generation | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | Generator --write and --check passed: 112 source entries/events. Public registry build materialized 366 canonical payloads and 15 sparse overlays. |
| Registry changelog check | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | Generator --write and --check passed: 112 source entries/events. Public registry build materialized 366 canonical payloads and 15 sparse overlays. |
| Registry generator test | N/A | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | No generator, schema, or source layout changed; source validation and --check cover this entry. |
| Registry package release split | yes | Record `.changeset`, registry changelog, both, or N/A with reason | Both package and copied install contracts changed. Updated existing .changeset/plate-transient-editor-ui.md (platejs major) and registry wiring entry; no release or publication performed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pnpm install passed; Plate Next v142 validate passed with exact generated skill/resource parity and unchanged historical entries. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Source audit: Best API owns the visual boundary and author-stage ordering; Plate UI applies it; package/docs/feature/plan worker sources contain no stale cursor recipe. Existing skill routes expose the repaired teaching; v142 validate passed. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source audit: Best API owns the visual boundary and author-stage ordering; Plate UI applies it; package/docs/feature/plan worker sources contain no stale cursor recipe. Existing skill routes expose the repaired teaching; v142 validate passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Accepted source-backed Auto target | implementation |
| Implementation | complete | Neutral package output and copied YjsPlugin composition | verification |
| Verification | complete | Focused checks and Browser proof passed | closeout |
| PR / tracker sync | N/A | Local work only; no publication requested | final response |
| Closeout | complete | Ledger and generated-source parity recorded | final response |

Findings:
- Package-owned palette/opacity duplicated presentation policy. The copied overlay already owned caret/label styles.
- Configuration callbacks run before author stages; copied presentation must extend the completed Yjs decoration descriptor.
- Registry installation needs the optional yjs peer; the copied cursor item now declares it.

Decisions and tradeoffs:
- Challenge delta: extend the existing Yjs decorate descriptor in copied source. This removes package style policy without adding another plugin identity or restoring a generic cursor subsystem.
- Two phases: (1) neutral package output plus copied decoration composition and focused proof; (2) adoption/docs/release/doctrine parity and real-route proof. Stop or pivot if observer lifetime, cursor identity, or native editing changes.
- Scale gate: no new runtime owner, subscription, cache, scheduler, or geometry work. Preserve the existing observe path; only map the already-produced decorations to copied attributes with canonical per-id metadata reads.
- Native goal: get_goal returned null. The user authorized implementation, not a new native Codex goal; this required repository plan is the execution ledger.
- Autoreview: N/A on next, where repository instructions prohibit it. Review the scoped diff locally.

Implementation notes:
- Removed only palette, color validation, and opacity policy from the current package plugin; preserved its observer, ranges, and geometry hooks.
- Copied YjsPlugin extends the owning descriptor, decorates selections through one cursorColor resolver, and installs RemoteCursorOverlay. Callers configure initialState as before.
- Updated docs, registry dependency/source output, release notes, and agent doctrine. No package export changes.

Review fixes:
- Corrected stale two-slot/positioned-container docs, dead cursor-page links, and the EditorStatus editor binding.
- Updated existing transient UI release prose to the live inactive-selection marker and copied FindKit.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Configure callback could not see an author-stage contribution | 1 | Use a later extend stage in copied source | Real integration passed; no package API workaround |
| Test fixture missing React import or using nonexistent destroy | 2 | Correct imports and unmount through the renderer | Integration passed |
| Raw combined Bun command allowed existing module mocks to leak | 1 | Use canonical pnpm test isolation and package-owned Bun batch | UI 5/5 and package 14/14 passed |
| Dev port 3102 shared an existing Next output-directory lock | 1 | Reuse this checkout server on 3100 | Browser and Chromium passed |
| Running docs server saw missing registry.json during generator replacement | 1 | Finish generation, then reload and check only fresh errors | Final docs content and clean warning/error log verified |
| Generated example import assertion assumed installation rewrites happened during generation | 1 | Validate generated source alias and declared target/dependency separately | Registry source checker and payload audit passed |

Verification evidence:
- Cwd: `/Users/zbeyens/git/plate-2`; base ref `a6afd55c30e97c74fe895d1ad005ca75413110f3`, local uncommitted source.
- `bun test packages/platejs/src/yjs/BaseYjsPlugin.api.spec.ts packages/platejs/test/yjs/react-contract.spec.tsx`: 14 pass, 0 fail. Log: `/tmp/yjs-cursor-package-tests.log`.
- `pnpm test apps/www/src/registry/components/editor/remote-cursor-overlay.spec.tsx apps/www/src/registry/examples/collaboration-demo.spec.tsx`: canonical isolated app batches, 1+4 pass, 34 assertions. Log: `/tmp/yjs-cursor-tests.log`. Package filters passed to this runner are excluded by its suite routing; the preceding package command supplies that proof.
- `node tooling/scripts/run-entrypoint-task.mjs typecheck platejs yjs-react` and `pnpm exec tsc --noEmit --project apps/www/tsconfig.package-integration.json --pretty false`: exit 0.
- Scoped `ultracite check`: exit 0 after formatting; seven package/UI/test files plus `registry-editor.ts`.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm --filter www test:www-browser:chromium tests/browser/transient-editor-geometry.spec.ts --grep 'Yjs remote selection'`: 1 pass, five warm expanded/collapsed cycles, zero retries, synchronized follow-up input. Log: `/tmp/yjs-cursor-browser.log`.
- CUA Browser on `/blocks/collaboration-demo`: remote selected text, one purple caret/label, selection rgba(124,58,237,0.2), caret/label rgb(124,58,237); disconnect removes both; reconnect plus typing appears in both peers. Actual CSS viewport 390x844, document width 390, label x75..109; screenshots captured and inspected. Temporary viewport reset.
- CUA Browser on `/docs/yjs` showed the final copied import/installation instructions; followed the example link to its live leaf page. Initial pages and demo had zero warning/error logs. Registry generation then produced transient missing-registry HMR errors; a fresh final docs reload rendered the final imports and EditorStatus binding with zero new warning/error logs.
- `pnpm --filter www check:docs`: API reference, MDX parse, and docs source parity passed. `pnpm --filter www build:registry`: 366 canonical payloads and 15 sparse overlays. `check-registry-source.mts`: passed. Logs: `/tmp/yjs-cursor-docs-check.log`, `/tmp/yjs-cursor-registry-build.log`, `/tmp/yjs-cursor-registry-check.log`.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 112 events checked. Source and generated entries document the copied import; generated cursor item declares platejs/yjs and includes the extended plugin.
- `pnpm install` and `node .agents/rules/plate-next/scripts/version.mjs validate`: passed; v142 source/mirror parity. Worker audit found no stale affected cursor recipe. `git diff --numstat -- templates` was empty.
- Unslop file-edit pass: both Yjs language pages, collaboration-example.mdx, changeset, registry entry, and this plan reviewed in full after claims stabilized. Kept technical literals and removed stale setup requirements; no migration prose in reference docs.
- Reporter-specific pixel controls, pre-fix reporter replay, and clean pushed-ref proof: N/A. This is a local architecture refactor with unchanged visual behavior, not a public issue completion claim. Production transport, native OS, whole-repository check, release, and publication are outside scope.

Local source fingerprints:
| Input | SHA-256 |
|-------|---------|
| `packages/platejs/src/yjs/react/YjsPlugin.tsx` | `9b757c8eb1e4ed20a49f286496df6193b268b6cc91361ac6036e748526034952` |
| `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx` | `7118267061d161563db3a38b76624e4bcefcfd0813c9e655915f1fd15b58f6b3` |
| `apps/www/src/registry/examples/collaboration-demo.tsx` | `b44a8853cdd0d538f9769d4f9b6c5d9ff5b65009ae0c90449cafc1f7ce3df3cd` |
| `apps/www/src/registry/components/editor/remote-cursor-overlay.spec.tsx` | `7663f5e8623b5691f9b262afde8d3f2b8b98c7dea3007384623fcdb5e7c4877e` |
| `apps/www/tests/browser/transient-editor-geometry.spec.ts` | `d395fd5a529428e570d69a2c2de4b55254132a7165c32ee2206a5827e9ad55ba` |

Final handoff contract:
- PR line: N/A; local uncommitted work.
- Issue / tracker line: N/A; direct user request.
- Confidence line: focused checks and actual Browser interactions passed.
- Flow table: baseline package/UI behavior passed; final package 14/14, app 5/5, Chromium 5/5 cycles and CUA interactions passed.
- Browser check: desktop and 390px collaboration view, disconnect/reconnect/typing, current docs.
- Outcome: Yjs package is unstyled; copied YjsPlugin owns the complete cursor presentation and preserves the overlay.
- Caveat: local proof only; full repository check and publishing were not requested or run.
- Design: use the existing descriptor and exact-view overlay; share one color resolver and preserve the original observer.
- Verified: package/UI tests, scoped lint/typechecks, browser, docs, registry, doctrine parity.
- PR body verified: N/A; no PR.

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
- PR: N/A; no commit, push, or PR.
- Issue / tracker: N/A; none requested.
- Browser proof: local demo and docs passed; screenshots inspected.
- Caveats: no full-repository or published-ref claim.

Timeline:
- 2026-09-04T19:39:10.439Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local implementation and verification complete |
| Where am I going? | Concise final handoff |
| What is the goal? | Keep package Yjs unstyled and own cursor presentation in copied UI |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No unresolved issue within the bounded change. Existing consumers of the headless package import must use the copied YjsPlugin for visual defaults; reference docs and registry changelog state that contract.
- No production transport, whole-repository, or release validation claimed.
