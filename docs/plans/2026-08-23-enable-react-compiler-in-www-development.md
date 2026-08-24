# Enable React Compiler in www development

Objective:
Enable React Compiler in `apps/www` development, prove the current source-alias dev graph compiles and renders correctly, and state the real CI coverage boundary.

Flow mode:
- one-shot execution

Goal plan:
docs/plans/2026-08-23-enable-react-compiler-in-www-development.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: current Codex task; no external tracker
- title: Remove the development-only React Compiler disable and verify CI-equivalent behavior
- acceptance criteria:
  - Explain why Compiler was disabled in development.
  - Check the claim that the Compiler path is Rust-backed.
  - Replace the `!isDev` gate with unconditional React Compiler enablement.
  - Verify the closest local equivalents of CI/build and a real development route.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: 75%; the one-line cut is clear, but the historical dev crash must be replayed
- improvement loop: source audit -> config cut -> typed/build proof -> fresh dev Browser replay
- final score / loop closure: 95%; source, emitted-chunk, typecheck, browser, interaction, and P1 review evidence agree. Full production build is blocked by unrelated missing generated registry inputs.

Completion threshold:
- `apps/www/next.config.ts` sets `reactCompiler: true` for every phase while retaining the development-only source aliases and `externalDir` behavior.
- The historical `useMemoCache` development failure does not reproduce on a fresh current dev server and `/dev/table-perf` renders an editable Plate editor without a Compiler overlay or relevant console/network failure.
- The www typed checks, scoped lint, emitted Compiler-runtime inspection, and P1 review pass. A direct production build is attempted without the forbidden `build:registry`; any unrelated generated-registry blocker is recorded rather than misreported as Compiler failure.
- The final handoff distinguishes local build proof from GitHub workflow coverage: current workflows do not watch `apps/www/next.config.ts`.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-enable-react-compiler-in-www-development.md` passes.

Verification surface:
- Source/history: current config, the 2026-03-11 solution note, the introducing commit, installed Next 16.2.6 React Compiler docs, and workflow path filters.
- Type/config: `pnpm --filter www typecheck` from the repo root.
- Production compilation: `PLATE_WWW_ASYNC_DOCS=1 pnpm --filter www exec next build` after source generation from typecheck; do not invoke `build:registry`.
- Lint: scoped Ultracite/Oxlint check for `apps/www/next.config.ts` and this plan, or the smallest repo-approved equivalent.
- Development runtime: fresh www Next dev process; Browser opens `/dev/table-perf`, checks the editor DOM, types into it, and checks console/network state.
- Review: P1 local autoreview against the final diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Never run `build:registry` locally; registry output is CI-owned.
- Keep `isDev`, `externalDir`, and Turbopack source aliases because they own local package HMR independently of the Compiler switch.

Boundaries:
- Source of truth: `apps/www/next.config.ts`; historical intent is documented in `docs/solutions/developer-experience/2026-03-11-next-turbopack-react-compiler-workspace-aliases.md`.
- Allowed edit scope: `apps/www/next.config.ts` plus this goal plan. Verification may generate ignored Next/Fumadocs output but must not retain CI-controlled registry output.
- Browser surface: `http://localhost:3100/dev/table-perf`; expect a rendered contenteditable Plate editor and no React Compiler cache-shape overlay. `/blocks/editor-basic` is unavailable because the checkout's generated registry index references absent source files.
- Browser strategy: Browser on a fresh Next dev process for DOM, console, and network proof. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or PR was requested.
- Non-goals: removing source aliases, changing package compilation, changing Compiler targets, cleaning manual memoization/display names, adding workflow infrastructure, committing, pushing, or opening a PR.

Output budget strategy:
- Cap source searches with path/glob filters and `head`; cap command output in tool calls. Save only concise final evidence in this plan.

Blocked condition:
- Stop if the same current-tree `useMemoCache`/Compiler failure reproduces after one clean dev restart and, only if install-corruption signals appear, one `pnpm run reinstall` rerun. Browser unavailability blocks browser-complete wording but not source/build findings.

Task state:
- task_type: app build configuration
- task_complexity: normal; tiny diff with a historical runtime failure mode
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: Valid cleanup candidate, but the Rust rationale is wrong and the historical disable covered a real dev cache-shape crash, not just taste.
- confidence: 95%; the final dev chunk imports Next's Compiler runtime, the editor mounts and accepts input, and no cache-shape or console error appears.
- next owner: task
- reason: Next 16.2.6 uses SWC to select files but still runs the React Compiler Babel plugin; only a current dev replay can retire the old workaround.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-enable-react-compiler-in-www-development.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, constraints, non-goals, verification, and handoff are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal`, `task`, and `plate-ui` instructions read; shadcn flow is N/A |
| Active goal checked or created | yes | Active goal points to this plan |
| Source of truth read before edits | yes | Current configs, introducing history, installed Next docs, and relevant solution note read |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | 2026-03-11 React Compiler/Turbopack solution identifies the original dev crash |
| TDD decision before behavior change or bug fix | no | N/A: build configuration cut; production compile and fresh browser replay are the direct proof |
| Branch decision for code-changing task | yes | Use current checkout; user did not request a branch, commit, or PR |
| Release artifact decision | no | N/A: app-only build configuration; no package or registry behavior release |
| Browser tool decision for browser surface | yes | Browser required by repo policy and historical runtime failure |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Scoped/capped searches and tool outputs recorded above |
| Browser pack selected | yes | Browser pack applied by goal template |
| Browser route / app surface identified | yes | `/dev/table-perf` on a fresh www dev process; the planned block route was rejected after an unrelated generated-registry failure |
| Browser tool decision recorded | yes | Browser for ordinary app QA; no native Chrome surface |
| Console/network caveat policy recorded | yes | Relevant Compiler/React errors and failed route resources fail the proof; unrelated dev noise is reported separately |
| Observable browser case captured | no | N/A: not a public report; replay historical `useMemoCache` overlay on current source graph |

Work Checklist:
- [x] No duration was requested; initial and final confidence are recorded.
- [x] The first checkpoint captured every user requirement, boundary, non-goal, verification surface, stop condition, and handoff caveat before implementation.
- [x] Objective, threshold, source classification, constraints, browser surface, owner, and blocked condition are concrete.
- [x] Video evidence is N/A because the request included no recording.
- [x] Repo instructions, both app configs, installed Next docs, introducing history, workflow filters, and the 2026-03-11 solution note were read before the edit.
- [x] The edit changes the literal owner, `apps/www/next.config.ts`, and preserves independent source-alias/HMR configuration.
- [x] Changeset and registry changelog are N/A for an app-only compiler toggle with no package or registry component behavior change.
- [x] Final handoff is a local change-and-proof report; branch creation, PR, commit, push, and tracker sync are N/A because none was requested.
- [x] Local-env-rot retry is N/A: the failed full build and block route name absent generated registry inputs, not mixed React installs or package-resolution corruption.
- [x] Workspace authority is `/Users/zbeyens/git/plate-2`; www commands and Browser on its fresh dev server own the changed behavior.
- [x] High-risk failure mode is the historical React Compiler `useMemoCache` size mismatch; a fresh Compiler-emitting dev process and editable route are the direct proof.
- [x] P1 local autoreview ran on the final code diff with the authorized scope and returned no findings.
- [x] Agent-native review is N/A because no agent rule, skill, hook, prompt, or tool changed.
- [x] Searches were scoped and capped. One dev-server interrupt returned a large cached error stream despite the cap; later checks used fresh processes and small targeted outputs.
- [x] Browser proof used `/dev/table-perf`, found one contenteditable editor, typed `compiler-proof`, and found no build dialog, cache-shape text, or console error.
- [x] HTTP `200` terminal evidence covers the route request; Browser console errors were empty. No native Chrome surface applied.
- [x] Screenshot is N/A because this is nonvisual compilation behavior and DOM/error-state evidence is stronger.
- [x] Report-backed red-before-green and exact public-case replay are N/A; this re-evaluates a historical internal workaround.
- [x] Final proof used a fresh dev process and fresh Browser tab on the final config hash; no temporary stubs, generated source edits, or route aliases were used.
- [x] Exact pushed-ref/clean-checkout and 5/5 native stability gates are N/A because the result is explicitly local and is not a native selection, focus, DnD, compositor, or paint claim.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source, type, emitted-chunk, Browser, lint, and review checks | Passed except full production build, whose unchanged path is blocked by absent generated registry inputs documented below |
| Bug reproduced before fix | no | N/A: historical workaround review, not a current reported defect | Original `useMemoCache` failure is documented in the 2026-03-11 solution note |
| Targeted behavior verification | yes | Compile and interact with a real source-backed Plate editor | `/dev/table-perf` returned 200, rendered one contenteditable, and accepted typed input |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | N/A | No package or exported file changed; `pnpm brl` not applicable |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest, lockfile, dependency, or install change |
| Agent rules or skills changed | no | N/A | No agent-owned file changed |
| Workspace authority proof | yes | Verify in the owning checkout/app/route | All commands ran in `/Users/zbeyens/git/plate-2`; Browser targeted its port 3100 dev server |
| Browser surface changed | yes | Capture ordinary Browser proof | Fresh Browser tab on `/dev/table-perf` passed DOM and interaction checks |
| Browser final proof | yes | Record exact Browser outcome and caveat | One contenteditable, zero Build Error dialogs, zero memo-cache error text, zero console errors |
| CI-controlled template output changed | no | N/A | No template or registry output retained |
| Package behavior or public API changed | no | N/A | App compilation configuration only; no changeset |
| Registry-only component work changed | no | N/A | No registry component changed; no changelog entry |
| Docs or content changed | no | N/A | Only this internal goal plan changed; no user-facing docs |
| High-risk mini gate | yes | Replay the historical runtime failure mode on the correct owner | Fresh dev Compiler runtime, contenteditable interaction, HTTP 200, and empty error state passed |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling behavior changed |
| Local install corruption suspected | no | N/A | Failures named absent generated registry source files; no React install-corruption signal |
| P1 autoreview for non-trivial implementation changes | yes | Run local P1 review | One invocation exited clean with no findings and 0.98 correctness confidence |
| PR create or update | no | N/A | User did not request a PR |
| Task-style PR body verified | no | N/A | No PR exists for this task |
| PR proof image hosting | no | N/A | No PR and no screenshot needed |
| Tracker sync-back | no | N/A | No tracker item |
| Final handoff contract | yes | Fill exact local outcome, proof, and caveats | Completed below |
| Final lint | yes | Run scoped equivalent | `pnpm --filter www exec ultracite check next.config.ts` passed |
| Output budget discipline | yes | Record any accidental high-volume output and recover | One server interrupt emitted cached errors; subsequent output was tightly scoped and no broad rerun was streamed |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run the autogoal completion checker | Closure checker result is recorded in verification evidence |
| Browser interaction proof | yes | Exercise the target route | Typed `compiler-proof` into the editor; text appeared and error state stayed empty |
| Browser console/network check | yes | Check errors and route response | Browser console errors empty; fresh server logged GET `/dev/table-perf` 200 |
| Browser final proof artifact | yes | Record route/DOM/runtime evidence | Route and query results recorded below; screenshot waived as nonvisual behavior |
| Exact case replay | no | N/A | No current public report; historical cache-shape symptom was the replay target |
| Final ref and fingerprints | yes | Record local base ref and config fingerprint | Base `33557a72cc6b393c4646af46cf0348f0e49efa99`; config SHA-256 `7ad93f68f2779661646d17b05eae52fe500f131ec101ce658f729a93e103e43a` |
| Clean final runtime | no | N/A | Explicitly local, uncommitted candidate; no pushed-ref or release claim |
| Retry-free stability | no | N/A | Not a native selection, focus, DnD, compositor, paint, or lifecycle regression claim |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Current config, history, solution note, Next/Oxc docs, and workflow filters read | implementation |
| Implementation | completed | `reactCompiler: !isDev` replaced with `reactCompiler: true`; dev aliases untouched | verification |
| Verification | completed | Typecheck, lint, emitted-runtime inspection, fresh Browser interaction, and P1 review passed | closeout |
| PR / tracker sync | completed | N/A: no commit, PR, push, or tracker requested | final response |
| Closeout | completed | Final evidence, caveats, fingerprint, and handoff recorded | final response |

Findings:
- The 2026-03-11 solution note records a real dev failure: mixed compiled output caused React Compiler `useMemoCache` size mismatch. The introducing diff also described slower development compilation. This was a workaround, not a random toggle.
- Oxc's Rust React Compiler exists as `oxc-transform-react` and a Vite integration. Next 16.2.6 still applies React Compiler through Babel after SWC selects relevant files; the emitted www dev chunk imports `next/dist/compiled/react/compiler-runtime` through a dependency path containing `babel-plugin-react-compiler`.
- The main GitHub CI workflow does not watch `apps/www/**`, and no workflow watches `apps/www/next.config.ts`. A config-only PR therefore receives no direct GitHub CI validation today.
- Production Compiler behavior is unchanged: the old `!isDev` expression already evaluates to `true` during `next build`.
- Full www build and registry preview routes are independently blocked in this checkout because `src/__registry__/index.tsx` imports 158 absent generated registry files. Repo policy forbids running the generator locally.

Decisions and tradeoffs:
- Keep `isDev`, `externalDir`, and Turbopack source aliases. They own package-source HMR and are independent from the Compiler switch.
- Use `/dev/table-perf` for final proof because it directly imports real Plate/editor source without the broken generated registry index.
- Do not add CI infrastructure in this task. Report the missing workflow coverage plainly; adding a real www build lane is a separate workflow decision.

Implementation notes:
- One production line changed in `apps/www/next.config.ts`: `reactCompiler: true`.
- No package API, registry component, manifest, dependency, generated registry output, or user-facing documentation changed.

Review fixes:
- None. P1 autoreview returned no accepted/actionable findings and rated the scoped patch correct at 0.98 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct `next build` without forbidden `build:registry` reported 158 missing generated-registry imports | 1 | Separate unchanged production behavior from the changed development lane | Classified as unrelated generated-input blocker; production Compiler value was already true |
| `/blocks/editor-basic` showed the same generated-registry build overlay | 1 | Restart the dev server and request a source-backed editor route directly | `/dev/table-perf` compiled and rendered cleanly |
| Browser `networkidle` load state unsupported | 1 | Use supported `load`, then explicit DOM, console, and terminal HTTP checks | Final proof passed |
| Dev-server interrupt returned a very large cached error stream | 1 | Restart cleanly and cap every later query to targeted evidence | No further broad output used |

Verification evidence:
- `pnpm --filter www typecheck` passed, including editor generation check, API reference check, docs parity, registry source check, and both TypeScript projects.
- `pnpm --filter www exec ultracite check next.config.ts` passed formatting and Oxlint.
- Fresh Next 16.2.6 Turbopack dev server returned GET `/dev/table-perf` 200.
- Fresh Browser tab: title `Plate`; one contenteditable; zero Build Error dialogs; zero `useMemoCache`/memo-cache text; zero console errors; typed `compiler-proof` successfully.
- Emitted route chunk `apps/www/.next/dev/static/chunks/apps_www_src_0v0cbhz._.js` imports Next's React Compiler runtime, proving the dev transform ran.
- `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1 ...` exited clean with no findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-enable-react-compiler-in-www-development.md` passed.
- Local base ref: `33557a72cc6b393c4646af46cf0348f0e49efa99`; final config SHA-256: `7ad93f68f2779661646d17b05eae52fe500f131ec101ce658f729a93e103e43a`.
- Full production build proof is unavailable without the forbidden registry generator; its observed failure is unrelated and production Compiler behavior did not change.

Final handoff contract:
- PR line: N/A; no commit, push, or PR requested
- Issue / tracker line: N/A; direct local request
- Confidence line: 95% in the development Compiler cut; no claim that GitHub CI covers it
- Flow table:
  - Reproduced: historical `useMemoCache` failure is source-documented; current red replay is N/A because this task removes a workaround rather than fixes a current report
  - Verified: typecheck/lint green; fresh Browser dev route and interaction green
- Browser check: `/dev/table-perf` rendered and accepted input with no Compiler overlay or console error
- Outcome: React Compiler is unconditional in www development and current source-alias development works on the exercised editor route
- Caveat: GitHub CI ignores this config; full www build and block preview are blocked by unrelated absent generated registry inputs
- Design:
  - Chosen boundary: the `reactCompiler` owner in `apps/www/next.config.ts`
  - Why not quick patch: this is the smallest correct owner edit; call-site or component changes would be nonsense
  - Why not broader change: source aliases/HMR remain required, and CI/workflow coverage needs a separate explicit decision
- Verified: www typecheck, scoped lint, emitted Compiler runtime, HTTP 200, editable Browser interaction, empty error state, and clean P1 review
- PR body verified: N/A; no PR

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
- PR: N/A; local uncommitted change only
- Issue / tracker: N/A
- Browser proof: fresh `/dev/table-perf` rendered one editable Plate surface, accepted input, and had no build/cache-shape/console error
- Caveats: no GitHub workflow covers `apps/www/next.config.ts`; full www build and block preview require generated registry inputs that are absent locally and forbidden to regenerate outside CI

Timeline:
- 2026-08-23T20:49:37.489Z Task goal plan created.
- 2026-08-23 Source/history audit found the original cache-shape crash and current Next Babel/SWC boundary.
- 2026-08-23 Changed www to unconditional React Compiler enablement.
- 2026-08-23 Typecheck and scoped lint passed; direct build exposed unrelated missing registry inputs.
- 2026-08-23 Fresh source-backed dev route compiled, emitted Compiler runtime, rendered, accepted input, and logged no errors.
- 2026-08-23 P1 autoreview completed cleanly.
- 2026-08-23 Autogoal completion checker passed and the local dev server was stopped.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Enable React Compiler in www development and prove the current source-alias dev graph works |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- A config-only change under `apps/www/next.config.ts` triggers no GitHub CI workflow, so regression prevention remains weak until a real www build/dev-config lane is added.
- Full production build health and registry preview health remain unproved in this checkout because required generated registry sources are absent. This does not weaken the development Compiler proof or change production Compiler behavior.
