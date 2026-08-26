# Fix zero-config Plate docs

Objective:
Fix the two accepted Plate docs defects; done when the install command and stale ParagraphPlugin import are corrected and docs verification passes; plan docs/plans/2026-08-25-fix-zero-config-plate-docs.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-fix-zero-config-plate-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: direct user request continuing the accepted review
- id / link: N/A
- title: Fix only review items 2 and 3
- acceptance criteria: both language variants of the manual guide install `platejs` for the first editor and introduce `@platejs/basic-nodes` only when marks use it; both editor-guide variants import `ParagraphPlugin` from `platejs/react`; no product code, tests, or unrelated docs are changed.

Docs lane:

- lane: install / get-started primary; guide / system supporting
- target docs: `content/docs/installation/manual.mdx`; `content/docs/installation/manual.cn.mdx`; `content/docs/(guides)/editor.mdx`; `content/docs/(guides)/editor.cn.mdx`
- documented source owner: `packages/plate/package.json`, `packages/plate/src/react/index.tsx`, `packages/core/src/react/index.ts`
- nearest sibling docs: `content/docs/installation/react.mdx`
- plugin page: N/A; no plugin page changes

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: N/A; exact two-row artifact checklist is stronger
- improvement loop: N/A; micro one-shot task
- final score / loop closure: N/A

Completion threshold:

- Both `manual.mdx` variants have `npm install platejs` before the first editor and install `@platejs/basic-nodes` at the first basic-marks use.
- Both `editor.mdx` variants import `ParagraphPlugin` from `platejs/react`.
- Source audits find no rejected old form in the four named locations, the docs source build and docs check pass, all affected routes render, and no files outside the four target docs plus this required plan are edited by this task.
- Docs closure is legal only when the page teaches the fastest correct path,
  every claim is source-backed, the selected lane-specific shape proof row is
  satisfied, required MDX/link/preview checks are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-zero-config-plate-docs.md`
  passes.

Verification surface:

- Source audit: focused `rg` over the four target docs plus current package exports.
- Parser/source proof: `pnpm --filter www build:source` and `pnpm --filter www check:docs` from `/Users/zbeyens/git/plate-2`.
- Render proof: Browser checks for the English and Chinese manual/editor routes against the local docs app.

Constraints:

- Follow `.agents/rules/docs-creator.mdc` for docs style and workflow.
- Write current-state docs only. No changelog voice.
- Keep code examples repo-backed and copy-pasteable.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not add docs ceremony for tiny typo/copy edits.

Boundaries:

- Source of truth: current `next` package manifests/exports and the four target docs.
- Allowed edit scope: the four target MDX files plus this required goal plan.
- Browser surface: the English and Chinese manual/editor routes only.
- Tracker sync: N/A; no tracker item.
- Non-goals: no product code, no tests, no broader cleanup of existing examples or prose, no PR/commit/push.

Output budget strategy:

- Read exact files and focused ranges only; exclude generated registry output, templates, build artifacts, and broad repo scans. Cap command output to the affected docs and verification errors.

Blocked condition:

- Stop only if current package exports contradict either correction, or the owning docs build/routes remain unavailable after focused local verification.

Docs state:

- task_type: docs
- task_complexity: micro
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: valid
- confidence: high; both defects are source-proven
- next owner: docs
- reason: `platejs` owns the zero-config editor and `ParagraphPlugin` is exported from `platejs/react`; both language variants taught stale package ownership.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-zero-config-plate-docs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Only prior review items 2 and 3 across their language mirrors; no product code or tests. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Active goal checked or created | yes | Goal created for this exact two-row outcome. |
| Docs lane selected | yes | Install/get-started primary; guide/system supporting. |
| Target docs read | yes | Read all four target MDX files in full; the Chinese mirrors received literal package/import corrections only. |
| Nearest sibling docs read | yes | Read `content/docs/installation/react.mdx` in full. |
| Docs style doctrine read | yes | Read `style-and-structure.md` and the install/guide lane templates. |
| Documented source code read | yes | Current `platejs` manifest/react reexports and Core `ParagraphPlugin` export were inspected. |
| Ownership map drafted | yes | `platejs` owns zero-config setup; `@platejs/basic-nodes` owns optional marks/elements; `platejs/react` exports `ParagraphPlugin`. |
| Plugin-page rules decision | no | N/A: neither target is a plugin page. |
| Browser/render proof decision | yes | Render all four affected routes with Browser after the edits. |
| PR/tracker expectation decision | no | N/A: user requested local edits only; no PR or tracker. |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as install plus supporting guide/system.
- [x] Selected lane-specific shape proof rows below are resolved with concrete
      evidence. A generic "docs lane shape satisfied" statement is not enough.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source.
- [x] Ownership map records core runtime, package, kit, registry, and app-local
      ownership where relevant.
- [x] Fastest success path appears before deeper mechanics or API reference:
      `platejs` alone precedes the first working editor; basic nodes appear at
      the first mark-plugin use.
- [x] Opening is three sentences or fewer and avoids generic fluff; the existing
      one-paragraph openings were unchanged.
- [x] Named APIs, imports, routes, and package specifiers changed by this task
      are exact against current source; unrelated existing examples were not
      re-audited or rewritten.
- [x] Plugin docs, if applicable, satisfy kit/manual/API ordering and headless
      package ownership; N/A: no plugin page was edited.
- [x] Serialization docs, if applicable, split directions and state environment
      constraints before examples; N/A: no serialization page was edited.
- [x] API reference docs, if applicable, use exact contracts and avoid tutorial
      filler; N/A: no API reference page was edited.
- [x] Spec/law docs, if applicable, record owner map, evidence, and explicit
      gaps; N/A: no spec or law page was edited.
- [x] Demos/previews are real: all existing manual previews rendered through the
      local docs route; this task added no preview.
- [x] Links target real leaf pages; N/A for link edits because no links changed,
      and all four affected routes rendered.
- [x] Every edited MDX artifact completed the required `unslop` file-edit pass
      after claims stabilized: `manual.mdx`, `manual.cn.mdx`, `editor.mdx`, and
      `editor.cn.mdx` were read in full, changed passages were inspected, and
      literal commands/imports plus their technical meaning were preserved.
- [x] Requirement language separates the required `platejs` runtime from the
      feature-specific `@platejs/basic-nodes` package; no compatibility or
      repo-only requirement is presented as user setup.
- [x] Workspace authority recorded: shell proof ran from
      `/Users/zbeyens/git/plate-2`; rendered proof used Browser against the
      existing local `apps/www` dev server.
- [x] Review/P1 autoreview target selected; N/A: four literal mirror corrections
      are micro docs work, covered by source, parser, parity, and Browser proof.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | yes | Opening has only the short lead before the first `##`; hard requirements appear before the first install command and are classified against package, copied-source, or build owners; the page has `## Installation`, `## Usage` or an equivalent first working path, and next-step links; procedural setup uses `<Steps>` when it is more than one real step; installed packages have an ownership table when more than one package/layer is involved; app-file snippets use titled code fences when file context matters. | Existing manual page remains a `<Steps>` procedure with titled app snippets and next steps. This edit makes the first install command match its single package owner, then introduces the optional feature package at first use. |
| Component / registry item | no | Real preview exists or is marked N/A; installation is CLI/manual shaped; usage has imports plus smallest JSX; examples are real variants; API reference is last when needed. | N/A: no component page. |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | `editor.mdx` already follows the guide shape; this task changes only one import so its migration example uses the current owner. |
| Behavior / runtime concept | no | Decision table or equivalent surface choice appears early; runtime pipeline has owner map; each stage is separated; recipes link to canonical references. | N/A: no runtime-concept rewrite. |
| Plugin / feature | no | Kit usage and manual usage are split when a kit exists; headless package ownership is explicit; plugin APIs/transforms are documented only when source-real. | N/A: no plugin page. |
| Serialization / conversion | no | Directions are split up front; environment constraints appear before examples; extension points come after the base path; heavy API reference stays late. | N/A: no serialization page. |
| Workflow / AI | no | Required runtime pieces are separated from optional UI; setup path comes before architecture; client/server or provider boundaries are explicit. | N/A: no workflow/AI page. |
| API reference | no | Short purpose paragraph, grouped surface, exact parameters/options/returns, caveats, and no tutorial restart. | N/A: no API reference page. |
| Spec / law / behavior | no | Contract, owner map, model-before-UX, evidence, and explicit gaps are recorded before any appendix. | N/A: no spec page. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the source audit, parser/build, link/demo check, or review named in this plan | Focused rejected-form audit returned zero in the four targets; `build:source` and `check:docs` passed; Browser rendered four routes. |
| Docs lane shape satisfied | yes | Resolve the selected row in `Lane-Specific Shape Proof`; do not close this gate from a generic shape assertion | Install row: one-package first install followed by optional feature package at first use. Guide row: migration import uses the canonical React owner. |
| Source-backed claim audit | yes | Verify every named API/option/transform/component/import/route against source | `platejs` manifest depends on Core/Plite, `platejs/react` reexports Core React, and Core exports `ParagraphPlugin` through its paragraph barrel. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact after claims stabilize; name each file and confirm protected literal content and technical claims survived | Read and inspected `manual.mdx`, `manual.cn.mdx`, `editor.mdx`, and `editor.cn.mdx`; commands/imports and technical claims remained literal and source-backed. |
| Requirements disclosure | yes | For install/get-started work, classify hard compatibility, layer-specific setup, recommendations, and repo-only details against live owners; otherwise record N/A | `platejs` is the first-editor runtime; `@platejs/basic-nodes` is feature-specific setup at the marks step. No repo-only detail was added. |
| Ownership map verified | yes | Confirm package/layer/kit/app-local ownership claims against source | Core/Plite runtime is exposed through `platejs`; basic mark plugins remain in `@platejs/basic-nodes`; `ParagraphPlugin` comes through `platejs/react`. |
| MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | Current `apps/www` owns `build:source` instead of the obsolete template command; `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| Links/routes/previews verified | yes | Check leaf links, routes, anchors, and `<ComponentPreview>` names or record N/A | No links/previews changed; all existing previews loaded while both manual routes rendered, and both editor routes rendered. |
| Plugin page specifics | no | If plugin page, apply `docs-creator` kit/manual/API rules or record N/A | N/A: no plugin page. |
| Browser/render surface changed | yes | Capture Browser proof for normal rendered surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser confirmed the expected package commands/import and rejected form absence on `/docs/installation/manual`, `/docs/editor`, `/cn/docs/installation/manual`, and `/cn/docs/editor`. |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only ownership corrections. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent files changed. |
| P1 autoreview for non-trivial docs changes | no | Load `.agents/skills/autoreview/SKILL.md` and run the right target with `--max-priority P1`; use P2 or P3 only when explicitly requested, or record N/A for tiny/no-local-patch work | N/A: two literal docs corrections; source audit and docs checks are stronger than review theater. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no code; MDX parser and docs checks own verification. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-zero-config-plate-docs.md` | Passed on 2026-08-25 after all substantive gates were resolved. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Prompt, four target docs, sibling, doctrine, and source owners read. | Writing |
| Writing | completed | Four literal English/Chinese ownership corrections applied; no product code or tests changed. | Verification |
| Verification | completed | Focused source audit, `build:source`, `check:docs`, and four-route Browser proof passed. | Closeout |
| PR / tracker sync | not_applicable | N/A: no PR, commit, push, issue, or tracker action requested. | Final response |
| Closeout | completed | Plan evidence recorded and the mechanical completion check passed. | Final response |

Findings:

- `platejs` already depends on and reexports Core/Plite, so the first manual editor needs only `platejs`.
- `ParagraphPlugin` is exported from `platejs/react`; `@platejs/basic-nodes/react` does not export it.

Decisions and tradeoffs:

- Change only the two accepted defects across their language mirrors. Existing unrelated prose and example defects remain untouched by explicit user scope.

Implementation notes:

- Changed the English and Chinese manual guides so `platejs` is the sole first-editor install and `@platejs/basic-nodes` is installed at the basic-marks step.
- Changed the English and Chinese editor migration snippets to import `ParagraphPlugin` from `platejs/react`.
- Preserved unrelated pre-existing ElementId edits in both editor-guide files and excluded them from this task's claims.

Review fixes:

- The focused mirror audit caught the same two stale statements in the Chinese pages; both were corrected without broadening beyond review items 2 and 3.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| New dev server could not start because the same `apps/www` server already owned port 3000 | 1 | Use the reported existing server instead of killing it or starting another process | Existing server served all four affected routes. |
| Browser `networkidle` load state is unsupported | 1 | Use supported `load` state plus a fresh DOM assertion | Four-route assertions passed. |

Verification evidence:

- Source audit from `/Users/zbeyens/git/plate-2`: both manual targets contain separate `npm install platejs` and `npm install @platejs/basic-nodes` commands; both editor targets import `ParagraphPlugin` from `platejs/react`; the rejected combined command and stale import are absent from those four files.
- Ownership audit: `packages/plate/package.json` depends on `@platejs/core` and `@platejs/plite`; `packages/plate/src/react/index.tsx` reexports `@platejs/core/react`; Core's React index and paragraph barrel export `ParagraphPlugin`.
- `pnpm --filter www build:source` passed.
- `pnpm --filter www check:docs` passed, including API-reference check, MDX source generation, and docs source parity.
- Browser rendered `/docs/installation/manual`, `/docs/editor`, `/cn/docs/installation/manual`, and `/cn/docs/editor`. Each route contained its expected package command/import and omitted its rejected form.
- Browser console still reports the existing Next.js uncached-data prerender diagnostic for both docs route families. It did not block rendering and is unrelated to these MDX ownership corrections.

Final handoff contract:

- PR line: N/A; no commit, push, or PR requested.
- Issue / tracker line: N/A; no tracker action requested.
- Confidence line: high for the four corrected statements; no broader docs audit claimed.
- Docs lane: install/get-started primary, guide/system supporting.
- Source-backed claims: `platejs` owns the first editor; basic nodes are installed at feature use; `ParagraphPlugin` comes from `platejs/react`.
- Content build / parser: `build:source` and `check:docs` passed.
- Links / demos / previews: unchanged and rendered on the affected routes.
- Browser check: four English/Chinese routes passed the expected/rejected assertions.
- Outcome: review items 2 and 3 are corrected across their mirrors; product code and tests were untouched.
- Caveat: existing Next.js uncached-data prerender diagnostics remain outside scope.
- Verified: 2026-08-25 from `/Users/zbeyens/git/plate-2` and Browser at `http://localhost:3000`.

Final handoff / sync:

- PR: N/A; local docs edit only.
- Issue / tracker: N/A.
- Browser proof: four affected routes rendered the accepted forms and omitted the rejected forms.
- Caveats: existing uncached-data prerender diagnostics were observed but did not block the docs render.

Timeline:

- 2026-08-25T18:01:09.617Z Docs goal plan created.
- 2026-08-25 Intake completed: requirements locked to review items 2 and 3; target docs, sibling docs, style rules, and current source owners read.
- 2026-08-25 Writing completed: English and Chinese mirrors corrected with no product-code or test edits.
- 2026-08-25 Verification completed: source audit, docs build/parity check, and four-route Browser proof passed.
- 2026-08-25 Closeout completed: the autogoal mechanical plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for final response. |
| Where am I going? | Hand off the verified local docs corrections. |
| What is the goal? | Correct only the first-install package command and stale ParagraphPlugin import. |
| What have I learned? | `platejs` owns zero-config setup; basic nodes are optional at first use; ParagraphPlugin comes from `platejs/react`. |
| What have I done? | Corrected all four language variants and passed source, docs, parity, and Browser proof. |

Open risks:

- No risk remains for the two corrected statements. The existing Next.js uncached-data prerender diagnostic is outside this docs-only scope and did not block rendering.
