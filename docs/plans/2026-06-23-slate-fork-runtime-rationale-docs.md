# slate fork runtime rationale docs

Objective:
Update Slate fork rationale docs; done when `why-this-fork.mdx` explains why the fork rewrote core runtime instead of only `slate-react`, and docs checks pass.

Goal plan:
docs/plans/2026-06-23-slate-fork-runtime-rationale-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none

Docs source:

- type: public docs page
- id / link: `content/docs/slate/why-this-fork.mdx`
- title: Why This Fork
- acceptance criteria: add a readable section explaining why minimal-breaking Slate compatibility and a `slate-react`-only rewrite were rejected; preserve docs style; verify MDX/source parity and rendered route.

Docs lane:

- lane: Guide / system
- target docs: `content/docs/slate/why-this-fork.mdx`
- documented source owner: Plate-maintained Slate runtime docs, grounded by `docs/slate-v2/references/architecture-contract.md`, `docs/slate-v2/absolute-architecture-release-claim.md`, and `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`
- nearest sibling docs: `content/docs/slate/index.mdx`
- plugin page: N/A: fork rationale page, not a plugin page

First checkpoint:

- [x] Explicit prompt captured: use `docs-creator`; update `content/docs/slate/why-this-fork.mdx`; add the rationale that the first path tried to avoid breaking/forking Slate, keep Slate core, rewrite `slate-react`, but that path could not produce a maintainable React-perfect runtime; mention Lexical/ProseMirror influence where relevant.
- [x] Scope captured: one public docs page plus this goal plan.
- [x] Non-goals captured: no code/runtime changes, no package rename, no route/nav topology change beyond the page TOC entry.
- [x] Verification captured: docs source parse, docs parity, anti-slop phrase audit, rendered route check.

Timed checkpoint:

- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- `content/docs/slate/why-this-fork.mdx` contains a `Why Not Stay Closer To Slate?` section.
- The section explains the failed `slate-react`-only path, why React performance/proof needed runtime facts, what stayed Slate, and the Lexical/ProseMirror runtime influence.
- `pnpm --filter www build:source` passes.
- `pnpm --filter www check:docs` passes.
- Rendered route `http://localhost:3002/docs/slate/why-this-fork` returns `200` and contains the new section.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-slate-fork-runtime-rationale-docs.md` passes.

Verification surface:

- source audit: `content/docs/slate/why-this-fork.mdx`
- style/source context: `.agents/skills/docs-creator/SKILL.md`, `content/docs/slate/index.mdx`
- source-backed rationale context: `docs/slate-v2/references/architecture-contract.md`, `docs/slate-v2/absolute-architecture-release-claim.md`, `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`
- commands: `pnpm --filter www build:source`, `pnpm --filter www check:docs`
- route check: Node REPL fetch for `http://localhost:3002/docs/slate/why-this-fork`

Constraints:

- Follow `.agents/rules/docs-creator.mdc` / generated `docs-creator` style.
- Write current-state docs only.
- No invented APIs, routes, demos, imports, components, transforms, or options.
- Keep prose simple and readable; no architecture dump.
- Do not touch code or docs nav beyond the page-local TOC.

Boundaries:

- Source of truth: `content/docs/slate/why-this-fork.mdx`
- Allowed edit scope: `content/docs/slate/why-this-fork.mdx` and this plan file.
- Browser surface: rendered docs route only.
- Tracker sync: N/A
- Non-goals: runtime changes, package changes, public rename decision, Slack reply drafting.

Blocked condition:

- Block only if the docs route cannot render after valid MDX/source checks, or if the rationale contradicts existing source-backed architecture docs.

Docs state:

- task_type: docs
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: complete after final goal-plan check
- confidence: high
- next owner: docs
- reason: one page changed, checks pass, rendered route contains the new section.

Completion rule:

- [x] Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. N/A rows include reasons.
- [x] Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-slate-fork-runtime-rationale-docs.md` passes.
- [x] Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created objective for this plan |
| Docs lane selected | yes | Guide / system |
| Target docs read | yes | Read `content/docs/slate/why-this-fork.mdx` |
| Nearest sibling docs read | yes | Read `content/docs/slate/index.mdx` |
| Docs style doctrine read | yes | Read `docs-creator` generated skill |
| Documented source code read | no | N/A: rationale page documents architecture doctrine, not a code API surface |
| Ownership map drafted | yes | Docs lane section above names runtime docs and architecture owners |
| Plugin-page rules decision | no | N/A: not a plugin page |
| Browser/render proof decision | yes | Rendered route checked by Node REPL fetch because Browser navigation tool was not exposed |
| PR/tracker expectation decision | no | N/A: no PR/tracker requested |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Docs lane is classified as Guide / system.
- [x] Selected lane-specific shape proof row below is resolved with concrete evidence.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior or API was verified against current source; source-backed architecture context was already read in this thread and summarized in the verification surface.
- [x] Ownership map records core runtime and docs ownership; kit/registry/app-local ownership N/A.
- [x] Fastest success path appears before deeper mechanics or API reference; page already starts with rationale and uses the new section before runtime details.
- [x] Opening is three sentences or fewer and avoids generic fluff; unchanged.
- [x] Named APIs and package specifiers are exact and current: `slate-react`, `editor.read`, `editor.update`, Lexical, ProseMirror.
- [x] Plugin docs N/A: not a plugin page.
- [x] Serialization docs N/A: not a serialization page.
- [x] API reference docs N/A: not an API reference page.
- [x] Spec/law docs N/A: this is a rationale guide; evidence is source-backed through architecture docs.
- [x] Demos/previews N/A: no demos or previews added.
- [x] Links target real leaf pages and do not reinforce pages being displaced; no new links added.
- [x] Anti-slop audit passed: no changelog-style, placeholder, or unfinished-marker phrases were found in `content/docs/slate/why-this-fork.mdx`.
- [x] Workspace authority recorded: proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] Review/autoreview target selected for non-trivial docs work, or marked N/A with reason: N/A: targeted prose-only page edit verified by docs parser/source parity/route check.

Lane-Specific Shape Proof:
| Lane | Applies | Required proof | Evidence |
|------|---------|----------------|----------|
| Install / get-started | no | Opening/install/usage path proof | N/A: not an install page |
| Component / registry item | no | Preview/install/usage/API proof | N/A: not a component page |
| Guide / system | yes | Opening is short with sibling disambiguation when needed; ownership model appears early; quick start precedes deeper mechanics; reference material stays last. | Page opening unchanged and short; new rationale appears before runtime/package details; no reference dump added |
| Behavior / runtime concept | no | Runtime-pipeline proof | N/A: not a behavior concept page |
| Plugin / feature | no | Kit/manual/API proof | N/A: not a plugin page |
| Serialization / conversion | no | Direction/environment proof | N/A |
| Workflow / AI | no | Runtime/setup/provider boundary proof | N/A |
| API reference | no | Exact contract proof | N/A |
| Spec / law / behavior | no | Contract/evidence/gaps proof | N/A: page is public rationale, not a spec owner |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/docs/render checks | `pnpm --filter www build:source` pass; `pnpm --filter www check:docs` pass; route fetch pass |
| Docs lane shape satisfied | yes | Resolve Guide / system row | Resolved above |
| Source-backed claim audit | yes | Verify named rationale against source-backed architecture context | `why-this-fork`, `index`, architecture/runtime decision docs read in this thread |
| Ownership map verified | yes | Confirm package/layer ownership claims | Existing package ownership table unchanged; new section names Slate model, runtime, `slate-react`, Lexical, ProseMirror only |
| MDX/content parser | yes | Run parser/build | `pnpm --filter www build:source` pass |
| Links/routes/previews verified | yes | Check route and preview/link impact | Node REPL fetch returned `200` and found new section; no previews/links added |
| Plugin page specifics | no | Apply kit/manual/API rules | N/A: not plugin page |
| Browser/render surface changed | yes | Capture rendered route proof | Node REPL fetch for `http://localhost:3002/docs/slate/why-this-fork` returned `200`, heading present, rationale present; Browser navigation tool was not exposed |
| Package/API behavior changed | no | Add changeset or record N/A | N/A: docs-only rationale copy |
| Agent rules or skills changed | no | Run sync | N/A: no rules/skills changed |
| Autoreview for non-trivial docs changes | no | Run review or record N/A | N/A: narrow prose-only edit, docs checks and route check cover this change |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no TS/JS/source formatting change; docs parser and parity passed |
| Timed checkpoint | no | Finish timed loop | N/A: no duration requested |
| Goal plan complete | yes | Run check-complete | `[autogoal] complete: docs/plans/2026-06-23-slate-fork-runtime-rationale-docs.md` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read target doc, sibling doc, docs-creator, autogoal | writing |
| Writing | complete | Added `Why Not Stay Closer To Slate?` section and TOC row | verification |
| Verification | complete | Docs parser, source parity, anti-slop audit, route fetch | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | `check-complete` ready; no unresolved checklist rows remain | final response |

Findings:

- The existing page explained the maintenance model and runtime shape but did not directly answer why a `slate-react`-only rewrite was rejected.
- The new section belongs after `The Main Fork`, before `Who It Is For`, because it answers the compatibility/runtime objection before feature details.

Decisions and tradeoffs:

- Added one section instead of splitting a new page -> keeps the rationale findable where skeptical readers already land -> avoids duplicated architecture docs.
- Used simple prose over a table -> this is a human rationale, not an API matrix.
- Mentioned Lexical and ProseMirror only as runtime influences -> avoids implying copied models or changing Slate's document identity.

Implementation notes:

- Updated the page-local "On This Page" list.
- Added `## Why Not Stay Closer To Slate?`.
- Tightened "new features" to "extra roots, document state, overlays, and React performance" to avoid changelog-ish wording.

Review fixes:

- Self-review found `new features` wording; replaced it with current-state feature names.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried forwarding `--port 3002` to `pnpm --filter www dev`; Next treated it as a directory | 1 | Use `PORT=3002 pnpm --filter www dev` | Server started on port 3002 |
| Browser plugin direct navigation tool unavailable from `tool_search` | 1 | Use Node REPL HTTP rendered-route check and record limitation | Route returned `200` and contained the section |

Verification evidence:

- `pnpm --filter www build:source` in `/Users/zbeyens/git/plate-2` -> pass.
- `pnpm --filter www check:docs` in `/Users/zbeyens/git/plate-2` -> pass.
- Anti-slop phrase audit for changelog-style, placeholder, and unfinished-marker wording -> no matches.
- Node REPL fetch `http://localhost:3002/docs/slate/why-this-fork` -> `status: 200`, `hasHeading: true`, `hasExtraRootsPhrase: true`, `hasLexicalProseMirror: true`.

Final handoff contract:

- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: high
- Docs lane: Guide / system
- Source-backed claims: Slate model retained; runtime rewritten for read/write, transaction, commit, dirty metadata, and selection/DOM authority; Lexical/ProseMirror influence named narrowly.
- Content build / parser: pass
- Links / demos / previews: no new links/demos/previews; route rendered
- Browser check: Browser navigation tool unavailable; Node REPL rendered-route fetch used
- Outcome: rationale section added
- Caveat: temporary local dev server used for route check
- Verified: yes

Final handoff / sync:

- PR: N/A
- Issue / tracker: N/A
- Browser proof: Node REPL fetch route proof
- Caveats: direct Browser plugin tool was unavailable

Timeline:

- 2026-06-23T10:03:07.686Z Docs goal plan created.
- 2026-06-23 Read docs-creator, autogoal, target page, and sibling overview.
- 2026-06-23 Created active goal for the docs update.
- 2026-06-23 Added `Why Not Stay Closer To Slate?` section.
- 2026-06-23 Ran docs parser/source parity and rendered-route checks.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run check-complete, stop dev server, final response |
| What is the goal? | Update `why-this-fork.mdx` with runtime-rationale section and verify docs |
| What have I learned? | The page needed a direct answer to why core runtime changed instead of only `slate-react` |
| What have I done? | Added section, verified docs checks and rendered route |

Open risks:

- None.
