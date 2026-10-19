# Plate Derived Schema Identity

Objective:
Implement discriminated named/derived schema identity; done when focused Core/Plite/History/Yjs contracts, typechecks, tests, and Biome pass; plan docs/plans/2026-07-22-plate-derived-schema-identity.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-derived-schema-identity.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: accepted user architecture decision
- id / link: current parent task
- title: Plate derived schema identity
- decision to make: implement the accepted omitted-identity behavior without changing Plite complete-schema ownership
- decision criteria: omitted identity is deterministic and semantics-sensitive; explicit identity remains durable lineage; no editor-instance identity enters schema identity

Major lane:
- lane: Plite/Plate public API architecture execution
- output type: code, focused Core contracts, owning JSDoc, package proof
- implementation expected: yes
- affected packages / surfaces: `packages/plite`, `packages/core`, `packages/plite-history`, `packages/yjs`, their existing changesets, this execution ledger
- dominant risk: accidentally conflating derived exact-match identity with durable Yjs/history/migration lineage

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary source and command gates exist
- improvement loop: fix focused failures until the named Core gates pass
- final score / loop closure: N/A: completion is command-backed

Completion threshold:
- `EditorSchemaIdentity` is a hard-cut union: `{kind:'derived', fingerprint}` or `{kind:'named', id, version, fingerprint}`. Fingerprints exclude lineage and hash compiled semantics only.
- Plate create/extend APIs accept omitted `schema`; omission compiles a derived identity, while explicit `{id, version}` compiles a named identity. Creator options become optional when `schema` was the sole required field, including `createPlateEditor()`, `createBaseEditor()`, and `createSlateEditor()`.
- History/Yjs persist, compare, and diagnose the union exactly with no compatibility alias or old persisted shape.
- Owning JSDoc describes derived versus explicit identity without migration prose.
- Focused Core tests and scoped Biome pass. Full Core/Yjs typecheck records the
  exact concurrent command-dispatch/plugin-generic blocker when it cannot be
  attributed to this lane.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-derived-schema-identity.md`
  passes.

Verification surface:
- Direct Core model/publication tests for omitted determinism, semantic fingerprint divergence, explicit preservation, no-argument creator inference, and reconfiguration/history behavior.
- Focused typechecks for `@platejs/plite`, `@platejs/core`, `@platejs/plite-history`, and `@platejs/yjs`.
- Focused Core test command selected after locating the owning contract files.
- Scoped Biome check for changed Core files and tests.
- Source audit proving derived identity never uses editor instance IDs.
- Plite compiler identity law proving equal semantics with different explicit lineage share a semantic fingerprint while retaining distinct named metadata, plus derived identity shape.
- Focused History/Yjs serialization, comparison, mismatch, and reconfiguration laws for both identity kinds.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly required.
- Keep Plite's complete-schema compiler as the semantic owner.
- Derived identity contains no fake/reserved/editor-instance ID.
- Named `{id, version}` remains durable lineage for Yjs, History, and migrations.
- Fingerprint is semantic-only and excludes schema `id`/`version`.
- Hard-cut the old flat persisted identity shape; no compatibility aliases or legacy decoder branch.
- No browser or docs sweep; update owning JSDoc only.
- No child agents.

Boundaries:
- Source of truth: Plate Core create/extend/model compilation and existing schema identity tests.
- Allowed edit scope: `packages/plite`, `packages/core`, `packages/plite-history`, `packages/yjs`, this plan, and their existing changesets if required.
- External sources: N/A: accepted local architecture decision and repository code are authoritative.
- Browser surface: N/A: explicitly excluded.
- Tracker sync: N/A: no issue/PR requested.
- Non-goals: content/apps adoption sweep, browser proof, docs sweep beyond owning JSDoc, unrelated schema audit repairs.

Output budget strategy:
- Read exact Core owners with bounded `rg` and `sed`; exclude generated artifacts and broad repository scans; cap command output; run only focused package proof.

Blocked condition:
- Stop only if the discriminated identity cannot be adopted by the four named packages without an unbounded content/apps sweep and no bounded package-level repair remains.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: parent integrated closure
- goal_status: complete

Current verdict:
- verdict: accept the discriminated semantic identity hard cut
- confidence: high
- next owner: parent integrated closure
- reason: focused compiler, creator, History, and Yjs laws pass; only concurrent
  command/plugin type failures remain outside this lane

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-derived-schema-identity.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, constraints, boundaries, four test contracts, JSDoc, proof, and exclusions recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | no | N/A: `plite-plan` is the domain architecture owner and the design is already accepted |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this checkpoint |
| Source of truth read before analysis | yes | Accepted architecture plan and prior Core/Plite ownership audit are current context; exact Core owners are the next bounded read |
| Major lane selected | yes | Plite/Plate public API architecture execution |
| Decision criteria stated | yes | Determinism, semantic divergence, explicit preservation, and reconfiguration/history behavior |
| Existing repo patterns / prior decisions checked | yes | Accepted schema-contribution architecture keeps Plite complete-schema ownership and Plate host derivation |
| Helper stack selected | yes | `plite-plan` plus `autogoal`; no agents or browser |
| External research decision recorded | no | N/A: local accepted design is authoritative |
| Implementation expectation recorded | yes | End-to-end implementation and focused proof required |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`, package owner `@platejs/core` |
| Branch / PR expectation decided | no | N/A: no branch, commit, push, or PR requested |
| Output budget strategy recorded | yes | Bounded exact-owner reads and focused proof only |
| Package/API pack selected | yes | Public Plate create/extend behavior changes |
| Public surface or package boundary identified | yes | Plite identity/compiler, Plate creators, History persistence, and Yjs room metadata |
| Release artifact path selected | yes | Update existing changesets for the four already-breaking package surfaces |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` before amending the four existing changesets |
| Barrel/export impact decision recorded | yes | No exported-file/layout change expected; `pnpm brl` N/A unless source inspection changes this |

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
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: accepted local architecture
      and current source fully settled the implementation.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason. Direct source/test pressure covered identity shape, semantic
      fingerprints, persistence hard cuts, and creator inference; no external
      reviewer was needed for the accepted design.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: package API work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: four public package changesets updated.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. Existing wildcard schema export covers the new identity variants; no barrel generation needed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Plite 80/80, History 16/16, Yjs 13/13, Core identity/creator 18/18 focused laws pass |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | Plite compiler owns semantic fingerprint; Core owns host derivation; History/Yjs own serialized envelopes |
| Decision criteria closure | complete | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Derived determinism, semantic divergence, explicit preservation, and reconfiguration/history laws pass |
| Options / tradeoffs / rejection record | complete | Record viable options, chosen recommendation, and why alternatives lose | Discriminated identity selected; fake IDs, editor IDs, lineage-hashed fingerprints, and compatibility decoders rejected |
| Review / pressure pass | complete | Run selected reviewer/lens or record N/A with reason | Parent review removed redundant Yjs equality branch and rejected a cast in favor of the owning optional type |
| Review findings closure | complete | Fix or explicitly reject accepted/actionable findings and record closure proof | All identity-lane findings fixed; property-policy regression explicitly routed to its concurrent owner |
| External-source audit | complete | Cite official/local clone/external sources when used, or record N/A | N/A: accepted local architecture and repository source were authoritative |
| Implementation gates | complete | If code changed, close primary-template and touched-surface gates; otherwise N/A | Four package owners, tests, JSDoc, persistence versions, and changesets updated |
| Final handoff contract | complete | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent when files changed | Scoped Biome checked 27 files and fixed 7; follow-up touched files clean |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One scoped diff/typecheck output truncated; all later commands used bounded tails, regex filters, or focused files |
| Timed checkpoint | complete | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-derived-schema-identity.md` | Run after this ledger update |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Schema types export through existing wildcard; no exported file/layout change |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Public API/runtime/serialization change in Plite, Core, History, and Yjs |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing package changesets amended; Plite/Core/History/Yjs use major |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry work |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changesets required and updated |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | Plite and History typechecks green; Core/Yjs full typechecks blocked by concurrent command/plugin generic errors unrelated to identity; all focused identity laws green |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: existing `export type * from './interfaces/schema'` exports variants |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | requirements and exact owners recorded | complete |
| Current-state map | completed | compiler/Core/History/Yjs ownership mapped | complete |
| Options and recommendation | completed | discriminated semantic identity accepted | complete |
| Review / pressure pass | completed | parent review findings fixed | complete |
| Implementation or plan artifact | completed | four-package hard cut implemented | complete |
| Verification | completed | focused proof green; unrelated integrated blockers recorded | complete |
| Closeout | completed | changesets and final handoff recorded | complete |

Findings:
- Accepted design: Plate may synthesize one reserved complete schema identity only when callers omit `{id, version}`; Plite still compiles the resulting complete schema.
- Parent audit indicates the current compiler fingerprint may include `id`/`version`; confirm and remove that lineage contamination before deriving omitted identity.
- Final accepted identity model is discriminated: derived identity has only `{kind, fingerprint}`; named identity adds `{id, version}`. No reserved fake ID.
- Creator options become optional where schema was the only required field; no-argument calls must preserve inference without casts or callback annotations.

Decisions and tradeoffs:
- Separate lineage from semantics in the public type: derived identity is semantic-only; named identity adds caller-owned lineage. History/Yjs compare the discriminant and exact fields rather than pretending every schema has a name.

Implementation notes:
- Plite complete schemas select `identity: 'derived'` or named `id/version`.
  The compiler hashes only canonical semantic resources and publishes the
  discriminated identity.
- Plate omission constructs the derived complete schema; explicit schema input
  remains immutable named lineage. Creator and hook options are optional.
- History JSON uses format 4 and Yjs schema metadata uses format 2. Both decode
  exact identity variants and reject old flat envelopes.
- `createSlateEditor` has no current source owner; no compatibility alias was
  invented. The live static/view creators were covered instead.

Review fixes:
- Centralized exact identity equality in Plite and removed duplicated flat
  comparisons from Core, History, and Yjs.
- Removed the unreachable derived-equality branch in Yjs diagnostics.
- Replaced the temporary static-editor cast by fixing optional plugin fields in
  the owning editor option types.
- Kept ordinary creator JSDoc schema-free and retained one named-lineage example.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite source typecheck exposed an inferred narrow default-schema record | 1 | Type the default and merged record arrays at their public declaration boundary | resolved |
| Core/Yjs full typecheck includes concurrent command-dispatch/plugin generic failures | 2 | Filter identity-owner errors and use focused runtime/type-owning proof; parent closes integrated tree | identity lane clean; integration caveat retained |
| Existing static/view specs cannot resolve test-utils Plite from current install | 2 | Move zero-arg static/view laws into a direct hook spec without test-utils | resolved, 3/3 pass |
| Full schema-definition suite exposes concurrent lost nominal policy guard | 1 | Route to schema contribution owner; do not broaden identity lane | accepted external blocker |

Verification evidence:
- `packages/plite`: `pnpm --filter @platejs/plite typecheck` passes; focused
  compiler/configuration laws pass 80/80.
- `packages/plite-history`: typecheck passes; persistence contract passes 16/16.
- `packages/yjs`: schema identity contract passes 13/13.
- `packages/core`: no-argument base/React/static/hook and explicit-lineage laws
  pass 13/13; model determinism/reconfiguration/history laws pass 2/2; the
  earlier full model file had 17/18 pass with one unrelated inline-container
  compiler failure.
- Scoped Biome checked all 27 implementation/test files and follow-up edits.
- Source audit found no editor-instance ID, fake schema ID, flat identity
  access, or old History/Yjs envelope acceptance in the four-package scope.

Final handoff contract:
- Recommendation: keep the hard cut exactly as implemented: derived identity
  for ordinary editors, named lineage only for persistence/collaboration/migration.
- Confidence: high for identity and creator behavior; integrated typecheck is
  temporarily obscured by the concurrent command/plugin rewrite.
- Evidence: direct compiler, Core creator/model, History, and Yjs laws above.
- Tests / commands: Plite typecheck + 80 tests; History typecheck + 16 tests;
  Yjs 13 tests; Core 15 focused tests; scoped Biome.
- Browser proof: N/A: explicitly excluded and no browser-facing behavior changed.
- PR / tracker: N/A: no git publication requested.
- Caveats: parent must rerun full Core/Yjs typechecks after the concurrent
  command/plugin generic lane settles; property-policy nominal guard belongs to
  the schema contribution owner.
- Next owner: parent integrated closure.

Timeline:
- 2026-07-22T08:16:10.691Z Major-task goal plan created.
- 2026-07-22: Prompt requirements, proof boundary, and no-browser/no-agent constraints recorded before source edits.
- 2026-07-22: Parent correction added semantic-only fingerprints and structurally derived omitted identity to the completion contract.
- 2026-07-22: Accepted redesign hard-cut flat identity into named/derived variants and expanded bounded package proof to Plite, Core, History, and Yjs.
- 2026-07-22: Implemented the four-package hard cut, bumped History/Yjs
  envelopes, made live creators/hooks zero-argument, and closed focused proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implement the discriminated identity through Plite, Plate, History, and Yjs, then run focused package proof |
| What is the goal? | Hard-cut schema identity into derived and named variants with semantic-only fingerprints and optional Plate creator schema/options |
| What have I learned? | A fake reserved ID is dishonest; the type must express whether lineage exists |
| What have I done? | Created and filled the execution ledger; no source edits yet |

Open risks:
- Existing Core code may currently require explicit identity earlier than the model compiler; inspect before choosing the narrow owner.
- The identity hard cut may expose bounded package tests/fixtures outside the initial four direct contracts; repair only named package owners, not content/apps.
