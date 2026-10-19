# Clean Link comments subscription

Objective:
Clean Link's optional Comments subscription; done when focused hook tests,
`www` typecheck, registry generation, scoped lint, and live browser checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-clean-link-comments-subscription.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct chat continuation
- id / link: N/A: no external issue or tracker
- title: Clean the Link-to-Comments active-ID read
- acceptance criteria:
  - `link.tsx` performs one semantic `useActiveCommentId()` read instead of
    owning an external-store subscription.
  - `comment.tsx` owns the optional subscription and returns `null` when the
    provider or configured plugin is absent.
  - Keep `slots.afterEditable`; do not add a Plate package API, plugin, overlay
    manager, file split, or broad generic store helper.
  - Preserve Link and Discussion behavior and prove the relevant routes.

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
- initial confidence score: N/A: binary verification threshold applies
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- The four acceptance criteria above are true; focused tests cover absent
  provider, absent plugin, and installed-plugin updates; the named source,
  typecheck, registry, lint, and browser gates pass or carry an exact unrelated
  blocker.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-clean-link-comments-subscription.md` passes.

Verification surface:
- `apps/www/src/registry/components/editor/comment.spec.tsx`.
- `apps/www/tests/browser/link-floating-toolbar.spec.ts` case
  `link:floating-toolbar-discussion-spacing`.
- `pnpm --filter www typecheck` and a scoped Ultracite check for touched source.
- `pnpm --filter www build:registry` because registry source changes.
- Source audit of `link.tsx` and `comment.tsx`.
- Browser checks on `/blocks/link-demo` and `/blocks/discussion-demo`, including
  console/network state and the visible Link/Discussion interaction.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Preserve the current Link floating-toolbar placement rule and
  `slots.afterEditable` registration.
- Keep the runtime law at one narrow active-ID subscription per consumer; do
  not move active state into `CommentsContext` and rerender all consumers.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `comment.tsx`, `link.tsx`, their focused specs, registry
  generation, and the two standalone demos.
- Allowed edit scope: those source/spec files, the existing Link browser spec,
  generated registry output, and this goal plan. Expand only for a proven
  owning failure.
- Browser surface: `/blocks/link-demo`, `/blocks/discussion-demo`, and the real
  combined `/view/editor-ai` surface.
- Browser strategy: Browser for normal app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR was requested.
- Non-goals: package API, a new plugin, shared overlay manager, Comments context
  fan-out, sidebar/discussion redesign, docs copy, commit, push, or PR.

Output budget strategy:
- Read exact source ranges and cap searches with owner globs and `head`; exclude
  generated JSON, `.next`, `node_modules`, and broad repository output unless a
  named verification command owns it.

Blocked condition:
- Stop only if the relevant app cannot be built or run after the repository's
  one allowed reinstall recovery, or current source proves the accepted
  ownership cannot preserve Link/Discussion behavior without a broader API
  decision.

Task state:
- task_type: registry React ownership cleanup with a missing-plugin robustness case
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: Delete Link's manual external-store plumbing; Comments owns one
    registry-local semantic hook.
- confidence: high; source, focused tests, registry generation, TypeScript,
    5/5 Chromium, and final Browser geometry proof are complete
- next owner: final handoff
- reason: Link needs one semantic value; Comments owns the optional descriptor,
    store lookup, and absence behavior.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-clean-link-comments-subscription.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and non-goals above copy the accepted cleanup. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `auto`, `autogoal`, `plate-ui`, its component-family law, `shadcn`, and focused `best-api` ownership law. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created the matching active goal. |
| Source of truth read before edits | yes | Read exact hook/provider and Link toolbar ranges plus current focused specs and consumers. |
| Tracker comments and attachments read | no | N/A: direct chat request, no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the registry helper ownership/generation solution; no new helper file or metadata edge is needed. |
| TDD decision before behavior change or bug fix | yes | Add and run the provider/plugin absence test before the source repair. |
| Branch decision for code-changing task | no | N/A: local edit only; no commit, push, or PR requested. |
| Release artifact decision | no | N/A: internal copied-code cleanup with unchanged install shape and behavior; no changeset or registry changelog. |
| Browser tool decision for browser surface | yes | Use the in-app Browser; no native Chrome-only behavior is involved. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact ranges, bounded searches, generated-output exclusions recorded above. |
| Browser pack selected | yes | `browser` pack materialized. |
| Browser route / app surface identified | yes | `/blocks/link-demo`, `/blocks/discussion-demo`, and combined `/view/editor-ai`. |
| Browser tool decision recorded | yes | In-app Browser first; Chrome/Computer N/A. |
| Console/network caveat policy recorded | yes | Check both on fresh final routes; report any unrelated failure exactly. |
| Observable browser case captured | no | N/A: this is not a report-backed paint claim; source robustness case is provider/plugin mismatch and live demos guard product behavior. |

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
- [x] Required video or screen-recording evidence is N/A: none supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: Comments owns the
      optional active-ID subscription; Link consumes one semantic value.
- [x] Release artifact requirement recorded: N/A because package/public install
      shape and visible behavior do not change.
- [x] Final handoff shape decided: concise outcome, exact tests/typecheck,
      registry generation, browser proof, and any caveat; PR/tracker N/A.
- [x] Branch handling recorded: N/A because no git publication was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: optional provider can reference an uninstalled
      plugin; the hook must fail closed to `null`. Runtime cost stays one narrow
      subscription, identical to the deleted Link-owned subscription.
- [x] Review/P1 autoreview is N/A: this is a trivial two-line ownership call-site
      cleanup with focused tests, and `autoreview` is forbidden on `next`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling source changes.
- [x] Output budget discipline recorded. One audit accidentally printed a
      generated JSON content line (12.5k tokens, tool-truncated); broad output
      stopped immediately and the final audit used exact source ranges.
- [x] Browser pack: routes are named above; verify Link opens/edits normally and
      Discussion opens from an anchored comment without console/network errors.
- [x] Browser pack: Browser is selected for these normal app surfaces;
      Chrome/Computer are N/A.
- [x] Browser pack: final Browser reload reported zero console warnings/errors,
      zero failed requests, and zero responses at or above 400.
- [x] Browser pack: final Browser screenshot visibly shows both surfaces with
      the Link toolbar above Floating Discussion.
- [x] Browser pack: reporter-visible paint proof is N/A because no pixel-level
      paint claim is being made.
- [x] Browser pack: report-backed proof is N/A; the deterministic red case is a
      provider configured with an uninstalled descriptor.
- [x] Browser pack: final proof reloaded `/view/editor-ai`, waited for the
      seeded comment, clicked its `comments` link, and rechecked both visible
      surfaces, geometry, console, and network on the final runtime source.
- [x] Browser pack: clean pushed-ref certification is N/A for an uncommitted
      local candidate; final wording will not claim shipped behavior.
- [x] Browser pack: the durable Chromium case passed 5/5 retry-free with one
      worker after the final formatter pass.
- [x] Browser pack: no stub, alias, route bypass, or hand-edited generated file
      is used; registry output came from `build:registry`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named tests, generation, typed checks, lint, source audit, and browser proof | Complete; the composite `www` command has the exact unrelated API-manifest caveat below. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Expected red: missing `useActiveCommentId` export, 0 pass / 1 fail. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 28/28 component tests, 13/13 registry tests, and Chromium 5/5 pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Main app `tsc` passed with 8 GB heap; package-integration `tsc` passed. Composite `www typecheck` stops earlier on an unrelated stale API-reference manifest. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file layout change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: none changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: none changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used localhost:3000. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Link demo, Discussion demo, and combined AI editor exercised in Browser. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Final screenshot plus geometry: Link bottom 311.09, Discussion top 342.22, intersection false. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` changes; registry payloads were generated by the owning command. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-local hook and cleanup only; no npm package API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no visible UI, metadata, dependency, or install-file topology change. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this internal goal ledger changed. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and why the chosen boundary is right | Missing installed plugin fails closed to `null`; focused tests cover absence and updates; one narrow subscription preserves fan-out. |
| Agent-native review for agent/tooling changes | no | Load agent-native review when applicable | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run one reinstall only for matching corruption signals | N/A: stale generated API data and TypeScript heap pressure are not install corruption. |
| P1 autoreview for non-trivial implementation changes | no | Run only when applicable | N/A: narrow cleanup with direct tests; `autoreview` is forbidden on `next`. |
| PR create or update | no | Run `check` before PR work and sync the body | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body when one exists | N/A: no PR. |
| PR proof image hosting | no | Host proof images when a PR requires them | N/A: no PR. |
| Tracker sync-back | no | Sync after a PR when requested | N/A: no tracker. |
| Final handoff contract | yes | Fill the fields below | Complete below. |
| Final lint | yes | Run scoped equivalent | Scoped Ultracite passes on all four changed source/test files. |
| Output budget discipline | yes | Record any oversized output and recovery | One generated-JSON output miss recorded; final reads were bounded. |
| Timed checkpoint | no | Finish requested duration or record N/A | N/A: no duration. |
| Goal plan complete | yes | Run the exact checker command | Passed: `[autogoal] complete`. |
| Browser interaction proof | yes | Exercise target routes with Browser | Link edit, Discussion open, and combined commented-link interaction passed. |
| Browser console/network check | yes | Record console/network state | Final fresh reload: 0 warnings/errors, 0 loading failures, 0 responses >=400. |
| Browser final proof artifact | yes | Record screenshot/geometry | Browser screenshot captured; exact rectangles recorded above. |
| Exact case replay | no | Replay report-backed case when applicable | N/A: not an external report-backed claim. |
| Final ref and fingerprints | yes | Record local source identity | Base HEAD `a6afd55c`; SHA-256 values recorded under verification evidence. |
| Clean final runtime | no | Certify pushed ref or state local limitation | N/A: uncommitted local candidate; no shipped/clean-ref claim. |
| Retry-free stability | yes | Run 5/5 when applicable | Chromium case passed 5/5 with one worker and no retry. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan and active goal contain the full contract | implementation |
| Implementation | complete | Comments hook added; Link manual adapter deleted; browser spec added | verification |
| Verification | complete | focused tests, registry build, typed checks, lint, 5/5 Chromium, and Browser proof | closeout |
| PR / tracker sync | N/A | no PR or tracker requested | final response |
| Closeout | complete | final ledger and caveat recorded | final response |

Findings:
- `link.tsx` currently owns an 18-line `useSyncExternalStore` adapter and does
  not guard `editor.plugin(comments.plugin).installed`.
- `comment.tsx` already owns the provider, optional context, and narrow external
  store hooks; the active comment ID belongs there.
- Moving the existing one-consumer subscription does not change subscription
  fan-out or add runtime machinery; the scale-sensitive API gate is N/A.
- The existing best-API doctrine already requires optional descriptor portal
  checks and registry-local narrow subscriptions, so no doctrine repair is
  needed.

Decisions and tradeoffs:
- Delete Link's manual adapter and export one narrow Comments-family read ->
  keeps the cross-feature call semantic and fail-closed -> adds one registry
  export but no package or lifetime owner.
- Do not put `activeId` into `CommentsContext` -> that would rerender unrelated
  context consumers and widen subscription fan-out.
- Keep `slots.afterEditable` -> it is the correct structural placement API and
  unrelated to the dirty subscription code.

Implementation notes:
- Added the focused hook contract first; `bun test
  apps/www/src/registry/components/editor/comment.spec.tsx` failed because
  `useActiveCommentId` was not exported.
- Added the Comments-owned optional active-ID subscription with an installed
  portal guard and reduced Link to one semantic hook call.
- Added durable browser coverage on the seeded commented link in
  `/view/editor-ai`; both overlays must be visible and vertically disjoint.

Review fixes:
- Initial browser-spec formatting failed; scoped Ultracite fixed the file and
  the final check passed.
- Final hard-cut review kept `slots.afterEditable`, rejected a package hook,
  context-wide active state, a generic optional-store API, and another plugin.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused red test: `useActiveCommentId` export missing | 1 | Implement the accepted Comments-owned hook | Expected TDD red; implementation added |
| Composite `www typecheck` stopped on stale API-reference manifest | 1 | Run the remaining owning checks independently | Editor check, source/parity checks, both TypeScript projects pass; unrelated manifest left untouched |
| Main `tsc` exhausted the default 4 GB heap while run concurrently | 1 | Retry sequentially with an explicit 8 GB Node heap | Passed |
| Browser `networkidle` wait unsupported | 1 | Use supported `load` plus fresh AX/locator waits | Passed final interaction and diagnostics |
| Generated registry JSON printed too much during source audit | 1 | Stop broad generated output; use exact source ranges and `git diff --check` | Recovered; final audit bounded |

Verification evidence:
- command: `bun test apps/www/src/registry/components/editor/comment.spec.tsx`
  from `/Users/zbeyens/git/plate-2` -> expected red, 0 pass / 1 fail, missing
  `useActiveCommentId` export before implementation.
- command: focused final Bun suite -> 28 pass / 0 fail / 80 expectations.
- command: registry metadata suite -> 13 pass / 0 fail / 1566 expectations.
- command: `pnpm --filter www build:registry` -> generated 366 canonical
  payloads and 15 sparse overlays successfully.
- command: docs parity and registry source checks -> pass.
- command: package-integration `tsc` and main app `tsc` with 8 GB heap -> pass.
- command: scoped Ultracite and scoped `git diff --check` -> pass.
- command: `link:floating-toolbar-discussion-spacing --repeat-each=5
  --workers=1` -> 5/5 Chromium pass with no retry.
- browser: `/blocks/link-demo` opened and entered Link editing;
  `/blocks/discussion-demo` opened the two-thread Floating Discussion;
  `/view/editor-ai` opened the seeded commented link and both surfaces.
- browser: final combined geometry -> Link `{top: 271.11, bottom: 311.09}`;
  Discussion `{top: 342.22, bottom: 589.25}`; intersection `false`; console
  warnings/errors `0`; failed requests `0`; responses >=400 `0`.
- source fingerprints:
  - `comment.tsx` `9464c4614d2c34a1e83034f3bb04704367714f71cfd4eee1806d6b98bd5a0758`
  - `link.tsx` `a6ae9f9c9a97618b7db186af0f456daaf9c6145bb57a093dd8ed1e1ae9cd3c08`
  - `comment.spec.tsx` `4386e337db50b4c34d8c8c631fac1ec846b124934164dfd96f4db6d6952d9b36`
  - `link-floating-toolbar.spec.ts` `c4a36a619b7ef39c47decaaf2bb4f98c3a4a27d03187feb007374daf97577216`

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: high for the scoped local candidate
- Flow table:
  - Reproduced: missing Comments-owned hook failed the focused spec before implementation
  - Verified: 28 focused tests, 13 registry tests, Chromium 5/5, and live Browser proof
- Browser check: Link, Discussion, and combined AI editor pass with no observed errors
- Outcome: Link contains one semantic Comments read; Comments owns optional subscription and missing-plugin behavior
- Caveat: composite `www typecheck` still stops on an unrelated stale API-reference manifest; its remaining owning checks pass independently
- Design:
  - Chosen boundary: exported registry-local `useActiveCommentId` in `comment.tsx`
  - Why not quick patch: the deleted Link block was the quick patch and omitted the installed guard
  - Why not broader change: one consumer does not justify package API, context fan-out, generic store machinery, or another plugin
- Verified: exact commands and browser geometry are recorded above
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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker
- Browser proof: final live screenshot/geometry plus durable 5/5 Chromium case
- Caveats: unrelated stale API-reference manifest prevents the composite
  `pnpm --filter www typecheck` wrapper from reaching checks that passed when
  invoked independently

Timeline:
- 2026-09-04T15:05:05.357Z Task goal plan created.
- 2026-09-04 Intake closed: requirements, ownership, hard-cut, tests, registry,
  and browser gates recorded before implementation.
- 2026-09-04 Implemented the Comments-owned hook and deleted Link-owned store
  plumbing; focused unit and registry checks passed.
- 2026-09-04 Generated registry payloads, passed typed/scoped checks, added and
  passed 5/5 durable Chromium coverage, and captured final live Browser proof.
- 2026-09-04 Goal checker passed and the active goal was marked complete.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal complete |
| Where am I going? | Concise final handoff |
| What is the goal? | Make Link consume one robust Comments-owned active-ID hook. |
| What have I learned? | The smallest durable owner is one registry-local Comments hook; the real combined route already supplies an exact commented-link fixture. |
| What have I done? | Implemented, generated, tested, typechecked, linted, ran Chromium 5/5, and captured fresh Browser geometry/error proof. |

Open risks:
- Scoped implementation risk: none found.
- Repository caveat: `pnpm --filter www typecheck` stops at the unrelated stale
  `src/generated/api-reference-manifest.json`; this task did not regenerate or
  overwrite that shared output from other uncommitted package work.
