# Node identity architecture audit

Objective:
Produce one source-backed final architecture plan for Plate and Plite node
identity, persistence, retrieval, path semantics, and migration without changing
product source.

Completion threshold:
The audit is complete when current Plate/Plite source and clean local Lexical,
ProseMirror, and Wordgard references are mapped symmetrically; every strict
concept matrix passes; one final API and owner split is chosen; rejected
alternatives, migration order, proof gates, and residual risks are explicit;
the audit registry and validation receipt are current; and the autogoal checker
passes.

Verification surface:
Current source owners and consumers in Plite, Plite React, Core, selection, DnD,
toggle, AI, media, table, Markdown, and TOC; clean local reference source and
tests; three strict seven-row concept matrices; JSON/artifact-link validation;
scoped formatting; and autogoal plan validation.

Constraints:

- Planning and audit artifacts only. Do not edit `packages/**`, `apps/**`,
  `content/**`, templates, package exports, or release files.
- Current source is authoritative. Prior plans and answers are leads.
- Separate fact, inference, and recommendation.
- Prefer the smallest public API with one owner per identity law.
- Device testing stays deferred because this decision has no device-specific
  behavior.

Boundaries:

- Workspace: `/Users/zbeyens/git/plate-2`.
- References: clean local `../lexical`, `../prosemirror` plus its model, state,
  transform, and view repositories, and `../wordgard`.
- Scope: runtime node identity, structural locations, anchors, persisted element
  identity, lookup, lifecycle, collaboration, schema typing, and migration.
- Non-goals: implementing the plan, changing unrelated schema/plugin APIs,
  ranking editors overall, publishing packages, opening a PR, or running
  browser/device tests.
- Final recommendation:
  `docs/plans/artifacts/node-identity-architecture-audit/final-recommendation.md`.

Blocked condition:
The audit would be blocked only by dirty or unavailable reference source, a
current owner that could not distinguish runtime from persisted identity, or a
strict matrix that could not close without unsupported claims. None occurred.

Goal plan:
`docs/plans/2026-08-07-node-identity-architecture-audit.md`

Primary template:
`docs/plans/templates/major-task.md`

Applied packs:

- docs
- package-api

Major source:

- type: user architecture request plus current repository source
- title: final node identity architecture audit
- decision: assign runtime identity, live locations, and durable identity to
  their truthful owners and choose the final call shape
- highest-risk mistake: making one serialized ID stand in for runtime identity,
  positions, text anchors, and external entity identity

Timed checkpoint:

- requested duration: N/A
- initial confidence: 0.65
- final confidence: 0.96
- closure: current owner/caller/test inventory, three reference comparisons,
  best-api pressure pass, provenance recheck, and strict validation completed

Current verdict:

- Keep mandatory non-serialized Plite runtime IDs on every descendant, including
  text.
- Keep paths and anchors for structure and text mapping.
- Remove persisted IDs from Core defaults.
- Replace `NodeIdPlugin` with explicit `ElementIdPlugin`, covering blocks and
  inline elements, never text.
- Move copy/regeneration and generated construction typing into generic schema
  lifecycle instead of retaining plugin-local cloning and scans.
- Migrate session consumers to branded `RuntimeId`; durable consumers explicitly
  install the element-ID capability.

Goal status:
complete

Start Gates:

| Gate                           | Applies | Evidence                                                                                                                                   |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Prompt requirements captured   | yes     | Scope, no-source-change boundary, final plan, proof, stop condition, and device-test deferral are recorded above.                          |
| Skills loaded                  | yes     | `editor-audit`, `best-api`, `autogoal`, and `major-task` were read before durable work.                                                    |
| Existing repo patterns checked | yes     | Current Plite runtime/index/anchor owners, Plate schema doctrine, NodeId implementation, and direct consumers are in the source inventory. |
| External source decision       | yes     | Local clean reference clones were sufficient; web research was unnecessary.                                                                |
| Workspace authority            | yes     | Plate repo owns artifacts; each adjacent reference owns its cited source and commit.                                                       |
| Implementation expectation     | yes     | Planning only; no product source change.                                                                                                   |
| Output budget                  | yes     | Exact symbol/range reads and durable inventories replaced broad output; one accidental broad result is recorded below.                     |
| Docs pack                      | yes     | Internal plan/audit artifacts use current-state technical prose and exact source links.                                                    |
| Package/API pack               | yes     | The final artifact names the hard cut, owners, migration, proof, and release work for later implementation.                                |

Work Checklist:

- [x] Every explicit requirement, scope boundary, non-goal, stop condition,
      deliverable, proof surface, and final handoff is recorded.
- [x] Current Plite runtime ID, snapshot index, stale-node target, path, anchor,
      schema, text-merge, and DOM contracts are mapped.
- [x] Current Core NodeId schema, lifecycle, defaults, options, scans, aliases,
      and consumers are mapped.
- [x] Lexical, ProseMirror, and Wordgard provenance and relevant source/tests are
      recorded from clean current checkouts.
- [x] One manifest and strict concept matrix per logical reference covers the
      symmetric union of relevant reference, Plite, Plate, and shared concepts.
- [x] Prior Wordgard candidates and prior test/issue harvest cursors are
      reconciled rather than silently inherited.
- [x] Facts, inference, and recommendations are separated.
- [x] Ideal call sites were designed before migration mechanics.
- [x] Best-api pressure checked naming, ownership, alternatives, configuration,
      inference depth, runtime cost, collaboration, and copied-registry needs.
- [x] The final plan names one API, one lifecycle, one generator option, exact
      hard cuts, rejected alternatives, ordered owners, blast radius, and proof.
- [x] Named APIs and reference claims are backed by current source or explicitly
      marked as proposed.
- [x] Audit registry and validation receipt are included.
- [x] No product source, package export, generated registry, or template file was
      changed.
- [x] Browser, package tests, changesets, barrels, and device testing are marked
      N/A for this planning-only change.
- [x] All review findings are resolved or rejected with evidence.

Completion Gates:

| Gate                              | Applies | Required action                                                                          | Evidence                                                                                                      |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Current-state source audit        | yes     | Map owners, callers, tests, and gaps.                                                    | `source-inventory.md` records the complete bounded map.                                                       |
| Decision criteria closure         | yes     | Resolve correctness, lookup, persistence, collisions, node kinds, typing, and migration. | `final-recommendation.md` fixes one law for each criterion.                                                   |
| Options and rejection record      | yes     | Compare viable alternatives.                                                             | Final recommendation rejects ten concrete alternatives.                                                       |
| Editor-audit matrices             | yes     | Validate all concepts.                                                                   | Lexical, ProseMirror, and Wordgard matrices each pass 7/7 with zero unresolved cells.                         |
| Best-api pressure pass            | yes     | Minimize public shape and remove duplicate jobs.                                         | One runtime namespace, one optional plugin, one generator option, and generic schema lifecycle were selected. |
| Reference provenance              | yes     | Recheck branch, upstream, commit, and clean tree.                                        | Seven recorded checkouts were clean at their registry commits.                                                |
| Implementation gates              | no      | Do not modify product code.                                                              | N/A: planning-only artifact scope was preserved.                                                              |
| Browser proof                     | no      | Verify a runnable UI only when product surfaces change.                                  | N/A: no runtime or UI changed.                                                                                |
| Package typecheck/test            | no      | Run owners only when package source changes.                                             | N/A: no package source changed.                                                                               |
| Changesets and registry changelog | no      | Add release artifacts for implemented user-visible changes.                              | N/A: no package or registry behavior changed.                                                                 |
| Barrels and generated API output  | no      | Regenerate when exports change.                                                          | N/A: exports did not change.                                                                                  |
| Docs parser                       | no      | Build MDX when `content/**` changes.                                                     | N/A: no MDX/content file changed.                                                                             |
| Scoped formatting                 | yes     | Check changed audit artifacts.                                                           | Prettier scoped check is recorded in Verification evidence.                                                   |
| Audit registry                    | yes     | Validate JSON and every linked artifact.                                                 | Registry JSON parses and all new links exist.                                                                 |
| Goal checker                      | yes     | Run the autogoal completeness checker.                                                   | Final successful command is recorded in Verification evidence.                                                |

Phase / pass table:

| Phase                      | Status    | Evidence                                                                                                  | Next                 |
| -------------------------- | --------- | --------------------------------------------------------------------------------------------------------- | -------------------- |
| Intake and source read     | completed | Requirements, skills, boundaries, and owner scope captured.                                               | Current-state map    |
| Current-state map          | completed | Source inventory and consumer classification written.                                                     | Reference comparison |
| Reference comparison       | completed | Three seven-row symmetric matrices written and validated.                                                 | API pressure         |
| Options and recommendation | completed | Final recommendation fixes one public shape and hard-cut list.                                            | Verification         |
| Review / pressure pass     | completed | Cross-editor scope, text merge law, schema lifecycle, generated typing, and key override were reconciled. | Verification         |
| Verification               | completed | Provenance, matrices, JSON, links, formatting, and plan checker passed.                                   | Closeout             |
| Closeout                   | completed | Registry, receipt, final owner handoff, confidence, and risks recorded.                                   | User acceptance      |

Findings:

Facts:

- Plite already assigns weakly owned runtime IDs to every descendant and maps
  them through immutable changes with a lazy bidirectional index.
- Plite already keeps paths, points, ranges, and anchors distinct from runtime
  IDs.
- Text leaf properties participate in merge equality, so a unique persisted ID
  would prevent valid text merges.
- Core installs NodeId by default, persists `id`, exposes seven policy knobs,
  scans duplicates, supports a hidden `_id`, and claims a required `IdElement`
  shape that its tests disprove.
- Most current `element.id` consumers need only session identity. Markdown and
  TOC are durable exceptions.
- Lexical keeps mandatory runtime keys out of JSON/Yjs. ProseMirror and Wordgard
  use mapped positions and leave durable IDs to schema/application data.

Inferences:

- Default NodeId duplicates Plite identity for most consumers and charges every
  document for an optional application concern.
- Persisted ID copy, split, type-change, and generated-value behavior expose
  missing generic schema lifecycle, not a reason for a 936-line special plugin.
- Runtime IDs may be direct generic targets if they remain branded and
  editor-scoped, just like paths.

Recommendations:

- Adopt the final identity law and API in `final-recommendation.md`.
- Execute the Plite schema/runtime packet before the Plate plugin/consumer hard
  cut.
- Keep collaborative legacy migration authoritative and one-time.

Decisions and tradeoffs:

- Runtime allocator: keep editor-scoped prefix plus counter. UUIDs are wasted on
  private IDs; realm-global allocation adds coupling without a persistence law.
- Persisted allocator: default full-length Nano ID, configurable to UUIDv7 or
  another string generator.
- Element coverage: all elements by default, including inline; never text.
- Structural access: paths remain; IDs do not encode order, offsets, or ranges.
- Type inference: generated properties are optional in construction input and
  required in canonical output without carrying full grammar through routine
  editor capabilities.
- Package boundary: keep one explicit plugin in Core; reject a new tiny package.
- Compatibility: hard cut, no aliases. Existing persisted documents install the
  replacement plugin and migrate once; no IDs are silently stripped.

Review fixes:

- Rejected serializing Plite runtime IDs after checking Lexical Yjs exclusion
  and current Plite weak storage.
- Rejected persisted text IDs after checking Plite and Wordgard merge laws.
- Kept runtime IDs editor-scoped after checking current root isolation and DOM
  binding; cross-editor DnD must carry the owner.
- Replaced plugin-local copy/paste switches with one schema `copy` policy.
- Added generated construction semantics so generic insert inference does not
  require callers to supply IDs.
- Added closed application key override because semantic property handles must
  survive a physical `id` to `blockId` mapping.
- Kept persisted lookup plugin-scoped; raw application strings do not become
  generic node targets.

Error attempts:

| Error / failed attempt                                                                                              | Count | Different move                                                                                | Resolution                                                                        |
| ------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| One broad runtime-ID search exceeded the intended output cap.                                                       | 1     | Returned to exact owners, symbols, and bounded ranges.                                        | Durable inventory contains the useful evidence; no further broad stream was used. |
| First strict matrix validation found uncited qualitative cells and invalid reference preference on absent concepts. | 1     | Added cell-local citations and changed absent-reference performance rows to honest tradeoffs. | All three strict matrices pass with zero unresolved cells.                        |
| Initial ProseMirror provenance notes named nonexistent module commits from an earlier working note.                 | 1     | Re-read every nested repository head, branch, upstream, and cited source range.               | Inventory and registry use the actual clean current module commits.               |
| A zsh loop treated a repository-plus-commit pair as one path.                                                       | 1     | Re-ran with an explicit two-argument function.                                                | Provenance was read correctly; no repository was changed.                         |

Verification evidence:

- `node .agents/rules/editor-audit/scripts/validate-concept-matrix.mjs --manifest .../lexical-concept-manifest.json --ledger .../lexical-concept-matrix.md`: 7 concepts, 7 rows, 0 unresolved cells.
- Equivalent strict validators for ProseMirror and Wordgard: 7 concepts, 7 rows, 0 unresolved cells each; three prior Wordgard candidates reaffirmed.
- Reference recheck: Lexical, ProseMirror wrapper, model, state, transform, view,
  and Wordgard all matched the exact registry commits and had clean trees.
- `node -e` JSON parse and artifact-link checks passed for the audit registry,
  manifests, artifact, matrices, inventory, recommendation, and receipt.
- Scoped Prettier check passed for every changed audit artifact.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-07-node-identity-architecture-audit.md` passed.
- Browser, package tests, typecheck, changesets, barrels, API generation, and
  device tests: N/A because no product, package, app, content, or export source
  changed.

Final handoff contract:

- Recommendation: mandatory private runtime identity in Plite; explicit durable
  element identity in Plate; paths/anchors retain structural and text jobs.
- Exact API and migration: `final-recommendation.md`.
- Confidence: 0.96.
- Evidence: source inventory, three strict matrices, current provenance, audit
  registry, and validation receipt.
- Caveat: generated property construction and physical key override are accepted
  plan targets, not current APIs.
- Primary next owner: `plite-plan` for RuntimeId/schema lifecycle.
- Dependent next owner: `plate-plan` for ElementId hard cut, consumers, docs, and
  release adoption.
- Stop condition: await user acceptance; do not implement from this audit turn.

Timeline:

- 2026-08-07: goal created; prompt and planning-only boundary captured.
- 2026-08-07: current Plite/Plate owners and consumers mapped.
- 2026-08-07: Lexical, ProseMirror, and Wordgard matrices validated.
- 2026-08-07: best-api pressure changed the proposal from universal persisted
  IDs to the final runtime/location/durable split.
- 2026-08-07: provenance repaired, registry and receipt written, verification
  closed.

Reboot status:

| Question          | Answer                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Where am I?       | Audit closeout complete.                                                                                         |
| Where am I going? | User acceptance, then ordered `plite-plan` and `plate-plan` implementation.                                      |
| What is the goal? | One final source-backed node identity architecture without product changes.                                      |
| What did I learn? | Plite already owns the right runtime architecture; default persisted IDs are the wrong Core policy.              |
| What did I do?    | Mapped owners, validated three reference matrices, chose the final API, and wrote the executable migration plan. |

Open risks:

- Generated property callbacks need a narrow schema fingerprint law: record that
  generation exists, not callback source or nondeterministic output.
- The durable ID index needs explicit behavior under undo, redo, named roots,
  schema reconfiguration, and collaboration.
- A closed schema key override is breaking schema work and must ship with
  migration proof.
- Applications that persist numeric IDs need an explicit conversion policy.
- Implementation scope is broad despite the small final API; packets must land
  in order and keep the no-alias hard cut.
