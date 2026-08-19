# Editor document standard proposals research

Objective:
Find the strongest editor document/block standard proposals; done when Slate
history and twelve candidates are source-checked and the likely remembered
proposal is identified.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-editor-document-standard-proposals-research.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: direct user follow-up requesting deeper GitHub research
- id / link: current Codex task
- title: Find the missing universal editor/block standard proposal
- decision to make: whether Slate or another project proposed a genuinely
  reusable universal node/block protocol beyond MDAST/UNIST, and whether it
  changes the prior Plate verdict.
- decision criteria: published specification, independent implementations,
  governance/versioning, rich-text structural coverage, editor suitability,
  extension model, and current maintenance.

Major lane:
- lane: GitHub/OSS standards and proposal research
- output type: source-backed proposal taxonomy and corrected verdict
- implementation expected: no
- affected packages / surfaces: existing editor-node research artifact only;
  possible future `best-api` decision
- dominant risk: mistaking a library's internal JSON, an embedding protocol,
  or an abandoned Slate design for a universal document standard.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: source/candidate threshold
- improvement loop: expand queries until Slate history and twelve distinct
  specification/proposal families have explicit dispositions
- final score / loop closure: N/A: binary evidence threshold

Completion threshold:
- At least twelve candidate standards/proposals are classified as syntax tree,
  rich-text document format, block protocol, collaboration model, or internal
  editor serialization.
- Slate GitHub issues, PRs, discussions, source history, and old schema/docs are
  searched with exact positive or negative evidence.
- The likely remembered proposal is identified or the ambiguity is narrowed to
  explicit candidates.
- The existing research artifact gains a second shard, ledger rows, and a
  statement of whether the prior Plate recommendation changes.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-document-standard-proposals-research.md`
  passes.

Verification surface:
- GitHub search ledgers and exact issue/PR/discussion/source reads.
- Clean local source clones for promoted candidates.
- `docs/plite/research/2026-08-17-editor-node-model-standards/shards/002-standards-proposals.md`.
- Updated repo/query/lead/read/rejected/promoted ledgers and README verdict.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: official specs, current repositories, GitHub issues/PRs/
  discussions, and immutable local source commits.
- Allowed edit scope: this plan and the existing research artifact/ledgers.
- External sources: Slate history plus at least twelve protocol/format families.
- Browser surface: N/A: research only.
- Tracker sync: N/A.
- Non-goals: implementing a new AST, full editor audits, issue corpus closure,
  or treating popularity as standards evidence.

Output budget strategy:
- Start with GitHub result counts/titles, record queries, then open only exact
  promising issues/spec/source files. Cap each search to 100 results and each
  source read to narrow sections; put the taxonomy in shard 002 instead of
  streaming raw results.

Blocked condition:
- Stop only if GitHub search/auth is unavailable across three different access
  paths or the historical Slate repository cannot be inspected locally.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: the remembered Slate proposal is issue #4378 for UNIST-compatible
  text nodes; related #1486 and #3482 considered MDAST and Portable Text. None
  landed. HASH Block Protocol is the likely remembered block-protocol name but
  explicitly does not define rich-text AST data.
- confidence: high
- next owner: none for research; prior user decision on three P1 Plate packets remains
- reason: 17 candidate families and full Slate proposal/history evidence reveal
  no missing universal editor-tree standard.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-document-standard-proposals-research.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Deeper GitHub research, standard/proposal focus, and suspected Slate provenance are explicit. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Reused for standards-comparison discipline. |
| Active goal checked or created | yes | New research goal created with this plan. |
| Source of truth read before analysis | yes | Prior 10-source artifact, current Plate decision, and clean official Slate clone are available. |
| Major lane selected | yes | GitHub/OSS standards and proposal research. |
| Decision criteria stated | yes | Seven standards/proposal criteria listed above. |
| Existing repo patterns / prior decisions checked | yes | Prior MDAST-adjacent verdict and exact open uncertainty are carried forward. |
| Helper stack selected | yes | `plite-research`, GitHub CLI/web discovery, local clone reads, major-task/autogoal. |
| External research decision recorded | yes | Slate history plus twelve candidate families required. |
| Implementation expectation recorded | no | N/A: no product implementation. |
| Workspace authority selected | yes | Research artifact in Plate; source authority in official GitHub/local clones. |
| Branch / PR expectation decided | no | N/A: no branch, commit, push, or PR. |
| Output budget strategy recorded | yes | Count/title searches before exact reads; results artifacted. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: none requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
      Pressure pass asked whether each proposal is a syntax AST, live editor
      model, interchange format, collaboration model, or embedding protocol;
      only honest category-specific boundaries survived.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
      N/A: research only.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
      N/A for code; the only factual correction was accepting the user's Slate
      memory and identifying #4378, while rejecting its canonical model change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 17 candidate families and full Slate source/history exceed the 12-candidate threshold; shard and ledgers validate. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Prior Plate model, current Slate source, full Slate history/tags, and current external specs mapped. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Specification, implementations, governance/versioning, structure, editing fit, extensibility, and maintenance are classified per family. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Shard 002 classifies 17 families and names exact category mismatch/rejection reasons. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Category pressure rejected syntax/conversion/collaboration/embedder standards as canonical editor ASTs and reaffirmed explicit adapters. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Slate #4378 accepted as provenance; UNIST-native Plate rejected; no open research finding remains. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | 14 exact Slate threads, 100 discussions, full history, four new clean clones, and official specs/docs read. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: research artifacts only; no runtime/API implementation. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Filled below and in shard 002. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: analytical Markdown/TSV only; TSV schema and placeholder audit pass. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One tag-fetch output was oversized; recorded below, then all discovery switched to capped exact queries and artifacted rows. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-document-standard-proposals-research.md` | Exact command passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prior artifact and explicit follow-up scope recorded. | Slate history discovery |
| Current-state map | complete | Existing Plate verdict and uncertainty are explicit. | Slate history discovery |
| Slate history discovery | complete | 7 query families, 12 issues, 2 PRs, 100 discussions, full git history/tags. | standards taxonomy |
| Options and recommendation | complete | 17 candidate families classified; #4378 identified. | review |
| Review / pressure pass | complete | Prior Plate boundary reaffirmed; no new API packet. | implementation decision |
| Implementation or plan artifact | complete | Shard 002 and all shared ledgers/README updated; no code implementation. | verification |
| Verification | complete | TSV columns, placeholders, clone cleanliness, commit receipts, and counts pass. | closeout |
| Closeout | complete | Handoff, caveats, exact likely memories, and next owner recorded. | final response |

Findings:
- Slate #4378 exactly proposed modifying Text for Universal Syntax Tree
  compatibility: `{ text }` to `{ type: "text", value }`. It remains open and
  unlanded.
- The proposal's own discussion corrected its “only incompatibility” premise:
  UNIST requires `type` on every node, and a configurable text key would reach
  every helper or create hidden editor policy.
- Slate #1486 explicitly considered MDAST-style nested mark nodes and retained
  self-contained split leaves because marks are unordered while inlines own
  structural identity.
- Slate #3482 documented a real native Portable Text experiment. Marks worked;
  void/inline selection invariants and required children did not.
- Slate #1024 proposed MIME/content-type fragment identity; Plate's app schema
  ID/version/fingerprint is a stronger completed version of that useful idea.
- Slate #1959 proposed a compact versioned `slt1` JSON format; core rejected it
  in favor of readable direct JSON for querying, rendering, and migrations.
- Slate #3272 proposed core migrations; maintainers assigned versions and
  migrations to the application/domain, matching Plate's current owner.
- Block Protocol is the exact “universal block protocol” name, but its Hook RFC
  explicitly lets hosts keep bespoke rich-text data and often exposes only a
  string to blocks.
- Among discovered repositories, Portable Text remains the only material open
  rich-text JSON specification. ADF, Contentful, Mobiledoc, Draft, ProseMirror,
  Delta, MyST, and Pandoc are vendor, editor, historical, or conversion formats.
- No standard combines syntax-tree utilities, arbitrary rich editor grammar,
  block embedding, and collaboration.

Decisions and tradeoffs:
- Accept the user's Slate memory as correct and name #4378 first; also name
  #1486 and #3482 because they are easy to conflate.
- Do not make Plate UNIST-native. Every text leaf would gain a discriminator
  and rename its core value while MDAST still requires a structural mark/format
  conversion.
- Do not add configurable `textKey` or generic `toUnist`. UNIST has no content
  vocabulary, so a generic conversion cannot state a truthful result.
- Keep MDAST as the explicit Markdown boundary; add other adapters only for
  real product jobs.
- Keep document-level schema identity/migrations. This incorporates the useful
  part of Slate #1024/#3272 without tying lineage to Slate/npm versions.
- Keep Block Protocol outside AST design. It may inform embeddable registry UI,
  not persisted node types.

Implementation notes:
- N/A: no product code changed. Research README, shared ledgers, and shard 002
  were updated.

Review fixes:
- Corrected the provisional “maybe Block Protocol rather than Slate” verdict:
  Slate #4378 is the exact proposal; Block Protocol is a separate likely phrase
  memory.
- Expanded “no standard” into a category-specific statement: real standards
  exist, but none owns all live-editor AST jobs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full Slate tag fetch streamed oversized tag output | 1 | Stop broad output and use capped git-log/source slices. | Full history was fetched; all subsequent reads were bounded and artifacted. |
| `gh search issues --state all` is invalid | 1 batch | Omit the state filter and use REST search for exact queries. | Seven query families and exact threads were retrieved. |
| GitHub GraphQL intermittently returned 503 | 3 | Retry once, then use REST API, web search, and local full history. | Exact issues/PRs and 100 of 155 discussions were obtained without weakening evidence. |
| `git log --all-match=false` is unsupported | 1 | Use multiple `--grep` terms without all-match. | Capped full-history results retrieved. |

Verification evidence:
- Shard: `docs/plite/research/2026-08-17-editor-node-model-standards/shards/002-standards-proposals.md` -> complete Slate provenance and 17-family taxonomy.
- Slate evidence -> issues #4378, #1486, #3482, #5253, #1024, #1959, #3272, #3273, #269 and related threads; PRs #3093/#3291; full history/tags; 100 discussions.
- New clean clones -> Block Protocol `7acf45e`, Mobiledoc `62d8fcb`, Contentful Rich Text `36f9d2a`, OT rich-text `b53cd97`; final HEAD/cleanliness reverified.
- Shared research ledgers -> 14 repositories, 9 query rows, 20 leads, 43 source reads, 15 rejected rows, 7 promotion/no-code rows; zero malformed TSV rows.
- Placeholder audit -> shard 002 contains zero unresolved markers.
- Current Plate verdict -> reaffirmed with zero new product API promotions.

Final handoff contract:
- Recommendation: identify Slate #4378 as the remembered UNIST proposal, but
  reject it for Plate; retain the Plate-native AST and explicit MDAST/vendor
  adapters. Treat Block Protocol as component interoperability, not node schema.
- Confidence: high.
- Evidence: 17 candidate families, full Slate history, 14 exact Slate threads,
  100 discussions, four new clean clones, official specifications/docs.
- Tests / commands: GitHub REST/GraphQL/web searches, full git history, source
  reads, TSV validator, placeholder audit, and final goal checker.
- Browser proof: N/A: research only.
- PR / tracker: N/A: no code or public tracker mutation.
- Caveats: #4378 remains open, so Slate could revisit it; Block Protocol 0.4 is
  still a draft. Neither changes current shipped contracts.
- Next owner: none for research. User may still accept/reject the earlier three
  P1 Plate schema packets.

Timeline:
- 2026-08-17T14:56:52.292Z Major-task goal plan created.
- 2026-08-17 Full Slate history fetched; issue/PR/discussion/code searches completed.
- 2026-08-17 Slate #4378 identified as exact UNIST proposal; #1486/#3482 identified as MDAST/Portable Text relatives.
- 2026-08-17 Block Protocol, Mobiledoc, Contentful, and OT rich-text cloned and read; 17-family taxonomy completed.
- 2026-08-17 Shared research README/ledgers and shard 002 updated; TSV/provenance/placeholder checks passed.
- 2026-08-17 Goal-plan mechanical completion check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final answer naming the exact proposal and standard taxonomy |
| What is the goal? | Find the missing universal editor/block proposal and test whether it changes Plate's AST decision. |
| What have I learned? | Slate #4378 is real; Block Protocol is real; neither is a universal rich-editor AST standard. |
| What have I done? | Searched full Slate history/GitHub and classified 17 standards/proposal families with verified sources. |

Open risks:
- Slate #4378 is still open and could receive a future PR, but no implementation
  exists in current Slate source.
- Block Protocol is a draft and may expand, but its current rich-text policy is
  explicit host ownership rather than a canonical AST.
- The taxonomy proves no material maintained candidate was missed in the named
  search surfaces; it cannot prove no private or obscure proposal exists.
