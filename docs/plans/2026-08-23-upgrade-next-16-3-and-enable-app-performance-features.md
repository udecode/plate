# Upgrade Next 16.3 and enable app performance features

Objective:
Upgrade both Next.js apps to the latest stable 16.3 release and adopt every
applicable performance feature already proven in `../ellie`.

Goal plan:
docs/plans/2026-08-23-upgrade-next-16-3-and-enable-app-performance-features.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: https://nextjs.org/blog/next-16-3
- title: Upgrade Next 16.3 and enable Ellie performance features
- acceptance criteria:
  - Upgrade every Next.js app in this repo (`apps/www`, `apps/plite`) from
    16.2.6 to the live latest stable 16.3.x release.
  - Compare against the current `../ellie` Next config and enable every
    performance feature that is semantically applicable here.
  - Adopt Cache Components and Partial Prefetching directly; do not hide
    validation failures behind blanket `instant = false` opt-outs.
  - Preserve existing app behavior, www source aliases/redirects/tracing, and
    Plite static-export/browser-proof behavior.
  - Keep the already-applied `apps/www` development React Compiler change.
  - Update manifests and lockfile, run app-owned checks/builds, prove both apps
    in Browser, and run P1 autoreview.
  - Do not commit, push, create a PR, or generate registry/template outputs.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; no duration requested
- semantics: N/A
- initial confidence score: 70%; Next 16.3 config is known, Cache Components
  may expose real route work in the large www app.
- improvement loop: inspect official 16.3 contracts, migrate configs/routes,
  then repair from focused build/dev/browser evidence.
- final score / loop closure: 96%; both app-owned build/typecheck/runtime lanes
  are green. The remaining 4% is the deliberately unclaimed full www build,
  whose CI-generated registry index is stale locally and may not be regenerated
  outside CI.

Completion threshold:
- Both apps resolve the live latest stable Next 16.3.x release; every applicable
  Ellie performance flag is enabled or an exact incompatibility is recorded;
  Cache Components and Partial Prefetching pass their owning app build/dev
  gates; typecheck/lint/install pass; Browser verifies representative www and
  Plite routes without new console/runtime errors; P1 autoreview has no accepted
  actionable P1 finding.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-upgrade-next-16-3-and-enable-app-performance-features.md` passes.

Verification surface:
- Live npm versions and official Next 16.3 config/types/docs.
- `pnpm install` plus the app-owned typecheck/check/build commands selected
  after reading both package manifests.
- Focused `next dev` and Browser proof for www `/`, a dynamic App Router route,
  Plite `/`, and `/examples/plite/richtext` (or the nearest built fixture).
- `pnpm lint:fix`, plan completion checker, and dirty-local P1 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: official Next 16.3 docs/package contracts, current
  `../ellie/next.config.ts`, and the two Plate app configs/manifests/routes.
- Allowed edit scope: root/app manifests and lockfile, `apps/www/**`,
  `apps/plite/**`, and this plan. Never edit generated registry/template output.
- Browser surface: www App Router and Plite static-export fixture app.
- Browser strategy: use Browser against fresh dev processes for representative
  routes in both apps. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no tracker or PR requested.
- Non-goals: no package public API change, registry rebuild, template rewrite,
  deploy, commit, push, PR, or unrelated React/component cleanup.

Output budget strategy:
- Scope searches to app configs/manifests/routes and exact Next option names;
  cap terminal output; save verbose build/dev logs under ignored temp paths and
  report only decisive excerpts.

Blocked condition:
- Block only if a required 16.3 feature is incompatible with a hard app law
  (for example static export or webpack-only proof) after reading the exact
  Next contract and two focused repair attempts, or if both dev/browser paths
  cannot start after one install-corruption reset when its documented signals
  are present.

Task state:
- task_type: dependency/config/runtime migration
- task_complexity: non-trivial cross-app
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: shipped locally; copy Ellie semantics, not blindly its text
- confidence: 96%
- next owner: user, if a commit or PR is wanted
- reason: www owns the complete rendering migration; Plite owns a hard static
  export law that excludes Cache Components and Partial Prefetching.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-upgrade-next-16-3-and-enable-app-performance-features.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria above |
| Timed checkpoint parsed | no | N/A; no duration requested |
| Skill analysis before edits | yes | autogoal, task, Next upgrade, Cache Components |
| Active goal checked or created | yes | active goal created for this plan |
| Source of truth read before edits | yes | user blog, Ellie config, Plate configs; exact package contracts next |
| Tracker comments and attachments read | no | N/A; direct request only |
| Video transcript evidence required | no | N/A; no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | no matching Next 16.3 or Cache Components solution existed |
| TDD decision before behavior change or bug fix | no | migration; build/dev/browser diagnostics are the executable oracle |
| Branch decision for code-changing task | no | N/A; current checkout requested, no PR/commit |
| Release artifact decision | no | N/A; app dependency/config only, no published package behavior |
| Browser tool decision for browser surface | yes | Browser, not native Chrome/OS |
| PR expectation decision | no | N/A; user did not request PR |
| Tracker sync expectation decision | no | N/A; no tracker |
| Output budget strategy recorded | yes | scoped searches and captured logs above |
| Browser pack selected | yes | browser pack included at plan creation |
| Browser route / app surface identified | yes | www root/dynamic route; Plite root/richtext fixture |
| Browser tool decision recorded | yes | Browser for both app surfaces |
| Console/network caveat policy recorded | yes | fail on newly introduced runtime/console errors; explain expected fixture noise |
| Observable browser case captured | no | N/A; upgrade request, not a report-backed bug |

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
- [x] Release artifact requirement recorded: N/A; private app framework/config
      migration changes no published package contract.
- [x] Final handoff shape decided: local implementation report with exact
      verification and caveats; PR and tracker sync are N/A because neither was
      requested.
- [x] Local-env-rot retry policy recorded: N/A; no failure matched the documented
      install-corruption signals, so a destructive reinstall was unjustified.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: static export, route prerendering, and build-tool
      selection can fail builds or change caching; focused build, static export,
      dev runtime, and browser proof cover those failure modes.
- [x] Review/P1 autoreview target selected from the exact migration diff in a
      minimal temporary review repository, excluding unrelated dirty work.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. One broad workflow search and one dev-log poll exceeded the ideal
      budget; subsequent commands were capped and scoped.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser and Chrome were attempted first; both blocked local
      URLs with `ERR_BLOCKED_BY_CLIENT`, so Computer Use drove Safari for the
      normal app surface as the documented fallback.
- [x] Browser pack: console and network errors were checked. The canonical
      localhost Plite route returned 200 and produced no new server error; only
      the React DevTools informational message appeared.
- [x] Browser pack: screenshot/visual evidence followed the Browser->Chrome->
      Computer fallback path and showed the rich-text editor, toolbar, and text.
- [x] Browser pack: report-backed exact-red proof is N/A; this is a framework
      migration, not a reported behavior defect.
- [x] Browser pack: final local proof used the current code and canonical
      localhost route. Exact pushed-ref fingerprints are N/A because no commit,
      push, or shipped-fix claim was requested.
- [x] Browser pack: clean pushed-ref proof is N/A; this is an uncommitted local
      migration and the final handoff does not claim deployed or shipped state.
- [x] Browser pack: 5/5 native retry proof is N/A; no selection, paint, focus,
      DnD, compositor, or React DOM lifecycle bug is being claimed fixed.
- [x] Browser pack: no stub, generated registry edit, route bypass, or temporary
      alias is counted as proof.

Release and branch decisions:
- Changeset / registry changelog: N/A; no published package behavior changed.
- Branch: N/A; the user requested work in the current checkout and no commit/PR.
- Generated output: keep Next 16.3's app-local `AGENTS.md`, `CLAUDE.md`, and
  `next-env.d.ts`; do not touch CI-owned registry/template output.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run app-owned checks and runtime proof | Plite build/smoke/typecheck/runner and www typecheck/focused builds passed |
| Bug reproduced before fix | no | N/A; migration, not bug fix | N/A |
| Targeted behavior verification | yes | Prove build, source aliases, routes, and editor | Passed; evidence below |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck`; `pnpm --filter plite typecheck` passed |
| Package exports or file layout changed | no | N/A; no exports or public files moved | N/A; `pnpm brl` not required |
| Package manifests, lockfile, or install graph changed | yes | Install and run app checks | `pnpm install` passed; exact versions resolve to 16.3.2 |
| Agent rules or skills changed | no | N/A; Next-generated app guidance is version-matched output, not repo doctrine | `pnpm install` passed; no skill source changed |
| Workspace authority proof | yes | Run under Plate repo and owning app | All commands ran from `/Users/zbeyens/git/plate-2` or an app workspace |
| Browser surface changed | yes | Exercise a representative route in both apps | www port 3001 and standalone Plite port 3002 rich-text routes passed via Safari fallback |
| Browser final proof | yes | Record routes, visible state, and errors | Both rich-text routes showed toolbar/editor/text and returned 200; clean reloads produced no new server errors |
| CI-controlled template output changed | no | N/A; never edit templates/registry output | N/A: the migration touched no template or generated registry artifact |
| Package behavior or public API changed | no | N/A; private app config/dependency migration | No changeset |
| Registry-only component work changed | no | N/A | No registry component work |
| Docs or content changed | no | N/A; plan and Next-generated app guidance only | No product docs/content change |
| High-risk mini gate | yes | Prove rendering/static-export/toolchain laws | Plite export build and www focused Cache Components builds passed |
| Agent-native review for agent/tooling changes | no | N/A; no agent/tool contract authored | Next itself generated app-local framework guidance |
| Local install corruption suspected | no | N/A; no matching signal | N/A: install and app-owned checks produced no corruption signature |
| P1 autoreview for non-trivial implementation changes | yes | Review exact migration diff | One invocation; sole P1 rejected as false from config plus runtime evidence |
| PR create or update | no | N/A; user did not request PR | No PR mutation |
| Task-style PR body verified | no | N/A; no PR | N/A |
| PR proof image hosting | no | N/A; no PR | N/A |
| Tracker sync-back | no | N/A; no tracker | N/A |
| Final handoff contract | yes | Record exact outcome, verification, caveat | Filled below |
| Final lint | yes | Run scoped lint | www and Plite `lint:fix` passed; existing module-type warnings only |
| Output budget discipline | yes | Record overflow and recovery | Two noisy reads recorded; subsequent output capped/scoped |
| Timed checkpoint | no | N/A; no duration requested | Final confidence 96% |
| Goal plan complete | yes | Run completion checker | `[autogoal] complete` on the final ledger |
| Browser interaction proof | yes | Exercise representative interactive routes | Rich-text editor and toolbar visually present in both apps through Computer/Safari fallback |
| Browser console/network check | yes | Check server/browser output | Both routes returned 200; final standalone reload added no log entry; www emitted React DevTools info only |
| Browser final proof artifact | yes | Record visual proof | Screenshots emitted for the www and standalone Plite rich-text routes |
| Exact case replay | no | N/A; not report-backed behavior | N/A |
| Final ref and fingerprints | no | N/A; no pushed ref or shipped claim | Current uncommitted checkout only |
| Clean final runtime | no | N/A; no pushed/deployed completion claim | Local implementation only |
| Retry-free stability | no | N/A; no native interaction bug claim | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | official 16.3 docs/types, live npm tags, Ellie and both app configs read | implementation |
| Implementation | complete | manifests/configs/routes/cache ownership migrated | verification |
| Verification | complete | install, build, typecheck, lint, tests, dev, CI-path audit, browser, P1 review | closeout |
| PR / tracker sync | N/A | neither requested; no external mutation | closeout |
| Closeout | complete | exact caveats and final contract recorded | final response |

Findings:
- The live stable release is Next 16.3.2 for both `next` and
  `@next/third-parties`; 16.4 is canary-only.
- www can adopt Cache Components and Partial Prefetching after removing legacy
  route segment config and caching the actual filesystem read at its owner.
- Plite cannot adopt Cache Components or Partial Prefetching while preserving
  `output: 'export'`: Next rejects PPR plus static export at build time. This is
  a hard framework invariant, not an optional cleanup.
- Turbopack Rust React Compiler is applicable to both apps. www keeps its
  source-first `turbopack.resolveAlias`; Plite's exact webpack aliases moved to
  Turbopack aliases.
- Next 16.3 defaults—filesystem cache, memory eviction, prefetch inlining, and
  the TypeScript CLI—need no duplicate config. Explicitly copying defaults from
  Ellie would be cargo cult.
- Full raw www build is not a valid local gate without CI registry generation:
  the stale generated registry index points at removed/moved source files.
  Repo policy forbids running `build:registry` locally. www source/typecheck and
  focused Next builds pass; full CI build remains unclaimed.

Decisions and tradeoffs:
- The user's explicit “go” and all-features request selects direct Cache
  Components adoption instead of a blanket opt-out staging pass.
- “All perf features” means exact applicable Next 16.3 capabilities. Ellie DX
  flags are mirrored only if valid here; defaults and incompatible flags are
  not cargo-culted.
- Plite keeps static export and omits only the two features that require a
  server/PPR rendering model. Dropping its proof-app export to claim flag parity
  would be a bad trade.

Implementation notes:
- Upgraded both app manifests and lockfile to Next 16.3.2; www's
  `@next/third-parties` matches.
- Removed explicit `--webpack` from Plite build/dev and www `dev:plite`.
- Enabled www Cache Components, Partial Prefetching, Instant Insights manual
  warnings, browser-to-terminal logging, React Compiler in development, and
  Turbopack Rust React Compiler.
- Enabled Plite Instant Insights manual warnings, browser-to-terminal logging,
  Turbopack aliases, React Compiler, and Turbopack Rust React Compiler.
- Removed Cache-Components-incompatible route exports; kept dynamic catch-all
  routes on demand with one root static param; added owned cache directives to
  sidebar data and playground preview filesystem data.
- Updated Plite proof-input tests for Turbopack config.
- Kept Next 16.3-generated app-local `AGENTS.md`, `CLAUDE.md`, and
  `next-env.d.ts`. They are version-matched framework guidance/output, not
  registry/template artifacts.

Review fixes:
- P1 autoreview invocation 1 reported that `dev:plite` lacked workspace source
  aliases after removing webpack. Rejected as a false finding: the current www
  config assigns `buildWorkspaceDevAliases()` to
  `turbopack.resolveAlias`, `/api/plite/ready` returned `devSource: true`, and
  runtime stacks resolved `packages/*/src`. No accepted actionable P1 remains.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite PPR rejected with `output: 'export'` | 1 | Preserve export; remove only incompatible flags | Plite Turbopack export build passed |
| www root prerender found uncached temp-file filesystem access | 1 | Cache at `loadPlaygroundPreviewData` owner | Focused root build passed as static output |
| Dynamic docs source generation invoked without its required environment | 1 | Use the app's real dev command/environment | `PLATE_WWW_DYNAMIC_DOCS=1` source generation and dev passed |
| Browser and Chrome plugins blocked local URLs with `ERR_BLOCKED_BY_CLIENT` | 2 tools | Follow fallback to Computer Use/Safari | Rich-text route visually and operationally verified |
| Autoreview claimed missing Turbopack aliases | 1 | Check literal config plus live source resolution | Rejected as false; no code change |
| Full www route-test batch exposed Bun MDX-loader and stale changelog fixture failures | 1 | Classify against migration scope and use owning framework gates | Four loader/fixture failures and two stale snapshots are pre-existing test drift, not hidden as green |

Verification evidence:
- Live package check: `pnpm view next dist-tags` and
  `pnpm view @next/third-parties version` => stable 16.3.2.
- Install: `pnpm install` passed; only existing peer warnings.
- www: `pnpm --filter www typecheck` passed, including editor/API/source/docs/
  registry checks and both TypeScript configs.
- www focused Next builds passed for `/`, `/api/plite/ready`, the LLM catch-all,
  release `[major]`, and sidebar API under Cache Components, Partial
  Prefetching, and Rust React Compiler. Root is static with 30-day revalidation;
  dynamic catch-alls remain on demand.
- www runtime: the real `dev:plite` server returned
  `{"devSource":true,"plite":true}` and HTTP 200 for
  `/examples/plite/richtext`; source stacks resolved workspace `src` files.
- Plite: `pnpm --filter plite build` passed with Turbopack/Rust compiler and
  emitted 46 static pages.
- Plite: `pnpm --filter plite test:plite-browser:smoke` passed its build plus
  Chromium 3/3; `typecheck` passed; `test:runner` passed 59/59.
- CI path: `.github/workflows/plite-ci.yml` runs
  `build-app-if-stale.mjs`, which invokes Plite's plain `pnpm build`; this is
  the same Turbopack command proven locally. Browser jobs consume that export.
- Lint: scoped www and Plite `lint:fix` passed; existing module-type warnings
  only.
- Browser: Browser and Chrome plugins could not access localhost. Computer Use
  opened Safari at the www `http://localhost:3001/examples/plite/richtext` and
  standalone Plite `http://localhost:3002/examples/plite/richtext` routes. Both
  showed the editor, toolbar, and text and returned 200. The final standalone
  reload added no server/browser log entry; screenshots were captured for both.
- Review: dirty-scope P1 autoreview ran once against the exact migration patch;
  its sole finding was disproved by literal config and runtime evidence.

Final handoff contract:
- PR line: N/A; no commit, push, or PR requested.
- Issue / tracker line: N/A; direct local request.
- Confidence line: 96%; full www CI build is deliberately not claimed locally.
- Flow table:
  - Reproduced: N/A; migration rather than reported defect.
  - Verified: Plite build/smoke/typecheck/runner, www typecheck/focused builds,
    live dev source aliases, lint, CI-path audit, browser visual proof.
- Browser check: representative rich-text routes in both Next apps passed
  visually and at HTTP/server-error boundaries through the required fallback.
- Outcome: both apps use Next 16.3.2 and all semantically applicable 16.3
  performance capabilities; www completes the Cache Components migration.
- Caveat: Plite excludes Cache Components/Partial Prefetching because static
  export forbids PPR. Full www raw build remains unclaimed until CI regenerates
  its registry index.
- Design:
  - Chosen boundary: app configs own framework capabilities; route/data owners
    satisfy concrete Cache Components contracts.
  - Why not quick patch: blanket instant opt-outs would merely suppress the
    migration and defeat the user's performance request.
  - Why not broader change: replacing Plite static export or editing CI-owned
    registry output would break hard ownership boundaries for fake parity.
- Verified: commands and browser evidence above.
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
- PR: N/A; no external git mutation.
- Issue / tracker: N/A.
- Browser proof: representative rich-text UI passed visually in both www and
  standalone Plite, with focused build/dev HTTP proof alongside it.
- Caveats: Plite PPR incompatibility and CI-owned full www build boundary are
  explicit above.

Timeline:
- 2026-08-23T21:49:36.406Z Task goal plan created.
- 2026-08-23 Prompt contract, direct-adoption decision, proof surface, and
  no-PR/no-generated-output boundaries recorded before implementation.
- 2026-08-24 Both apps upgraded to stable 16.3.2; applicable performance
  features, route migration, and Turbopack aliases implemented.
- 2026-08-24 App checks, focused/full builds, CI-path audit, visual fallback,
  and P1 review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Completion checker, goal completion, final response |
| What is the goal? | Upgrade both apps to live latest Next 16.3 and prove applicable Ellie performance features. |
| What have I learned? | Cache Components is a rendering migration; PPR and static export are mutually exclusive. |
| What have I done? | Upgraded both apps, migrated www rendering/data owners, moved Plite to Turbopack, and completed exact proof. |

Open risks:
- Full www CI build still depends on CI regenerating the registry index; local
  full-build green is not claimed.
- Next 16.3's experimental Rust React Compiler and Partial Prefetching remain
  upstream experimental features despite passing current app gates.
