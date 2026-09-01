# Hard Cut Next WWW Redirects

Objective:
Hard-cut useless `apps/www` redirects on `next`; done when every redirect is
classified against `main` and current route ownership, every compatibility-only
row is deleted, canonical routes work, and zero unjustified rows remain.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-hard-cut-next-www-redirects.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user correction to an under-scoped hard-cut audit
- id / link: `apps/www/next.config.ts` on the current `next` checkout, compared
  with `main`
- title: Remove useless redirects added on `next`
- acceptance criteria: inventory every object in `redirects()`; compare the
  block and route changes against `main`; delete every compatibility-only
  redirect introduced on `next`; retain a row only if a hard correctness,
  security, serialized-data, native-behavior, or already-shipped public contract
  proves it; do not add aliases, tombstones, tests for deleted paths, or another
  redirect owner; prove canonical destinations still render and old sources no
  longer redirect.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: the redirect ledger and zero-residue audit are
  binary
- improvement loop: N/A: one bounded config/reference/browser sweep
- final score / loop closure: N/A: no timed loop

Completion threshold:
- Every current redirect row has a source/destination, `main` presence, current
  source-owner, destination-owner, contract class, and keep/cut verdict.
- Every redirect that exists only to preserve a renamed/deleted `next` route is
  deleted. Any retained redirect has concrete hard-contract evidence.
- A final source audit finds zero unclassified or unjustified rows and no second
  redirect/alias owner for the cut paths.
- `apps/www` formatting/type proof passes; Browser proves every canonical
  destination still renders and every cut source remains on its own URL without
  canonical content or redirect.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-next-www-redirects.md` passes.

Verification surface:
- Current-vs-`main` config diff plus exact redirect ledger and route-owner
  searches.
- Scoped formatter and `pnpm --filter www typecheck` after deletion.
- Browser route replay for every unique destination and cut source, with console
  error check; raw local HTTP headers distinguish redirects from the docs
  catch-all's existing unknown-route response.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Work directly on `next`; do not switch branches or create a worktree.
- Preserve redirects already present on `main` unless evidence independently
  proves they are in the user-authorized `next` cleanup scope.
- Do not treat implementation effort, SEO habit, bookmarks, or compatibility
  preference as a hard contract.

Boundaries:
- Source of truth: current `apps/www/next.config.ts`, local `main` and
  `origin/main` versions of that file, current content/app route owners, and live
  `apps/www` Browser behavior.
- Allowed edit scope: the redirect block in `apps/www/next.config.ts`, directly
  proven dead compatibility glue elsewhere if any, and this plan. Do not touch
  unrelated route content, staged work, or generated files.
- Browser surface: every redirect source/destination classified for deletion or
  retention.
- Browser strategy: Browser for route/render proof. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or tracker requested.
- Non-goals: no repository-wide router rewrite; no main-branch edits; no route
  content redesign; no package/runtime API change; no PR, commit, push, or
  tracker mutation.

Output budget strategy:
- Read only the bounded redirect block from current/main/origin-main. Extract
  source/destination pairs as counts or short tables. Search exact paths in
  named route/content owners, excluding generated registry, `.next`,
  `node_modules`, `.turbo`, logs, and unrelated staged output. Cap all results.

Blocked condition:
- Stop only if local `main` and `origin/main` disagree in a way that changes the
  authorized cut, or a redirect has source-backed evidence of an already-shipped
  correctness/security/data contract that requires explicit override.

Task state:
- task_type: hard cut and route-config audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: complete
- goal_status: complete

Current verdict:
- verdict: delete the entire 16-row `redirects()` method; all rows are legacy
  migration or canonicalization aliases and current protocols already use the
  destination forms
- confidence: high; branch comparison, current callers, protocol owners, HTTP,
  Browser, formatting, and typecheck agree
- next owner: task
- reason: 13 rows came from `main`, three were added on `next`, and none protects
  a hard correctness/security/data/native contract

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-next-www-redirects.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Entire `redirects()` block on `next`, `main` comparison, hard cuts, no compatibility replacements, and exact proof are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Continue the loaded `hard-cut` workflow; `autogoal` owns measurable closure and the Browser pack owns route proof. |
| Active goal checked or created | yes | `get_goal` returned none; created the active goal naming this plan. |
| Source of truth read before edits | yes | Read the full current/main/origin-main block, route owners, Markdown negotiation, registry URL config, and locale caller before product edits. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: bounded correction to current route config with direct branch comparison. |
| TDD decision before behavior change or bug fix | no | N/A: deleted redirects must not gain deleted-behavior tests; canonical destinations receive type and Browser proof. |
| Branch decision for code-changing task | yes | Keep the current checkout on `next`; compare refs read-only and create no worktree. |
| Release artifact decision | no | N/A: app route-config deletion needs no changeset or registry changelog. |
| Browser tool decision for browser surface | yes | Browser for visible route proof; raw local HTTP only diagnoses redirect headers. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker requested. |
| Output budget strategy recorded | yes | Bounded block reads, extracted pairs, exact path searches, and capped output are recorded above. |
| Browser pack selected | yes | Route behavior is the user-visible acceptance surface. |
| Browser route / app surface identified | yes | Every classified source/destination under the `apps/www` server. |
| Browser tool decision recorded | yes | Browser for normal app QA; no native Chrome/OS behavior applies. |
| Console/network caveat policy recorded | yes | Record console errors; raw HTTP distinguishes redirects from unknown-route shell behavior. |
| Observable browser case captured | no | N/A: direct local config cleanup, not a report-backed public behavior issue. |

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
- [x] Nearby repo instructions and implementation patterns read before edits:
      root/project instructions, `hard-cut`, current/main/origin-main config,
      docs Markdown negotiation, registry URL config, locale owners, and route
      content.
- [x] Implementation fixes the right ownership boundary: delete the whole
      compatibility method from `apps/www/next.config.ts`; update the sole stale
      `?locale=cn` caller to the canonical `/cn/docs` URL.
- [x] Release artifact requirement recorded: N/A: app route-config deletion
      changes no package or registry release artifact.
- [x] Final handoff shape decided: 16-row cut ledger, two-file diff, source/type/
      HTTP/Browser proof, and explicit no-PR/no-tracker lines.
- [x] Branch handling recorded for code-changing work: direct current `next`
      checkout; no branch switch or worktree.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: shell proof ran in
      `/Users/zbeyens/git/plate-2`; Browser used the live `apps/www` server.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: a retained hidden redirect owner or broken canonical
      destination. Exact path search, HTTP, and Browser must falsify both.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: branch is `next`,
      where repo law forbids `autoreview`; the exact two-file diff and route
      ledger received source/runtime proof.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none are in scope.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
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
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      no paint claim.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
      N/A: direct config audit, not report-backed.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints. A fresh
      Browser tab replayed all route groups; file fingerprints are recorded.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: local uncommitted candidate; no pushed,
      shipped, or public-issue completion claim.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. N/A: route-only
      config, no native lifecycle behavior.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | HEAD 16, `main` 13, working tree 0; source, formatter, typecheck, HTTP, and Browser gates passed. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Current `next` source contained 16 permanent redirects; user identified the unwanted compatibility block. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | All 16 source samples returned no redirect; all 14 unique canonical destinations returned HTTP 200; Browser kept source URLs and rendered canonical visible routes. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file-layout change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: none changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: none changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Shell proof ran in `/Users/zbeyens/git/plate-2`; Browser used its live `apps/www` server. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Fresh Browser tab replayed all visible destination groups and all 16 cut sources. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Canonical titles/headings rendered, each source retained its URL, and console errors were zero. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: app URL compatibility removal is not a package/API release; no changeset. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: registry components and generated registry output did not change. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Only the stale Chinese README URL changed; canonical link rendered and full www docs/type parity passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risks were hidden redirect owners and broken current protocols; exact searches plus HTTP/Browser proved zero hidden rows and healthy `.md`, `.json`, locale, docs, releases, and Plite destinations. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: branch is `next`, where repo law forbids `autoreview`; exact two-file diff and full route ledger were directly verified. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec ultracite fix apps/www/next.config.ts tooling/cn/README.md` passed; `git diff --check` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One generated-release long-line miss is recorded; all later reads were exact, excluded, and capped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-hard-cut-next-www-redirects.md` | Passed: `[autogoal] complete` for this plan. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser route replay completed. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser console error count 0; raw HTTP showed zero redirect destinations. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Semantic Browser route/title/h1 ledger plus HTTP status/content-type ledger recorded; screenshot N/A because no visual claim. |
| Exact case replay | no | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | N/A: direct local config audit, not report-backed. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local uncommitted `next` candidate; config SHA-256 `36073907...b028d51`, README `e55136fc...c4a847ad`. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local uncommitted candidate; no pushed/shipped claim. |
| Retry-free stability | no | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | N/A: route-only config, no native lifecycle behavior. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Current/HEAD had 16 rows, `main` and `origin/main` shared 13, current protocol owners and callers audited. | implementation |
| Implementation | complete | Deleted the entire redirect method and canonicalized the sole stale Chinese README URL. | verification |
| Verification | complete | Exact source audit, formatter, diff check, full www typecheck, HTTP matrix, and Browser matrix passed. | closeout |
| PR / tracker sync | complete | N/A: neither requested. | final response |
| Closeout | complete | Final goal-plan checker passed. | final response |

Findings:
- `main` and `origin/main` both resolve to `cce36d378b` and contain 13 redirect
  rows. `HEAD` on `next` contained 16: the same 13 plus three Plite migration
  aliases. The final working config contains zero.

| Source | Destination | On `main` | Current owner / contract | Verdict |
| --- | --- | --- | --- | --- |
| `/docs/migration` | `/docs/releases` | yes | Releases and individual migration leaf pages are canonical | cut |
| `/cn/docs/migration` | `/cn/docs/releases` | yes | A live Chinese migration page exists at the source and was masked by the redirect | cut |
| `/docs/plite/examples` | `/examples/plite/richtext` | no | Plite examples app route is canonical | cut |
| `/docs/plite/migration/plite` | `/docs/plite/migration` | no | Plite migration guide is canonical | cut |
| `/docs/plite/releases/plite` | `/docs/plite/why-this-fork` | no | Why This Fork guide is canonical | cut |
| `/docs/components/changelog` | `/docs/installation/plate-ui#sync-copied-files` | yes | Plate UI installation guide owns copied-file sync | cut |
| `/cn/docs/components/changelog` | `/cn/docs/installation/plate-ui` | yes | Chinese Plate UI installation guide is canonical | cut |
| `/docs.mdx` | `/docs` | yes | HTML docs use `/docs`; raw docs use `.md` | cut |
| `/docs/:path*.mdx` | `/docs/:path*.md` | yes | Markdown negotiation owns `.md`; `.mdx` is not public protocol | cut |
| `/cn/docs.mdx` | `/cn/docs` | yes | Chinese HTML docs use `/cn/docs`; raw docs use `.md` | cut |
| `/cn/docs/:path*.mdx` | `/cn/docs/:path*.md` | yes | Chinese Markdown negotiation owns `.md` | cut |
| `/r/:path([^.]*)` | `/r/:path.json` | yes | Registry config requires `{name}.json` | cut |
| `/rd/:path([^.]*)` | `/rd/:path.json` | yes | Development registry uses canonical JSON files | cut |
| `/?locale=cn` | `/cn` | yes | Locale path prefix is canonical | cut |
| `/docs/:path*?locale=cn` | `/cn/docs/:path*` | yes | Locale path prefix is canonical | cut |
| `/:path*?locale=cn` | `/cn/:path*` | yes | Locale path prefix is canonical | cut |

- The only live old-format caller was the Chinese tooling README's
  `https://platejs.org/cn/docs?locale=cn`; it now links directly to
  `https://platejs.org/cn/docs`.
- The `rewrites()` method remains because it implements current `.md` document
  negotiation. It is not compatibility or navigation and does not change the
  browser URL.

Decisions and tradeoffs:
- Delete the whole `redirects()` method -> every row failed the hard-contract
  test, and row-by-row retention would preserve arbitrary history.
- Update the sole stale caller -> hard cuts delete callers instead of relying on
  dead-path routing.
- Keep current Markdown rewrites -> `/docs/*.md` and `/cn/docs/*.md` are active
  machine-readable protocols with direct tests and HTTP 200 proof.
- Add no tests for removed redirects -> tests should cover canonical routes, not
  deleted compatibility behavior.

Implementation notes:
- Two product files changed: `apps/www/next.config.ts` and
  `tooling/cn/README.md`. No generated file, package, lockfile, registry item, or
  release artifact changed.

Review fixes:
- Initial correction plan considered preserving `main` redirects. The user's
  clarification and hard-cut counterfactual widened the verdict to all 16 rows;
  source audit proved the 13 inherited rows are also compatibility-only.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First plan patch did not match one Browser-pack line | 1 | Split plan edits into bounded patches | Plan filled without replacing its generated structure. |
| Multi-ref `git rev-parse --short` invocation failed | 1 | Resolve `main` and `origin/main` separately | Both resolve to `cce36d378b`. |
| One caller search included a generated release-index long line | 1 | Exclude generated/public registry trees and search exact paths | Final exact search returned zero stale redirect/caller matches. |
| First Browser source matrix waited for a missing h1 | 1 | Count h1 before reading its text | Full 16-source matrix completed with zero console errors. |

Verification evidence:
- Cwd `/Users/zbeyens/git/plate-2`: redirect counts were HEAD 16, `main` 13,
  working tree 0.
- Exact search for `redirects()`, all literal sources, and `?locale=cn` returned
  exit 1 with zero current matches outside this plan/history.
- `pnpm exec ultracite fix apps/www/next.config.ts tooling/cn/README.md` passed.
- `git diff --check -- apps/www/next.config.ts tooling/cn/README.md` passed.
- `pnpm --filter www typecheck` passed editor generation, API reference, MDX,
  docs parity, registry source, Next type generation, and both TypeScript
  projects.
- Raw HTTP checked all 16 cut source samples: none returned a redirect
  destination. All 14 unique canonical destinations returned HTTP 200.
- Raw current protocols returned 200 with correct content types:
  `/docs/selection.md` and `/cn/docs/selection.md` were `text/markdown`;
  `/r/editor.json` and `/rd/editor.json` were `application/json`.
- Fresh Browser tab rendered canonical Releases, Chinese Releases, Plite rich
  text, Plite Migration, Why This Fork, Plate UI EN/CN, docs EN/CN, and Chinese
  home titles/headings at their own URLs.
- Fresh Browser replay kept all 16 cut sources on their source URL. Old docs and
  extensionless registry paths rendered no canonical destination; locale query
  paths stayed English/current-path; `/cn/docs/migration` revealed its own live
  Chinese migration page. Console error count was zero.
- Final local fingerprints: `apps/www/next.config.ts`
  `36073907df1eadb1f10df9386ec7eacd550b68f574e39436cd7bc4d78b028d51`;
  `tooling/cn/README.md`
  `e55136fcc7b605e864f28c6d07d51cec5e81cd8cb3ec7c2657961282c4a847ad`.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no tracker requested or mutated
- Confidence line: high; exhaustive row ledger and source/type/HTTP/Browser proof
  agree
- Flow table:
  - Reproduced: `next` config contained 16 compatibility redirects
  - Verified: working count 0, stale-source count 0, canonical destinations 14/14
    HTTP 200, Browser source/destination matrices green
- Browser check: passed with zero console errors
- Outcome: removed the entire redirect method and canonicalized one stale README
  caller
- Caveat: local uncommitted candidate; unknown docs slugs may use the existing
  empty docs shell rather than a universal 404, but none redirects
- Design:
  - Chosen boundary: delete the route-config owner and its sole stale caller
  - Why not quick patch: pruning only the three `next` additions would leave 13
    equally unjustified compatibility rows
  - Why not broader change: current `.md` rewrites are active protocols, not
    navigation compatibility
- Verified: row ledger, exact source audit, format/diff, full www typecheck, raw
  HTTP, Browser
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
- PR: N/A: no PR
- Issue / tracker: N/A: none
- Browser proof: passed
- Caveats: local/uncommitted and generic unknown-doc response noted above

Timeline:
- 2026-08-31T13:58:33.707Z Task goal plan created.
- 2026-08-31 classified all 16 redirect rows against `main`, route owners, and
  current protocols.
- 2026-08-31 deleted the whole redirect method and canonicalized the Chinese
  README link.
- 2026-08-31 formatter, diff check, full www typecheck, 16-source HTTP/Browser
  replay, 14-destination HTTP matrix, and canonical Browser routes passed.
- 2026-08-31 autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Complete the active goal and hand off. |
| What is the goal? | Delete every compatibility-only redirect added on `next` and prove canonical routes survive. |
| What have I learned? | All 16 rows are compatibility-only; current protocols already use destination forms. |
| What have I done? | Removed all redirects, updated the stale caller, and passed every named proof gate. |

Open risks:
- None inside the local hard-cut scope. This is not committed, pushed, deployed,
  or released.
