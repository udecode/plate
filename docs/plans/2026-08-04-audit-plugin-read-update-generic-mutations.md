# Audit plugin read update generic mutations

Objective:
Audit all package-authored read/update methods; done when every method and production owner is classified against generic mutations with a source-backed target API.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-04-audit-plugin-read-update-generic-mutations.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user request plus live Plate source
- id / link: current task
- title: audit plugin read/update methods against generic mutations
- decision to make: which authored methods should be deleted, which generic operations need richer domain options or replacement hooks, and which feature methods own real semantics
- decision criteria: complete manifest; every production consumer counted; inferred normal/custom/escape call sites; no schema identity or element generic restatement; runtime semantics preserved

Major lane:
- lane: architecture or public API
- output type: source-backed best-api audit and target call shapes
- implementation expected: no; user requested audit/recommendation, not source edits
- affected packages / surfaces: all `packages/**/src` plugin definitions and their production consumers; Core/Plite generic mutation projection owners
- dominant risk: deleting a method that adds semantic defaults, selection behavior, normalization, dependency coordination, or transaction composition hidden behind a generic-looking verb

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: completion is a counted manifest
- improvement loop: N/A: exhaustive bounded audit replaces a timed loop
- final score / loop closure: N/A: close when manifest and evidence gates pass

Completion threshold:
- Every package plugin-authored `read` and `update` member is enumerated and assigned exactly one decision: replace with generic mutation, keep as distinct semantic operation, internalize, move owner, or defer with a named blocker.
- Every removal candidate and survivor has production-owner evidence; tests/docs/barrels are excluded from owner counts but inspected for public exposure/adoption impact.
- The report resolves the named Callout, Code Drawing, Date, DOCX/TableCell, Indent, and Equation cases and defines inferred common, customization, and escape call sites.
- The report includes expected/reviewed/excluded counts, a P0-P3 table, layer ownership, breaking impact, rejected alternatives, and exact next owner.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-audit-plugin-read-update-generic-mutations.md`
  passes.

Verification surface:
- Counted `rg`/AST-assisted source manifest over `packages/**/src`, public barrels, and production consumers.
- Direct reads of the generic mutation compiler/projection owner and every classified feature owner.
- Focused type/test source inspection where behavior or inference is not evident from implementation.
- Mechanical goal-plan check; no package typecheck/browser proof because no product source changes occur.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not modify `packages/**`, `apps/**`, `content/**`, generated barrels, changesets, or skill doctrine during this audit.
- Preserve genuinely semantic feature operations; genericity does not justify behavioral regression.
- Prefer descriptor-scoped inference over explicit element generics, schema types, or installed checks for required dependencies.

Boundaries:
- Source of truth: current checkout under `/Users/zbeyens/git/plate-2`, root/detail Vision, and current public types/implementations/callers.
- Allowed edit scope: this goal-plan artifact only.
- External sources: N/A unless a narrow unresolved precedent question remains after local source; none expected.
- Browser surface: N/A: API/source audit with no runtime or UI mutation.
- Tracker sync: N/A: no tracker source.
- Non-goals: implementing the cut, compatibility aliases, migration docs, release artifacts, browser/device testing, unrelated plugin colocation.

Output budget strategy:
- Start with file/count-only `rg` queries scoped to `packages/**/src`; save the full manifest under this plan's Findings rather than streaming whole trees; inspect exact owners in bounded slices; exclude dist, node_modules, tests, docs, examples, generated output from production-owner counts.

Blocked condition:
- Stop only if generated or missing source makes a method's runtime semantics or public type contract unresolvable after implementation, tests, callers, and emitted declarations are inspected.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: user decision, then `plate-plan` implementation
- goal_status: active

Current verdict:
- verdict: hard-cut redundant authored element mutations; keep semantic methods; do not add generic reads or aggregate-property mutation magic
- confidence: high
- next owner: `plate-plan` after user accepts the target
- reason: the complete production manifest is classified and the remaining implementation is a public hard cut across Core, packages, registry, docs, tests, and generated contracts

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-audit-plugin-read-update-generic-mutations.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Named cases and full-manifest/output requirements are copied below. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`; architecture/public-API analytical lane selected. |
| Active goal checked or created | yes | Goal created for this exact audit and plan path. |
| Source of truth read before analysis | yes | Read `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and full `best-api`/`autogoal`/`major-task` skills. |
| Major lane selected | yes | Architecture or public API; analytical only. |
| Decision criteria stated | yes | Complete classification, production-owner evidence, inference and semantic parity. |
| Existing repo patterns / prior decisions checked | yes | Current Vision and best-api generic-mutation doctrine read; live source audit follows. |
| Helper stack selected | yes | `best-api` decision owner + `major-task` audit shell + `autogoal` lifecycle only. |
| External research decision recorded | no | N/A: local API/runtime truth is sufficient unless a narrow unresolved precedent appears. |
| Implementation expectation recorded | yes | No product source implementation in this audit. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout. |
| Branch / PR expectation decided | no | N/A: analytical task; no branch, commit, or PR. |
| Output budget strategy recorded | yes | Count/file-first searches, bounded source slices, generated/noisy trees excluded. |
| Package/API pack selected | yes | Applied because public package mutation APIs are being audited. |
| Public surface or package boundary identified | yes | Plate package descriptors and Core/Plite generic operation projection boundary. |
| Release artifact path selected | no | N/A: no published user-visible delta; audit artifact only. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package changes. |
| Barrel/export impact decision recorded | no | N/A: no exports change. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Enumerate every authored `read` and `update` member in package plugin constructors and justified `.extend()` stages; count expected/reviewed/excluded rows.
- [x] Count production owners for every method and distinguish callers from tests, docs, barrels, and exports.
- [x] Resolve whether Callout `insert` and Code Drawing mutations are semantic or redundant with generic element operations.
- [x] Resolve `InsertDateOptionsFor` and define the inferred Date insertion call without public compiler-ferry types.
- [x] Resolve DOCX `tableCell.installed ? tableCell.schema.type : undefined` from actual dependency/optional-format semantics; do not assume the user's preferred outcome if source contradicts it.
- [x] Resolve whether exported `IndentElement` is feature-owned schema inference or a handwritten shadow type, including all consumers.
- [x] Define the inferred Equation `set` call that removes `<EquationElement>` without losing target identity or active-transaction semantics.
- [x] Specify how an authored same-name generic mutation replacement receives additional domain options and preserves default generic behavior when composition is needed.
- [x] Publish ideal normal, customization, and escape call sites with exact public owners/imports.
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
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: N/A, analytical plan artifact only.
- [x] Package/API pack: N/A: no `.changeset` work.
- [x] Package/API pack: N/A: no registry work.
- [x] Package/API pack: no release artifact because no product/package source changes are authorized.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: N/A for package checks because no product source changes occur; source/type-test inspection remains required evidence.
- [x] Package/API pack: N/A for generated barrels or release notes because no exported layout or published behavior changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete the counted manifest and mechanical plan check | 239/239 projected authored methods classified; checker is the final command |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Core synthesis, portal facade, 38 production files, consumers, docs, barrels, and type contracts inspected |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Classification and target API below close every named case |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Recorded below |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | `best-api` public-complexity, inference, ownership, and alternatives pressure applied to every mixed row |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Every finding is accepted, rejected, or assigned an exact next owner; this analytical task has no source-fix obligation |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: current Core/runtime/package source settles the API |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no product, app, docs, barrel, changeset, or skill source changed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: analytical Markdown plan only; no lint-owned source changed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count/file-first searches were capped; one noisy search was replaced by exact scoped queries |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-audit-plugin-read-update-generic-mutations.md` | final command |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core generated/default mutations, inferred descriptors, package exports, and public docs inspected |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | This audit is agent-only; implementing the accepted target is a published breaking package/API change |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A now; required during implementation for every affected published package |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A now; implementation is package API plus registry adoption, not registry-only |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Agent-only audit artifact; no product delta |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: no product source changed; existing compile/runtime contracts were inspected as evidence |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported source changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements, Vision, skills, and live owners read | current-state map |
| Current-state map | complete | 239/239 projected authored methods plus 25 explicit generic calls inventoried | options |
| Options and recommendation | complete | one target and rejected alternatives recorded | review |
| Review / pressure pass | complete | public complexity, inference, ownership, and transaction-policy pressure applied | implementation decision |
| Implementation or plan artifact | complete | analytical artifact only; product edits explicitly deferred | verification |
| Verification | complete | bounded AST and caller scans plus existing Core contracts inspected | closeout |
| Closeout | complete | final handoff recorded; checker remains | final response |

Findings:
- Measured scope:
  - A bounded Babel AST scan over production `packages/*/src` found 63 authored
    `read`/`update` contribution rows in 36 definition files: 227 method
    definitions, split into 81 `read` and 146 `update` methods.
  - The shared media contribution defines three methods once but projects them
    onto Audio, File, Video, Image, and Media Embed. The consumer-visible
    authored projection is therefore 239 method slots across 38 source owners:
    81 `read` and 158 `update`.
  - Reviewed: 239/239 projected authored slots. Classification totals are
    9 replace-with-generic, 8 delete/internalize, 4 move/rename, and 218 keep.
  - Excluded from the product-method count: Plite native extension methods,
    package tests, type tests, generated output, docs, public registry JSON,
    changelogs, and imported native contributions such as History. Those are
    evidence or a different layer, not authored Plate plugin methods.
  - A separate production scan found 25 explicit
    `nodes.insert/set/unset<T>` call sites. Twenty-three can lose their explicit
    element generic through descriptor/schema ownership or ordinary broad
    inference. The two Suggestion text calls remain honest internal escapes.

- Current Core facts:
  - `resolvePlugins.ts` synthesizes `insert`, `set`, and `remove` for every
    element descriptor, then merges authored updates over them. An authored
    same-name method already is the override; no second override DSL is absent.
  - Generic `insert` calls `tx.schema.create`, honors explicit `at`, inserts
    blocks after the selected block, inserts inline elements at the selection,
    and no-ops without a selection or `at`.
  - Generic `set` and `remove` force the descriptor's compiled persisted type
    and deliberately omit caller-owned `match`.
  - `createPluginContext.internal.ts` currently opens an untagged one-shot
    update for every scoped update method. It does not let a caller apply an
    update policy to a descriptor-scoped generic method.
  - Generated schema materialization already computes exact owner property
    types through `InternalEditorDefinitionOwnedElementProperties`; package
    aliases are not needed to teach the application schema.

- Complete classification manifest. `G` means replace the authored method with
  the existing synthesized generic operation; `I` means delete or make lexical;
  `M` means keep the behavior but move/rename it; every unmarked method is `K`
  and remains a distinct semantic operation.

| Owner | `read` | `update` | Decision |
| --- | --- | --- | --- |
| AI Base | `hasPreview` | `acceptPreview`, `beginPreview`, `cancelPreview`, `discardPreview`, `insertNodes`, `markBatch`, `removeMarks`, `removeNodes`, `undo` | all K |
| AI Chat | `commentRange`, `insertStart`, `markdown`, `node`, `prompt`, `resolvePlaceholders`, `serializeChunk` | `accept`, `acceptSuggestions`, `applySuggestions`, `applyTableCellSuggestion`, `insertBelow`, `insertChunk`, `rejectSuggestions`, `removeAnchor`, `replaceSelection` | all K |
| Copilot | — | `accept`, `acceptNextWord`, `reject`, `setBlockSuggestion`, `setSuggestion` | all K |
| Blockquote | — | `toggle`, `untab` | all K |
| H1-H6 | — | `toggle` on each descriptor | all K |
| Line Height | — | `set` | K: target matching and default removal are aggregate-property semantics, not element CRUD |
| Text Align | — | `set` | K: same reason |
| Text Indent | — | `set`, `unset` | K: no universal aggregate-property target law exists |
| Callout | — | `insert` | G |
| Code Block | `entry`, `indentDepth`, `isEmpty`, `isAtStart` | `format`, `insert`, `resetBlock`, `selectAll`, `tab`, `toggle`, `untab` | all K; normalize `insert(input, options)` |
| Code Drawing | — | `insert` | G |
| Comment | `has`, `node`, `nodes` | `clearTransient`, `removeMark`, `setDraft`, `unsetMark` | all K |
| Core Affinity | — | `setSelection` | K |
| Core DOM | — | `autoScroll` | K |
| Core Node ID | — | `normalize` | K |
| Core Override | — | `executeBreakRuleAction`, `executeDeleteRuleAction`, `resetBlock`, `selectAdjacentBlockVoid` | all K |
| Navigation Feedback | — | `clear`, `flashTarget`, `navigate` | all K |
| Date | — | `insert` | K; split domain input from node options and delete `InsertDateOptionsFor` |
| Emoji | — | `insert` | K: behavior plugin inserts configured text, not its own element |
| Footnote Base | `definition`, `definitions`, `definitionText`, `duplicateDefinitions`, `duplicateIdentifiers`, `hasDuplicateDefinitions`, `identifiers`, `isDuplicateDefinition`, `isResolved`, `nextId`, `references` | `createDefinition`, `focusDefinition`, `focusReference`, `insert`, `normalizeDuplicateDefinition`, `selectDefinition`, `selectReference` | all K; split `insert` input/options and remove raw element generics through schema creation |
| Footnote React | — | `focusDefinition`, `focusReference` | K: intentional React/navigation override |
| Indent | — | `decrease`, `increase`, `set`, `tab`, `untab` | `set` M to `change`; remaining K. `set` currently means relative change, so it must stop lying |
| Column Item / Group | — | `insert`, `insertGroup`, `moveMiddle`, `selectAll`, `set`, `toggle` | `insert` G; `insertGroup` M to `BaseColumnPlugin.update.insert`; `set` M to `BaseColumnPlugin.update.setColumns`; `toggle` M to BaseColumnPlugin; `moveMiddle` and `selectAll` K |
| Link | `findAutolink` | `exitEnd`, `insert`, `unwrap`, `upsert`, `upsertText`, `wrap` | all K |
| Legacy list model / Todo | `getListItemEntry`, `getListRoot`, `isListNested` | Todo `toggle`; list `moveListItemUp`, `moveListItemsToList`, `removeFirstListItem`, `removeListItem`, `unwrapList`, `indent`, `outdent`, `toggle` | all K |
| List | `getNext`, `getPrevious`, `expandItemsWithChildren`, `isActive` | `indent`, `outdent`, `toggle` | all K |
| Equation block | — | `insert` | G after `texExpression` becomes a canonical schema default |
| Equation inline | — | `insert` | K: derives expression from selected text; split input/options |
| Media factory projected to Audio/File/Video/Image/Media Embed | — | `insert`, `setUrl`, `setWidth` on each descriptor | `insert` and `setUrl` K; five `setWidth` slots G to descriptor `set` |
| Placeholder React | — | `insertMedia`, `replaceMedia`, `insertMediaReplacingBlock` | first two K; `insertMediaReplacingBlock` I into its sole paste consumer |
| Mention | — | `insert` | K; add normal second node-options parameter |
| Block Selection | `first`, `getNodes`, `isSelecting` | `duplicate`, `insertBlocksAndSelect`, `paste`, `removeNodes`, `select`, `setIndent`, `setNodes`, `setTexts` | `first` I; remaining K |
| Suggestion | `activeDescriptions`, `findIdentity`, `node`, `nodeEntries`, `nodes` | `accept`, `addMark`, `delete`, `deleteFragment`, `insertFragment`, `insertText`, `reject`, `removeMark`, `removeNodes`, `setNodes` | all K |
| Tabbable | `findDestination` | — | K |
| Table | `getCellIndicesById`, `getCellIndices`, `getColumnIndex`, `getRowIndex`, `getSelection`, `createCellSelection`, `getAdjacentCell`, `getCellInNextRow`, `getCellInPreviousRow`, `getEntries`, `getGridAbove`, `getGridByRange`, `getMergeGridByRange`, `getNextCell`, `getPreviousCell`, `getSelectedCell`, `getSelectedCellEntries`, `getSelectedCellIds`, `getSelectedCells`, `getSelectedCellsBoundingBox`, `getSelectedTableIds`, `getSelectedTables`, `isCellSelected`, `isSelectingCell`, `getLeftCell`, `getTopCell`, `getCellBorders`, `getCellSize`, `getSelectedCellsBorders`, `isBorderHidden`, `isSelectedCellBorder`, `isSelectedCellBordersNone`, `isSelectedCellBordersOuter` | `insert`, `insertColumn`, `insertRow`, `removeColumn`, `removeRow`, `remove`, `setBorderSizes`, `toggleBorders`, `setBorderSize`, `merge`, `moveSelection`, `selectAll`, `setCellBackground`, `setColumnSize`, `setMarginLeft`, `setRowSize`, `split`, `tab` | I: `getColumnIndex`, `getRowIndex`, `getMergeGridByRange`, `getLeftCell`, `getTopCell`, `setBorderSizes`; remaining K |
| Tag | `getSelectedItems`, `isEqual` | `insert` | all K |
| TOC | `headings` | — | K |
| Toggle | `isActive`, `lastEnclosedEntry` | — | all K |
| Exit Break | — | `insert`, `insertBefore` | K: behavior plugin inserts another owner's block |

- Exact generic replacements:
  - Callout `insert`: move the canonical `icon: '💡'` into
    `property.string({ default: '💡', omitDefault: false })`; text-block schema
    already creates children and compiled identity. The two registry calls become
    `.insert({}, { select: true })`.
  - Code Drawing `insert`: move the complete empty drawing data into the JSON
    property default; canonical void content supplies the child. Delete
    `CodeDrawingInsertInput`; the registry value can use `CodeDrawingData` or a
    descriptor-derived element property type.
  - Block Equation `insert`: make blank `texExpression` a materialized schema
    default and use generic `.insert({}, options)`.
  - Column Item `insert`: delete it. It has zero production callers and its
    insertion-only `33%` contradicts the schema's canonical `50%` width.
  - Media `setWidth`: replace three registry consumers and current docs with
    `editor.plugin(plugin).update.set({ width }, { at: element })`; schema
    validation already owns finite number/string width.

- Custom insert contract:

```ts
plugin.update.insert(input?, nodeOptions?);
```

  - Domain construction and behavior inputs belong in the first object.
  - `at`, `select`, splitting, and other generic node insertion controls belong
    in the second `NodeInsertNodesOptions` object.
  - Apply this to Code Block, Date, Footnote, inline Equation, Column Group, and
    Mention. Link, Media, Tag, and Table already have the right two-part shape.
  - Delete one-owner public compiler-ferry aliases:
    `InsertCalloutOptions`, `InsertDateOptions`, `InsertFootnoteOptions`,
    `InsertColumnOptions`, `InsertColumnGroupOptions`, `InsertEquationOptions`,
    `InsertInlineEquationOptions`, and `InsertMentionOptions`. Inline the small
    callback inputs; descriptor inference is the public type contract.
  - Keep reused media domain inputs. Keep Code Block's private
    `CodeBlockUpdateFor<T>` only if declaration emit still reproduces the
    documented TS7056 ceiling after the signature cleanup.

- Explicit generic migration:
  - Registry Code Block, shared Equation UI, and Floating Media use
    `editor.plugin(descriptor).update.set(...)`; no `<CodeBlockNode>`,
    `<EquationElement>`, or `<FloatingMediaElement>`.
  - Inside transactions, Layout uses `tx.column.set`, Link uses `tx.link.set`,
    Table uses `tx.table`, `tx.tableRow`, and `tx.tableCell`, and Placeholder
    uses `tx.placeholder.insert` after the Column `set` collision is removed.
  - Optional Footnote Definition construction uses the guarded compiled type
    with `tx.schema.create` and raw insertion, without restating a generic.
  - The two Suggestion `SuggestionText` calls remain: Suggestion owns dynamic
    text properties, not an element descriptor, so an element portal would lie.

- Scoped transaction policy gap:
  - Make the descriptor portal update facade mirror root `editor.update`:

```ts
const equation = editor.plugin(BaseInlineEquationPlugin);

equation.update.set({ texExpression }, { at: element });
equation.update({ history: 'merge' }).set(
  { texExpression },
  { at: element }
);
```

  - This is one callable facade, not a second API. It removes the sole reason
    `useEquation` falls back to typed raw `nodes.set` for a tagged update.
  - Do not add a plugin parameter overload to `editor.update.nodes.set`; that
    duplicates the descriptor portal. Do not put transaction policy into every
    method's node options.

- Named cases:
  - `InsertDateOptionsFor` is compiler scaffolding exposed as API. The Date
    behavior survives, but the type and merged-argument shape do not.
  - `IndentElement` has exactly zero consumers outside its declaration. Delete
    it. Aggregate property plugins may refine many element types and cannot
    truthfully claim one `ElementOf<Plugin>`.
  - `tableCell.installed ? tableCell.schema.type : undefined` in DOCX survives.
    DOCX deliberately does not depend on Table; presence is runtime optionality,
    while type inference only describes an installed descriptor. Removing the
    guard would make an optional integration throw or force a bogus dependency.
  - `setUrl` survives despite `setWidth` being cut: URL normalization,
    provider/source projection, path resolution, and boolean failure are real
    semantics. Floating Media should adopt it rather than duplicate it.

- Public alias/local-helper cleanup found during the same pass:
  - Delete `BlockSelection.read.first`; it is an unused `getNodes()[0]` alias.
  - Inline `insertMediaReplacingBlock` into its sole paste owner.
  - Table keeps one canonical query per job: use `getCellIndices` instead of
    `getColumnIndex`/`getRowIndex`; `getGridByRange` instead of the exact
    `getMergeGridByRange` alias; `getAdjacentCell` instead of `getLeftCell` and
    `getTopCell`. Keep `setBorderSize` public and make batch
    `setBorderSizes` lexical/private.

Decisions and tradeoffs:
- Chosen law: element schema defaults own construction; synthesized descriptor
  CRUD owns ordinary insertion/set/removal; an authored same-name method owns
  the complete operation only when behavior is observably richer.
- Chosen customization: keep authored `update` factories. They already receive
  the active transaction and override the default once. Use `tx.schema.create`
  and transaction primitives inline; do not expose `baseInsert`, `defaultInsert`,
  `super.insert`, middleware, or an override callback protocol without repeated
  composition evidence.
- Chosen inference boundary: descriptor portals and closed transaction groups
  infer element properties. Do not add a plugin argument to raw `nodes.*` and
  do not retain public element-generic aliases merely to type one call.
- Rejected generic element reads: insertion/set/removal have one deterministic
  type-bound law; "active", "current", "above", or "selected" do not. A
  generated `read.isActive` would encode accidental selection policy.
- Rejected aggregate-property CRUD synthesis: one plugin may own multiple
  properties with different targets. A magic plugin-wide `set` cannot define
  which nodes accept which subset without another targeting language. Keep the
  small semantic Basic Styles/Indent methods.
- Rejected missing-plugin schema identity: an absent optional plugin has no
  compiled persisted identity. `installed` remains the non-throwing presence
  check; raw name fallbacks are lies.
- Compatibility: hard cut only. No aliases, deprecated overloads, merged legacy
  argument support, or duplicate root/raw/portal paths.
- Blast radius: Core scoped update types/runtime; Callout, Code Drawing, Code
  Block, Date, Footnote, Indent, Layout, Link, Math, Media, Mention, Selection,
  Table; registry consumers, EN/CN docs, type tests, barrels, changesets, and
  generated editor contracts.

## P0-P3 recommendation

| Priority | Action | Why |
| --- | --- | --- |
| P0 | Delete Callout, Code Drawing, block Equation, Column Item, and five Media Width authored wrappers after moving canonical defaults into schema | These are the actual generic-operation misses |
| P0 | Standardize every semantic element `insert` to `insert(input, nodeOptions)` and delete one-owner `*OptionsFor`/`Insert*Options` scaffolding | One call shape preserves inference and the complete low-level option surface |
| P0 | Make scoped `portal.update(policy)` callable and migrate the 23 removable explicit element generics | Tagged updates should not force callers back to raw generic nodes APIs |
| P1 | Move Column Group operations to `BaseColumnPlugin`; rename `insertGroup` to `insert`, `set` to `setColumns`, and Indent `set` to `change` | Current names and owners hide synthesized generic methods and lie about behavior |
| P1 | Delete unused `IndentElement`; keep real cross-owner refinements such as `IdElement`, `ListElement`, `SuggestionElement`, and media refinements | Schema/application generation already owns exact nodes; only consumed semantic refinements earn an export |
| P2 | Internalize Block Selection `first`, Placeholder `insertMediaReplacingBlock`, and six Table aliases/batch helpers | They add public alternatives without an independent job |
| P3 | Do not add generic element reads, aggregate-property CRUD magic, a base-operation hook, or missing-plugin identity fallback | Each adds a second policy language or lies about runtime presence |

Implementation notes:
- No product implementation was authorized in this audit.
- Execution order: Core scoped update policy and type proof; redundant wrapper
  defaults/removals; custom signature normalization; owner moves; explicit
  generic adoption; local-helper cuts; docs/barrels/changesets/generated
  contract adoption; package and Browser proof; `best-api repair` only after
  the target is accepted and source behavior is proven.
- Required focused behavior proof includes no-selection/explicit-at/block/inline
  insertion, custom name versus persisted type, authored override precedence,
  tagged scoped updates, schema default materialization, Media invalid URL and
  width handling, optional DOCX without Table, Layout selection/width parity,
  Table border/selection parity, and one undo unit for compound semantic inserts.
- Browser routes during implementation: standalone Callout, Code Drawing,
  Equation, Layout, Media, and Table demos where available.

Review fixes:
- Corrected the tempting but wrong recommendation to delete the DOCX
  `installed` guard; live portal/runtime and package dependency evidence prove
  it is required.
- Corrected the earlier broad "Column insert is semantic" classification:
  Column Item `insert` has no production caller and conflicts with schema
  defaults; only Column Group sized construction is semantic.
- Kept Media `setUrl` after semantic pressure: it is not equivalent to generic
  set and its current UI duplicates the exact normalization job.
- Rejected a fourth universal element verb or generic read family; two internal
  unsets and one Toggle query do not justify permanent global API surface.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root `typescript` package exposes only a version stub to CommonJS in this checkout | 1 | Use the installed Babel parser for a read-only AST census | Complete 227-definition / 239-projection manifest produced |
| One broad caller search included generated public registry JSON and historical changelogs | 1 | Exclude generated/public/changelog trees and query exact scoped method names | Production caller evidence above is bounded and current |

Verification evidence:
- AST census: 63 direct contribution rows, 36 direct files, 227 definitions;
  projected media expansion yields 239 reviewed method slots in 38 owners.
- Explicit generic census: 25 production `nodes.insert/set/unset<T>` sites.
- Exact source reads: Core synthesis and merge precedence; portal facade;
  generated owner-property type emitter; every mixed/removal owner; DOCX and
  Footnote optional dependencies; current public docs and production callers.
- Existing Core contracts prove descriptor `insert/set/remove`, exact property
  inference, persisted name/type separation, no caller `match`, no-selection
  behavior, and semantic override precedence.
- N/A package tests/typecheck/Browser: no product source changed.
- Mechanical plan checker: final command.

Final handoff contract:
- Recommendation: accept the P0/P1 hard cut; execute P2 in the same package
  adoption only after focused consumer scans stay empty; reject P3 machinery.
- Confidence: high. Generic replacements and optional-dependency decisions are
  direct source facts; the scoped policy facade is the one new API recommendation.
- Evidence: complete manifest, consumer scans, runtime/type owners, and current
  docs/contracts recorded above.
- Tests / commands: bounded AST/`rg` audits and existing contract inspection;
  no runtime commands because no product source changed.
- Browser proof: N/A for this audit; mandatory during implementation on the
  affected standalone demos.
- PR / tracker: none; no git or external mutation authorized.
- Caveats: implementation must prove declaration emit before removing Code
  Block's private TS7056 carrier and must preserve compound insert history and
  selection behavior exactly.
- Next owner: `plate-plan` for accepted Core/package/app adoption; then
  `best-api repair` for the two reusable doctrine additions: uniform custom
  insert arguments and policy-aware scoped updates.

Open risks:
- Code Block's private TS7056 carrier may still be necessary after the public
  signature cleanup; declaration emit, not taste, decides it.
- Generic block insertion changes placement relative to the remaining Callout,
  Code Drawing, and block Equation wrappers. Focused selection/history tests and
  Browser demos must prove parity before deleting those bodies.
- A callable scoped update facade touches Core transaction-policy typing and
  rollback behavior. It must delegate to the existing root update exactly once.

Timeline:
- 2026-08-04T10:23:11.856Z Major-task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Audit complete; product source remains untouched |
| Where am I going? | User decision, then `plate-plan` execution if accepted |
| What is the goal? | Classify every package-authored read/update method against generic mutations and define the inferred target API |
| What have I learned? | Generic element CRUD is sound but adoption stopped early; optional runtime presence and semantic feature behavior must not be erased by type enthusiasm |
| What have I done? | Classified 239/239 projected methods, resolved every named case, counted 25 explicit generic escapes, and published one hard-cut target |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
