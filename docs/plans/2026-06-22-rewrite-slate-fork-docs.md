# rewrite slate fork docs

Objective:
Rewrite Slate fork docs; done when why-this-fork.mdx passes docs style, source checks, and route proof.

Goal plan:
docs/plans/2026-06-22-rewrite-slate-fork-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: local docs rewrite
- id / link: `content/docs/slate/why-this-fork.mdx`
- title: Why This Fork
- acceptance criteria: page states the hard agent-first fork philosophy plainly, reads less like dense AI architecture notes, keeps claims current-source-backed, parses as MDX, and renders at `/docs/slate/why-this-fork`

Docs lane:
- lane: spec / law / behavior positioning page
- target docs: `content/docs/slate/why-this-fork.mdx`
- documented source owner: Slate packages under `packages/slate*`, `packages/yjs`, `packages/browser`, and Slate docs/examples in `content/docs/slate/**` / `apps/www`
- nearest sibling docs: `content/docs/slate/index.mdx`, `content/docs/slate/migration.mdx`, `content/docs/slate/meta.json`, selected Slate library/concept docs linked from the page
- plugin page: N/A: fork positioning page, not a plugin page

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: user requested rewrite until satisfied, no explicit time
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: docs checklist is the metric
- improvement loop: rewrite, self-review against Slack criticism and docs-creator anti-slop rules, verify
- final score / loop closure: close when checklist, content proof, route proof, and goal-plan checker pass

Completion threshold:
- `content/docs/slate/why-this-fork.mdx` is rewritten in docs-creator style:
  opening <= 3 sentences, direct agent-first thesis, no defensive corporate
  polish, no unreadable jargon clusters, no changelog voice, no fake APIs, and
  every package/route claim source-backed or removed.
- Docs closure is legal only when the page explains the fork philosophy,
  names ownership boundaries, records explicit gaps, required MDX/link/route
  checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-rewrite-slate-fork-docs.md`
  passes.

Verification surface:
- source audit: read target doc, nearest sibling Slate docs, docs metadata, and package/source anchors for named packages and routes
- parser/build: `pnpm --filter www build:source` or closest existing docs/content parser command
- docs route: render/check `/docs/slate/why-this-fork` on local www dev server
- anti-slop audit: search target doc for changelog voice, stale `Slate v2` naming overclaim where inappropriate, and quoted dense phrases from the Slack feedback

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: current repo source and docs, especially Slate package names and docs routes
- Allowed edit scope: `content/docs/slate/why-this-fork.mdx` plus this goal plan
- Browser surface: local docs route `/docs/slate/why-this-fork`
- Tracker sync: N/A: no issue/PR/tracker update requested
- Non-goals: no package/API/runtime changes, no sidebar rename unless required by this page, no migration or release-doc rewrite

Blocked condition:
- Stop only if the target docs route cannot be rendered due to unrelated app/tooling failure after the MDX parses, or if current source contradicts the requested agent-first positioning.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: rewritten and verified
- confidence: high for this page
- next owner: human review only if the public naming strategy changes beyond this page
- reason: page now states the agent-first fork philosophy directly, removes release-guide sprawl, and keeps claims source-backed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-rewrite-slate-fork-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copied target file, docs-creator style, hard agent-first philosophy, rewrite-until-satisfied intent, route/content proof, and no runtime/API scope. |
| Timed checkpoint parsed | no | No duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created active goal for this plan. |
| Docs lane selected | yes | Spec/law/behavior positioning page. |
| Target docs read | yes | Read `content/docs/slate/why-this-fork.mdx` before writing. |
| Nearest sibling docs read | yes | Read `content/docs/slate/index.mdx`, `content/docs/slate/migration.mdx`, `content/docs/slate/meta.json`; release-page path checked and found absent. |
| Docs style doctrine read | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Documented source code read | yes | Audited package names/exports via `packages/slate*/package.json`, `packages/yjs/package.json`, `packages/browser/package.json`, and API/source/docs `rg` for `editor.read`, `editor.update`, tx groups, roots, and state. |
| Ownership map drafted | yes | Package ownership table in target doc maps `@platejs/slate`, `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/slate-history`, `@platejs/slate-hyperscript`, `@platejs/yjs`, `@platejs/slate-layout`, and `@platejs/browser`. |
| Plugin-page rules decision | no | Not a plugin page. |
| Browser/render proof decision | yes | Render/check `/docs/slate/why-this-fork` after MDX parser check. |
| PR/tracker expectation decision | no | User requested local docs rewrite only. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Requirements:
      use `docs-creator` style; rewrite `content/docs/slate/why-this-fork.mdx`;
      apply the harder agent-first fork vision; rewrite until satisfied; verify
      route/content proof; no runtime/package/API scope.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install, guide/system, plugin/feature,
      serialization/conversion, workflow/AI, API reference, or spec/law.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant.
- [x] Fastest success path appears before deeper mechanics or API reference.
- [x] Opening is three sentences or fewer and avoids generic fluff.
- [x] Named APIs, options, transforms, components, imports, routes, and package
      specifiers are exact and current.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps.
- [x] Demos/previews are real registry entries or marked N/A with reason.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Target doc rewritten; `pnpm --filter www check:docs` passed; route returned 200 on `http://localhost:3003/docs/slate/why-this-fork`; source/link audits recorded below. |
| Docs lane shape satisfied | yes | Check the lane-specific structure against `docs-creator` | Spec/law/behavior page has short opening, fork thesis, owner map, proof boundaries, explicit gaps, and read-next links; no API-reference dump. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | `rg` verified `editor.read`, `editor.update`, tx groups, roots, state, and linked docs; package json files verified named package surfaces. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Package table matches package directories and package.json names under `packages/slate*`, `packages/yjs`, and `packages/browser`. |
| MDX/content parser | yes | Run `pnpm --filter www build:source` / source parity for MDX/content changes | `pnpm --filter www check:docs` passed after formatting. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | Linked local MDX files exist; route returned 200 on normal www dev server; no `<ComponentPreview>` used. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: fork positioning page. |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser plugin setup failed with node_repl metadata error; text-only page verified by `curl` route proof per docs-creator fallback. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs and goal-plan edits only. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/rules/**` or skill source changed. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Read autoreview skill. Helper has no file-only target; `--mode local` would review unrelated dirty checkout, so used scoped diff/source/route review instead. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec prettier --write content/docs/slate/why-this-fork.mdx` ran; full lint not needed for MDX-only docs edit. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-rewrite-slate-fork-docs.md` | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read target, siblings, package metadata, docs metadata, and source/API matches | writing complete |
| Writing | complete | replaced long release-guide hybrid with focused 158-line positioning page | verification complete |
| Verification | complete | `pnpm --filter www check:docs`, route 200, anti-slop search, link file existence checks | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan updated with final evidence; final goal check ready | final response |

Findings:
- The old page mixed fork positioning, release notes, package guide, migration, proof policy, and complete change map in one page. That shape made the Slack criticism true: too dense and too AI-note-like.
- The release-page sibling path in the generated plan was stale; current Slate docs have `content/docs/slate/why-this-fork.mdx`, `content/docs/slate/migration.mdx`, and `content/docs/slate/meta.json`, with package/library details in dedicated pages.
- Browser plugin setup failed before connection with a node_repl metadata error, so route proof used the docs-creator text-page fallback: local dev server plus `curl`.

Decisions and tradeoffs:
- Kept the public page as "Why This Fork" rather than a release guide. Migration/install/package details belong in their dedicated pages.
- Removed public "Slate v2" phrasing from this page except no remaining matches; the page calls it Plate's Slate fork and explicitly says it is not an official upstream Slate release.
- Chose direct agent-first language: this fork is optimized for agent-run maintenance and proof, not the easiest human-only editor library.
- Did not update sidebar/docs IA because the requested target was one page and current route/nav already exists.

Implementation notes:
- Rewrote `content/docs/slate/why-this-fork.mdx` to 158 lines.
- Added frontmatter description.
- Added sections: The Bet, Who It Is For, What Stays Slate, What Changes, Document Shape, Package Ownership, Browser Proof, Hard Boundaries, Docs Philosophy, Read Next.
- Removed the old install block, On This Page block, complete change map, release-guide package sections, and dense phrases cited in Slack feedback.

Review fixes:
- Prettier formatting applied after the first rewrite.
- Removed the last public "Slate v2" phrase from the page.
- Scoped review rejected running `autoreview --mode local` because the helper cannot target one file and this checkout may contain unrelated dirty work.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Route proof streamed too much HTML into tool output | 1 | Use saved HTML artifact and boolean content checks | Re-ran content checks from `/tmp/why-this-fork.html` / `/tmp/why-this-fork-final.html` with small Node output. |
| Combined curl + Node heredoc included shell `$?` inside Node input | 1 | Separate route status from Node content assertions | Re-ran the Node content assertions cleanly; all needles true. |

Verification evidence:
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate-2` -> passed after rewrite and after Prettier.
- `pnpm exec prettier --write content/docs/slate/why-this-fork.mdx` in `/Users/zbeyens/git/plate-2` -> formatted target file.
- Anti-slop source audit for changelog voice, marketing adjectives, stale public v2 phrasing, and Slack-cited dense phrases in `content/docs/slate/why-this-fork.mdx` -> no matches.
- `curl -sS -o /tmp/why-this-fork-final.html -w '%{http_code}\n' http://localhost:3003/docs/slate/why-this-fork` -> 200.
- Node content assertion on `/tmp/why-this-fork-final.html` -> `Plate's Slate fork`, `agent-first`, `not an official upstream Slate release`, `Use upstream Slate if`, and `@platejs/browser` all present.
- Link existence check -> all local read-next MDX files exist.

Final handoff contract:
- PR line: no PR requested.
- Issue / tracker line: no issue/tracker update requested.
- Confidence line: high for this page rewrite; broader public naming still a product decision outside this edit.
- Docs lane: spec/law/behavior positioning page.
- Source-backed claims: package names and API examples checked against current package metadata/docs/source.
- Content build / parser: `pnpm --filter www check:docs` passed.
- Links / demos / previews: local read-next links exist; no previews used.
- Browser check: Browser plugin failed to connect; normal dev route returned 200 via curl.
- Outcome: `why-this-fork.mdx` now states the agent-first fork thesis plainly and cuts the old release-guide sprawl.
- Caveat: first route compile on normal dev took 81s; `dev:slate` route hit unrelated Next/ts-morph/source-map-support failure.
- Verified: yes.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: Browser unavailable; route proof via `curl` on local www dev.
- Caveats: normal dev route first compile was slow; `dev:slate` route failed independently of MDX parser.

Timeline:
- 2026-06-22T03:15:53.711Z Docs goal plan created.
- 2026-06-22T03:16Z Created active goal.
- 2026-06-22T03:18Z Read target doc, sibling docs, docs metadata, package metadata, and source/API matches.
- 2026-06-22T03:20Z Rewrote target page.
- 2026-06-22T03:22Z Ran `pnpm --filter www build:source` and anti-slop search.
- 2026-06-22T03:24Z Started local www dev servers for route proof; `dev:slate` failed route render, normal `dev` returned 200.
- 2026-06-22T03:27Z Ran `pnpm --filter www check:docs`, Prettier, final route/content assertions, and scoped review.
- 2026-06-22T03:28Z First goal-plan check failed because closeout was still in progress and verification evidence contained a placeholder-marker token inside a quoted audit command; repaired this plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run goal-plan check, stop dev servers, final response |
| What is the goal? | Rewrite `content/docs/slate/why-this-fork.mdx` to docs-creator style with hard agent-first positioning and proof |
| What have I learned? | The old page was too much release guide, not enough fork thesis |
| What have I done? | Rewrote page, formatted it, verified docs parser/source parity and route content |

Open risks:
- Broader public naming ("Slate v2" vs Plate's Slate fork) still exists in other docs and is outside this target-page rewrite.
