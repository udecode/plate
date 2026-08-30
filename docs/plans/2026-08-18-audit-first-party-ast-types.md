# Audit first-party AST types

Objective:
Audit every first-party persisted AST type; done when all canonical
elements/properties have source-backed keep/change verdicts and every P0-P3
finding names its owner and next step.

Goal plan:
docs/plans/2026-08-18-audit-first-party-ast-types.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user prompt plus current generated schema and accepted research
- id / link: `apps/www/src/registry/components/editor/plugins.schema.json` and
  `docs/plite/research/2026-08-17-editor-node-model-standards/README.md`
- title: harsh honest review of all first-party persisted AST types
- decision to make: whether the final v54 node/property vocabulary and content
  shapes are genuinely good enough, and which remaining debts are P0-P3.
- decision criteria: truthful semantics, one owner per field, web/editor
  precedent where material, schema/runtime coherence, Markdown boundary fit,
  migration safety, and zero unreviewed canonical element/property families.

Major lane:
- lane: architecture or public API, analytical audit
- output type: ranked Best API findings plus full coverage accounting
- implementation expected: no; this turn is review-only
- affected packages / surfaces: canonical generated editor schema, first-party
  feature schemas, frozen v53→v54 manifest/migration, document-model docs, and
  accepted node-model research.
- dominant risk: calling the profile “all good” after inspecting only the
  recently renamed list/media fields while structural or property debt remains.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; no timed checkpoint requested
- initial confidence score: N/A; exact row coverage replaces a subjective score
- improvement loop: enumerate, classify, pressure-test, source-verify
- final score / loop closure: complete only when reviewed counts equal expected

Completion threshold:
- Every canonical generated element type and property definition is included
  in a compact manifest and assigned to one reviewed semantic family.
- Every frozen v53 first-party migration identity is reconciled with the final
  generated profile or explicitly classified as historical/not installed.
- Every semantic family receives `keep`, `change`, or `defer` plus P0-P3
  severity, source evidence, owner, and next step.
- The final answer leads with the real verdict and the full reviewed/expected
  counts; it does not imply implementation.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-audit-first-party-ast-types.md`
  passes.

Verification surface:
- Compact extraction from the generated schema (`elements.byType`,
  `properties.definitions`, groups/content programs), source reads of every
  flagged owner, v53 manifest counts, accepted research matrix, and final count
  reconciliation.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Harsh honest feedback: no neutral catalogue and no migration-cost veto.
- Current source outranks the older memory recommendation and research rows.

Boundaries:
- Source of truth: current generated schema, owning package schemas/codecs,
  v53 manifest/migration, current document-model docs, accepted local research.
- Allowed edit scope: this goal plan only; product code/docs stay read-only.
- External sources: local editor clones and standards already captured in the
  accepted research; refresh only if a decision-critical name lacks evidence.
- Browser surface: N/A; persisted type/grammar audit, not visible behavior.
- Tracker sync: N/A; no tracker source.
- Non-goals: React/component props, internal compiler helper types, app-only
  transient fields, legacy-list-model maintenance, implementation, commit, push, PR.

Output budget strategy:
- Parse the generated JSON into counts and compact TSV-like rows; never print
  the full schema again. Use targeted source reads for flagged families only,
  exclude generated release output/build artifacts, and cap every search.

Blocked condition:
- Block only if canonical schema output cannot be parsed or a persisted field
  has no resolvable owner after three distinct source searches.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: accepted findings route to Best API repair and Plate Plan
- goal_status: complete

Current verdict:
- verdict: not all good; core ontology wins, but one P0, seven P1, and two P2
  debts remain.
- confidence: high; every bounded element/property row reconciled.
- next owner: `best-api -> plate-plan` for the P0 persistence/live-schema split,
  then feature owners for dependent P1/P2 rows.
- reason: 35 modern element types and 101 direct property declarations were
  reviewed; current generated persistence types still expose transient/editor-
  only state and several feature contracts remain untruthful or under-validated.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-audit-first-party-ast-types.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Review all first-party persisted types; harsh verdict; no implementation implied |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read |
| Active goal checked or created | yes | Active goal names this exact plan and full coverage threshold |
| Source of truth read before analysis | yes | Current generated schema shape, VISION, Best API doctrine, accepted research, and memory history read |
| Major lane selected | yes | Analytical architecture/public API audit |
| Decision criteria stated | yes | Semantics, ownership, coherence, interchange, migration, and complete row coverage above |
| Existing repo patterns / prior decisions checked | yes | Current node-model research and historical MDAST recommendation checked; current source wins |
| Helper stack selected | yes | `best-api`, `major-task`, `autogoal`; existing research consumed without rerunning editor-audit |
| External research decision recorded | yes | Local clones/research sufficient unless a flagged field lacks decision evidence |
| Implementation expectation recorded | yes | Review-only; no product changes |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout and generated editor schema |
| Branch / PR expectation decided | no | N/A: analytical only; no git delivery |
| Output budget strategy recorded | yes | Compact parse/count first, targeted owner reads second |
| Package/API pack selected | yes | Persisted schema and public generated types are the audit surface |
| Public surface or package boundary identified | yes | First-party Plate feature schemas plus central generated application grammar |
| Release artifact path selected | no | N/A: read-only audit, no published delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package changes |
| Barrel/export impact decision recorded | no | N/A: no source/export changes |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested; exact
      row coverage is the completion metric.
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
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: analytical only;
      package/API pack records the audited public boundary.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is N/A because this is a read-only audit.
- [x] Package/API pack: changeset work is N/A because no package changed.
- [x] Package/API pack: registry changelog is N/A because no registry source changed.
- [x] Package/API pack: no artifact is needed because the diff is plan-only analytical evidence.
- [x] Package/API pack: proposed breaks are explicit recommendations, not implemented compatibility changes.
- [x] Package/API pack: package checks are N/A because product code did not change; source/generated-schema audits own proof.
- [x] Package/API pack: barrels and release notes are N/A because exports and packages did not change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 35 modern elements, 101 direct property declarations, and 60 v53 identities reconciled; zero unreviewed families |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Generated grammar, optional owners, v53 manifest, docs, research, and every flagged package owner mapped |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Every family has keep/change/exclude verdict; 1 P0, 7 P1, 2 P2 findings ranked |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Keep list and rejection rationale recorded in Findings and Decisions |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Best API pressure pass compared generated schema, owning code, accepted research, and contradiction searches |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | N/A: analytical findings are recommendations; no fixes authorized |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Accepted local editor-node-model research consumed; no new external claim required |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: product code/docs unchanged; plan-only audit |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Final root lint covers the plan artifact |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One generated-schema read was too broad; subsequent work used compact parsers and capped owner reads |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-audit-first-party-ast-types.md` | Final mechanical checker is last gate |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Generated exact Editor/Value plus feature schemas and optional first-party owners audited |
| Release artifact classification | no | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | N/A: read-only audit; no published delta |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no package changes |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry changes |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Plan-only analytical audit; no release artifact |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: no product/package code changed; generated/source audits are the evidence |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported files or layout changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt, current schema, Vision, research, and memory read | current-state map |
| Current-state map | complete | Full count reconciliation and family manifest | options |
| Options and recommendation | complete | Keep/change/exclude and P0-P2 rows recorded | review |
| Review / pressure pass | complete | Contradiction scans and owner reads verified every finding | implementation decision |
| Implementation or plan artifact | complete | Analytical plan artifact only; no implementation authorized | verification |
| Verification | complete | Expected/reviewed counts reconcile; evidence below | closeout |
| Closeout | complete | Handoff prepared | final response |

Findings:
- Generated canonical application grammar: 32 element types and 96 property
  declarations (75 element, 21 text; 66 unique persisted keys/prefixes).
- Optional modern first-party owners outside that app grammar: `codeDrawing`,
  `excalidraw`, and `tag`, with 5 direct property declarations.
- Frozen v53 profile: all 60 identities classified; 27 legacy element mappings
  reconciled. Six legacy-list-model structural types are explicitly excluded by
  maintenance policy.
- The core Plate-native model is sound, but the generated `Value` mixes durable
  content with edit-only/transient nodes and flags. It is not a clean persisted
  document profile yet.

Coverage manifest:
| Family | Reviewed types / properties | Verdict |
|---|---:|---|
| Core tree and paragraph/root grammar | `Text`, `Element`, `paragraph`, root | keep |
| Structural containers | `blockquote`, `codeBlock`, `codeLine`, `column`, `columnGroup`, `footnoteDefinition`, `table`, `tableRow`, `tableCell` | keep with column cleanup and requiredness/validation fixes |
| Text blocks | `aiChat`, `audio`, `callout`, `file`, `heading`, `image`, `mediaEmbed`, `toggle`, `video` | keep durable owners; split `aiChat`; narrow Media fields |
| Block voids | `equation`, `horizontalRule`, `placeholder`, `toc` | keep durable owners; split `placeholder`; rename math value |
| Inline elements | `date`, `emojiInput`, `footnoteInput`, `footnoteReference`, `inlineEquation`, `link`, `mention`, `mentionInput`, `slashInput` | keep durable owners; split input nodes; repair date/mention/footnote contracts |
| Text marks and annotations | 21 generated text property declarations | keep semantic marks; cut transient decoration/workflow flags from persistence |
| Cross-cutting block properties | list, indent, alignment, line height, AI/suggestion | list/alignment keep; add domain validators; split transient AI/suggestion state |
| Optional modern owners | `codeDrawing`, `excalidraw`, `tag`; 5 properties | keep Excalidraw/Tag; flatten and rename Code Drawing |
| Historical/classic | 60 v53 identities; 6 legacy-list-model structural types excluded | migration coverage complete; classic outside new API investment |

Best API findings:
| Priority | Surface | Current friction | Best direction | Delete / hide | Owner | Proof |
|---|---|---|---|---|---|---|
| P0 | Persisted profile boundary | Generated `Value` includes edit-only `emojiInput`, `footnoteInput`, `mentionInput`, `slashInput`, upload `placeholder`, streaming `aiChat`, plus `aiPreview`, `ai`, `codeSyntax`, `commentTransient`, and `suggestionTransient` | Generate distinct live-editor and persisted-document contracts; persistence excludes edit-only nodes and transient decoration/workflow fields | Hide transient nodes/fields from persisted `DocumentValue`, codecs, fingerprints, and migrations | Core schema compiler plus owning AI/Combobox/Media/Suggestion/Comment/Code Block packages | Generated schema contains all rows; owners mark several `editOnly` or transient and V53 calls `code_syntax` transient |
| P1 | Date element | Two optional fields allow `{}`, invalid canonical `date`, or both `date` and `rawDate` | One required `value` with validator/fallback law; invalid external syntax falls back outside the canonical Date node | Delete `date`/`rawDate` dual state | Date | `BaseDatePlugin` schema and `normalizeDateValue` |
| P1 | Mention identity | Persisted external identity is named `key`, violating runtime `NodeKey`/persisted `id` law | Rename `key` to `id`; keep one required display `value` or rename it to `label` only if callers gain clarity | Delete persisted mention `key` | Mention | HTML/Markdown codecs use it as mention identity, not live node identity |
| P1 | Footnote identity | Reference and definition `identifier` are optional although their semantic identity is mandatory | Make `identifier` required on both nodes; construction and decode must fail/fallback without one | Delete empty-string encoder fallbacks | Footnote | Both schema declarations use optional `property.string()` while MDAST codecs require identity |
| P1 | Column layout ownership | `columnGroup.layout` is schema-owned but has zero production consumers; child `column.width` is the real source | Delete `layout`; keep widths solely on child columns or deliberately move all width ownership to the group, not both | Delete dead `layout` | Layout | Source search finds declaration/test only; all operations and renderers use `column.width` |
| P1 | Media field targets | Shared `name` is allowed on Image and Media Embed although both HTML codecs reject any node with `name` | Target `name` only to File/Audio/Video owners that serialize it | Remove `name` from Image/Media Embed schemas and insert inputs | Media | `mediaElementProperties` supplies `name`; Image and Media Embed encoders return `null` when present |
| P1 | Code Drawing data model | One opaque `data` bag hides three stable domain fields and persists PascalCase enum values | Flat `code`, lowercase `language` (`mermaid`, `graphviz`, `plantuml`, `flowchart`), and lowercase `view` (`split`, `code`, `preview`) | Delete `data`, `drawingType`, `drawingMode`, and PascalCase persisted values | Code Drawing | Validated schema shows stable independently meaningful fields, unlike Excalidraw’s true vendor payload |
| P1 | Public document-model docs | “First-Party Profile” documents 8 element shapes while the modern audited profile has 35 | Either publish the complete generated profile or label the page explicitly representative and link the generated contract | Remove false completeness | Docs | `document-model.mdx` type list versus reconciled manifest |
| P2 | Domain-constrained numbers/strings | Finite primitives still admit fractional list starts/indent, non-positive natural sizes/spans/heights, and arbitrary text-align strings | Add validated integer/positive/enum property descriptors where domain law is closed; keep CSS-extensible strings open | Replace raw primitive descriptors only for closed domains | List, Indent, Media, Table, Basic Styles | Current schema uses primitive `number`/`string`; Heading/ListType already prove validator pattern |
| P2 | Equation source field | `texExpression` repeats implementation detail and block/inline construction requiredness differs | Use one `tex` field on both equation nodes with consistent canonical requiredness/default law | Delete `texExpression` | Math | Both codecs map directly to MDAST `value`/KaTeX source |

Decisions and tradeoffs:
- Verdict is not “rewrite everything.” The Plate-native `{ type, children }` /
  `{ text }` ontology, one heading with `level`, `language`, structural tables,
  flat lists, direct media captions, natural image dimensions, text-leaf marks,
  and document-level migration lineage all win.
- P0 persistence/live-schema separation comes before polishing individual
  transient fields. Renaming transient fields while leaving them in the
  persisted contract is lipstick on the wrong ontology.
- Optional vendor payloads such as Excalidraw `data` are honest opaque
  boundaries. Code Drawing is not: its three fields are Plate-owned and stable.
- No implementation is authorized in this review turn. Accepted rows route to
  `best-api`/`plate-plan` in P0→P1 dependency order.

Implementation notes:
- N/A. This was a read-only API audit; no product code or public docs changed.

Review fixes:
- The pressure pass upgraded the persistence/live-schema leak from scattered
  feature-level cleanup to the single P0 owner. That avoids cosmetic field
  renames before the persisted contract boundary exists.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Parsed the current generated canonical schema: 32 installed element types
  and 96 direct property declarations (75 element, 21 text; 66 unique keys or
  prefixes).
- Audited the three modern first-party owners outside that app composition:
  `codeDrawing`, `excalidraw`, and `tag`, adding 3 element types and 5 direct
  property declarations.
- Reconciled 35/35 modern element types and 101/101 direct property
  declarations into the coverage manifest.
- Reconciled 60/60 frozen v53 identities and all 27 legacy element mappings;
  six legacy-list-model structural types remain explicitly outside new API
  investment.
- Re-read each flagged schema, codec, normalizer, and consumer. Targeted scans
  confirmed transient/edit-only leakage, dead column `layout`, Media `name`
  rejection, optional Date/Footnote state, Mention `key` semantics, Equation
  source ownership, and Code Drawing's stable Plate-owned fields.
- Reused the accepted current editor-model research instead of reopening a web
  survey; current source overruled its older heading-name hypothesis.
- Product tests and Browser proof are N/A because product behavior did not
  change. The goal checker and repository lint are the closeout gates.

Final handoff contract:
- Recommendation: keep the core Plate-native ontology; do not call the profile
  final until the P0 persisted/live grammar split lands. Then repair the seven
  P1 contracts and two P2 vocabulary/validator debts in dependency order.
- Confidence: high within the declared first-party persisted-type boundary.
- Evidence: generated schema counts, optional-owner schemas, frozen migration
  manifest, owning codecs/consumers, current Vision, docs, and accepted editor
  standards research.
- Tests / commands: compact schema/count extraction, targeted `rg` ownership
  and contradiction scans, `pnpm lint:fix`, and the autogoal completion checker.
- Browser proof: N/A; this was a type/grammar audit with no runtime or UI edit.
- PR / tracker: N/A; no commit, push, PR, or tracker mutation was requested.
- Caveats: the generated schema is the canonical editor composition, not every
  possible plugin combination. Optional modern first-party owners were added
  explicitly; third-party and legacy-list-model maintenance contracts are excluded.
- Next owner: `best-api` repair, then `plate-plan` for the P0 compiler/profile
  boundary; feature package owners implement accepted P1/P2 rows afterward.

Timeline:
- 2026-08-18T08:59:27.143Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Hand off the ranked findings without implying implementation |
| What is the goal? | Audit every bounded first-party persisted AST type and rank every remaining API debt |
| What have I learned? | The ontology is strong, but the generated `Value` is not a truthful persisted-document type |
| What have I done? | Reconciled 35 modern element types, 101 direct properties, and all 60 v53 identities |

Open risks:
- A different app composition may expose additional optional first-party
  plugin contracts; this audit covers the canonical generated app plus the
  identified modern optional owners, not arbitrary third-party schemas.
- No behavior regression claim is made. This review establishes API/type debt;
  implementation will need migration, codec, type, and corpus proof.
- P1/P2 naming should not land ahead of the P0 persistence boundary when that
  would preserve transient fields in a newly polished contract.
