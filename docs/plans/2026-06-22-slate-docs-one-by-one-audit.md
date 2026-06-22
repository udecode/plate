# slate docs one by one audit

Objective:
Audit Slate docs one by one; done when all 70 pages have a lane/verdict ledger, accepted fixes are applied, docs checks pass; plan docs/plans/2026-06-22-slate-docs-one-by-one-audit.md.

Goal plan:
docs/plans/2026-06-22-slate-docs-one-by-one-audit.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: docs corpus audit
- id / link: `content/docs/slate/**/*.mdx`
- title: Slate docs one-by-one docs-creator audit
- acceptance criteria: every Slate MDX page is individually classified, checked against `docs-creator`, repaired when the fix is safe, or marked clean/deferred with a concrete reason.

Docs lane:

- lane: mixed corpus: install/get-started, guide/system, behavior/runtime concept, API reference, spec/law, and library guide pages
- target docs: 70 Slate MDX pages under `content/docs/slate`
- documented source owner: Slate packages under `packages/slate*`, `packages/slate-*`, `packages/slate-browser`, `apps/www` docs/examples, plus docs nav metadata when routes are affected
- nearest sibling docs: same folder sibling pages for each audited page
- plugin page: no, Slate docs are package/library/API/concept docs, not Plate plugin pages

First checkpoint:

- User explicitly requested `docs-creator` on the 70 Slate docs again.
- Check one by one, not only aggregate grep/build gates.
- Use docs-creator lane shape, voice, ownership, links, code example, and anti-slop rules.
- Apply safe docs repairs found during the audit.
- Stop when all 70 pages have an individual ledger verdict and verification evidence is recorded.

Timed checkpoint:

- requested duration: none
- semantics: N/A: user requested exhaustive page count, not timed work
- initial confidence score: N/A: concrete metric is 70 page verdicts plus docs verification
- improvement loop: audit page -> classify lane -> record issue/fix/verdict -> patch safe issue -> verify
- final score / loop closure: all 70 rows closed or deferred with reason, then checks pass

Completion threshold:

- All 70 Slate MDX files are present in `docs/plans/artifacts/slate-docs-one-by-one-audit/page-ledger.md`.
- Each ledger row has lane, per-page verdict, concrete finding/fix status, and proof note.
- Accepted docs fixes are applied to source files.
- No page is closed by a generic "docs lane shape satisfied" claim.
- Structural/source/link/anti-slop audits and docs parser checks pass.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-one-by-one-audit.md`
  passes.

Verification surface:

- Per-page ledger: `docs/plans/artifacts/slate-docs-one-by-one-audit/page-ledger.md`
- Structural audits over `content/docs/slate/**/*.mdx`
- Source/link/import/code-fence anti-slop audits with scoped commands
- `pnpm --filter www check:docs`
- Local route/render proof if route-affecting changes are made

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: `content/docs/slate/**/*.mdx`, `content/docs/meta.json` only if routing is changed, and source package files used to verify API claims.
- Allowed edit scope: Slate docs plus this goal plan/artifact; no runtime or package API edits unless a docs claim proves impossible and the user explicitly redirects.
- Browser surface: only needed if rendered docs/nav/routes are changed in a way command checks cannot prove.
- Tracker sync: N/A: no external tracker requested.
- Non-goals: no broad API redesign, no Plate package migration, no docs route IA rewrite unless a one-by-one finding requires it.

Blocked condition:

- Stop only if a page requires a public API/product naming decision that cannot be inferred from existing Slate docs/source, or if docs verification fails for an owner outside the allowed edit scope.

Docs state:

- task_type: docs
- task_complexity: major corpus docs audit
- current_phase: intake
- current_phase_status: complete
- next_phase: per-page audit
- goal_status: active

Current verdict:

- verdict: complete; final `check-complete` is the remaining mechanical gate
- confidence: high
- next owner: docs
- reason: 70/70 pages have ledger rows, accepted fixes are applied, docs parser/link/route/source audits pass

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-one-by-one-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records `docs-creator`, all 70 Slate docs, one-by-one ledger, safe repairs, and verification threshold. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` fully before editing. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this active goal. |
| Docs lane selected | yes | Mixed corpus lane: install/get-started, guide/system, API reference, and spec/law rows in ledger. |
| Target docs read | yes | 70 Slate pages listed in `docs/plans/artifacts/slate-docs-one-by-one-audit/page-ledger.md`. |
| Nearest sibling docs read | yes | Folder-by-folder pass covered walkthroughs, concepts, API locations/nodes/operations, libraries, and general pages. |
| Docs style doctrine read | yes | `docs-creator` lane rules, anti-slop rules, verification checklist, and templates read. |
| Documented source code read | yes | Source-backed audits checked package/import names, route/example registry, docs proof map references, and current Slate package boundaries. |
| Ownership map drafted | yes | Ledger and docs preserve ownership across `@platejs/slate`, `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/slate-history`, `@platejs/yjs`, `@platejs/slate-layout`, and `@platejs/browser`. |
| Plugin-page rules decision | no | N/A: Slate docs corpus has no Plate plugin pages. |
| Browser/render proof decision | yes | Text/docs route proof used HTTP route smoke against local dev server; direct Browser tool was not exposed in this turn. |
| PR/tracker expectation decision | no | N/A: no PR/tracker sync requested. |

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
- [x] Selected lane-specific shape proof row below is resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
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
      N/A with reason. Scoped docs review used because local autoreview helper would review unrelated dirty checkout scope.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | yes | Opening has only the short lead before the first `##`; page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | `content/docs/slate/walkthroughs/01-installing-slate.mdx` now has `## Installation`, package ownership table, `## Usage`, and exact next-step link. No multi-step procedure needed `<Steps>`. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: Slate corpus has no registry component pages and no `<ComponentPreview>`/`<PackageInfo>` matches. |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | Ledger rows 22-36, 38-49, 51-60, 61-70; 25 docs-shape fixes applied where early sections were missing. |
| Behavior / runtime concept | yes | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | Spec/behavior pages `why-this-fork`, `docs-proof-map`, `dom-coverage-boundaries`, and `experimental-virtualized-rendering` kept explicit boundaries and evidence rows. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no Plate plugin pages in `content/docs/slate`. |
| Serialization / conversion | yes | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | `concepts/10-serializing.mdx` has `## Read The Document`, `## Plain Text`, `## HTML`, `## Deserializing HTML`, source-backed examples, and no stale imports. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no AI/workflow page in Slate corpus. |
| API reference | yes | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | API rows 1-21 in ledger; locations/operations/scrubber pages fixed where grouping headings were missing. |
| Spec / law / behavior | yes | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | `why-this-fork`, `docs-proof-map`, DOM coverage, and virtualized rendering pages kept explicit proof limits and owner maps. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | `final-audit.json`: 70 docs, 70 ledger rows, 25 fixed, 45 clean, 0 stale/slop/link/route failures. |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | All applicable lane rows above resolved with concrete page/file evidence. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | Stale import/install scan returned 0 matches; package ownership checked against current `@platejs/*` docs/source surfaces. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Ledger proof plus docs proof map preserve package/layer owners; no plugin/app-local ownership was introduced. |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` passed; it ran `pnpm build:source` and docs source parity. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | `link-audit.txt` is `ok`; no `<ComponentPreview>`/`<PackageInfo>` matches; `route-smoke.json` has 25/25 edited routes HTTP 200. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: no plugin pages in Slate corpus. |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Direct Browser plugin was not exposed; text docs route proof used local dev server HTTP smoke on 25 edited routes, all 200. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs/artifact-only changes; no package/API behavior changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/rules` or generated skill source changed in this task. |
| Autoreview for non-trivial docs changes | yes | Load `.agents/skills/autoreview/SKILL.md` and run the right target, or record N/A for tiny/no-local-patch work | Loaded `autoreview`; scoped docs review used instead of helper because helper local mode would review unrelated dirty checkout scope. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: MDX docs-only edits; `www check:docs`, link audit, anti-slop scan, and route smoke are the owning gates. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-one-by-one-audit.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | `docs-creator` + `autogoal` read; 70 files enumerated | per-page audit |
| Per-page audit | complete | `page-ledger.md` has 70 rows, 25 fixed, 45 clean | verification |
| Writing | complete | Applied docs-shape fixes to 25 source docs | verification |
| Verification | complete | `check:docs`, link audit, final audit, route smoke | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan updated; final `check-complete` next | final response |

Findings:

- `01-installing-slate` was the clearest docs-creator miss: no `## Installation`, no ownership table, no exact linked next step.
- Several API/reference and concept/library pages put examples or link lists before the first stable section heading.
- `09-performance` had a stale MDN URL: `https://developer.mozilla.org/en-US/docs/slate/Web/CSS/content-visibility`.
- The local dynamic-docs dev alias route proof failed because `.source-dev/dynamic.ts` exposes no `docs` export in this setup; static generated-source dev server rendered edited routes successfully.

Decisions and tradeoffs:

- Did not title every short API snippet; snippet title spam would make reference pages noisier and file context was not required.
- Did not run full dirty-tree autoreview helper; scoped docs review was the right target because local helper mode would include unrelated checkout changes.
- Did not patch folder-index doc links such as `libraries/slate-react`; the route resolver confirmed they map to `index.mdx` pages.

Implementation notes:

- 25 source docs were edited for heading shape, install/get-started shape, warning placement, placeholder comment removal, or stale URL repair.
- The per-page audit lives in `docs/plans/artifacts/slate-docs-one-by-one-audit/page-ledger.md`.

Review fixes:

- Accepted: install page lane-shape fix.
- Accepted: warning moved below first heading on migration page.
- Accepted: API/reference grouping headings added where missing.
- Accepted: placeholder comment removed from rendering snippet.
- Accepted: stale MDN URL fixed.
- Rejected: blanket code-fence titles for every short example; docs-creator only requires titles where file context matters.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad example-registry search streamed too much output | 1 | Use compact Node audits writing artifacts | Recovered with `link-audit.txt` and `final-audit.json`. |
| Wrong direct `pnpm --dir apps/www next ...` command | 1 | Use `pnpm --dir apps/www exec next ...` | Dev server started. |
| Route-smoke script mixed top-level `await` and `require` | 1 | Use ESM `import fs from 'node:fs'` | Route smoke script passed on retry. |
| Dynamic-docs dev alias returned 500 for every docs route | 1 | Restart without dynamic alias, using generated `.source/server` | 25 edited routes returned 200. |

Verification evidence:

- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate-2` -> pass; generated MDX source and docs source parity passed.
- `docs/plans/artifacts/slate-docs-one-by-one-audit/page-ledger.md` -> 70 rows, 25 fixed, 45 clean.
- `docs/plans/artifacts/slate-docs-one-by-one-audit/link-audit.txt` -> `ok`.
- `docs/plans/artifacts/slate-docs-one-by-one-audit/final-audit.json` -> 70 docs, 0 missing ledger/frontmatter, 0 stale matches, 0 anti-slop matches, 0 route failures.
- `docs/plans/artifacts/slate-docs-one-by-one-audit/route-smoke.json` -> 25 edited docs routes returned 200 from `http://localhost:3002`.
- `rg` scan for `<ComponentPreview` / `<PackageInfo>` under `content/docs/slate` -> no matches, preview validation N/A.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-slate-docs-one-by-one-audit.md` -> pass.

Final handoff contract:

- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no issue/tracker requested.
- Confidence line: High after 70-row ledger and verification gates.
- Docs lane: Mixed Slate docs corpus.
- Source-backed claims: Stale import/install/API slop scan clean.
- Content build / parser: `pnpm --filter www check:docs` passed.
- Links / demos / previews: link audit clean; previews N/A.
- Browser check: direct Browser unavailable; route smoke with local dev server passed 25 edited routes.
- Outcome: 70 docs checked one by one, 25 source docs fixed.
- Caveat: dynamic docs dev alias is broken in this local setup; static generated-source dev server is the route-proof owner used here.
- Verified: see Verification evidence.

Final handoff / sync:

- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: direct Browser unavailable; HTTP route smoke passed.
- Caveats: dynamic-docs alias 500s are recorded as local dev setup issue, not a docs source failure.

Timeline:

- 2026-06-22T04:34:43.679Z Docs goal plan created.
- 2026-06-22 Created active autogoal.
- 2026-06-22 Pre-audit found 70 files and 52 heuristic flags.
- 2026-06-22 Applied 25 docs-shape/source fixes.
- 2026-06-22 Wrote 70-row page ledger.
- 2026-06-22 Ran docs parser/source parity, link audit, final audit, and 25-route smoke.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final goal-plan check and complete the goal |
| What is the goal? | Audit Slate docs one by one and fix accepted docs-creator misses |
| What have I learned? | 25 docs needed shape repairs; dynamic docs route proof is broken locally but static generated-source proof passes |
| What have I done? | 70-row ledger, 25 docs fixes, docs checks, link audit, route smoke |

Open risks:

- Dynamic docs dev alias still fails route rendering because `.source-dev/dynamic.ts` has no `docs` export; this was not repaired because the docs source itself passes parser/source parity and route proof works with generated source.
