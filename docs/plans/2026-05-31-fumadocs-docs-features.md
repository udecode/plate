# Fumadocs Docs Features

Objective:
Implement the approved Fumadocs-derived docs features in `apps/www`: canonical per-page markdown routes and Accept-header markdown negotiation, processed-markdown LLM output when available, locale-scoped search where English mode excludes CN pages and CN mode gets localized English fallback docs, TypeScript/auto type-table MDX support, files/auto-files MDX support, and richer page actions matching Plate UI.

Task source:
- type: chat instruction
- id / link: N/A
- title: approved Fumadocs docs features except CN search in English mode
- acceptance criteria: implement all approved features; ensure CN search items do not show in English mode.

Completion threshold:
- `/docs/*.md`, `/cn/docs/*.md`, `/llms.txt`, `/llms-full.txt`, and per-page LLM routes return markdown with the best available processed content.
- `Accept: text/markdown` rewrites docs page requests to markdown without breaking normal HTML routes.
- Search stays locale-scoped: English mode does not surface `/cn/docs/**`; CN mode keeps localized docs and English-only fallback docs under `/cn/docs/**`.
- MDX exposes TypeScript type-table and files/auto-files authoring components without breaking existing Plate MDX components.
- Page actions expose markdown-oriented actions in Plate styling.
- Focused tests, typecheck, scoped lint, and HTTP proof cover the changed routes and docs pages.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-fumadocs-docs-features.md` passes.

Verification surface:
- `pnpm --filter www typecheck`
- focused `bun test` route/search tests under `apps/www`
- scoped `pnpm exec biome check ... --fix` for changed files
- HTTP proof for `/docs/controlled`, `/docs/controlled.md`, `Accept: text/markdown /docs/controlled`, `/cn/docs/plugin-input-rules.md`, and search API locale behavior
- source audit proving English search cannot include `/cn/docs/**`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes.
- Do not edit generated registry/template output.

Boundaries:
- Source of truth: latest user correction plus local installed Fumadocs package/source behavior.
- Allowed edit scope: `apps/www` docs runtime/components/config/tests and this goal plan.
- Browser surface: docs pages and top-of-page actions under `http://localhost:3002/docs/controlled`.
- Tracker sync: N/A, user did not provide an external tracker item.
- Non-goals: OpenAPI integration, PR/commit/push, broad docs content rewrite, CN search appearing in English mode.

Output budget strategy:
- Used focused `rg`, targeted file reads, scoped test output, and `/tmp/plate-*` HTTP artifacts instead of streaming full rendered HTML. One failed full-markdown assertion produced long output; recovered with focused passing reruns.

Blocked condition:
- No blocker remains. The only browser-specific caveat is tool availability: the in-app Browser tool was not exposed in this session, so HTTP route proof is the recorded substitute.

Task state:
- task_type: feature
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until `update_goal(status: complete)`

Current verdict:
- verdict: implemented
- confidence: high after `www` typecheck, focused tests, scoped lint, and HTTP proof on `localhost:3002`
- next owner: final handoff
- reason: all approved features landed with English search excluding CN results and CN search using localized fallback docs.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `task`, and `docs-creator`; read local docs runtime/source before edits. |
| Active goal checked or created | yes | Active goal created for this feature set. |
| Source of truth read before edits | yes | Latest user message required all approved features while keeping CN results out of English mode. |
| Tracker comments and attachments read | N/A | No tracker item. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked | N/A | App runtime work; local source and memory context were the relevant references. |
| TDD decision before behavior change | yes | Added route/search/proxy tests around changed behavior. |
| Branch decision for code-changing task | yes | Stayed in current checkout; no proactive git state per repo rule. |
| Release artifact decision | yes | N/A: app docs runtime change, no published package release. |
| Browser tool decision | yes | Browser tool was not exposed; HTTP proof used. |
| PR expectation decision | yes | N/A: user did not ask for PR. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Output budget strategy recorded | yes | Recorded above. |
| Browser route identified | yes | `http://localhost:3002/docs/controlled` plus markdown/search routes. |
| Docs lane selected | yes | Docs-app runtime and authoring component support, not content rewrite. |
| Documented source owner identified | yes | `apps/www` owns docs runtime, MDX components, search, and LLM routes. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: `apps/www` docs runtime/config/search/proxy/components.
- [x] Release artifact requirement recorded as N/A with reason.
- [x] Final handoff shape decided with tests, HTTP proof, caveat, and no PR/tracker.
- [x] Branch handling recorded: current checkout, no PR/commit requested.
- [x] Local-env-rot retry policy recorded as N/A with reason.
- [x] Workspace authority recorded for `/Users/zbeyens/git/plate` and `apps/www`.
- [x] High-risk note recorded: browser routes, search indexing, redirect behavior, and source checker.
- [x] Review/autoreview target selected and scoped waiver recorded.
- [x] Agent-native review decision recorded as N/A because no agent tooling changed.
- [x] Output budget discipline recorded and followed.
- [x] Browser pack route, interaction path, and expected visible outcome recorded.
- [x] Browser pack blocker recorded: approved browser tool unavailable.
- [x] Browser pack console/network caveat recorded.
- [x] Browser pack final proof caveat recorded.
- [x] Docs pack lane, target docs runtime, and source owner recorded.
- [x] Named APIs/imports/options/routes/components are source-backed by local installed packages/source or marked N/A.
- [x] Docs work uses current-state runtime support, not changelog voice.
- [x] Links/routes/previews target real leaf pages or are marked N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named checks and route proof | `pnpm --filter www typecheck`; focused `bun test`; HTTP proof all passed. |
| Bug reproduced before fix | yes | Record failing repro | Reproduced structured-data search failure, CN duplicate fallback, direct `.md` route gap, and CN search redirect loop. |
| Targeted behavior verification | yes | Run focused behavior tests | Focused Bun tests passed: 11 tests, 31 expects. |
| TypeScript or typed config changed | yes | Run typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | N/A | Barrels only for package exports | No package public exports changed. |
| Package manifests, lockfile, or install graph changed | yes | Install and package checks | Added `fumadocs-typescript@5.2.6` and `fumadocs-ui@16.9.3`; `www` typecheck passed. |
| Agent rules or skills changed | N/A | Sync only for `.agents` source edits | No `.agents` files changed. |
| Workspace authority proof | yes | Verify in owning workspace | Commands ran from repo root or `apps/www`, which owns the changed behavior. |
| Browser surface changed | yes | Use approved browser or record waiver | Browser tool unavailable; HTTP route proof used. |
| Browser final proof | yes | Record exact caveat | No screenshot; HTTP status/content/search proof recorded. |
| CI-controlled template output changed | N/A | Restore generated template output | No `templates/**` output touched. |
| Package behavior or public API changed | N/A | Changeset only for published package behavior | App-only docs runtime/config change. |
| Registry-only component work changed | N/A | Registry changelog only for registry component work | No registry component changed. |
| Docs or content changed | yes | Verify source-backed behavior | `build:source`, typecheck, route tests, and HTTP proof passed. |
| High-risk mini gate | yes | Record realistic failure mode and proof | Failure modes and proofs recorded in findings, error attempts, and verification evidence. |
| Agent-native review for agent/tooling changes | N/A | Review only for agent tooling | No agent/action tooling changed. |
| Local install corruption suspected | N/A | Reinstall only for env rot | Failures matched code/tooling changes and were fixed directly. |
| Autoreview for non-trivial implementation changes | N/A | Record scoped waiver | Waived: route tests, typecheck, HTTP proof, and source checker covered this narrow app runtime change; no PR requested. |
| PR create or update | N/A | Run `check` before PR work | No PR requested. |
| Task-style PR body verified | N/A | Verify PR body if PR exists | No PR. |
| PR proof image hosting | N/A | Host proof images for PR body | No PR and no screenshot. |
| Tracker sync-back | N/A | Sync external tracker when present | No tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run scoped lint/format | Scoped `pnpm exec biome check ... --fix` passed. |
| Output budget discipline | yes | Verify no unbounded output remains | One accidental long failed test output recorded; final proof output is concise. |
| Goal plan complete | yes | Run autogoal checker | Final run follows this plan update. |
| Browser interaction proof | yes | Exercise route or record blocker | Browser tool unavailable; HTTP route proof used. |
| Browser console/network check | N/A | Console requires browser tool | HTTP status/content checks covered route/network behavior. |
| Browser final proof artifact | yes | Record artifact/caveat | `/tmp/plate-*` HTTP artifacts generated; no screenshot. |
| Docs source-backed claim audit | yes | Verify source claims | Local installed Fumadocs source and generated source output inspected. |
| Docs links / routes / previews | yes | Verify leaf routes | `/docs/controlled`, `/docs/controlled.md`, `/cn/docs/plugin-input-rules.md`, `/llms.txt`, and search routes passed. |
| Docs MDX/content parser | yes | Run parser/source generation | `fumadocs-mdx` ran via typecheck and passed. |
| Plugin page specifics | N/A | Apply plugin-page rules only for plugin docs content | No plugin page content rewrite. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read app docs config, routes, LLM/search code, generated source shape, and local package source. | implementation done |
| Implementation | complete | Added markdown negotiation, localized search fallback, processed LLM fallback, MDX components, page actions, source checker update, redirect exclusion. | verification done |
| Verification | complete | Typecheck, focused tests, scoped Biome, and HTTP proof passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated with evidence and risks. | final response |

Findings:
- Fumadocs v15 generates `.source/server.ts` instead of `.source/index.ts`; the docs source parity checker needed to support both shapes.
- `createFromSource` needed a custom `buildIndex` because the local route-test runtime did not reliably expose `structuredData`.
- Legacy `?locale=cn` redirects were catching `/api/search` and causing a `/cn/cn/...` redirect loop.

Decisions and tradeoffs:
- Keep search strict: English requests index only English docs; CN requests index translated docs plus English-only fallback docs under localized `/cn/docs/**` URLs.
- Keep markdown routes under existing `/llm` handlers and rewrite `/docs/*.md` plus `Accept: text/markdown` to them.
- Use local Plate-styled `Files` and `TypeTable` components instead of pulling Fumadocs UI rendering directly into MDX output.

Implementation notes:
- Added `fumadocs-typescript` and `fumadocs-ui` to `apps/www`.
- Enabled `includeProcessedMarkdown`, `remarkMdxFiles`, and `remarkAutoTypeTable` in `source.config.ts`.
- Added `apps/www/src/proxy.ts` for Accept-header and direct `.md` rewrites.
- Added custom locale-aware search indexing in `apps/www/src/app/api/search/route.ts`.
- Added `docs-files` and `docs-type-table` MDX components.
- Added richer page actions and source-path wiring.
- Updated LLM helpers to prefer processed text and fall back to raw/frontmatter.
- Updated `check-docs-source-parity.mts` for Fumadocs v15 generated source layout.

Review fixes:
- Fixed CN fallback duplication by comparing page slugs, not localized URLs.
- Fixed direct `/docs/*.md` route support after page actions exposed those links.
- Fixed `/api/search?locale=cn` redirect loop by excluding `api` and already-localized `cn` paths from the legacy locale redirect.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Search route threw `Cannot find structured data from page` | 1 | Use custom `buildIndex` from markdown/frontmatter | Resolved in `apps/www/src/app/api/search/route.ts`. |
| `www` typecheck failed on missing `.source/index.ts` | 1 | Teach checker v15 `.source/server.ts` format | Resolved in `apps/www/scripts/check-docs-source-parity.mts`. |
| HTTP CN search returned redirect loop body | 1 | Exclude API/CN paths from legacy `?locale=cn` redirect | Resolved in `apps/www/next.config.ts`. |
| Biome command used wrong cwd with duplicated path | 1 | Rerun from repo root | Resolved; scoped Biome passed. |

Verification evidence:
- `pnpm exec biome check ... --fix` for changed files passed.
- `pnpm --filter www typecheck` passed, including `fumadocs-mdx`, `check-docs-source-parity.mts`, `check-registry-source.mts`, and both TypeScript projects.
- `bun test 'src/app/(app)/llms.txt/route.test.ts' 'src/app/(app)/llms-full.txt/route.test.ts' 'src/app/(app)/llm/[[...slug]]/route.test.ts' 'src/app/cn/llm/[[...slug]]/route.test.ts' src/app/api/search/route.test.ts src/proxy.test.ts` passed: 11 tests, 31 expects.
- HTTP proof on `http://localhost:3002`: `/docs/controlled`, `/docs/controlled.md`, `Accept: text/markdown /docs/controlled`, `/cn/docs/plugin-input-rules.md`, and both search API queries returned `HTTP/1.1 200 OK`.
- HTTP content proof: controlled HTML includes `Controlled Editor Value`; markdown responses include `Source: https://platejs.org/docs/controlled`; CN fallback markdown includes `Source: https://platejs.org/cn/docs/plugin-input-rules`.
- HTTP search proof: English `controlled` search returned no `/cn/` URLs; CN `Plugin Input Rules` search returned `/cn/docs/plugin-input-rules` and no `/docs/` URLs.

Reboot status:
- Current checkout has a running dev server on `http://localhost:3002` started with `pnpm --filter www exec next dev --port 3002`.
- Fresh verification after the last code/config change: scoped Biome passed, `pnpm --filter www typecheck` passed, focused Bun tests passed, HTTP proof passed.

Open risks:
- No known functional risk remains.
- Browser screenshot and console proof were not captured because the in-app Browser tool was not exposed in this session; HTTP proof covers the changed route and network behavior.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high after typecheck, tests, scoped lint, and HTTP proof.
- Flow table:
  - Reproduced: direct route probes caught structured search failure, missing direct `.md` route behavior, and CN search redirect loop.
  - Verified: typecheck, focused Bun tests, scoped Biome, and HTTP proof passed.
- Browser check: in-app Browser tool unavailable; HTTP proof used. Dev server remains at `http://localhost:3002`.
- Outcome: Fumadocs docs features implemented for markdown routes, LLM content fallback, locale search, MDX authoring components, and page actions.
- Caveat: no screenshot captured because no browser-control tool was exposed.
- Design:
  - Chosen boundary: `apps/www` docs runtime/config/components and route tests.
  - Why not quick patch: search and markdown behavior needed shared route/config ownership, not caller-side fixes.
  - Why not broader change: package exports, registry output, and docs content rewrites were outside the approved feature set.
- Verified: scoped Biome, `pnpm --filter www typecheck`, focused Bun route/search tests, HTTP proof.
- PR body verified: N/A, no PR.
