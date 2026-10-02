# Round-trip lists inside markdown table cells

Objective:
Make `@platejs/markdown` read `<ul>`/`<ol>` inside table cells as indent-list paragraphs and write cell list paragraphs back as inline HTML lists, with tests, a patch changeset, and a docs row, delivered through PR #5139.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5139-round-trip-lists-in-table-cells.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub PR URL (`$task https://github.com/udecode/plate/pull/5139`), backed by public GitHub bug issue #5138
- id / link: PR #5139 / https://github.com/udecode/plate/pull/5139; issue #5138 / https://github.com/udecode/plate/issues/5138
- title: `fix(markdown): round-trip lists inside table cells`
- task type: behavior bug fix in a published package, with supporting docs
- acceptance criteria (from issue #5138):
  - `<ul>`/`<ol>` with `li` children inside a `td`/`th` deserialize to indent-list paragraphs (`indent: 1`, `listStyleType: 'disc'` or `'decimal'`), one paragraph per item, marks and links kept
  - nested `<ul>`/`<ol>` inside an `li` deserialize to `indent: 2` and deeper
  - list paragraphs inside a `td`/`th` serialize as `<ul><li>…</li></ul>` / `<ol><li>…</li></ol>` with no raw newline inside a GFM row
  - `| <ul><li>a</li><li>**b**</li></ul> |` round-trips to the same cell string
  - line breaks inside a cell paragraph serialize as `<br/>`; non-list cell blocks keep the `<br/>` join
  - ordered `start` numbers and task-list `checked` state survive the round trip; shapes the editor cannot store exactly keep the text fallback
  - serialization works without `remark-mdx`; `allowNode`, `allowedNodes`, and `disallowedNodes` still apply
- caveats: the issue and its diagnosis were written by the same contributor as the PR, so they were treated as claims and reproduced on `main` before the fix was accepted
- likely files / packages: `packages/markdown/src/lib/rules/defaultRules.ts` (`td`/`th` rules), `packages/markdown/src/lib/table.spec.ts`, `.changeset/markdown-table-cell-lists.md`, `content/docs/(plugins)/(serializing)/markdown.mdx`
- browser surface: none; headless serialization through `deserializeMd` / `serializeMd`
- root-cause layer: table-cell conversion rules in `defaultRules.ts`: no `ul`/`ol`/`li` rule inside cells on read, and list paragraphs inside cells routed through the generic list grouping on write

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A; normal one-shot completion gates apply
- initial confidence score: N/A; exact binary acceptance checks exist
- improvement loop: reproduce on `main` -> rule-level fix with behavior tests -> package and repo checks -> structured autoreview -> PR body and plan sync
- final score / loop closure: N/A; close only when the named checks and PR gates pass

Completion threshold:
- Every acceptance criterion above is covered by a case in `packages/markdown/src/lib/table.spec.ts` that fails on `main` at b7475d472 and passes on the branch.
- `pnpm --filter @platejs/markdown test`, `pnpm g:typecheck`, `pnpm brl` (no drift), `pnpm lint`, `pnpm test:all`, `pnpm test:slowest`, and `pnpm --filter www check:docs` pass from the repo root.
- The structured autoreview helper exits 0 with no accepted/actionable findings on `--mode branch --base upstream/main`.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5139-round-trip-lists-in-table-cells.md` passes.

Verification surface:
- command: `pnpm --filter @platejs/markdown test` (bun) in `~/dev/repos/plate`, including the 24 cases of `table.spec.ts`
- command: `pnpm g:typecheck`, `pnpm brl`, `pnpm lint`, `pnpm test:all`, `pnpm test:slowest` in `~/dev/repos/plate` (the `bun check` steps of `.github/workflows/ci.yml`)
- command: `pnpm --filter www check:docs` in `~/dev/repos/plate` for the docs table rows
- command: `.agents/skills/autoreview/scripts/autoreview --mode branch --base upstream/main` in `~/dev/repos/plate`
- source-audit: `packages/markdown/src/lib/rules/index.ts` unchanged; no export or type change in `@platejs/markdown`
- artifact: one `@platejs/markdown` patch changeset, task-style PR body naming this plan, plan present at the PR head

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Cells behave as before without the indent list plugin or when the editor's `rules` define `ul`, `ol`, or `li`.
- Do not change list conversion outside table cells.

Boundaries:
- Source of truth: issue #5138, PR #5139, `@platejs/markdown` source and tests on `upstream/main` at b7475d472, the Markdown plugin docs page.
- Allowed edit scope: `packages/markdown/**`, one `.changeset/*.md`, `content/docs/(plugins)/(serializing)/markdown.mdx`, this plan, and PR metadata.
- Browser surface: N/A; serialization has no route, and the docs rows are checked by `check:docs`.
- Tracker sync: PR #5139 closes issue #5138 (`Closes #5138`) and is cross-referenced in the issue timeline; no separate issue comment.
- Non-goals: dash-marker text bullets inside cells (`- a<br/>- b`), `@platejs/list-classic` cell lists, `<ol reversed>` / `<li value>`, changes to `listToMdastTree`, Chinese docs (`markdown.cn.mdx` has no MDX conversions table).

Output budget strategy:
- Bounded `grep -n` / `sed -n` reads of `defaultRules.ts`, `table.spec.ts`, the docs page, and the `.agents` skill files; gate output written to log files and read through `tail`/`grep`; GitHub state read through `gh` JSON fields.

Blocked condition:
- Stop only if a repo gate fails for a reason tied to the diff that cannot be fixed inside the allowed edit scope, if push access to the fork is lost, or if a maintainer asks for a different boundary.

Task state:
- task_type: bug fix in a published package
- task_complexity: normal, non-heavyweight, measurable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high after reproduction on `main` and green package, repo, docs, and review gates
- next owner: task
- reason: every acceptance criterion has a red-on-main, green-on-branch test; the fix sits in the rules that own table cells

Pre-solution issue challenge:
- reporter claim: `<ul>`/`<ol>` inside a GFM cell become literal text (marks dropped) and serialize back escaped; list paragraphs typed in a cell serialize to a newline-separated list that breaks the row; `x<br/>y` comes back as `x y`
- suggested diagnosis or fix: `customMdxDeserialize` falls back to text for unknown `ul`/`ol`/`li` inside cells (`deserializer`), `td`/`th` serialize sends cell children through `convertNodesSerialize`, whose list grouping emits an mdast `list` with raw newlines, and `p` serialize turns the `\n` from `<br/>` into an mdast `break` that the GFM table writer collapses; proposed fix: cell-level `ul`/`ol`/`li` deserialization and a cell serializer that writes inline HTML lists and `<br/>`
- repro ladder:
  - tests / source-level repro: reproduced in `~/dev/repos/plate`: the 24 cases of `packages/markdown/src/lib/table.spec.ts` fail on `main` at b7475d472 (literal `<ul><li>a</li><li>b</li></ul>` text, `\<ul>\<li>a\</li>…` on write, `| intro<br/>- one\n- two |`, `| x y |`) and pass with the change
  - Playwright / automated browser: N/A; headless serialization, no DOM
  - Browser plugin: N/A; no route renders the serializer output
  - screenshot / visual proof: N/A; no layout, selection, dialog, or visual state
- reproduction verdict: reproduced
- validity verdict: valid; the diagnosis matches the source (`defaultRules.ts` `td`/`th` rules on `main`), and the fix belongs in those rules
- best long-term fix boundary: the `td`/`th` rules in `defaultRules.ts`, which already own cell grouping and the `<br/>` join (#5068 added custom inline elements inside cells at the same boundary); module-private helpers for the list shapes; raw HTML tokens on write so `remark-mdx` is only needed to read lists back
- harsh honest feedback: a serializer that emits a broken GFM row for a list typed in a cell is a correctness bug, not a limitation; the text fallback for unsupported shapes is kept so nothing silently disappears
- hard-stop decision: cleared; reproduced on `main` before implementation

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5139-round-trip-lists-in-table-cells.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `task`, `autogoal`, `autoreview`, `docs-creator` (tables for option matrices, stable headings, verification checklist), and the `changeset` rules; no heavyweight, browser, registry, or agent-native skill applies |
| Active goal checked or created | no | N/A: no Codex goal runtime in this session; this plan file is the durable goal state |
| Source of truth read before edits | yes | `gh pr view 5139` (state, body, head, timeline) and `gh issue view 5138` read; the maintainer's autoclosure comment asked for this per-PR task run before the PR was reopened |
| Tracker comments and attachments read | yes | PR comments: codesandbox and changeset bots plus the author's gate comment; issue #5138 has no comments or attachments |
| Video transcript evidence required | no | N/A: no video or screen recording |
| Pre-solution issue challenge required | yes | Public bug report with a technical diagnosis, challenged by reproducing on `main` through the package test setup |
| Reproduction verdict before implementation | yes | Valid/reproduced: `table.spec.ts` cases fail on `main` at b7475d472 and pass on the branch |
| Repro escalation ladder selected | yes | Test-level repro owns the behavior; Playwright, Browser, and visual rungs are N/A for headless serialization |
| Suggested fix reviewed against durable boundary | yes | Fix placed in the `td`/`th` rules that own cells; rejected a remark plugin for dash markers (needs source positions, out of scope) and changes to `listToMdastTree` (would alter lists outside tables) |
| `docs/solutions` checked for non-trivial existing-code work | yes | Searched `docs/solutions` for table-cell and markdown notes: `2026-04-02-markdown-container-keyboard-rules-must-lift-one-level.md` and the table border toggle note concern keyboard and selection behavior, not serialization; nothing contradicts the rule-level fix |
| TDD decision before behavior change or bug fix | yes | 24 behavior cases in `table.spec.ts`, each red on `main`; five Codex review rounds each added a regression case for the finding fixed |
| Branch decision for code-changing task | yes | `feat/markdown-table-cell-lists` on fork `OrbitingBucket/plate` from `upstream/main` b7475d472; PR #5139 targets `main` |
| Release artifact decision | yes | `.changeset/markdown-table-cell-lists.md`, `@platejs/markdown` patch |
| Browser tool decision for browser surface | no | N/A: serialization rules have no route; docs rows checked by `pnpm --filter www check:docs` |
| PR expectation decision | yes | PR #5139 already exists and is updated in place |
| Dedicated task plan selected for exact PR | yes | This plan owns PR #5139 only (https://github.com/udecode/plate/pull/5139) |
| Tracker sync expectation decision | yes | Issue #5138 is closed by the PR (`Closes #5138`) and cross-referenced in its timeline; no separate comment |
| Output budget strategy recorded | yes | Bounded reads and log-file tails as recorded above |
| Docs pack selected | yes | `--with docs`: two rows added to the Default MDX Conversions table in `content/docs/(plugins)/(serializing)/markdown.mdx` |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read: tables for enums and option matrices, current-state reference voice, verification checklist |
| Docs lane selected | yes | Supporting docs on a package fix: reference rows in the existing Markdown plugin page, no new page |
| Target docs and nearest sibling docs read | yes | Target page sections `Using a Remark Plugin (GFM)`, `Appendix A: HTML in Markdown`, `Default MDX Conversions`; sibling rows `<column_group>` / `<column>`; `markdown.cn.mdx` has no MDX conversions table |
| Docs style doctrine read | yes | Reference voice, table for conversions, no changelog voice, American English |
| Documented source owner identified | yes | `td`/`th` rules in `packages/markdown/src/lib/rules/defaultRules.ts` (`deserializeTableCellList`, `serializeTableCellList`, `serializeTableCell`) |
| Package/API pack selected | yes | `--with package-api`: published runtime behavior of `@platejs/markdown` changes and a changeset ships |
| Public surface or package boundary identified | yes | No export or type change; `defaultRules` `td`/`th` behavior changes; new helpers are module-private; `rules/index.ts` unchanged |
| Release artifact path selected | yes | `.changeset/markdown-table-cell-lists.md` (`"@platejs/markdown": patch`) |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/rules/changeset.mdc` read: imperative voice, user delta from `main`, one package per file, patch for a fix |
| Barrel/export impact decision recorded | yes | Only `table.spec.ts` is new under an exported folder and specs are excluded from barrels; `pnpm brl` produced no diff |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video evidence.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason. Verdict: `valid`, reproduced on `main`.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters. Test-level repro owns the behavior; the other rungs are N/A.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path. Cleared: reproduced and valid.
- [x] Nearby repo instructions and implementation patterns read before edits:
      `AGENTS.md`, `CONTRIBUTING.md`, `.agents/rules/task.mdc`,
      `.agents/rules/autoclosure.mdc`, the sibling rule files
      `columnRules.ts` / `fontRules.ts` / `mediaRules.ts`, and the existing
      `td`/`th` rules.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Boundary: `td`/`th` rules in `defaultRules.ts`.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. One `@platejs/markdown` patch changeset.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable. Bug
      fix with task-style PR body; issue closed by the PR.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. Dedicated branch
      `feat/markdown-table-cell-lists`.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL. PR #5139
      (https://github.com/udecode/plate/pull/5139) owns this plan; head and
      body readback recorded in Completion Gates.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no corruption-shaped
      failure; the one failed command was a missing `timeout` binary on macOS,
      recorded in Error attempts.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. All proof ran in `~/dev/repos/plate`, the fork
      clone on branch `feat/markdown-table-cell-lists`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Recorded in the High-risk mini gate.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. Committed branch:
      `--mode branch --base upstream/main`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent or tooling files changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. `ListPlugin`, `listStart`, list indent props, and the todo mapping come from `defaultRules.ts` (`KEYS.ul`, `KEYS.ol`, `KEYS.listTodo`, `listStart`).
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: no links, anchors, or previews added.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason. `.changeset` applied.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: a changeset exists.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Compatible patch: cells convert lists only with the indent list plugin loaded and no user `ul`/`ol`/`li` rule; every other shape keeps the previous text fallback.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. No barrel update required (`pnpm brl` no diff).

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Package tests 271 pass; `pnpm g:typecheck` 54/54; `pnpm brl` no drift; `pnpm lint` 0 errors; `pnpm test:all` 3566 + 12 pass, 0 fail; `pnpm test:slowest` exit 0; `check:docs` passed; autoreview below |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid/reproduced; fix in the `td`/`th` rules |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Test-level repro complete; Playwright, Browser, and visual rungs N/A for headless serialization |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | `table.spec.ts` cases fail on `main` at b7475d472 with the outputs listed in the issue |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/markdown test`: 271 pass, 0 fail across 39 files, including the 24 table cases |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm g:typecheck` (build + typecheck for `./packages/**`): 54/54 tasks successful |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl`: 52 tasks successful, `git status --porcelain -- packages` empty |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile edit |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent files changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Every command ran from `~/dev/repos/plate` on `feat/markdown-table-cell-lists` |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no route or DOM behavior changes |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser or visual behavior |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edits |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/markdown-table-cell-lists.md` adds one `@platejs/markdown` patch entry |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry files |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | Supporting docs: two rows in the Default MDX Conversions table; `docs-creator` read; docs pack closed; `pnpm --filter www check:docs` passed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: a cell that users relied on staying literal text now becomes a list, or a list shape is written that cannot be read back. Proof: conversion only runs with the indent list plugin and no user `ul`/`ol`/`li` rule; every unsupported shape has a fallback test; round-trip tests cover marks, links, breaks, nesting, `start`, restarts, and checkbox items. Boundary is right because `td`/`th` already own cell grouping and the `<br/>` join |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent or tooling changes |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: all owning checks ran normally |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Structured Codex autoreview (`--mode branch --base upstream/main`) exited 0 with no accepted/actionable findings; verdict "patch is correct" (0.78); no fixes required |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `bun check` steps passed locally before the body update; PR #5139 body rewritten to the task-style format |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5139 head read back with `gh pr view --json headRefOid`; `git show <head>:docs/plans/5139-round-trip-lists-in-table-cells.md` resolves; body contains exactly one plan line |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5139 --json body` read back the auto-release block, fix/plan/confidence lines, the exact table header, and the four sections; no self-link |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no browser proof or image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: PR #5139 carries `Closes #5138` and is cross-referenced in the issue timeline |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint` (biome + eslint) 0 errors, one pre-existing warning in `apps/www` |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Gate output captured to log files and read with `tail`/`grep`; no unbounded stream |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5139-round-trip-lists-in-table-cells.md` | Checker passed from `~/dev/repos/plate` before the plan commit |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Rows match `deserializeTableCellList` (`KEYS.ul`/`KEYS.ol` style types, `listStart`, `KEYS.listTodo` for checkbox items) and the `editor.plugins.list` guard |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no links, routes, or previews added |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` (runs `build:source` first) passed: "Docs source parity check passed." |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing plugin page; only the conversions reference table changed, no kit/manual/API section touched |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `rules/index.ts` unchanged; new helpers not exported; `defaultRules` keys unchanged (`td`/`th` behavior only) |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/markdown` runtime behavior fix |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | One patch changeset for `@platejs/markdown`; no core-package entry |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: package source change |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset exists |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter @platejs/markdown test` 271 pass; `pnpm g:typecheck` builds and typechecks the package |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed; no generated diff |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #5139 and issue #5138 read; behavior reproduced on `main`; rule ownership audited | implementation |
| Implementation | complete | cell list helpers and shared `td`/`th` serializer in `defaultRules.ts`; 24 table cases; patch changeset; two docs rows | verification |
| Verification | complete | package tests, full typecheck, barrel check, lint, all tests, slowest-test gate, docs parity, structured autoreview | PR/tracker sync |
| PR / tracker sync | complete | PR #5139 updated with task-style body naming this plan; plan pushed to the head; issue closed by the PR | closeout |
| Closeout | complete | all plan gates resolved; checker passes | final response |

Findings:
- On `main` at b7475d472 the `td`/`th` rules group inline cell children into one paragraph and have no rule for `ul`/`ol`/`li`, so `customMdxDeserialize` keeps the tags as text.
- `td`/`th` serialize joined block children with `<br/>` but routed list paragraphs through the generic list grouping, producing an mdast `list` with raw newlines inside the GFM row.
- `<br/>` in a cell became `\n` text and the GFM table writer collapsed the resulting `break` to a space.
- The repo already splits themed rules into sibling files, but `td`/`th` live in `defaultRules.ts` next to `table`/`tr`, so the fix stays there with module-private helpers.

Decisions and tradeoffs:
- Write cell lists as raw HTML tokens -> serialization needs no `remark-mdx` -> reading them back still does, which the PR body states.
- Convert only shapes the indent list can hold exactly and keep the text fallback otherwise -> nothing is lost silently -> block children in `li`, inline tails after nested lists, `<ol reversed>`, `<li value>`, and odd `start` values stay text.
- Leave dash-marker text bullets (`- a<br/>- b`) as text -> keeps the change rule-level -> a follow-up remark plugin can add them.

Implementation notes:
- `deserializeTableCellList` / `deserializeTableCellListItem` map `ul`/`ol`/`li` to indent-list paragraphs with `indent`, `listStyleType`, `listStart`, `listRestart`, and todo `checked`.
- `serializeTableCellList` writes consecutive list paragraphs as nested `<ul>`/`<ol start>` with a new `<ol>` on `listRestart` or numbering gaps; `serializeTableCell` is shared by `td` and `th` and writes line breaks as `<br/>`.
- Node filters (`allowNode`, `allowedNodes`, `disallowedNodes`) apply to list paragraphs and to the `ul`/`ol`/`li` wrappers.
- Docs: two rows in the Default MDX Conversions table of the Markdown plugin page.

Review fixes:
- `codex review --base upstream/main` (five passes): fixed one P1 (trailing `\n` inside `<li>` left on the row) and five P2 findings (export filters bypassed for list paragraphs, deserialize filters bypassed for recognized lists, block children accepted inside `li`, todo `checked` dropped, `<ol start>` dropped), each with a regression case.
- Structured autoreview helper: see the Autoreview gate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `timeout 600 pnpm brl` failed with `command not found: timeout` (macOS) | 1 | Rerun `pnpm brl` without the wrapper | Resolved; 52 tasks successful, no drift |
| First CI runs on PR open failed to start (zero jobs) | 1 | Run the `bun check` steps locally; the reopened runs wait for maintainer approval | Resolved locally; GitHub runs await maintainer approval |

Verification evidence:
- `~/dev/repos/plate`: `pnpm --filter @platejs/markdown test` -> 271 pass, 0 fail, 39 files (24 cases in `table.spec.ts`).
- `~/dev/repos/plate`: `pnpm g:typecheck` -> 54/54 tasks successful.
- `~/dev/repos/plate`: `pnpm brl` -> 52 tasks successful; `git status --porcelain --untracked-files=all -- packages` empty.
- `~/dev/repos/plate`: `pnpm lint` (biome check + eslint) -> 0 errors, 1 pre-existing warning outside the diff.
- `~/dev/repos/plate`: `pnpm test:all` -> 3566 pass / 0 fail (fast suite) plus 1 + 10 + 1 slow-suite passes; `pnpm test:slowest` exit 0.
- `~/dev/repos/plate`: `pnpm --filter www check:docs` -> "Docs source parity check passed."
- `~/dev/repos/plate`: `.agents/skills/autoreview/scripts/autoreview --mode branch --base upstream/main` -> exit 0, no accepted/actionable findings, verdict "patch is correct" (0.78).
- `~/dev/repos/plate`: `gh pr view 5139 --json body,headRefOid` read back after the body update (see Completion Gates).

Final handoff contract:
- PR line: PR #5139 (https://github.com/udecode/plate/pull/5139), head updated with this plan
- Issue / tracker line: `🐛 Fixes #5138`
- Confidence line: `🟢 90-95% confidence`
- Flow table:
  - Reproduced: tests 🔴 (24 `table.spec.ts` cases fail on `main` at b7475d472), browser ➖ N/A
  - Verified: tests 🟢 (package tests, full typecheck, barrel check, lint, all tests, docs parity), browser ➖ N/A
- Browser check: ➖ N/A; headless serialization, no route
- Outcome: `<ul>`/`<ol>` inside table cells read as indent-list paragraphs and list paragraphs write back as inline HTML lists; cell line breaks write as `<br/>`; unsupported shapes keep the text fallback
- Caveat: reading lists back needs `remark-mdx`; dash-marker text bullets stay text; `@platejs/list-classic` cells are unchanged
- Design:
  - Chosen boundary: the `td`/`th` rules in `defaultRules.ts`, which own cell grouping and the `<br/>` join
  - Why not quick patch: escaping or stripping `<ul>` on read would keep marks lost and rows broken on write
  - Why not broader change: changing `listToMdastTree` or adding a remark plugin would alter lists outside tables or need source positions
- Verified: package tests, `g:typecheck`, `brl`, `lint`, `test:all`, `test:slowest`, `check:docs`, structured autoreview
- PR body verified: `gh pr view 5139 --json body` readback recorded in Completion Gates

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: #5139 (https://github.com/udecode/plate/pull/5139), open, body in task-style format
- Task plan at exact PR head: `docs/plans/5139-round-trip-lists-in-table-cells.md` committed on `feat/markdown-table-cell-lists` and pushed to the fork
- Issue / tracker: #5138, closed by the PR through `Closes #5138`
- Browser proof: ➖ N/A; headless serialization
- Caveats: `remark-mdx` needed to read cell lists back; dash-marker text bullets remain text (possible follow-up); GitHub CI runs wait for maintainer approval

Timeline:
- 2026-10-02T09:12:05Z PR #5139 opened from `OrbitingBucket/plate` at d294b5aba (issue #5138 opened the same minute).
- 2026-10-02T15:57:23Z Maintainer autoclosure closed the PR for a missing per-PR task plan; reopened at 20:48:10Z.
- 2026-10-02T21:00:00Z Local `bun check` steps and `pnpm brl` run; docs rows committed as e036684ab and pushed.
- 2026-10-02T21:34:18Z Task goal plan created.
- 2026-10-02T21:45:00Z Package tests, docs parity check, and structured autoreview run; plan filled.
- 2026-10-02T22:00:00Z Plan committed and pushed; PR body rewritten to the task-style format and read back.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response; wait for maintainer CI approval and review |
| What is the goal? | Round-trip lists inside markdown table cells in `@platejs/markdown`, delivered through PR #5139 |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Ordered and checkbox list styles keep their own markup; every other list style is written as `<ul>`, as `listToMdastTree` does, so the original style is not preserved.
- `@platejs/list-classic` editors get no cell list conversion; their cells keep the text fallback.
- Dash-marker text bullets inside cells remain text until a remark plugin reads them.
