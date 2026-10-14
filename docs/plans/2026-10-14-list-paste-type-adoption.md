---
review_scopes: [list, clipboard]
review_basis: [2026-10-14-list-paste-object-boundaries, 2026-10-13-list-paste]
verdict: pursue
work_kind: implementation
review_commit: ca301fa61534b1dcca2b355b9d040c02f1f384c0
review_inputs: [packages/platejs/src/root.tsx, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/editor-commands.ts, packages/plitejs/src/core/editor-reads.ts, packages/plitejs/src/core/read-registry.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/transforms-node/set-nodes.ts, packages/plitejs/src/transforms-node/replace-children.ts, packages/plitejs/test/slice-fit-contract.test.ts, packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.ts, packages/platejs/src/features/media/lib/BaseMediaPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/CopilotPlugin.tsx, docs/plans/2026-10-14-list-paste-object-boundaries.md, VISION.md, docs/vision/common.md]
---

# Adopt the copied first item without converting its text

Status: executed locally; uncommitted, remote publication unavailable
Page: https://claude.ai/artifact/DtbjYK46RvpbPugGTfdtoY
Playbook: build

Pursue removing List's before/after target-type mutation. This continues the owner's original list paste build. The previous iteration's second diff round proved that the post-paste conversion deletes a copied mark which explicitly permits copying. Its one replacement was exhausted, so the lead saved and reverted that approach before this iteration. The earlier prefix still breaks CodeBlock composition and cannot close the task.

## Brief

### What will change?

Lists now paste at the caret's depth, keep their nesting and first-item type, and continue numbering. The target's restart wins. The implementation stays uncommitted for review.

### What could go wrong?

Six comparison cases and five Chromium runs pass. Repository-wide checks remain unverified after verification was narrowed. A collaborative-view identity concern remains untested. The remote page has not been updated.

## Teach

A copied slice describes the blocks being pasted. The destination describes what will be replaced. An ordinary paste at a text position keeps the usual text merge and metadata rules. Replacing a whole node removes that node and inserts the copied blocks.

List needs whole-node replacement when the caret sits in a qualifying empty paragraph or heading. It prepares the copied items after the other paste handlers finish, then selects that empty node explicitly. The shared fitter still owns document validity, copied child documents, the caret and undo.

This removes both temporary type conversions. Copied text stays under its final type, while an ordinary non-list paste keeps its existing behavior.

## Demo

1. Start the docs app with `PLATE_WWW_DEV_SOURCE=1 pnpm --filter www dev --port 3297`, then open http://localhost:3297/blocks/list-demo. Copy the sibling Decimal 111 and Decimal 112 items and paste below Roman 3. They remain peers and continue as IV and V.
2. The native image cases paste an image-headed list into a nested empty paragraph or heading. The image remains the first item; typing and one undo still work. Run [the native list clipboard suite](../../apps/www/tests/browser/list-keys.spec.ts) with `PLAYWRIGHT_RETRIES=0 pnpm --filter www test:www-browser:chromium tests/browser/list-keys.spec.ts`.

The original run kept its screenshots locally under `artifacts/2026-10-13-list-paste/type-replan/`. They are not included in this repository; use the committed suite to repeat the checks.

## Outcome

Complete the original six fixed-column cases and the owner's first-item type and restart choices. Preserve copy-permitted text properties, the two surviving empty task items after truncation, separate CodeBlock and paragraph items under both plugin orders, target id/alignment, admitted roots, selection and one undo. Keep ordinary occupied targets, single open list items and non-list pastes on their accepted contracts.

## Scope

Only first-item type adoption and the canonical fitting behavior it needs. Retain the original forest landing and identity changes, the wrapper/limiter repairs, and the prior iteration's reviewed object candidate. Continue in the same checkout on fix/list-paste, with no worktree, commit, push or PR. Build through `.agents/playbooks/build.md` after this plan's review. Evidence lives under `artifacts/2026-10-13-list-paste/type-replan/`.

## Evidence

Model: gpt-6-astra @xhigh.

This iteration reopens 2026-10-13-list-paste for first-item type adoption because the prefix broke CodeBlock composition. Its nesting and numbering rules remain.

It reopens 2026-10-14-list-paste-object-boundaries because post-paste conversion removed copy-permitted marks. Its semantic emptiness, root-owning target refusal and admitted object placement remain. [BaseListPlugin](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts) prepares the replacement, and [public-state](../../packages/plitejs/src/core/public-state.ts) resolves its exact node interval. The exact rejected bytes are saved in `rejected-continuation.patch` and `rejected-protected-head.patch` under this run directory.

### Requirements

- User: paste nesting lands at the caret's depth and continues target numbering; the first list item keeps its type in an empty paragraph or heading at any depth.
- User: the empty target's explicit restart wins; final behavior matches all six saved comparison cases.
- Existing contracts: copying preserves properties whose copy lifecycle allows them; one paste has one undo and legal selection/root ownership.
- Existing contract: the ordinary empty target retains permitted id/alignment. An incoming property wins where the established list rules choose it.
- User: local uncommitted delivery and the existing page URL; no website login is needed for its recorded Artifact publisher.

### Lanes

- Incumbent prefix. It changes the target before downstream handlers and fails both List-first CodeBlock composition cases. It is only the required reverted state.
- Post-paste type conversion. It preserves downstream context but deletes a supported copied mark and mishandles two empty survivors. Rejected by exact frozen-tree controls.
- Existing node replacement after delegation. It may preserve current children but needs proof of metadata lifecycle, node identity, imported roots and selection. A source-text restore is rejected because downstream handlers may have transformed that text.
- Existing slice fitting with a complete first block. Compare a narrowly admitted closed text-block candidate with any stronger existing fitting input. Container-head unfolding, ordinary metadata and incomplete rooted boundaries remain required controls. A new public option must prove why existing slice intent cannot express the job.

The source grounding is `artifacts/2026-10-13-list-paste/type-replan/how/answer.md`. The lead confirmed its named setNodes lifecycle, replacement and structural-candidate owners. The current fitter distinguishes text-content blocks from container spines through its existing schema reader. The property compiler already owns element type-change retention. Neither fact proves a new candidate until its current controls run.

### Dependents

- ai uses `packages/platejs/src/ai/react/AIChatPlugin.ts`; closed replacement and partial text paths are in consumer proof.
- layout uses `packages/platejs/src/ai/react/AIChatPlugin.ts`; Table and CodeBlock explicitly delegate whole-node replacement.
- media uses `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`; caption Enter and object schemas remain in consumer proof.
- basic is unaffected at serializer imports because no serialized field or format mapping changes.
- markdown is unaffected at serializer imports because no serialized field or format mapping changes; original round trips still rerun.
- distribution imports `packages/platejs/src/root.tsx`; the existing editorReads export gains the landing descriptor. Public inference, generated reference and teaching checks are required.
- editing is unaffected at ExitBreak's list-query import because query and Enter APIs are unchanged.
- react is unaffected at IndentPlugin's list-query import because indent APIs and React state ownership are unchanged.
- ui is unaffected at copied components because no component or kit membership changes. Native clipboard proof retains the exact list-demo route.
- proof is unaffected at scenario type imports because the test package API is unchanged. Its browser runner drives final acceptance.

The production candidate passes 181 Plate cases across seven consumer files and 1,280 raw Plite cases across ten files. Logs are `artifacts/2026-10-13-list-paste/type-replan/production-consumers-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/production-raw-consumers-a1.log`. Final acceptance still follows the diff panel and last lint fix.

## What other editors do

The original plan's saved Notion, ProseMirror and Lexical comparisons still support its depth and joining choices. They do not settle custom mark lifecycle or root ownership here. Tiptap and Slate provide no new live result for this question. This iteration first compares the current Plite operations and their tests; it makes no external-editor claim about the new candidate.

## Public API

The ordinary caller continues replacing its copied slice. The new customization uses the existing read middleware factory, imported with editorReads from the public package root.

```ts before
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```
```ts after
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```

List moves destination-dependent preparation from command middleware to a pure read. This is the planned call in the existing plugin.

```ts before
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
around(editorCommands.replaceSlice, ({ input, next, state }) => {
```
```ts after
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
around(editorReads.slice.landing, ({ editor, input, next, state }) => {
```

The descriptor takes and returns `ReplaceSliceCommand`. It runs once in the default replacement command after command prefixes and input transformations. A terminal handler bypasses it. Direct transaction replacement and direct fitting do not run it. There is no new boolean or state method.

The existing replacement options accept `SelectionApi.nodes(...)` for an exact contiguous sibling target. This applies to one-shot command replacement, raw transaction replacement and direct fitting. A rootless node selection addresses the main document, including from a named-root view. Explicit disjoint selections return false without consuming gaps. The existing implicit disjoint command selection still uses its established branch.

A node selection replaces its members themselves. It does not inherit their properties. List prepares its permitted target properties before asking for that replacement. Whole void replacement remains legal when the parent admits it; editing inside a void still requires the existing voids option.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| List depth, numbering and empty-target policy | Plate | platejs list feature | Product list semantics |
| Placement, property lifecycle, roots and caret | Plite | plitejs core | Shared document invariants |
| Pure command landing and exact view reads | Plite | plitejs root | Existing command and read composition |

## Main changes

Remove List's target-type mutation. The replacement command's existing default builder runs the new landing read before its existing node-selection and fitting branches. It uses the active command's exact editor/view. The existing read executor's explicit-source path keeps view projection and prefix draft active during the whole read. The view's one-shot slice and fragment replacements regain their existing semantic command lowering; callback transaction replacement stays raw. CodeBlock and Table delegate explicit node targets before their text or cell lookups.

List builds an admitted closed first block from the final target and copied content. The existing schema owner decides type-change property retention. Copied properties win over retained target properties, then the empty target's explicit start/restart wins. Stale List fields never enter that inheritance. A declined closed candidate leaves fallback content free of inherited target properties.

The slice owner translates an explicit contiguous node selection into its existing exact interval. Exact fitting must consume that interval. It cannot shift to a smaller insertion or keep a selected required prefix; inadmissible replacement returns false without publishing changes. Ordinary caret prefix insertion keeps its existing behavior. It checks membership and void ancestry before fitting. The shared local-text candidate factory excludes exact intervals, including its direct and positional fast paths. Open slices with exact targets use boundary fitting. The fitter attempts a closed exact interval directly, with its existing structure admission, instead of searching and repeatedly checking the same object sequence. This restores the frozen work budget. Ordinary caret fitting still has only the already reviewed object/void empty-block candidate, not F's ordinary-text expansion. No core branch merges List properties. A single open empty surviving item keeps the existing no-op behavior.

### Design comparison and review target

The initial target F and its full comparison remain in `artifacts/2026-10-13-list-paste/type-replan/architect/synthesis.md`. Its approved wording was “the existing fitter's empty-block candidate also accepts an ordinary non-inline, non-atom text block.” Plan round one disproved that choice. The exact ordinary paragraph probe loses id and alignment through command, raw transaction and direct fitting. The restored incumbent keeps them.

Challenge delta: replaced F's implicit ordinary-block adoption with explicit node replacement. The one architect replay compares reuse of NodeSelection, a new single-node target, a List command handler and a broader fitting/lifecycle redesign. The candidate package and blind scoring live under `artifacts/2026-10-13-list-paste/type-replan/architect-replay/`. The blind judge selects cand-1, with cand-2 boundary controls and cand-3 adoption requirements. The lead agrees with its scores and choice in the replay synthesis. H4 implements that design in a disposable export for review. The lead also applied the runners' void, CodeBlock and view-fragment requirements, and replaced repeated exact-interval admission after G failed the frozen object work budget.

The ordinary paragraph metadata probe now passes all three entries. H4 also passes the copied-mark, two-empty-survivor, downstream prefix, terminal-handler, authored view, named-root, exact-anchor and fourteen-cohort controls. The evidence and limits are in `artifacts/2026-10-13-list-paste/type-replan/architect-replay/synthesis.md`. The judge also challenged exact-boundary fallback. Its required empty-heading case exposed two distinct fitter paths. H4 fixes both, and independent mutants fail while the exact refusal and legitimate caret control pass. These are prototype results, not final native acceptance.

Plan round two found two defects in H4. Table treated explicit node replacement as cell filling, including a wrong-root write from a named view. Open slices also reached a text fast path that threw on whole-node targets. H5 repairs the Table consumer and the shared text-candidate factory. Exact red/green probes, six durable tests and the coverage receipt are in `artifacts/2026-10-13-list-paste/type-replan/plan-panel-2/synthesis.md`. No critical finding was dismissed. The third plan round reviewed those changes and their callers. It found no critical defect. It identified a valid empty-container target that the resolver refused, missing selection assertions, and a wrong host-load summary. H6 fixes the resolver and skips text-prefix probing for exact intervals. Its three entry regressions fail against H5 and pass after the repair. The synthesis and scope are in `artifacts/2026-10-13-list-paste/type-replan/plan-panel-3/synthesis.md`.

All completed runners belong to one model family after the fresh Opus ping failed. The completed third panel covered Table delegation and open-slice exact targets. The build diff panel must attack the same-family review limit and the last-round empty-container repair. The earlier contracts remain required controls.

### Decision ledger

Build round one found that an equal copied tail retained the selected node's key and deletion anchor. Pursue completing exact replacement through the existing node-identity owner. The original target remains whole-node replacement; the round adds no new public surface.

Three repair lanes were checked. Disabling suffix trimming restores the full canonical interval but still fails all three entry tests. Marking every complete same-shape replacement as structural makes the focused identity tests pass, but conflicts with the established text-only classification contract in `editor-methods-contract.ts`. Reusing `nodes.replace`'s existing discarded-key set preserves both contracts. The selected repair shares that identity operation and invokes it only after fitting accepts the replacement, before mapping the applied change. A refused fit must preserve every key and anchor.

The detached fitting test must apply its complete transaction spec, as the existing public API parity test does. Applying only `spec.changes` drops the spec's selection and private identity data; it is a separate canonical-change operation. The corrected three-entry regression is red in `artifacts/2026-10-13-list-paste/type-replan/build-panel-1/exact-tail-complete-spec-red-a1.log`. The earlier file named `exact-tail-durable-green-a1.log` is a failed attempt, not green evidence. The second diff round reviews this repair and the ordinary same-shape control.

The repair passes all three entries and both independent mutations detect its removal. The production replay passes 283 focused, 181 plugin and 1,283 raw cases, with overlap between groups. A forward nearest point anchor inside a removed whole node follows the replacement interval; the active paste caret stays at the inserted tail. The old prototype expected those two positions to coincide. The corrected probe and the existing node-replacement control agree, as `artifacts/2026-10-13-list-paste/type-replan/build-panel-1/synthesis.md` records. Final native input and work-budget acceptance still follow review.

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| First-item type | List mutates the target before paste | List returns complete copied content and an explicit empty-node target after handlers | Plate list | Prefix breaks CodeBlock; post-conversion drops marks | BaseListPlugin and its smallest regressions | H4 marks, survivors and downstream probes | Wrong fallback or stale metadata | rearchitect |
| Destination preparation | No late pure command read | One existing-style read descriptor returns the complete replacement input | Plite command/read owners | Read the final prefix draft without another mutation phase | editor-reads, editor-commands and inferred public type contract | H4 boundary and downstream probes | Raw fitting policy expansion | rearchitect |
| Exact view context | View wrappers lose semantic lowering; explicit reads can lose draft projection | Existing view read projection within draft scope and semantic slice/fragment wrappers | Plite read registry and runtime view | Named and authored views keep their context | read-registry, editor-runtime-view and regressions | H4 view/context/authored probes; current transfer contracts | Prefix suspension or wrong document | rearchitect |
| Whole-node target | Slice options accept text locations | Existing NodeSelection represents exact contiguous siblings | Plite public-state and options types | Full replacement must be explicit | TextInsertFragmentOptions, WithNodeTarget and canonical exact bounds | H4 ordinary control, node targets, roots and undo; H void and boundary controls | Gap deletion or void bypass | rearchitect |
| Closed exact interval | Generic candidate search repeats admission work | Reuse closed-boundary candidate and refuse shifted or partial replacement of explicit intervals | Plite fitter | G exceeded the frozen copied-object budget | Existing candidate and structure admission | H4 fourteen-cohort smoke, exact-prefix refusal and caret control, two mutants, and raw contracts | Changed candidate priority | rearchitect |
| CodeBlock consumer | Treats every explicit paste target as a text location | Delegate whole-node targets | Plate code block | A NodeSelection has no Range anchor | BaseCodeBlockPlugin and its public regression | H2 exact crash; H4 node replacement and ordinary code insertion | Unintended text flattening | rearchitect |
| Table consumer | Expands explicit node targets into cells and can resolve a rootless target in the wrong view | Delegate explicit whole-node targets | Plate table | Exact replacement must reach canonical target resolution | BaseTablePlugin and three public regressions | H4 red and H5 green whole/disjoint/rootless controls; implicit fill remains | Wrong root or changed cell paste | rearchitect |
| Property lifecycle | Existing schema projection | Reuse unchanged against current draft | Plite schema | Prefix-created ancestor probe passes | No new helper or argument | H4 context probe | Incorrect site-dependent retention | keep |
| Teaching | List command-prefix explanation; text-only replacement targets | Command preparation, explicit node target and raw-fit distinction | docs/vision/plite.md and public docs | Customization and replacement examples must match runtime | best-api repair, teaching sweep, plate-docs, Chinese twins and generated reference | Final docs/types/preview checks | Stale examples | rearchitect |

The reviewed prototype is ready for production adoption. The third round reaches the plan cap, so the next gate is the build, followed by its diff review. Rollback saves the new mechanism's patch and restores the affected production owners to the pre-adoption freeze, while preserving the already reviewed forest and object fixes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| First-item repair | Finish the original paste goal through a new design review (look) | Hold this build for owner review | hold type adoption | small |
| Delivery | Leave all changes uncommitted in the requested checkout | No other delivery authorized | owner commits | detail |
| Verification scope | Finish with focused paste proofs (look) | Reopen repository checks | full checks | big |
| Empty block identity | Replace the empty block and map its anchors through the normal change rules (look) | Reopen the design to require the old runtime key | retain empty key | small |
| Exact replacement target | Keep ordinary paste behavior and replace only an explicitly selected node (look) | Reopen the replacement design | revisit node target | small |
| Replacement anchors | Follow existing whole-node replacement behavior (look) | Reopen independent anchor behavior | revisit anchors | detail |
| Review continuation | Build after this plan's review (look) | Hold the build | hold | small |

## Native behavior and proof

| Behavior | Required result | Proof |
| --- | --- | --- |
| Six comparison cases | Exact nesting, type and numbering | Final source fixture equality and package contracts |
| Real list and image clipboard | Rendered type, caret, follow-up typing and one undo | Existing five-case Chromium suite, warmup plus five retry-free runs on a fresh owned source server |
| Property lifecycle and limited empty items | Copy-permitted mark and both task states retained | Exact new red/green public-entry cases |
| Shared fitting | Existing plain text, media, code, table, AI, roots and transfer contracts | Current focused and package checks |

## Scale contract

Keep the original ten cohorts and four object cohorts, their frozen deterministic budgets and source fingerprints. G failed the copied-object budget at 16,021 checks against 12,033. H5 passes all fourteen pre-acceptance cohorts without raising a budget. The three `h5-*-budget-r1` logs, their JSON results and the receipt under `plan-panel-2/synthesis.md` record the exact work and sample counts. This proves model work bounds only. Final acceptance still alternates five baseline/candidate packets after the last reviewed code and lint edit. No speed claim is made. Native proof remains required.

## Steps

- [x] Revert the failed replacement and reproduce both findings and the restored composition failure. Proof: `artifacts/2026-10-13-list-paste/type-replan/red-marks-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/reverted-marks-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/red-empty-survivors-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/reverted-empty-survivors-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/reverted-composition-a1.log`.
- [x] Ground existing lifecycle, replacement and fitting owners through how. Proof: `artifacts/2026-10-13-list-paste/type-replan/how/answer.md` and lead source inspection.
- [x] Run architect, its blind judge and the decisive prototype controls; choose one route. Proof: `artifacts/2026-10-13-list-paste/type-replan/architect/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/prototype/closed-head-f.patch`, `artifacts/2026-10-13-list-paste/type-replan/prototype-landing-context-f-a3.log` and the six budget logs recorded there. Selected for plan review only.
- [x] Replace rejected F through one architect replay, blind judgment and H4 controls. Proof: `artifacts/2026-10-13-list-paste/type-replan/architect-replay/synthesis.md` and `artifacts/2026-10-13-list-paste/type-replan/prototype/node-target-h4-source.json`.
- [x] Finish the decision ledger and review the plan before production edits. Proof: `artifacts/2026-10-13-list-paste/type-replan/plan-panel-3/synthesis.md`; three plan rounds completed, no critical remains.
- [x] Build the chosen route and its smallest regression cases. Proof: `artifacts/2026-10-13-list-paste/type-replan/build-panel-1/exact-tail-complete-spec-red-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/build-panel-1/identity-consumers-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/build-panel-1/identity-mutations-a2.log`; frozen production `a109ee709af30ecfc8224f15b5f81d6c67486050`.
- [x] Run affected shared-consumer, docs, changeset and cheap type/audit gates. Invoke best-api repair and plate-docs for `content/docs/api/core/plate-plugin.mdx`, `content/docs/api/editor-transforms.mdx`, `content/docs/api/document-change.mdx`, `content/docs/api/selection.mdx`, `content/docs/(plugins)/(styles)/list.mdx` and their Chinese twins. The teaching sweep confirms those five English paths. Four already have Chinese twins; add selection.cn.mdx for the new node-target teaching. Run their example coverage audit, teaching sweep, generated reference check, rendered previews and public inferred type proof. Proof: current package logs and attributed baseline findings. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Run writing passes, diff review and final scoped lint. Proof: writing and diff review completed; further type/lint and unresolved full-check attribution were skipped under the `full checks` default. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Repeat original comparison, native and work-budget acceptance. Proof: final source and server identity, inspected frames, five retry-free native runs and paired performance packets. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Close every active list-paste plan, audit the decision trail, reflect and render the requested publication. Proof: `artifacts/topics/list.html`, `artifacts/2026-10-13-list-paste/type-replan/final-trail/disposition.md`, `artifacts/2026-10-13-list-paste/type-replan/final-reflect/synthesis.md` and `artifacts/2026-10-13-list-paste/object-replan/artifact-publication-check-v2.md`; remote publication remains blocked.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prior replacement reverted | yes | Exact red and reverted controls above; original composition failure remains visible |
| Verdict and grounding | yes | Pursue; current lifecycle and fitting source plus how answer |
| Architect and decisive prototypes | yes | F was rejected by plan round one; the required architect replay and H4 prototype proof are recorded in the replay synthesis and receipt |
| Plan panel before build | yes | Three rounds completed; `artifacts/2026-10-13-list-paste/type-replan/plan-panel-3/synthesis.md` |

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Shared consumers and cheap checks | yes | Production focused 283, plugin 181 and raw 1283 cases pass in their attempt logs. In response to the owner correction on 2026-10-14, the lead stopped broad type/lint expansion; no further full check or failure-attribution sweep runs. The incomplete failing production-check-a1.log is not a green gate. |
| Best API and public docs adoption | yes | artifacts/2026-10-13-list-paste/type-replan/build-preparation/docs-coverage.md, production-docs-build-a2.log and build-type-docs-final-a1.log. |
| Public API blast radius | yes | Production boundary, downstream, named/authored view and raw policy probes pass; production-raw-consumers-a2.log includes transfer, DOM and Yjs. |
| Shared-code quality review | no | skip: api-build already owes the diff panel before the first slice |
| Slice freeze and typed lint before panel | yes | Frozen a109ee709af30ecfc8224f15b5f81d6c67486050. production-typed-lint-a3.log passed 23 files. The later one-line export census retry has no completion receipt. Further type/lint runs are skipped after the owner correction. |
| Writing and diff panel | yes | artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md; zero confirmed critical findings. Product writing passes precede the frozen review; later delta is prose only. |
| Final original-goal acceptance | yes | artifacts/2026-10-13-list-paste/type-replan/final-comparison-cases-a1.log, final-native-and-docs-a2.log, final-work-counts-a1.log and final-object-counts-a1.log. |
| Decision audit, reflect and page | yes | artifacts/2026-10-13-list-paste/type-replan/final-trail/disposition.md and final-reflect/synthesis.md; local page rendered, remote publication remains blocked by the recorded capability limit. |

## Proof

The frozen rejected tree is 208c2d875b3495dfec561d08b694419ef490df3d. Its source-model probes lose the first copied mark and the first of two surviving empty tasks. The restored prefix passes those cases but still merges Head and Tail under List-first CodeBlock. Neither is an acceptable final result. The original six fixture cases and native gestures remain the completion boundary.

## Open work

- Sol's accepted-authored-view identity concern is unverified. With seed / old / tail / outside and a pending proposal after seed, exact accepted/edit replacement might restore a discarded tail key through projection-index inheritance. The native paste proof does not cover it. Tracked in `docs/plans/topics/list.md`. owner: Plate and Plite authored-view maintainers. stop: the exact case from `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/seat-gpt-6.1-sol.md` is confirmed or rejected.
- Remote publication cannot run through the recorded publisher in this Codex session. The second capability attempt found a Claude Docs connector, but reading the exact target was denied. No browser login is requested. Tracked here and in the original plan. owner: natamox in the publishing-capable Claude session. stop: the local final HTML is published to the requested URL through Artifact.

## Close

The original prefix and the later post-paste conversion were rejected and reverted. The final code prepares the copied head after command handlers, then replaces the qualifying empty node through the canonical fitter. The first type survives without a temporary type change. This also preserves copied marks and the empty target's permitted properties. The empty target's start and restart win.

The owner challenged time and tokens spent on verification. The lead narrowed the remaining proof to paste behavior, the required diff review and the existing work budgets. Further type/lint runs and unrelated full-check attribution are skipped. The failing incomplete full check is not green and is not labeled wholly pre-existing. The leading plan's full checks default reopens that choice.

Local behavior acceptance passed on unchanged source. All six comparison fixtures exactly match the carried page data and pass through the product command. The current source also passed 283 focused, 181 plugin and 1283 raw cases as overlapping groups. The equal-tail identity repair has three durable entry regressions, independent failing mutations and six successful replays of the seats' exact values.

Desktop Chromium completed one warmup and five retry-free runs of the five-case suite. Each run checks the ordinary list flow and image-headed pastes into nested empty paragraph and heading targets, with follow-up input and history. The lead opened all three final screenshots and saw IV/V peer numbering and intact copied image heads. Selection setup uses the existing helper; clipboard and keyboard gestures are native. The owned source server's identity and ancestry were recorded, and it was stopped after proof. Firefox, WebKit, mobile and external applications are not covered.

Proof: `artifacts/2026-10-13-list-paste/type-replan/final-comparison-cases-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/final-comparison-data-a1.log`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/build-type-final-source.json`, `artifacts/2026-10-13-list-paste/type-replan/build-type-final-server.json` and `artifacts/2026-10-13-list-paste/type-replan/build-type-final-process-owner.json`. The first server attempt failed an overly strict process-group check before any test. The retry proves the listener descends from the owned launch; it does not waive ownership.

All fourteen frozen deterministic work budgets pass on final source in five paired rounds. The ten original cohorts retain 20 samples per arm; the four object cohorts retain 10. Forest visits are 3, 3, 3, 1001 and 2001. Prefix visits are 0, 0, 2, 5000 and 5000, with one apply on its first three cohorts and none on the last two. Object admission counts are 14, 10004, 4010 and 10004. These count selected operations, not all CPU work. Loaded-host timing remains inconclusive, and no speedup is claimed. Proof: `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; their JSON summaries preserve the packets and fingerprints.

The current type build completed two diff rounds. Round one found the selected equal-tail identity defect; the lead fixed it through the existing discarded-key owner. Round two reports no confirmed critical, warning or nit defect. Each Opus ping failed, so both rounds are same-family. Sol's accepted-authored-view identity concern remains unverified and has its exact input, owner and stop in Open work. The broader partial-root and top-level object limits remain in the object-boundary plan and list subject.

The public docs, examples and generated references describe late preparation and exact node targets. Final previews pass all twelve English/Chinese routes, including the List editor. The Plate and Plite changesets remain uncommitted. No worktree, branch commit, push or PR was created. HEAD remains ca301fa61534b1dcca2b355b9d040c02f1f384c0. Review freezes are unreferenced objects and do not move the branch.

Remote publication has not happened. The recorded publisher takes a local HTML path and the existing Artifact URL. The capability check found no usable publisher here; the Claude Docs attempt was denied for this exact target. No browser login is required or requested. The local final page and publication payload are the handoff for the publishing-capable session. See `artifacts/2026-10-13-list-paste/object-replan/artifact-publication-check-v2.md`.

Final accounting covers 35 plan steps across three iterations plus four delivery items. Total 39: 37 done, 0 partial, 1 skipped, 1 blocked and 0 open. Further type/lint is skipped. Remote publication is blocked. The code, proof, record close, local page and Chinese handback are complete. These counts include overlapping plan steps, not unique tests.

### Attention

reviewed by gpt-6-astra @xhigh, same-family fallback after the Opus seat returned no answer. The final record review found stale claims of clean lint and complete failure attribution. Those claims are corrected; no check was rerun. The reviewer found no other record issue blocking local paste delivery. This was a record audit, not another code review. Its coverage limits are in `artifacts/2026-10-13-list-paste/type-replan/final-trail/seat-fallback.md`, and the applied disposition is beside it.

The final reflection accepted no new workflow change. New publication, verification and closeout rules were rejected because the existing rules already covered the mistakes. No new backlog item was created. The lead should have used the documented publisher route and bounded the checks earlier. See `artifacts/2026-10-13-list-paste/type-replan/final-reflect/synthesis.md`.


The repository ledger nominates editor-public-naming as its next item. That is a separate task and was not started. Evidence: `artifacts/2026-10-13-list-paste/type-replan/final-records/ledger-next.txt`.

Reviewed inputs for this iteration: `packages/platejs/src/root.tsx`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/editor-commands.ts`, `packages/plitejs/src/core/editor-reads.ts`, `packages/plitejs/src/core/read-registry.ts`, `packages/plitejs/src/editor-runtime-view.ts`, `packages/plitejs/src/transforms-node/set-nodes.ts`, `packages/plitejs/src/transforms-node/replace-children.ts`, `packages/plitejs/test/slice-fit-contract.test.ts`, `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts`, `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/ai/react/CopilotPlugin.tsx`, `docs/plans/2026-10-14-list-paste-object-boundaries.md`, `VISION.md`, `docs/vision/common.md`. The final mechanism is owned by the type-adoption continuation; a listed input is review context, not a claim that every file changed.

The repository ledger check remains partial. This task repaired its missing Close input references. The ledger also rejects ignored local screenshots required by the page workflow and reports unrelated older records; those files were not changed. No ledger-green claim is made. Evidence: `artifacts/2026-10-13-list-paste/type-replan/final-records/ledger-close-a1.log`.
