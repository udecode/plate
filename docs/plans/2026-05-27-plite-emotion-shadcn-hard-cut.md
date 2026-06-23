# plite emotion shadcn hard cut

Objective:
Hard cut Emotion from `/Users/zbeyens/git/plate-2/Plate repo root` and migrate
the example/site styling surface to the existing shadcn default-style stack.
Completion requires no live `@emotion`/`emotion`/`css(`/`cx(` references outside
ignored generated build output, no `@emotion/css` dependency in the manifest or
lockfile, affected examples using stable class names and the site stylesheet,
green focused and full local verification, and this plan passing the autogoal
completion checker.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-27-plite-emotion-shadcn-hard-cut.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser
- package-api

Task source:
- type: user prompt
- id / link: N/A: direct chat request
- title: `Plate repo root` Emotion hard cut to shadcn default style
- acceptance criteria: remove Emotion dependency/usages, migrate examples to
  className/CSS/shadcn-style primitives, verify site and browser behavior.

Completion threshold:
- `rg -n '@emotion|emotion|css\(|cx\(' . --glob '!site/.next/**' --glob '!site/out/**'`
  has zero matches from `/Users/zbeyens/git/plate-2/Plate repo root`.
- `package.json` and `bun.lock` no longer contain `@emotion/css`.
- Affected example files no longer import or call Emotion and use stable
  class names backed by `site/public/index.css`.
- `bun check` passes from `/Users/zbeyens/git/plate-2/Plate repo root`.
- Browser proof exercises representative migrated routes with zero console
  errors and zero generated Emotion-style `css-*` classes.

Verification surface:
- command: `bun install`
- command: `bun lint:fix`
- command: `bun lint`
- command: `bun typecheck:site`
- command: `bun typecheck:root`
- command: `bun check`
- source-audit: `rg -n '@emotion|emotion|css\(|cx\(' . --glob '!site/.next/**' --glob '!site/out/**'`
- browser: local Chromium smoke against `http://localhost:3100/examples/*`
- artifact: `/tmp/plite-shadcn-search.png`

Constraints:
- Preserve Plite package runtime behavior.
- Do not add compatibility shims, fallback styling helpers, or new styling
  libraries.
- Do not create commits, pushes, or PRs.
- Do not revert unrelated dirty work in `Plate repo root`.

Boundaries:
- Source of truth: direct user prompt plus live `Plate repo root` source.
- Allowed edit scope: `apps/www/**`, `Plate repo root/package.json`,
  `Plate repo root/bun.lock`, and adjacent root-check fixes required to keep
  verification honest.
- Browser surface: `apps/www` examples app.
- Tracker sync: N/A: no tracker issue supplied.
- Non-goals: no package runtime redesign and no PR work.

Blocked condition:
Stop if local commands cannot run after repo-prescribed retry, browser tooling
cannot access the site and no local browser proof is possible, or source proves
a design decision is required that the local shadcn/default-style patterns
cannot answer.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal`, `hard-cut`, `task`, Browser skill, and attempted `autoreview` closeout |
| Active goal checked or created | yes | `get_goal` returned no goal; `create_goal` created this objective |
| Source of truth read before edits | yes | User prompt, `Plate repo root/package.json`, shadcn wiring, and Emotion audit read |
| Tracker comments and attachments read | N/A | No tracker item supplied |
| Video transcript evidence required | N/A | No video supplied |
| `docs/solutions` checked | yes | Searched `docs/solutions` for plite/example/shadcn/emotion context |
| TDD decision | N/A | Styling-library migration; no new behavior contract needed before edit |
| Branch decision | N/A | No PR/commit requested; no proactive branch hygiene performed |
| Release artifact decision | yes | Private root/site example dependency cleanup; no published package changeset |
| Browser tool decision | yes | Tried approved in-app Browser first; it blocked local URL with `ERR_BLOCKED_BY_CLIENT`; used local Chromium smoke as fallback proof |
| PR expectation decision | N/A | User requested implementation only |
| Tracker sync expectation decision | N/A | No tracker issue supplied |
| Package/API pack selected | yes | Root manifest and lockfile changed |
| Public surface or package boundary identified | yes | Private root dependency graph and site examples only |
| Barrel/export impact decision | N/A | No package exports or barrels changed |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, acceptance criteria,
      caveats, likely files, browser surface, and root-cause layer.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the ownership boundary by removing the dependency,
      imports, runtime class generation, and lockfile entries.
- [x] Release artifact requirement recorded as N/A because no published package
      user-visible delta is part of this patch.
- [x] Branch handling recorded as N/A because no commit or PR was requested.
- [x] Workspace authority recorded: proof commands ran in `Plate repo root`.
- [x] Browser route, interaction path, and visible outcome recorded.
- [x] Browser proof uses approved Browser first and records fallback after
      client-side local URL blocking.
- [x] Browser console and dynamic search-highlight behavior checked.
- [x] Package boundary, release artifact, and hard-cut decision recorded.
- [x] Package-owned checks recorded through `bun check`.
- [x] Review/autoreview outcome recorded: helper hung and was killed; manual
      patch review found and fixed stylesheet nesting risk.
- [x] Agent-native review decision recorded as N/A: no `.agents`, `.claude`,
      `.codex`, hook, prompt, or command source changed.
- [x] Local-env-rot retry policy recorded as N/A: failures were source or stale
      generated-output issues, not install corruption.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, dependency refresh, checks, and browser proof | All threshold rows below passed |
| Bug reproduced before fix | N/A | Record reason | Migration, not a bug repro |
| Targeted behavior verification | yes | Browser-smoke representative migrated routes | Pagination, markdown-preview, search-highlighting, and comment-mode mounted expected migrated selectors; search produced 3 highlights |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun typecheck:site`, `bun typecheck:root`, and full `bun check` passed |
| Package manifests, lockfile, or install graph changed | yes | Run install and checks | `bun install` removed one package; `bun check` passed |
| Workspace authority proof | yes | Run proof in owning checkout | All commands ran from `/Users/zbeyens/git/plate-2/Plate repo root` |
| Browser surface changed | yes | Exercise route/interaction | Local Chromium smoke passed; Browser-client blocked local URLs with `ERR_BLOCKED_BY_CLIENT` |
| Browser console/network check | yes | Record console state | Final browser smoke reported `errors: []` |
| Browser final proof artifact | yes | Record screenshot path | `/tmp/plite-shadcn-search.png` |
| Package behavior or public API changed | N/A | Add changeset or reason | No published package behavior/API/types/config/runtime delta |
| Registry-only component work changed | N/A | Update registry changelog or reason | No registry work |
| Docs or content changed | N/A | Verify or reason | No intentional docs/content edit for this task |
| High-risk mini gate | yes | Record failure mode and proof plan | Risk: styling drift from moving runtime styles to stylesheet; proof: source audit, typecheck, lint, browser smoke, and screenshot |
| Agent-native review | N/A | Record reason | No agent/tooling files changed |
| Local install corruption suspected | N/A | Record reason | No install-corruption signature |
| Autoreview | N/A | Record blocker/alternate review | Helper ran >3 minutes with no output; killed PID 69249; manual review found and fixed native CSS nesting risk |
| PR create or update | N/A | Record reason | No PR requested |
| Final lint | yes | Run `bun lint:fix` and `bun lint` | Both passed after cleanup |
| Public API / package boundary proof | yes | Source-audit impact | Root private dependency only; no package exports/barrels changed |
| Release artifact classification | yes | Record classification | No artifact: private root/site example cleanup |
| Package typecheck/build/test | yes | Run owning checks | `bun check` passed |
| Barrel/export generation | N/A | Record reason | No package exports or exported file layout changed |
| Goal plan complete | yes | Run autogoal checker | To run after final plan update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, package manifest, shadcn wiring, and Emotion audit read | Done |
| Implementation | complete | Emotion imports removed; class names and stylesheet rules added; dependency removed | Done |
| Verification | complete | Source audit, `bun check`, and browser smoke passed | Done |
| Review | complete | Autoreview helper blocked; manual review cleanup applied and reverified | Done |
| Closeout | complete | Final goal-plan checker remains as mechanical closeout | Done |

Findings:
- Initial audit found shadcn already wired through `site/components.json`,
  `site/styles/shadcn.css`, `site/components/ui/button.tsx`, and
  `site/pages/_app.tsx`.
- Initial audit found `@emotion/css` imports across examples under
  `site/examples/ts/**` plus root `package.json` and `bun.lock`.
- Root check exposed unrelated async integration script type/lint gaps. Fixed
  the declaration file as `.d.mts` and removed one dead unused helper so
  `bun check` could prove the checkout.
- Browser-client in-app navigation to local URLs was blocked by the client with
  `net::ERR_BLOCKED_BY_CLIENT`; local Chromium proof against the same running
  app succeeded.

Timeline:
- 2026-05-27T07:44Z Created active goal and goal plan.
- 2026-05-27T07:44Z Read prompt, skills, package manifest, shadcn wiring, and
  Emotion audit.
- 2026-05-27T07:45Z Converted static style constants to stylesheet classes.
- 2026-05-27T07:48Z Replaced remaining dynamic Emotion calls with class toggles.
- 2026-05-27T07:49Z Ran `bun install`; lockfile removed `@emotion/css`.
- 2026-05-27T07:50Z `bun typecheck:site` passed.
- 2026-05-27T07:51Z `bun lint:fix` initially exposed CSS selector ordering;
  fixed and reran successfully.
- 2026-05-27T07:53Z Browser-client local URL proof blocked with
  `ERR_BLOCKED_BY_CLIENT`; local Chromium smoke succeeded.
- 2026-05-27T07:56Z `bun check` passed after root declaration/lint cleanup.
- 2026-05-27T07:57Z Autoreview helper hung and was terminated.
- 2026-05-27T08:03Z Manual review cleanup flattened stylesheet selectors.
- 2026-05-27T08:04Z Final `bun check` and browser smoke passed.

Decisions and tradeoffs:
- Hard cut means no local Emotion compatibility helper, no wrapper around
  Emotion semantics, and no new styling runtime.
- Kept example-specific styles in the already-loaded site stylesheet rather
  than scattering a new styling abstraction through examples.
- Used local Chromium smoke only after the approved in-app Browser path blocked
  local dev URLs.
- Fixed root async integration declaration/lint gaps because they blocked the
  repo's fast verification gate and were narrow source fixes.

Review fixes:
- Flattened generated nested CSS selectors and media rules after manual review
  to avoid relying on native CSS nesting support.
- Added `scripts/integration-local-async.d.mts` and removed the unused
  `pickupPath` helper so root typecheck/lint could pass.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun serve` on 3100 failed with EADDRINUSE | 1 | Use already-running checkout server on 3100 | Browser smoke used `http://localhost:3100` |
| Browser-client local URL blocked with `ERR_BLOCKED_BY_CLIENT` | 2 | Use local Chromium smoke against same server | Smoke passed with zero console errors |
| First declaration filename `.mjs.d.ts` not resolved by TS | 1 | Use ESM declaration filename `.d.mts` | `bun typecheck:root` passed |
| Autoreview helper produced no output for >3 minutes | 1 | Terminate helper and do manual source review | Manual review cleanup applied and reverified |

Verification evidence:
- command: `bun install` from `Plate repo root` -> pass, saved lockfile, one
  package removed.
- command: `rg -n '@emotion|emotion|css\(|cx\(' . --glob '!site/.next/**' --glob '!site/out/**'`
  from `Plate repo root` -> zero matches.
- command: `rg -n '"@emotion/css"|@emotion|emotion' package.json bun.lock site/examples/ts site/public/index.css scripts --glob '!site/.next/**' --glob '!site/out/**'`
  from `Plate repo root` -> zero matches.
- command: `bun typecheck:site` from `Plate repo root` -> pass.
- command: `bun typecheck:root` from `Plate repo root` -> pass.
- command: `bun lint:fix` from `Plate repo root` -> pass.
- command: `bun lint` from `Plate repo root` -> pass.
- command: `bun check` from `Plate repo root` -> pass: lint, package/site/root
  typecheck, 1258 Bun tests, 35 slate-layout tests, and 457 slate-react Vitest
  tests.
- browser: local Chromium smoke from `Plate repo root` against
  `http://localhost:3100` -> pass: pagination, markdown-preview,
  search-highlighting, and comment-mode selectors present; `css-*` class count
  0 on every checked route; search interaction produced 3 highlights; console
  errors `[]`.
- artifact: screenshot saved at `/tmp/plite-shadcn-search.png`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker issue supplied.
- Confidence line: high; source audit, dependency audit, full fast gate, and
  browser smoke are green.
- Flow table:
  - Reproduced: N/A, migration request rather than bug repro.
  - Verified: source audit, `bun check`, and browser smoke passed.
- Browser check: approved Browser-client blocked local URL; local Chromium smoke
  passed against the running checkout server.
- Outcome: Emotion hard cut completed.
- Caveat: autoreview helper hung; manual review was used instead.
- Design:
  - Chosen boundary: site examples plus private root dependency graph.
  - Why not quick patch: leaving a compatibility helper would keep the dead
    styling runtime alive.
  - Why not broader change: package runtime/API was not part of the styling
    dependency cut.
- Verified: see Verification evidence.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after checker and goal completion |
| What is the goal? | Hard cut Emotion from `Plate repo root` and migrate site examples to shadcn/default-style CSS |
| What have I learned? | Emotion was limited to example styling plus root dependency graph; shadcn was already wired |
| What have I done? | Removed dependency/imports/runtime classes, moved styles to stylesheet, fixed fast-check blockers, verified with source audit, `bun check`, and browser smoke |

Open risks:
- Autoreview helper did not complete; mitigated by manual source review and
  rerunning deterministic checks.
