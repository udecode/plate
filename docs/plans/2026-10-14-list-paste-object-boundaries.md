---
review_scopes: [list, clipboard]
review_basis: [2026-10-13-list-paste, 2026-10-04-clipboard-audit]
verdict: pursue
work_kind: implementation
review_commit: ca301fa61534b1dcca2b355b9d040c02f1f384c0
review_inputs: [packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/CopilotPlugin.tsx, packages/platejs/src/features/media/lib/BaseMediaPlugin.ts, packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts, packages/plitejs/src/core/slice-fit/frontier.ts, packages/plitejs/test/slice-fit-contract.test.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, docs/plans/2026-10-13-list-paste.md, VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/vision/plate.md]
---

# Keep object list items whole at empty targets

Status: executed locally; uncommitted, remote publication unavailable
Page: https://claude.ai/artifact/DtbjYK46RvpbPugGTfdtoY
Playbook: plan

Pursue the remaining object-head paste behavior. The owner's list paste goal still requires it. Decision-trail T1 found that the earlier build repaired a mechanism after its one allowed replacement, so its object route and shared fitter edits are saved and reverted. This iteration compares the ownership choices before rebuilding that path. It continues the same task, checkout and uncommitted delivery.

## Brief

### What will change?

Lists now paste at the caret's depth, keep their nesting and first-item type, and continue numbering. The target's restart wins. The implementation stays uncommitted for review.

### What could go wrong?

Six comparison cases and five Chromium runs pass. Repository-wide checks remain unverified after verification was narrowed. A collaborative-view identity concern remains untested. The remote page has not been updated.

## Teach

A copied item includes its content and the boundaries the selection crossed. The list plugin chooses depth, numbering and the empty-line policy. The shared fitter decides which copied blocks stay whole and how their content enters the document.

Closing a copied object's boundaries does not currently guarantee that it stays whole. The fitter may open it again or place it beside the empty target. The previous build tried to repair that after its last permitted review round.

The new iteration compares whole-block replacement with a change to the existing paste fitter. The narrow prototype replaces an empty text block only when the complete copied content fits there. Other text pastes keep their current path.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Remaining object path | Finish the original type-preservation promise through a new review cycle (look) | Keep today's object paste and leave the original goal incomplete | hold objects | small |
| Closed objects at other empty text blocks | Replace empty callouts and child-document lines too, when their parent accepts the object (look) | Preserve those empty block types | preserve empty blocks | small |
| Closed code blocks at empty lines | Replace the empty line when the copied blocks fit (look) | Keep an extra empty line before the code block | keep empty code line | small |
| Partial custom-object copies | Keep selected text when the copy omits the object's required body (look) | Require a whole-object selection | whole objects only | detail |
| Delivery | Keep all changes uncommitted in this checkout, as requested | No alternative authorized | owner commits | detail |

## Outcome

A list-led multi-block or closed paste at a collapsed caret in an empty paragraph or heading of the main document preserves the first item's type at any depth. This includes configured object and void list targets whose copied payload can form a valid owner, content roots actually carried by the copied head, truncation and target start/restart precedence. An open boundary whose required object roots were omitted by extraction stays open; preserving selected text does not authorize inventing or copying unselected roots. Ordinary occupied-target joins, raw Plite open-caption text, single open List items, selected blocks, parent schema requirements and one-step history keep their contracts.

## Scope

Only the remaining object/void empty-target mechanism and the existing fitter paths its chosen design needs. Forest landing, list identity and the ordinary prefix remain from the original plan. No worktree, branch commit, push or PR. Logs remain under `artifacts/2026-10-13-list-paste/object-replan/`; the original decision trail records continuation and links this iteration's review receipts.

## Evidence

Model: gpt-6-astra @xhigh.

This iteration retains 2026-10-13-list-paste for flat-list numbering and the ordinary prefix because those owners still meet the goal. It reopens that plan only for object-head landing.

It reopens 2026-10-04-clipboard-audit for nested closed-object placement because its fitter can unpack an admitted closed object. Schema admission, root mapping and atomic history remain with the transaction owner. [BaseListPlugin](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts) and [the fitter](../../packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts) are the two changed owners. The saved candidate's timing is inconclusive, and its passing tests are historical after the revert.

### Requirements

- The owner's first-item type promise applies at any main-document container depth.
- Source-root imports, schema admission, selection mapping and history remain under the existing runtime owners.
- Partial text copied from inside an object must remain a legitimate text slice. Plate's explicit list-led multi-block policy is an exception at the named empty targets; a single open item keeps today's text behavior.
- Ordinary text paste must not drop target id or alignment as a side effect of broadening empty-block replacement.
- Every shared fitter consumer the selected mechanism can affect gets its current contract proof.

### Lanes

- Keep the reverted object exclusion. This adds no artifact but fails the owner's named outcome in `object-replan/reverted-object-quote-a1.log`.
- Keep object policy in Plate and use an existing whole-block placement operation that imports roots and preserves one history step. Grounding must establish whether such an operation composes with the command's current slice and limits.
- Make closed object boundaries truthful in the existing Plite fitter and let Plate request whole placement. The saved candidate demonstrates feasibility, but its broad nested empty-block replacement and unchanged callers require challenge.

Three independent architect candidates and a blind judge compare these routes. The lead selects the narrow candidate from cand-2, with Plate's approved promotion restored. Scores, the blind judge and the losing candidates' useful cases are in `artifacts/2026-10-13-list-paste/object-replan/architect/synthesis.md`.

### Dependents

- ai and layout use `packages/platejs/src/ai/react/AIChatPlugin.ts`; their closed replacement and partial text paths are included in consumer proof.
- media uses `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`; caption Enter and object schema contracts remain in consumer proof.
- basic and markdown are unaffected at their list serializer imports; this iteration changes no serialized list fields or format mapping. The original list round-trip tests still rerun.
- distribution is unaffected at its root exports; this iteration adds no public export or entrypoint.
- editing is unaffected at ExitBreak's list-query import; this iteration changes no query, Enter or exit command.
- react is unaffected at IndentPlugin's list-query import; this iteration changes no indent API or React state owner.
- ui is unaffected at copied components because this iteration changes no component or kit membership; the original native clipboard proof route remains.
- proof is unaffected at scenario type imports; this iteration changes no test package API. The repository browser runner still drives final native acceptance.


The source map in `artifacts/2026-10-13-list-paste/object-replan/how/answer.md` traces the materially different paths. AI and Copilot call transaction replacement. Media Enter fits an explicitly open caption suffix. Code middleware supplies plain text. Table may delegate a single-cell paste or replace exact child intervals. Transfer has point, edge and relocation paths. DOM clipboard has exact and decoded inputs. Yjs consumes the resulting canonical changes. These owners keep their current calls and require current proof after the build.

Before editing this mechanism, the source-first clipboard, transaction, transfer, roots, DOM-format, collaboration and fitting controls passed 1,198 tests. Media passed 67 tests, and the package type gate ran 99 tasks without cache. Retained List tests had five object-path failures after the required revert. These are the new iteration's baseline, not its final proof.

## What other editors do

The original plan's saved comparisons establish list depth and text joins in Notion, ProseMirror and Lexical. They did not test this custom object-head contract. Those observations remain evidence for list behavior only. Tiptap and Slate supply no new live result for this narrower path. The architecture comparison must label any source-only object-boundary evidence it adds.

## Public API

The table clipboard caller keeps its existing replacement call. No new public option is the default target.

```ts before
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```
```ts after
// packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx
assert.equal(editor.update.slice.replace(slice), true);
```

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| List depth, identity and empty-target policy | Plate | platejs list feature | These are list semantics |
| Slice fitting, root import, schema admission and history | Plite | plitejs core | Every slice caller shares these invariants |

## Design under review

The current prototype uses the existing `SliceFitCandidate` shape. It adds no public option, exported helper, serialized field or List-owned root mapper. The producer of the wrong placement is candidate selection in Plite; that is the owner being changed.

Plate retains the owner's empty-target rule. After limiting the landed list content, it gives the surviving head the target's explicit starts. For an object or void head at an admissible empty paragraph or heading, it checks the complete replacement through the existing internal `schema.canPlaceAt` and delegates the limited slice with closed boundaries through `next`. Each open edge must retain the roots its schema declares. Otherwise it keeps the existing open route and recomputes a kept landing, as it does after failed placement. The ordinary prefix remains for other heads. Closing this product-policy input preserves the copied content and roots that actually arrived. It cannot recover text or roots omitted by extraction, and it does not promise to.

Plite first considers replacing the nearest semantically empty text block with the original closed object/void-led content. The existing `isEmpty` predicate is extracted into one internal pure function, shared by the editor read and the fitter. It rejects elements with object, atom or void behavior and blocks containing inline elements, even when their text is empty. Whole-block replacement also excludes targets that own content roots. Their local text can be empty while their body is not. The candidate uses the existing whole-node boundary from `getBoundaryCandidates` and goes through `isStructurallyApplicable`, including its full-sequence actual-parent admission. The admitted candidate enters the same canonical preparation, caret mapping, root import and history path as other fits. Explicit exact bounds, protected target boundaries and ordinary paragraph heads stay on their existing paths. If that complete replacement is inadmissible, ordinary fitting remains responsible for schema fallback.

The priority rule also applies to closed objects at empty callouts and named-root text blocks. It is a generic Plite rule, independent of Plate's main-document paragraph/heading policy for promoting open List input. This corrects the original plan's broader exclusion claim. The new candidate excludes object targets and a target block whose own boundary is protected. It can replace an ordinary empty child inside a protected ancestor. Existing fallback behavior remains outside this new candidate's guarantee. The prototype does not change global object opening or widen the old top-level local replacement. An additional probe found why that matters. A closed object copied into an empty object's caption succeeds at intake; the earlier global opening cap rejects it. Another probe allows the object only inside a quote, where the saved broad replacement leaves an empty paragraph. The narrow candidate preserves the first flow and replaces the empty paragraph in the second.

The core change requires a fully closed slice. The original Plate policy closes its eligible object input, so both open multi-item list copies and closed item copies reach it. Raw Plite's mixed closed-head/open-tail behavior remains unchanged. The new code also leaves the limiter's existing boundary provenance and terminal-void caret behavior unchanged. Those broader changes proposed by two runners are not prerequisites for the requested list behavior and need separate evidence before adoption. The mixed-boundary probe remains a diagnostic of an unchanged limit, never a durable test that requires type loss.

### Build panel round 1 composition verdict

Pursue replacing the ordinary prefix with the existing transaction continuation. The original approved route changed the empty target before downstream paste handlers ran. Astra C1 and `object-replan/panel1-composition-red-a3.log` show that List before CodeBlock then flattens two copied list items into one code block. CodeBlock correctly reads its current command state; the List producer must preserve the original landing context.

The ordinary path will delegate the landed, limited slice first. It then extends that result through `state.transaction.extend`, retaining refusal, effects and one history entry. It records the original target's node key before delegation and updates only that surviving node. When the fitter already replaced it, the copied node and its remapped roots remain untouched. When a nonempty copied head did not put content into the target, the continuation leaves that target unchanged. This preserves the existing zero-budget no-op. The copied head's empty state is read before delegation.

The unwrapped blocks now supply both landing and empty-target eligibility. The limiter runs on their source depths before landing, so a removed head cannot choose the surviving list's identity or marker. Their delegated slice subtracts the peeled wrapper depth while retaining the original roots. The fallback still restores those wrappers. This resolves Astra W1's same-quote copy into an empty heading and preserves the separate cross-quote-edge limit.

The maximum justified cut is the ordinary target-mutation prefix. A closed slice at a block path fails seven current contracts, including nested tasks and target id/alignment. Updating the old path after delegation fails exclusive-root copying and the zero-budget case. The initial surviving-key continuation passed the earlier 178 List tests and top-level CodeBlock cases in `object-replan/panel1-postfix-candidate-a1.log`. The nested rooted-head probe rejects under both the reviewed prefix and the candidate; it is not evidence of a new regression or successful nested rooted copying. These are throwaway source-model experiments, not final acceptance.

The first continuation prototype still leaves a blank paragraph before a closed code block inside a quote. The raw Plite case reproduces this without List in `object-replan/panel1-protected-head-red-a2.log`. Pursue extending the existing empty-block candidate to a closed head whose schema requires preserving its context. CodeBlock already declares that policy. The same structural admission, semantic-empty, target-root and exact-boundary checks remain. This keeps boundary ownership in the fitter and adds no List-side deletion of a leftover node. Ordinary unprotected heads retain the existing merge path and its metadata lifecycle.

Opening the protected head is rejected by the existing fitter, including the closed owned-root case. Allowing every closed head through the priority candidate breaks the existing nested-leading-spine contract. Restricting the addition to the declared preserve-context policy passes all 270 existing List and raw fitter cases in `object-replan/panel1-protected-head-candidate-a1.log`. The new raw regression must also pass on the production bytes, followed by the affected shared consumers and unchanged scale budgets. These experiments refine this round's first replacement before its next review.

No public API changes. Existing `editor.update.fragment.replace` and `editor.update.slice.replace` calls remain. `BaseListPlugin` owns the continuation and Plite owns the additional protected-head fit. Together they form this first replacement of the ordinary prefix in the current iteration. The command continuation contract remains unchanged. The next diff round must attack the protected-head admission, surviving-key and no-content premises, both middleware orders, roots, downstream refusal/replacement/movement, wrapper depth, undo and the unchanged work budgets. Broader consumer, native and scale proof reopens after this fix. Reverting restores the ordinary branch from frozen tree 89834d0c8372a19c3b6172da5f5692a60c342852, whose C1 remains a blocker, so the user goal cannot close on that fallback.

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Empty list-led object paste | Excluded from prefix and may lose its type | Delegate the limited content as a complete replacement | Plate list in platejs | Owner explicitly requires its first type at any main-root depth | One existing middleware branch | Retained open-object, nested, restart, roots and truncation regressions | Mistaking plain caption text for a list paste | rearchitect |
| Whole empty-block candidate | Nested local merge can precede valid whole placement | Prefer a fully admitted closed object/void replacement of the nearest empty text block | Plite core in plitejs | Same fitting defect reproduces without Plate | One candidate in the existing fitter | Nested-only object, one-child maximum, ordinary metadata and empty object-caption controls | Schema admission or exact bounds bypass | rearchitect |
| Roots, selection and history | Existing isolated fit transaction | Same owner and calls | Plite core | No duplicate lifecycle is needed | No new API | Root lifecycle, transaction and collaboration suites | Partial publication on rejection | keep |
| Ordinary list forest and first-item policy | Prefix changes downstream target context | Keep forest landing; extend delegated paste on the surviving target | Plate list | Preserve first-item type without making later plugins see a speculative type | Current iteration first mechanism replacement | C1/W1 reproductions, original fixtures, native and work budgets | Result identity and no-content handling | rearchitect |

### Alternatives and scope

The no-change incumbent fails the nested-object goal. Existing whole-child fitting handles a sole child, but replacing an arbitrary single sibling through it would also refit siblings. Bare child replacement does not import slice roots or own the paste caret. These general composition limits are inferred from the current signatures and source; the independent prototype proves the selected existing fitter route instead.

A new exact-block or child-interval API would expose another target or internal bridge and, in the terminal List form, bypass downstream middleware. No current caller needs that new contract once the existing fitter chooses its valid empty-block candidate. The saved broad fitter patch is rejected by the nested-only-object and empty-caption probes. The narrower local-candidate suppression prototype passes the main regressions but still uses that global opening cap, so it is not the chosen code.

The three realistic failures are losing a copied owner or its roots, rejecting a legitimate caption merge, and changing a required parent slot or ordinary target metadata. The named controls exercise each relevant boundary. A failure reverts this iteration's candidate and object branch together; the ordinary list fix remains reviewable. No public hard cut or app migration is needed.

### Plan panel round 1

Challenge delta: the selected owner and priority-candidate approach remain. The eligibility now uses the canonical semantic empty-block predicate, the candidate calls canonical structural admission, and Plate reuses full placement admission before keeping a line join. Plate also keeps incomplete rooted text copies open. The combined proposed code and source hashes are `artifacts/2026-10-13-list-paste/object-replan/semantic-prototype.patch` and `semantic-prototype-manifest.json` in that directory.

Astra and Sol identified one critical defect, counted once for the Codex family. The original prototype deleted a mention from a text-empty paragraph. The exact probe fails in `mention-prototype-red-a1.log` and passes in `mention-semantic-green-a3.log`. The build must add this public replacement regression. This also invokes `pstack:correct` on the rule that semantic checks share their existing owner. The pure predicate moves that owner instead of copying it.

Opus's copied-root warning reproduced as an exception when the head lost required roots. `boundaries-head-red-a1.log` fails on the original prototype; `boundaries-head-a1.log` accepts exactly the selected text, and `boundaries-owner-a1.log` preserves an actually copied owner and its body. Its capacity warning reproduced with a valid two-child container. `boundaries-capacity-red-a1.log` detects the wrong join; `boundaries-capacity-a1.log` passes through the existing placement owner. Both become cheap build regressions.

The callout and named-root controls assert the newly explicit scope in `warnings-semantic-a2.log`. The same log preserves an inline void at the copied tail and verifies subsequent typing after it. Both terminal-void cases match the intake document, caret and follow-up result byte for byte. The new candidate's canonical admission is shared; the old top-level text-merge branch remains because it also owns ordinary text behavior and metadata. Combining those different policies is unnecessary for this fix.

All three seats returned. Opus read only three columns of the older trail after row 60, so that seat's mandatory coverage is partial. Its other findings, the full dispositions and failed command attempts are recorded in `artifacts/2026-10-13-list-paste/object-replan/plan-panel-1/synthesis.md`. Round 2 reviews these changes because the critical fix earned it.

### Plan panel round 2

Astra identified one critical data-loss case. A text-empty `exclusive-portal` can own a nonempty body. The round-1 prototype removed that owner and its body. `target-owner-semantic-a1.log` records the loss. The candidate now checks the target's canonical content-root references before proposing whole replacement. This keeps the editor's existing local `isEmpty` meaning unchanged. `target-owner-final-prototype-a1.log` preserves the owner and body. The intake path already rejects this paste atomically because its fallback duplicates an exclusive owner, as `target-owner-control-a1.log` shows. This change preserves that refusal; it does not claim a successful paste into the owner. `warnings-owner-a1.log` still accepts an ordinary empty line inside a named root and an empty callout.

Sol's instrumentation warning is fixed. The probe requires the loaded fitter path and source hash. Omitting the preload now fails by name. A separate mutant adds two real admission calls, retains the original budget, and fails the stress cohort at 30,008 visits. The candidate remains at 10,004. The frozen ceiling intentionally allows two scans, so a single added scan can still pass. This is a bounded linear-work contract for the four accepted cohorts, not a bound on every rejection path. The recorded packets remain model proxies with loaded-host timing; they support no speed claim.

The complete dispositions and coverage gaps are in `artifacts/2026-10-13-list-paste/object-replan/plan-panel-2/synthesis.md`. The revised code is `owner-prototype.patch` in that directory's parent, with its manifest. This applied critical fix earns the third and final plan round. The third round is complete; its receipt follows.

### Plan panel round 3

No seat found a new critical issue. The final round's synthesis is `artifacts/2026-10-13-list-paste/object-replan/plan-panel-3/synthesis.md`. The plan reached its three-round cap and proceeds to the build. The corrected performance probe checks an expected source manifest; `object-cost-manifest-a1.log` passes on the reviewed bytes, and `object-cost-wrong-manifest-a1.log` rejects a different hash. The three-scan mutant fails the stress and top-level budgets, while the normal and large-copy budgets permit its extra work.

The durable body-retention test allows the existing atomic refusal without requiring it forever. A real prior edit makes its undo check meaningful. A separate case proves whole content can replace an empty line inside an element-owned body while its owner and history remain intact. `owner-regressions-final-a2.log` passes 262 tests against the unchanged proposal source. The proposed production source is still the four-file `owner-prototype.patch`.

## Native behavior and proof

| Behavior | Change | Proof |
| --- | --- | --- |
| First type at an empty target | Object and void content can replace a nested empty text block | Model prototype; final package proof covered by the final proof receipts in Close, except the remaining record audit and publication limit |
| List clipboard, caret and history | Original depth and numbering repair remains; an image-led copy also replaces a nested empty paragraph or heading | Keep the original native cases and add an image list head plus Tail through actual copy/paste, object rendering, no placeholder, model/DOM caret, typing, unchanged source and one-step history. Run the combined suite five times without retries on final bytes |
| Open caption and ordinary text | Existing calls retain their merge behavior | Metadata and caption prototype controls; final media and shared-owner contracts required |
| Terminal void | Existing Plite caret behavior | No new editable successor is claimed; current behavior is outside this repair |

## Scale contract

Benchmark runs inside this plan. The measured operation remains paste, with copied item count, surrounding blocks and changed following numbers as independent variables. The original ten cohorts, frozen work budgets, source fingerprints and correctness assertions remain binding. The architecture probe replays one packet against the narrow prototype before the plan panel, then the final build runs the five paired packets after its last code edit. Loaded-host time is inconclusive and cannot support a speed claim. Acceptance rests on deterministic work with native correctness, as the original Defaults already record.

The added object cohorts cover 10 and 10,000 surrounding blocks, 2 and 2,000 copied blocks, and a matched top-level control. `object-cost-contract.json` freezes admission-loop budgets from the intake count and a two-scan linear ceiling before candidate results. `object-cost-semantic-a1.log` passes with 14, 10,004, 4,010 and 10,004 visits. `object-cost-negative-a1.log` rejects a zero budget with the named assertion. This counts the retained-sibling admission loop that the original probes miss. It does not count all fitter work or prove constant-time paste. Nested intake loses the head type and is only a wrong-behavior control. The final build repeats these cohorts five times, alternating with intake, alongside the original ten cohorts. No speed comparison is claimed.

The nine lanes keep the original plan's scope. Source identity, paste work, the named native clipboard route, and large/stress documents apply. Product-versus-main speed, wrapper-tax attribution, mount timing, pinned-Slate speed and unrelated example breadth are not claimed.

## Steps

- [x] Ground object boundaries, current candidates, configured targets and materially distinct callers through how. Proof: `artifacts/2026-10-13-list-paste/object-replan/how/answer.md` and the lead's source inspection.
- [x] Run architect and choose a target against the incumbent and a materially different alternative. Proof: `artifacts/2026-10-13-list-paste/object-replan/architect/synthesis.md` and `artifacts/2026-10-13-list-paste/object-replan/edges-priority-asserted-a1.log`.
- [x] Finish this plan, its decision ledger and proof boundaries; run the plan panel. Proof: `artifacts/2026-10-13-list-paste/object-replan/plan-panel-3/synthesis.md`, reviewed at 2afecfcd4400c3ddc030f9a09104e4b736e9ac3a before production behavior edits.
- [x] Build the selected mechanism and its cheap red/green regressions. Proof: `artifacts/2026-10-13-list-paste/object-replan/production-regressions-a1.log`, `artifacts/2026-10-13-list-paste/object-replan/target-owner-mutation-a1.log` and `artifacts/2026-10-13-list-paste/object-replan/production-native-smoke-a2.log`.
- [x] Verify the shared consumers and applicable Plite/Plate check steps. Proof: current AI acceptance, Copilot, table single-cell/exact-child paste, code-block paste, detached fitContent, media, transfer/clipboard, transaction, roots and collaboration contracts plus types; recorded full-check failures without claiming complete base attribution. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Add the Plite patch changeset and reconcile the public list docs and editor behavior law through plate-docs. Proof: changeset review, both docs languages and scoped docs checks. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Run writing passes and the diff panel, then final scoped lint fix. Proof: writing and diff review completed; further type/lint and unresolved full-check attribution were skipped under the `full checks` default. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Rerun the original six comparison cases, repeated native clipboard proof and affected scale contracts on final bytes. Proof: saved final fingerprints, inspected screenshot, five retry-free runs of both ordinary and object native cases, original work budgets and the object admission budgets. Evidence: `artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md`, `artifacts/2026-10-13-list-paste/type-replan/final-native-and-docs-a2.log`, `artifacts/2026-10-13-list-paste/type-replan/final-work-counts-a1.log` and `artifacts/2026-10-13-list-paste/type-replan/final-object-counts-a1.log`; further type/lint skipped after the owner correction.
- [x] Reconcile both plans, decision audit findings, full counts, reflection and the existing page. Proof: `artifacts/topics/list.html`, `artifacts/2026-10-13-list-paste/type-replan/final-trail/disposition.md`, `artifacts/2026-10-13-list-paste/type-replan/final-reflect/synthesis.md` and the recorded publisher capability limit.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Object mechanism reverted before replanning | yes | Saved patches and `object-replan/reverted-object-quote-a1.log`; actual nested-object assertion fails |
| How and architect | yes | `artifacts/2026-10-13-list-paste/object-replan/architect/synthesis.md`; three candidates, blind judge and explicit boundary assertions |
| Plan panel | yes | Three rounds completed; `artifacts/2026-10-13-list-paste/object-replan/plan-panel-3/synthesis.md` |
| Public API break | no | skip: none selected; reopen if the chosen design changes it |

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Shared fitter callers and type checks | yes | artifacts/2026-10-13-list-paste/type-replan/production-product-consumers-a1.log and production-raw-consumers-a2.log; further type checks skipped after owner correction. |
| Diff panel and writing | yes | artifacts/2026-10-13-list-paste/type-replan/build-panel-2/synthesis.md; deslop/no-comments receipts in type decision log; final prose unslop/bro. |
| Final original-goal acceptance | yes | artifacts/2026-10-13-list-paste/type-replan/final-comparison-cases-a1.log, final-native-and-docs-a2.log, final-work-counts-a1.log and final-object-counts-a1.log. |
| Decision audit, reflect and page | yes | artifacts/2026-10-13-list-paste/type-replan/final-trail/disposition.md and final-reflect/synthesis.md; local page rendered, remote publication remains blocked by the recorded capability limit. |

## Proof

The saved historical candidate is `825a6c2aad6491205a46d8a6d0745db7f0724ed6`. The current reverted case fails with the named type-loss assertion. Final proof must run after the new design's last change. The original plan's six comparison data cases and real Chromium route remain acceptance requirements.

## Open work

- An extracted partial rooted object at the trailing edge can throw for missing roots through ordinary open fitting. `boundaries-tail-intake-a1.log` reproduces it in the intake export and `boundaries-tail-a1.log` in the prototype. This iteration does not close that boundary or claim to fix the existing tail fitter. Track in the list subject at close. owner: natamox. stop: a separate clipboard repair preserves this partial tail without inventing omitted roots, or the owner declines that custom-object case.

- A partial copied rooted head preserves selected text but can lose its first item's list fields in the existing open fallback. The durable test asserts selected content and actual roots, not that numbering loss is desirable. Track in `docs/plans/topics/list.md` at close. owner: natamox. stop: a separate rooted-copy repair preserves list identity without inventing omitted roots, or the owner declines that case.
- Top-level closed object paste can delete an unselected mention or the nonempty body of a text-empty root-owning block under the old fitter. `owner-top-intake-a1.log` and `owner-top-prototype-a1.log` reproduce the latter in both versions. `round2-mention-top-intake-a1.log` and `round2-mention-top-semantic-a1.log` reproduce it before this new candidate. Track in the list subject at close. owner: natamox. stop: the existing boundary producer preserves the mention and owned body, or the owner declines those broader clipboard cases.
- Plate's promotion admission and Plite's structural admission use different contexts. The supplied protected-paragraph override probe did not install a protected behavior, so it establishes no mismatch. Unknown-tail and ancestor-sensitive mismatch remain inferred, outside the current verified schema cases. Track in the list subject at close. owner: natamox. stop: a valid public schema reproduces a mismatch and its owner is repaired, or the hypothesis is disproven.

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

Reviewed inputs for this iteration: `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/ai/react/CopilotPlugin.tsx`, `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`, `packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts`, `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/src/core/slice-fit/frontier.ts`, `packages/plitejs/test/slice-fit-contract.test.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `docs/plans/2026-10-13-list-paste.md`, `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/vision/plate.md`. The final mechanism is owned by the type-adoption continuation; a listed input is review context, not a claim that every file changed.

The repository ledger check remains partial. This task repaired its missing Close input references. The ledger also rejects ignored local screenshots required by the page workflow and reports unrelated older records; those files were not changed. No ledger-green claim is made. Evidence: `artifacts/2026-10-13-list-paste/type-replan/final-records/ledger-close-a1.log`.
