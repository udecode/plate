# slate fork rationale examples

Objective:
Expand Plite fork rationale docs; done when `why-this-fork.mdx` gives detailed examples for why the fork rewrote runtime instead of only `plite-react`, and docs/render checks pass.

Goal plan:
docs/plans/2026-06-23-slate-fork-rationale-examples.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: public docs page
- id / link: `content/docs/plite/why-this-fork.mdx`
- title: Why This Fork
- acceptance criteria: section is more exhaustive, includes concrete examples, keeps docs-creator voice, and avoids invented APIs or changelog wording.

Docs lane:

- lane: Guide / system
- target docs: `content/docs/plite/why-this-fork.mdx`
- documented source owner: Plate-maintained Plite runtime rationale, backed by `docs/plite/references/architecture-contract.md`, `docs/plite/absolute-architecture-release-claim.md`, and `docs/research/decisions/plite-read-update-runtime-architecture.md`
- nearest sibling docs: `content/docs/plite/index.mdx`
- plugin page: N/A: rationale page, not a plugin page

First checkpoint:

- [x] Explicit prompt captured: make the prior section more exhaustive and a bit more detailed with examples.
- [x] Explicit skill captured: follow `docs-creator`.
- [x] Scope captured: edit `content/docs/plite/why-this-fork.mdx`; keep this plan updated.
- [x] Non-goals captured: no code changes, no package rename, no docs nav change, no route move, no Slack reply drafting.
- [x] Verification captured: docs source build, docs parity, anti-slop audit, rendered route check, autogoal check-complete.

Timed checkpoint:

- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- `## Why Not Stay Closer To Plite?` explains the initial `plite-react`-only path.
- The section gives concrete examples of runtime facts the renderer cannot safely own.
- The section explains what stayed Plite-shaped.
- The section names Lexical and ProseMirror influence narrowly without implying copied models.
- The docs style stays direct, readable, and current-state.
- `pnpm --filter www build:source` passes.
- `pnpm --filter www check:docs` passes.
- Rendered route `http://localhost:3002/docs/plite/why-this-fork` returns `200` and contains the expanded examples.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-slate-fork-rationale-examples.md` passes.

Verification surface:

- source audit: `content/docs/plite/why-this-fork.mdx`
- style owner: `.agents/skills/docs-creator/SKILL.md`
- sibling docs: `content/docs/plite/index.mdx`
- source-backed rationale: `docs/plite/references/architecture-contract.md`, `docs/plite/absolute-architecture-release-claim.md`, `docs/research/decisions/plite-read-update-runtime-architecture.md`
- route check: `http://localhost:3002/docs/plite/why-this-fork`

Constraints:

- Follow docs-creator voice: direct, shadcn-dense, concrete examples, no essay before the concept.
- Write current-state docs only.
- Do not use changelog wording.
- Do not invent APIs, routes, demos, imports, components, transforms, or options.
- Do not mention public `main` root.

Boundaries:

- Source of truth: `content/docs/plite/why-this-fork.mdx`
- Allowed edit scope: `content/docs/plite/why-this-fork.mdx` and this plan file
- Browser surface: rendered docs route only
- Tracker sync: N/A
- Non-goals: runtime changes, package changes, navigation restructuring, release naming decision

Blocked condition:

- Block only if source-backed architecture docs contradict the expanded rationale or the docs route cannot render after valid MDX checks.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: complete
- confidence: high
- next owner: docs
- reason: target section was expanded with concrete examples and docs/render checks passed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` |
| Active goal checked or created | yes | `get_goal` returned none; active goal created |
| Docs lane selected | yes | Guide / system |
| Target docs read | yes | Read `content/docs/plite/why-this-fork.mdx` |
| Nearest sibling docs read | yes | Read `content/docs/plite/index.mdx` |
| Docs style doctrine read | yes | Read `docs-creator` |
| Documented source code read | no | N/A: rationale page documents architecture doctrine, not a code API surface |
| Ownership map drafted | yes | Docs lane section above |
| Plugin-page rules decision | no | N/A: not a plugin page |
| Browser/render proof decision | yes | Render route after docs checks |
| PR/tracker expectation decision | no | N/A: no PR/tracker requested |

Work Checklist:

- [x] First checkpoint complete.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as Guide / system.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Source-backed architecture rationale was verified against current docs.
- [x] Ownership map records the relevant runtime/doc owners.
- [x] Named APIs and package specifiers are exact and current.
- [x] Plugin, serialization, API reference, spec, and preview lanes are N/A because this is a rationale guide page.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Guide / system | yes | Opening is short; ownership model appears early; detailed mechanics stay below the main fork; reference material stays later. | Existing page shape fits; this patch expands one rationale section after `The Main Fork` and before package/runtime reference sections. |
| Other lanes | no | N/A | Not install, component, plugin, serialization, workflow, API reference, or formal spec page. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run docs source, parity, render, and plan checks | `pnpm --filter www build:source` pass; `pnpm --filter www check:docs` pass; route check pass |
| Docs lane shape satisfied | yes | Resolve Guide / system row | resolved above |
| Source-backed claim audit | yes | Verify rationale against source-backed architecture docs | read architecture contract, absolute architecture claim, read/update runtime decision |
| Ownership map verified | yes | Confirm runtime/doc ownership claims | resolved above |
| MDX/content parser | yes | Run `pnpm --filter www build:source` | pass |
| Links/routes/previews verified | yes | Check route | route returned `200`; no links/previews changed |
| Plugin page specifics | no | N/A | Not plugin page |
| Browser/render surface changed | yes | Route proof | Node REPL fetch returned `200` and found the expanded examples |
| Package/API behavior changed | no | N/A | Docs-only |
| Agent rules or skills changed | no | N/A | No rule/skill edits |
| Autoreview for non-trivial docs changes | no | N/A | N/A: narrow rationale-doc edit with parser/parity/render checks |
| Final lint | no | N/A | N/A: MDX prose-only |
| Timed checkpoint | no | N/A | N/A: no duration requested |
| Goal plan complete | yes | Run check-complete | ready for final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | target, sibling, docs-creator, source-backed architecture docs read | writing |
| Writing | complete | expanded `Why Not Stay Closer To Plite?` with examples table and ownership rationale | verification |
| Verification | complete | docs parser, docs parity, anti-slop audit, and route check passed | closeout |
| Closeout | complete | no unresolved checklist rows remain; final check-complete next | final response |

Findings:

- The current section names the right reason but is too compressed. It needs concrete examples of why a renderer-only rewrite becomes a hidden second runtime.

Decisions and tradeoffs:

- Expand the existing section instead of adding a new page, because the skeptical reader is already on `Why This Fork`.
- Use a small table for examples, because docs-creator favors tables for ownership and variant boundaries.

Implementation notes:

- Expanded `Why Not Stay Closer To Plite?` with concrete examples for `Shift+Down`, `Cmd+A` + Delete, extra editable regions, document metadata, overlays/comments, and browser proof.
- Kept Lexical/ProseMirror influence narrow: read/update and dirty reconciliation from Lexical; transaction and DOM-selection authority from ProseMirror.

Review fixes:

- Ran anti-slop audit for changelog wording, unfinished markers, and public `main` root leaks; no matches.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:

- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate-2` -> pass.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate-2` -> pass.
- Anti-slop audit for changelog wording, unfinished markers, and public `main` root leaks -> no matches.
- Node REPL fetch for `http://localhost:3002/docs/plite/why-this-fork` -> `status: 200`, examples present, no `main` root leak.

Final handoff contract:

- Changed files: `content/docs/plite/why-this-fork.mdx`, `docs/plans/2026-06-23-slate-fork-rationale-examples.md`
- Verification: docs source build, docs parity, anti-slop audit, route check, autogoal check-complete
- Route proof: Node REPL route fetch
- Caveats: Browser plugin control did not need visual proof for this text-only page; route proof used Node fetch.

Timeline:

- 2026-06-23: plan created, target/source docs read, active goal created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run check-complete, stop dev server, close goal |
| What is the goal? | More exhaustive fork rationale examples |

Open risks:

- None.
