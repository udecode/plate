# rewrite performance guide

Objective:
Rewrite `content/docs/(guides)/performance.mdx` as a current-state,
source-backed guide for Plate docs performance evidence and benchmark ownership.

Goal plan:
docs/plans/2026-06-02-rewrite-performance-guide.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- docs-creator

Docs source:
- type: local docs rewrite
- id / link: `content/docs/(guides)/performance.mdx`
- title: Performance
- acceptance criteria: current-state guide, fastest path first, no unsourced
  benchmark numbers, benchmark ownership clear, content parser and browser proof
  recorded

Docs lane:
- lane: guide/system
- target docs: `content/docs/(guides)/performance.mdx`
- documented source owner: `apps/www` public docs harness plus
  `benchmarks/editor` Evidence Kit lab
- nearest sibling docs: `content/docs/examples/huge-document.mdx`,
  `content/docs/(guides)/static.mdx`
- plugin page: N/A: guide page, not plugin docs

Completion threshold:
- The page teaches the quickest valid performance path first.
- Every concrete route, command, workload, and benchmark artifact claim is backed
  by current repo source.
- Unsourced hardcoded Plate-vs-Slate numbers and absolute local links are absent
  from the source docs page.
- The guide distinguishes public Plate-vs-Slate docs harness evidence from
  Slate v2-vs-Slate Evidence Kit evidence.
- `pnpm --filter www build:source`, `pnpm --filter www check:docs`, Browser
  verification, and the autogoal completion check pass or record a concrete
  blocker.

Verification surface:
- Source audit: target doc, huge-document example, editor-perf route and runner,
  benchmark registry, benchmark health artifact, rich-text evidence artifact.
- Parser/parity: `pnpm --filter www build:source` and
  `pnpm --filter www check:docs` from `/Users/zbeyens/git/plate-2`.
- Stale-claim scan: `rg` for old absolute links and old benchmark numbers in the
  source docs page.
- Browser proof: in-app Browser opened `http://localhost:3000/docs/performance`
  and verified the rewritten sections render with no page console errors.

Constraints:
- Follow `.agents/rules/docs-creator.mdc` and the loaded `docs-creator` skill.
- Write current-state docs only. No changelog voice.
- Keep commands repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, options,
  or benchmark artifacts.
- Do not regenerate CI-owned registry output locally.

Boundaries:
- Source of truth: `content/docs/(guides)/performance.mdx`,
  `apps/www/src/registry/examples/huge-document-demo.tsx`,
  `apps/www/src/app/dev/editor-perf/page.tsx`,
  `apps/www/scripts/run-editor-perf.mts`,
  `benchmarks/editor/README.md`,
  `benchmarks/editor/research/benchmark-registry.json`,
  `benchmarks/editor/benchmarks/results/benchmark-health-latest.json`, and
  `benchmarks/editor/benchmarks/results/rich-text-editors-latest.json`.
- Allowed edit scope: performance guide and this docs plan.
- Browser surface: `/docs/performance` on the existing `apps/www` dev server.
- Tracker sync: N/A: no external tracker issue in this request.
- Non-goals: no package/API changes, no benchmark execution, no registry-output
  regeneration, no deployment of Evidence Kit static reports.

Blocked condition:
- Block only if the docs source cannot build, the rendered docs route cannot be
  reached through Browser, or source audit finds a benchmark claim without a
  current repo-backed artifact.

Docs state:
- task_type: docs
- task_complexity: moderate
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: user/CI
- reason: source page is rewritten, parser/parity/browser checks passed, and
  CI-owned registry output is intentionally left for automated regeneration

Completion rule:
- Completion is valid because every checklist item is checked, final evidence is
  recorded, and the completion checker passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `docs-creator` loaded | yes | Skill instructions loaded and followed for source-backed current-state docs |
| Active goal checked or created | yes | Goal scratchpad created with docs template |
| Docs lane selected | yes | Classified as guide/system |
| Target docs read | yes | Read `content/docs/(guides)/performance.mdx` before editing |
| Nearest sibling docs read | yes | Read huge-document and static guide docs |
| Docs style doctrine read | yes | Used docs-creator current-state/no-changelog rules |
| Documented source code read | yes | Read editor-perf route, runner, huge-document demo, Evidence Kit README/results |
| Ownership map drafted | yes | Evidence Surfaces and Source Map tables added |
| Plugin-page rules decision | yes | N/A: guide page |
| Browser/render proof decision | yes | Browser route proof required and completed |
| PR/tracker expectation decision | yes | N/A: no PR/tracker request in this turn |

Work Checklist:
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
- [x] Plugin docs are N/A because this is a guide page.
- [x] Serialization docs are N/A because this page does not document
      serialization or conversion.
- [x] API reference docs are N/A because this page does not define API
      contracts.
- [x] Spec/law docs are N/A because this is not an editor-behavior law page.
- [x] Demos/previews are real registry entries or marked N/A with reason.
- [x] Links target real leaf pages and do not reinforce pages being displaced.
- [x] Anti-slop audit passed: no changelog voice, no fake APIs, no placeholder
      comments, no unchecked plan items, no dead anchors, no redundant summary.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed docs.
- [x] Review/autoreview target selected for non-trivial docs work, or marked
      N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, parser/parity, stale-claim scan, Browser proof | Completed in `/Users/zbeyens/git/plate-2` |
| Docs lane shape satisfied | yes | Check guide/system structure against `docs-creator` | Quick Path, Evidence Surfaces, Public Harness, Evidence Kit, Claim Checklist |
| Source-backed claim audit | yes | Verify named routes/commands/artifacts against source | `run-editor-perf.mts`, `editor-perf/page.tsx`, benchmark registry/results read |
| Ownership map verified | yes | Confirm app-local and benchmark-lab ownership against source | Evidence Surfaces and Source Map tables align with source files |
| MDX/content parser | yes | Run source build and docs parity | `pnpm --filter www build:source`; `pnpm --filter www check:docs` |
| Links/routes/previews verified | yes | Check leaf docs link and route render | Browser route proof for `/docs/performance`; `/docs/examples/huge-document` link present |
| Plugin page specifics | no | Record N/A | N/A: guide page |
| Browser/render surface changed | yes | Capture Browser proof | In-app Browser verified title, new sections, absent stale claims, and no page errors |
| Package/API behavior changed | no | Record N/A | N/A: docs-only source rewrite |
| Agent rules or skills changed | no | Record N/A | N/A: no skill/rule edit in this turn |
| Autoreview for non-trivial docs changes | no | Record N/A | N/A: user asked rewrite, not review; docs parser/browser gates cover this change |
| Final lint | yes | Run scoped equivalent or record ignored surface | `pnpm exec biome check ... --fix` ran; Biome ignores MDX/plan markdown |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-rewrite-performance-guide.md` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read target, siblings, source route/runner, Evidence Kit artifacts | writing |
| Writing | complete | Rewrote `content/docs/(guides)/performance.mdx` | verification |
| Verification | complete | `build:source`, `check:docs`, stale-claim scan, Browser proof | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker action requested | final response |
| Closeout | complete | Plan updated and completion check run | final response |

Findings:
- The old public Plate-vs-Slate numbers were only found in the docs page and
  generated registry docs JSON, not a durable benchmark artifact.
- `benchmarks/editor` active evidence currently covers Slate v2 vs Slate, not
  Plate vs Slate public overhead.
- `apps/www/public/r/performance-docs.json` is stale registry output; repo rules
  say not to regenerate registry output locally.

Decisions and tradeoffs:
- Removed unsourced numeric snapshots from the source guide.
- Kept the public docs harness as the Plate-vs-Slate claim source.
- Referenced Evidence Kit as supporting research and static-report output, not
  as public Plate-vs-Slate proof.
- Left CI-owned registry JSON untouched.

Implementation notes:
- Added Quick Path with the public preset command and `--summary-out` artifact.
- Added Evidence Surfaces and Source Map ownership tables.
- Added Evidence Kit health snapshot sourced from
  `benchmark-health-latest.json`.
- Added Claim Checklist for future performance claims.

Review fixes:
- Removed absolute local markdown links from the source guide.
- Removed stale hardcoded `475.61 ms`, `529.58 ms`, `972.70 ms`, and related
  markdown-profile claims from the source guide.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www dev -- --port 3001` forwarded flags as a directory | 1 | Start Next directly from `apps/www` | Found existing dev lock instead |
| Direct Next dev on ports 3001/3002 blocked by existing dev lock | 2 | Use existing dev server on 3000 | Existing server rendered route after compile |
| Scoped Biome check ignored MDX/plan markdown | 1 | Record ignored lint surface | Parser/parity/browser checks cover docs change |

Verification evidence:
- `pnpm --filter www build:source` passed in `/Users/zbeyens/git/plate-2`.
- `pnpm --filter www check:docs` passed in `/Users/zbeyens/git/plate-2`.
- `rg -n "/Users/zbeyens|475\\.61|529\\.58|972\\.70|480\\.60|standalone markdown benchmark|it depends" 'content/docs/(guides)/performance.mdx'` returned no source-page matches.
- Browser proof on `http://localhost:3000/docs/performance`: title
  `Performance - Plate`, `Quick Path`, `Evidence Surfaces`,
  `public-slate-vs-plate`, and `Evidence Kit` present; old `475.61 ms` and
  `rich-markdown mount` claims absent; page console errors empty.
- `pnpm exec biome check 'content/docs/(guides)/performance.mdx' docs/plans/2026-06-02-rewrite-performance-guide.md --fix` ran and reported both paths ignored by Biome.

Final handoff contract:
- PR line: N/A, no PR requested in this turn.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high; source docs and rendered route are verified.
- Docs lane: guide/system.
- Source-backed claims: verified against app docs harness and Evidence Kit
  artifacts.
- Content build / parser: `build:source` and `check:docs` passed.
- Links / demos / previews: `/docs/examples/huge-document` route link present;
  no preview added.
- Browser check: passed on the in-app Browser.
- Outcome: performance guide rewritten.
- Caveat: generated `apps/www/public/r/performance-docs.json` remains stale by
  repo rule until CI-owned registry regeneration runs.
- Verified: yes.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: `http://localhost:3000/docs/performance` verified.
- Caveats: CI-owned registry output intentionally untouched.

Timeline:
- 2026-06-02T11:34:33Z Docs goal plan created.
- 2026-06-02T11:38:25Z Source rewrite, parser checks, Browser proof, and plan
  evidence recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Rewrite performance guide as source-backed current-state docs |
| What have I learned? | Public Plate-vs-Slate docs harness and Slate v2 Evidence Kit evidence must stay separate |
| What have I done? | Rewrote guide, verified parser/parity/browser, recorded evidence |

Open risks:
- CI-owned registry JSON remains stale locally until automated registry
  regeneration runs.
