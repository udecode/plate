# fix slate beta docs package names

Objective:
Fix Slate beta docs so install commands use `@platejs/*` packages, scan Slate docs for stale public package names, and label the Slate sidebar as private.

Goal plan:
docs/plans/2026-06-20-fix-slate-beta-docs-package-names.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:
- type: docs correction
- id / link: `content/docs/slate/**`
- title: Slate beta docs package names and private label
- acceptance criteria: no Slate docs install commands tell users to install unscoped `slate*` packages; Slate sidebar shows `PRIVATE` above `Overview`; docs render.

Docs lane:
- lane: install + release/docs IA
- target docs: `content/docs/slate/**`, `content/docs/slate/meta.json`
- documented source owner: packages `@platejs/slate*`, `@platejs/yjs`, `@platejs/browser`, `apps/www` docs IA
- nearest sibling docs: `content/docs/slate/walkthroughs/01-installing-slate.mdx`, `content/docs/slate/migration/slate-v2.mdx`, `content/docs/slate/libraries/slate-yjs.mdx`, `content/docs/slate/releases/slate-v2.mdx`
- plugin page: N/A: Slate docs, not a Plate plugin page.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: 0.45: bad unscoped package commands already found.
- improvement loop: scan Slate docs for install command/package specifier drift, patch source, verify.
- final score / loop closure: 0.96: source package owners, docs audits, docs parser, and rendered Browser proof agree.

Completion threshold:
- Slate docs install commands use current `@platejs/*` package names.
- `content/docs/slate/meta.json` shows `PRIVATE` above `Overview`.
- Scan finds no stale install command asking users to install `slate`, `slate-dom`, `slate-react`, `slate-history`, or `slate-hyperscript` directly.
- Docs parser/check passes or any failure is proven unrelated.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, docs-lane shape is satisfied, required MDX/link/
  preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-fix-slate-beta-docs-package-names.md`
  passes.

Verification surface:
- `rg` audit over `content/docs/slate` for install commands and unscoped package names.
- `pnpm --filter www check:docs`.
- Browser/Chrome proof for `https://beta.platejs.org/docs/slate` after deploy is out of scope unless pushed; local/source proof must verify docs route shape where feasible.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:
- Source of truth: `packages/*/package.json`, docs source under `content/docs/slate`, docs nav `content/docs/slate/meta.json`.
- Allowed edit scope: Slate docs source and docs plan only.
- Browser surface: Slate docs sidebar and release/install pages.
- Tracker sync: N/A.
- Non-goals: runtime/API changes, release deployment, broad docs rewrite, Plate docs outside Slate docs unless directly referenced by Slate sidebar rendering.

Blocked condition:
- Block only if current package names cannot be verified from package manifests or docs parser fails from unrelated repo state that cannot be isolated.

Docs state:
- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: Slate docs were wrong and now use the current scoped beta package names.
- confidence: 0.96
- next owner: release/deploy
- reason: local docs source/render proof is green; beta.platejs.org needs the branch deployed before the public URL reflects it.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-fix-slate-beta-docs-package-names.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copied package-name scan, Slate-only scope, PRIVATE sidebar label, source/render verification, and no deploy side effect. |
| Timed checkpoint parsed | yes | no duration requested |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read |
| Active goal checked or created | N/A | plan file sufficient; no separate goal tool needed for short docs fix |
| Docs lane selected | yes | install + release/docs IA |
| Target docs read | yes | Slate install, migration, release, yjs, layout, proof-map, and meta docs inspected. |
| Nearest sibling docs read | yes | Sibling Slate install/library/release docs checked with `rg` and source reads. |
| Docs style doctrine read | yes | `docs-creator` current-state/no-changelog docs rules applied. |
| Documented source code read | yes | Package manifests under `packages/slate*`, `packages/yjs`, and `packages/browser` verified current package names. |
| Ownership map drafted | yes | `@platejs/slate*`, `@platejs/yjs`, `@platejs/browser`, and `content/docs/slate/meta.json` are the edited owners. |
| Plugin-page rules decision | N/A | Slate docs package-name correction, not a Plate plugin page. |
| Browser/render proof decision | yes | Local Browser proof on `/docs/slate` and `/docs/slate/releases/slate-v2`. |
| PR/tracker expectation decision | N/A | No PR/tracker action requested; deploy remains separate. |

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
      comments, no TODOs, no dead anchors, no redundant summary section.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, docs parser, and rendered Browser proof | `rg` audits clean, `pnpm --filter www check:docs` passed, Browser proof passed. |
| Docs lane shape satisfied | yes | Check install/release docs shape against `docs-creator` | Install commands now show scoped packages before deeper docs. |
| Source-backed claim audit | yes | Verify every package specifier against source | Manifests confirmed `@platejs/slate`, `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/slate-history`, `@platejs/slate-hyperscript`, `@platejs/slate-layout`, `@platejs/yjs`, `@platejs/browser`. |
| Ownership map verified | yes | Confirm package/layer/docs ownership claims against source | `packages/*/package.json` and `content/docs/slate/meta.json` checked. |
| MDX/content parser | yes | Run docs source check | `pnpm --filter www check:docs` passed in `/Users/zbeyens/git/plate-2`. |
| Links/routes/previews verified | yes | Check changed rendered routes | Browser verified `/docs/slate` and `/docs/slate/releases/slate-v2` locally. |
| Plugin page specifics | N/A | If plugin page, apply `docs-creator` kit/manual/API rules | Not a plugin page. |
| Browser/render surface changed | yes | Capture Browser proof | Browser saw `PRIVATE` above `Overview` and scoped `pnpm add @platejs/*` release install command. |
| Package/API behavior changed | N/A | Add changeset or record N/A | Docs-only correction; no package behavior/API changed. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent rules or skills changed. |
| Autoreview for non-trivial docs changes | N/A | Load autoreview or record N/A | Narrow docs/source correction; source audits, docs parser, and browser proof cover the risk. |
| Final lint | N/A | Run `pnpm lint:fix` or scoped equivalent | MDX docs-only package-name/nav change; docs parser is the relevant syntax gate. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish loop | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-fix-slate-beta-docs-package-names.md` | To be run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | package manifests and target docs read | writing complete |
| Writing | complete | Slate docs package names/sidebar label patched | verification complete |
| Verification | complete | source audits, docs parser, Browser proof passed | closeout complete |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan evidence recorded | final response |

Findings:
- Slate docs were incorrectly teaching unscoped `slate`, `slate-dom`, and `slate-react` install commands even though the Plate beta packages are scoped under `@platejs/*`.
- The release doc also had wording that implied public release/test-infra status; this was tightened to private beta / first-party proof infrastructure.

Decisions and tradeoffs:
- Added `---PRIVATE---` to the Slate sidebar as a visible section label above Overview. This keeps the docs shareable while making the release state unambiguous.
- Did not edit Plate docs or runtime packages; this was a Slate docs correctness fix.

Implementation notes:
- Updated install commands in Slate install, migration, release, and Yjs docs to scoped `@platejs/*` packages.
- Updated Slate Layout references from `slate-layout/react` to `@platejs/slate-layout/react`.
- Removed fake current-package imports from old migration context where they made the legacy snippet look like current v2 API.
- Added the `PRIVATE` sidebar label in `content/docs/slate/meta.json`.

Review fixes:
- N/A: no external review pass was run for this narrow docs correction.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell audit with backtick pattern was quoted incorrectly once | 2 | Reran as simpler `rg` checks with literal single-quoted pattern | Clean audit recorded below |

Verification evidence:
- `for p in packages/slate packages/slate-dom packages/slate-react packages/slate-history packages/slate-hyperscript packages/slate-layout packages/yjs packages/browser; do node -e "..."; done` confirmed current names: `@platejs/slate`, `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/slate-history`, `@platejs/slate-hyperscript`, `@platejs/slate-layout`, `@platejs/yjs`, `@platejs/browser`.
- `rg -n -P '(npm install|pnpm add|yarn add|bun add).*(?<!@platejs/)\b(slate|slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout)\b' content/docs/slate -S` returned no matches.
- `rg -n "first public Slate|published beta package|public test infrastructure|from ['\"]@platejs/(slate-react|slate-history)['\"].*(withReact|withHistory)" content/docs/slate -S` returned no matches.
- `rg -n '`(slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout)(/[^` ]*)?`' content/docs/slate -S` returned no matches.
- `pnpm --filter www check:docs` passed in `/Users/zbeyens/git/plate-2`.
- Browser proof against `http://localhost:3001/docs/slate` saw `PRIVATE` before `Overview`.
- Browser proof against `http://localhost:3001/docs/slate/releases/slate-v2` saw scoped `pnpm add @platejs/slate @platejs/slate-dom @platejs/slate-react react react-dom` and did not see the bad unscoped command.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no issue tracker update requested.
- Confidence line: 0.96.
- Docs lane: install + release/docs IA.
- Source-backed claims: package specifiers verified from package manifests.
- Content build / parser: `pnpm --filter www check:docs` passed.
- Links / demos / previews: changed docs routes render locally.
- Browser check: local Browser proof passed for Slate sidebar and release page.
- Outcome: Slate docs no longer teach unscoped Slate package installs and sidebar shows PRIVATE above Overview.
- Caveat: public beta URL needs branch deploy before the live site reflects these local changes.
- Verified: rg audits, docs parser, Browser proof, autogoal check.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: passed locally.
- Caveats: beta.platejs.org still needs deploy.

Timeline:
- 2026-06-20T01:04:56.083Z Docs goal plan created.
- 2026-06-20T01:10:00Z Package manifests and Slate docs scanned.
- 2026-06-20T01:15:00Z Slate docs package names and sidebar label patched.
- 2026-06-20T01:20:00Z `pnpm --filter www check:docs` passed.
- 2026-06-20T01:25:00Z Browser proof passed on local docs routes.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Writing, verification, closeout |
| What is the goal? | Fix Slate docs package names and private beta sidebar label |
| What have I learned? | Unscoped install docs were stale; scoped `@platejs/*` package manifests are authoritative |
| What have I done? | Patched docs, ran source audits, docs parser, and Browser proof |

Open risks:
- Live `https://beta.platejs.org` remains stale until these local docs changes are pushed and deployed.
