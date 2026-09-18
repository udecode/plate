---
review_scopes: [suggestions, authored]
review_basis: [2026-09-17-suggestions-authored-editing-final]
work_kind: implementation
---

# Authored direct editing with visible suggestions

Status: Complete. Native, Plate, product-root, documentation, doctrine and browser proof are closed.

Objective:
Make the playground and AI editor open in Editing while existing suggestions remain visible and reviewable. Settle native input/publication ownership, pending-content semantics, Plate adoption and exact proof.

Flow mode:
Agent-led execution.

Goal plan:
docs/plans/2026-09-17-authored-direct-editing-with-visible-suggestions.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Mode:
Standard; embedded Benchmark probe and one bounded read-only adoption worker.

Completion threshold:
The accepted native, Plate, product-root, documentation and doctrine changes pass P1–P8, including exact browser replay on both product routes.

Verification surface:
Planning: native capture/classify/map/apply experiment; current self-edit, input/history and causal contracts; source fingerprints; local links and validator. Execution: P1–P8 below, including both exact product routes.

Constraints:
- Editing by default and visible suggestions must hold together.
- Native authored state owns content, identities, attribution, dependencies and decisions. Exact mounted views own presentation and input intent; readOnly is independent.
- No accepting suggestions for visibility, save/switch/restore input handlers, parallel suggestion store, compatibility aliases, or generated application contracts.
- Product, generated registry and workflow source changes are authorized where required by the accepted plan. Git publication remains out of scope.
- Preserve unrelated changes in the authorized checkout, branch next.

Boundaries:
In scope: edit/markup and edit/proposed, pending-content interaction, coordinate/publication ownership, root defaults, mode controls, history, clipboard, Yjs, persistence, documentation and proof.
Non-goals: replacing authored storage, new public policy layer, changing every raw Plite default, general suggestion parity, independent comments work, table redesign or release.

Blocked condition:
A contradictory native invariant or failed bounded probe prevents target acceptance. No such blocker remains for this bounded design. Production/native-browser proof remains required in execution.
Pending live content remains editable. A gesture that depends on pending content remains reviewable with true attribution; this is the settled target, not an unresolved preference. Protecting all pending spans would make visible content unexpectedly non-editable and discard native dependency/amendment behavior that already has real consumers and tests.

Plite Plan state:
- phase: closure
- next: none
- handoff: consumed

Decision brief:
- Chosen shape: existing EditorRoot authored, with separate intent and projection.
- Strongest cut: delete fixed editing→accepted / suggesting→markup presets and the internal flag's dual role as coordinate basis and publication status.
- Keep native authored storage/positions/decisions and Plate's existing review/decorations plugin.
- Consequence: ordinary accepted-content edits are direct; edits depending on pending content remain reviewable. Do not partially accept one mixed replacement.

## Public API target

Normal path:

```tsx
import { EditorRoot } from 'platejs/react';
import { Editor } from '@/registry/components/editor/editor';

<EditorRoot
  editor={editor}
  authored={{ intent: 'edit', projection: 'markup' }}
>
  <Editor />
</EditorRoot>
```

Clean proposed presentation uses the same input with projection: 'proposed'. Accepted-only remains an explicit useful view. Target union, owned by EditorViewOptions and inherited by AuthoredView:

```ts
type AuthoredView =
  | { intent: 'edit'; projection: 'accepted' | 'proposed' | 'markup' }
  | { intent: 'propose'; projection: 'proposed' | 'markup' };
```

Five valid combinations. Propose/accepted would hide pending text as the user types, so it remains unsupported. Read-only snapshot readers can use edit intent for all projections. Omitted native policy remains edit/accepted.

Keep the existing names. `projection` precisely selects accepted, proposed, or markup presentation. `intent: 'edit'` describes the user's requested editing mode without falsely promising that a gesture causally dependent on pending content can be published directly. A new `mode`, `visibility`, or `write: 'direct'` field would either couple the axes again or lie about that contextual case.

Exact-view controls retain their real imports:

```ts
import { DefaultAuthoredPlugin } from 'platejs/authored';
import { SuggestionPlugin } from 'platejs/suggestion/react';

editor.plugin(SuggestionPlugin).api.setMode('editing');
// Preserves the current projection.

editor.plugin(DefaultAuthoredPlugin).api.setView({
  intent: 'edit',
  projection: 'accepted',
});
// Explicit accepted-only presentation.
```

setMode('editing') preserves projection. setMode('suggesting') preserves markup/proposed; from accepted it selects markup to keep pending input visible. read.mode/useSuggestionMode remain intent-derived. This small Plate adapter owns a product transition, not state. Viewing changes readOnly only.

## Native behavior contract

| Input context | Editing result | Attribution/review |
| --- | --- | --- |
| Accepted-origin content without unresolved prerequisites | Direct edit at the visible location | Canonical accepted content changes; existing pending identities/status survive |
| Immediately outside a pending insertion | Direct edit at its stable outside boundary | Adjacency alone does not inherit proposal status; preserve left/right ordering |
| Inside or replacing own pending live content | Existing native pending amendment behavior | Preserve the owner's identity where self-edit semantics permit; never implicitly accept |
| Inside another author's pending live content | Dependent pending edit | Attribute to current writer; never amend another author's identity |
| One replacement/structural gesture spanning accepted and pending content | Entire dependent transaction remains reviewable | Existing self-edit partitions may amend owned parts/create pending parts; no silently accepted subset; one undo group |
| Accepted text with pending formatting/movement | Classify actual prerequisites, not paint or birth alone | Independent command can be direct; dependent command remains reviewable |
| Retained deletion/move fragment | Existing fragment-owned editing/protection | Own retained edits amend their deletion; foreign retained deletion content remains protected |
| Conflicted prerequisite | Existing conflict ownership | Unsupported mutation aborts atomically; typing must not implicitly resolve a conflict |
| readOnly | Select/copy/inspect/change projection | No text mutation or implicit decision |

Rejecting a parent with a foreign dependent edit still uses the existing blocked-decision result and dependency selection UI; do not auto-cascade. Multiple emitted contributions remain one history transaction.

Composition uses the existing own-change grouping and a stable resolved publication context for its lifetime. Mode/projection reconfiguration during composition remains delayed. Native selection owns affinity; no new public input option. Editing at an outside boundary must not use suggesting mode's “extend adjacent suggestion” heuristic.

Explicit tx.authored.propose remains an intentional override. Review, receive, replacement, revert and undo keep their dedicated paths. They must all stop deriving input coordinates from proposal status.

## Runtime design and invariants

1. Choose the input document from the exact view's projection: accepted uses accepted positions; proposed/markup uses live proposed content/positions. Markup retained fragments keep their separate native binding.
2. Replace active.proposed with explicit private transaction state: `inputProjection: 'accepted' | 'proposed'`, `intent: 'edit' | 'propose'`, and `publication: 'unresolved' | 'accepted' | 'proposed'`. Projection selects coordinates, intent supplies the requested policy, and publication records the resolved authored operation kind. Commit metadata consumed by Yjs reports actual input projection.
3. Capture against the actual input snapshot using existing stable contribution identities. In Editing, inspect captured prerequisites in the transaction's causally observed state. An ordinary accepted publication must not require unresolved pending content.
4. Direct path: use one private direction-aware authored mapping owner to project the captured input change into accepted coordinates, validate both resulting documents, publish the canonical accepted change, and preserve visible selection in input coordinates. Reuse or extract `mapAuthoredChange` only if its accepted-edit behavior is proved symmetric for projected→accepted input; the prototype does not grant that undocumented meaning to `acceptedEdit`.
5. Dependent path: reuse native proposal/amendment capture and existing text/structural partitions. No new general partition engine or splitting a gesture into accepted and pending commits.
6. Read-your-writes, anchors, command specs, clipboard, normalization and finish must use the same input basis. A change must be applied to the snapshot length it was built against. Mapping/validation failure aborts the whole transaction.
7. History retains canonical changes, authored operations and exact-view selections with independent meanings. Yjs uses those operations and actual coordinate metadata; view mode is not shared document state.
8. `tx.authored.propose()` forces proposed publication and proposed input before ordinary writes. It may not switch coordinate bases after a document change has started; existing mixed-write rejection remains. Review, receive, replacement, revert and history select their own explicit input/publication states instead of inheriting view intent.
9. Reuse checkpoint/wire shapes unless an actual serialized field changes. Preserve saved IDs, attribution and comments links. Source version is authoritative; no speculative checkpoint bump or seed replay.

Do not reject received operations merely because a dependency is pending in the receiver's current state: concurrent review and delivery order can differ. Classification uses causal state at authoring; existing replay/conflict semantics own receive. Reordered-delivery tests are mandatory.

The direct hot path has one capture, dependency checks over captured prerequisites, and one direction-aware map. Dependent edits may use at most one additional classification capture before the existing pending path. No scan of every change, DOM scan, second projection store, or new view subscription.

## Design-time evidence and hard-cut comparison

| Current fact | Source |
| --- | --- |
| edit restricted to accepted, runtime rejects edit/markup | packages/plitejs/src/interfaces/editor.ts:1762; src/authored/authored.ts:603 |
| Proposal flag selects coordinates/publication | packages/plitejs/src/authored/authored.ts:420–529, 1694, 1769, 2190–2468, 2650 |
| Identity capture/map and self-edit partitions already exist | packages/plitejs/src/authored/steps.ts:275, 403, 526, 2112, 2467 |
| Only original author amends; pending prerequisites affect decisions | packages/plitejs/src/authored/state.ts:1906; decisions.ts:100–196 |
| Mode overwrites both fields | packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts:6 |
| React reconciliation already separates fields | packages/plitejs/src/react/components/plite.tsx:315 |
| Yjs effects consume commit input projection | packages/plitejs/src/yjs/core/shared-effect-log.ts:1017 |
| General roots omit policy | apps/www/src/registry/examples/playground-demo.tsx:207; registry/blocks/editor-ai/components/editor/rich-text-editor.tsx:56 |
| Browser proof separates typing from visible suggestions | apps/www/tests/browser/suggestion.spec.ts:50–155 |

Paths abbreviated after semicolons inherit their owning directory. Line anchors refer to the inspected snapshot; probe hashes identify the native receipt.

Rejected alternatives:
- Delete intent: loses the explicit track-changes job.
- Delete projection: loses accepted/proposed presentation and snapshot export jobs.
- Delete SuggestionPlugin: moves real review/decorations/interaction jobs to callers and leaves the native restriction.
- Replace editing→accepted with editing→markup only: still destroys a selected proposed view and does not fix native input.
- Protect all pending live spans: interrupts editing unnecessarily where native amendment/dependency semantics exist.
- Accept first or synthesize CSS-only text: corrupts review intent or bypasses native input ownership.
- General per-span accepted/pending planner: unnecessary new owner and surprising partial acceptance of one gesture.
- New storage/mapper package: no missing independent owner; the executable probe supports native reuse.
- Rename `intent` to `mode` or `write: 'direct'`: rejected. `mode` belongs to Plate product controls, and `direct` would misdescribe causally dependent edits. The orthogonal native names are already the smallest truthful public API.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| View policy | Coupled presets | Five valid combinations | Plite EditorViewOptions | Direct visible editing | Validator/types/readers/docs | P1/P4 | Union-only change unsafe | rearchitect |
| Input/publication | One dual-purpose flag | Explicit input projection, requested intent and resolved publication | Authored transaction | Visible and canonical offsets differ | Reads/specs/commits/history/Yjs | Probe, P2/P3/P5 | Stale draft/partial remap | rearchitect |
| Pending interaction | Direct accepted-only input | Contextual publication via native dependencies | Capture/state | Keep review reversible and attributed | Existing self-edit/fragment owners | Semantic probe, P2/P3 | Format/move dependencies | rearchitect |
| Fixed mode pairs | Projection overwritten | Preserve projection; normalize accepted→suggesting | BaseSuggestionPlugin | Product transition | Toolbar/tests | P4/P6 | Hiding pending work | cut |
| Storage/decisions | Native causal graph | Same authority | State/decisions/checkpoint | Durability and convergence | No caller store/seed replay | Existing contracts, P3/P5 | Accepted dependant blocks rejection | keep |
| Review presentation | Decorations and click/review state | Same plugin, no visibility authority | Plate SuggestionPlugin | Independent presentation job | Root policy/selectors | P4/P6 | Stale active item | keep |
| General defaults | Inherit edit/accepted | Explicit edit/markup at two roots | Registry | Product policy | Playground/editor-ai | P6/P8 | First paint/hydration | move |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Native authored/core | Widen union/validator; replace active.proposed with the private three-state contract; implement direction-aware direct projected input; inspect every former boolean consumer | Plan accepted | New combinations work before UI adopts them; no coordinate/publication inference remains | P1/P2, frozen mapping contract on production path |
| 2 | Capture/fragments/history | Pending dependencies, amendments, mixed gestures, composition, selection, rollback | Slice 1 | Review remains reversible; one undo group; true attribution | P2/P3, bounded classification capture |
| 3 | Yjs/checkpoint/format | Input metadata, awareness, save/reload, reordered receive, read-only readers | 1–2 | Peers/restored editors agree on both projections and identities | P5, complete native operation measurement |
| 4 | Plate/registry | Projection-preserving controls; two edit/markup roots; dedicated demos stay proposing; view demo simplification | 1–3 | Both default behaviors hold together | P4/P6/P8, mounted performance |
| 5 | Docs/doctrine/Verify Plate | Current-state teaching, required doctrine repair/mirrors, registry and final proof | Behavior passes | Fresh joint browser and production cost evidence | P7/P8 and strict closure |

Proof matrix:
| ID / claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| P1: combinations and view lifetime | Type/validator/root source | Authored-view contracts, Plate types, sibling views/equivalent rerenders/readOnly | Complete: edit supports accepted/proposed/markup; propose supports proposed/markup |
| P2: direct projected edits | Owner probe + six semantics | Public update/command chain, before/inside/across insert/delete/format/move; roots/atoms/split/merge; values/lengths/IDs/selection/rollback | Complete: focused authored contracts and production probe pass |
| P3: review/undo/retained content | 76 current self-edit/history/causal tests | Contextual cases, fragments, composition, undo/redo, accept/reject | Complete: authored, React and Yjs partitions plus direct composition coverage pass |
| P4: mode preserves projection | Consumer audit | BaseSuggestionPlugin/SuggestionPlugin specs and types | Complete: Editing preserves projection; Suggesting upgrades accepted to markup |
| P5: persistence/convergence | Commit/checkpoint/causal source | Mixed-policy peers, reordered receive, review/undo, reload/format | Complete: full Yjs partition and focused authored Yjs contracts pass |
| P6: user's joint requirement | Screenshot and old proof gap | `/blocks/playground` and `/blocks/editor-ai` joint reporter interaction | Complete: 26/26 fresh product browser cases plus clipboard replay pass |
| P7: mapping and mounted cost | Four-cohort receipt | Production complete-operation probe and mounted browser contracts | Complete: four production cohorts, two typing cohorts, four mounted cohorts and four www cohorts pass |
| P8: integration/teaching | Live command inventory | Types/lint/tests, registry, browser, doctrine/docs mirrors | Complete with one unrelated checkout-wide www type-contract failure recorded below |

Execution commands, from repository root unless noted:
- Focused native: `bun test ./packages/plitejs/test/authored-view-contract.test.ts ./packages/plitejs/test/authored-command-lifecycle-contract.test.ts ./packages/plitejs/test/authored-self-edit-contract.test.ts ./packages/plitejs/test/authored-history-input-contract.test.ts ./packages/plitejs/test/authored-causal-contract.test.ts`.
- Native closure: `pnpm --filter plitejs test:partition:authored`, `pnpm --filter plitejs test:partition:yjs`, `pnpm --filter plitejs typecheck`, and affected lint/DOM checks.
- React from packages/plitejs: `bun run test:react test/react/authored-view.test.tsx test/react/authored-fragment-provider.test.tsx`.
- Plate: `pnpm --filter platejs test:partition:suggestion`, `pnpm --filter platejs test:partition:suggestion-react`, `pnpm --filter platejs typecheck`, affected lint.
- Native browser: `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/authored-changes.spec.ts`. Performance: adjacent authored-performance.spec.ts and authored-mounted-performance.spec.ts. Serialize managed browser runs.
- Product: `pnpm --filter www test:www-browser:chromium tests/browser/suggestion.spec.ts`, then affected clipboard.spec.ts and suggestion-performance.spec.ts. This www script reuses a dev server; it is not the managed Plite runner. Bind serving source identity and build its actual @platejs/test artifact dependency. Use a fresh owned server if identity is uncertain.
- Registry on next: `pnpm --filter www build:registry`. Barrels: `pnpm brl` only if exports/exported-folder membership change. Never manually edit generated registry/templates.
- Final runtime closure: `pnpm check:plite`, `pnpm check:plite:browser-matrix`, `pnpm --filter www typecheck`, affected docs checks, and fresh exact product routes.

P6 must restore strict recordBrowserRuntimeErrors around the direct-typing interaction. Previous hydration details-ID and first-painted suggestion failures remain unresolved execution work, not established unrelated failures. Do not remove the recorder or enter Suggestion mode to pass the default-Editing test. Replay the earlier native data-transfer regression and ensure no “Cannot apply change length …” exception; inspect the supplied recordings for exact gestures during execution.

Scale contract:
- Applicability: new reverse mapping on native typing. Existing authored capture/classify/map/apply is the disputed owner.
- Artifacts: [probe.ts](artifacts/2026-09-17-authored-editing-probe/probe.ts), [result.json](artifacts/2026-09-17-authored-editing-probe/result.json).
- Command: `bun docs/plans/artifacts/2026-09-17-authored-editing-probe/probe.ts`.
- Baseline: capture accepted insert, classify, map to projected, apply both. Candidate prototype: equivalent projected insert, classify, map to accepted, apply both. Same source/process/fixture/action; alternating order. This proves the position/capture primitives can express the mapping, not that the current `acceptedEdit` flag is the final production API or a symmetric semantic contract.
- Cohorts fixed before measurement: 10 blocks/1 change; 1,000/100; 10,000/1,000; one block/200 changes. Insert after pending text PENDING, with different visible/canonical offsets.
- Frozen budget: candidate p50 ≤ baseline p50 + max(1 ms, 25% baseline); p95 ≤20 ms. Forty-one samples after eight warmups; cold duration recorded separately. No override.
- Counters: one capture, one map, one captured step/target in each path; serialized checkpoint bytes and SHA-256 source fingerprints. Call counts do not prove constant-time internals; stress still grows with document size.
- Correctness: identical accepted/projected outputs and dependencies versus baseline; exact resulting text. Six diagnostics assert outside/boundary direct versus inside/deletion/mixed pending classification and no foreign amendment.
- Scope: disputed-owner prototype only. No complete publication, browser, caret, retained-DOM, Yjs or user-perceived latency certificate. The 20 ms limit is a mapping-unit limit.
- Production rerun: preserve the design receipt, adapt the same command to invoke final public edit/markup updates through the settled direction-aware mapper, retain the isolated mapping measurement with identical budget/cohorts, and compare entire accepted-input versus projected-input updates using the same relative p50 allowance. Add a correctness case where reverse mapping encounters pending-only content and must classify it as proposed rather than silently drop it. Do not infer a whole-operation absolute 20 ms promise.
- Mounted rerun: authored-performance.spec.ts, authored-mounted-performance.spec.ts, www suggestion-performance.spec.ts with the new view combination and existing budgets; record input-to-commit/paint, renders/publications and source identity.
- Fan-out/privacy: no DOM/subscribers/network in the native probe; synthetic values only. Same storage authority, no duplicate payload. Use existing opt-in profiling; no telemetry service or document/author data collection.

| Cohort | Baseline p50 ms | Candidate p50 ms | Candidate p95 ms | Candidate cold ms | Checkpoint bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| normal | 0.196 | 0.189 | 0.341 | 0.544 | 4253 |
| large | 0.627 | 0.631 | 0.818 | 0.782 | 379156 |
| stress | 6.530 | 6.463 | 10.808 | 6.196 | 3815510 |
| dense | 0.255 | 0.264 | 0.280 | 0.294 | 493041 |

Receipt: 2026-09-17T17:11:00.559Z, Bun 1.3.12, Darwin, Apple M5 Max. All cohorts pass. Raw samples preserve noise; these small p50 differences do not establish a speedup.

Conditional evidence:
- External research/legal provenance: N/A; local source directly resolves the missing combination; no external code reused.
- Browser: mandatory in execution; not launched for this planning artifact. Native tests are not browser proof.
- Publication/release: N/A; no authority requested or implied.
- Benchmark: embedded design-falsification scope, not full Benchmark certification. Final production/mounted contract above.
- Doctrine in execution: Maintain Workflow owns editing .agents/rules/best-api.mdc's authored initialization law and the smallest docs/vision/plite.md and plate.md owners. State intent does not determine visibility/input coordinates. Audit plate-ui, plite-plan, plate-plan and plate-plugin-creator teaching; edit contradictions only. Append .agents/rules/plate-next/versions.json, preserve attestations, run pnpm install, prove generated mirrors. No doctrine change is implemented in this planning pass.
- Docs: content/docs/(plugins)/(collaboration)/suggestion.mdx, content/docs/(guides)/authored-changes.mdx, content/docs/api/core/plate-components.mdx and docs/plite/reference/public-docs/libraries/plite-authored.mdx, plus corresponding .cn.mdx pages where present. Teach current behavior, not migration history.
- No new package or entrypoint. Source-first types and next registry generation apply during execution.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt/authority/current owners | yes | Objective, boundaries, source table and consumed read-only adoption worker |
| Best API target | yes | Public target and maximum-value hard-cut comparison |
| Scale applicability/performance pack | yes | Native reverse mapping hot path |
| User operation and owner | yes | Direct typing with visible suggestions; authored transaction |
| Cohorts and frozen budget | yes | Probe contract; four cohorts; no overrides |
| Baseline/target/correctness | yes | Scale contract and passing result.json |
| Detector/privacy decision | yes | Existing profiling; synthetic input; no new telemetry |

Work Checklist:
- [x] Outcome, scope, constraints, source claims and owner boundaries are concrete.
- [x] Public call shape and hard-cut counterfactual are resolved.
- [x] Canonical state, view policy, input coordinates and publication are separated.
- [x] Every decision has adoption, proof, risk and verdict; no private bridge.
- [x] Scale-sensitive ownership has passing executable baseline/target evidence.
- [x] Complete-operation production/native-browser proof is required in execution and not claimed by the owner prototype.
- [x] Applicable normal/large/stress/dense cohorts, warm/cold samples, payload, counters and source identity are recorded.
- [x] No new cache/index/store/scheduler/subscription is justified; existing native identity/mapping wins.
- [x] Pending/foreign/mixed/retained/conflict/composition semantics and execution slices are specified.
- [x] Proof extends existing owners for missing costly cases only, with production rerun contracts.
- [x] Database parallelism is N/A: no database; mutation/publication stay serial per transaction.
- [x] No protected data or budget override; conditional doctrine/docs and registry work are assigned.
- [x] Fresh planning verification and final handoff are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve target, decisions and adoption | Complete: five public combinations and projection-preserving modes shipped in the checkout |
| Fresh source | yes | Check fingerprints/decision-changing claims | Complete: production probe and managed browser runs bound source identity |
| Best API review | yes | Resolve material call-shape findings | Complete: intent, projection and resolved publication have separate owners |
| Pre-acceptance scale | yes | Passing matched native-owner probe | Complete: `result.json`, four cohorts |
| Warm/large/stress/cold/payload | yes | Record bounded receipt/scope | Complete: raw samples, counters, payload and failed receipt preserved |
| Complete operation/final production rerun | yes | Run final owner and mounted contracts | Complete: production probe, native typing/mounted and www performance suites pass |
| Correctness guard | yes | Outputs/classification/current contracts | Complete: native, React, Plate, Yjs, clipboard and exact product-route proof pass |
| Fan-out/detector/privacy | yes | Existing owners, no speculative infrastructure | Complete: no new store, telemetry or visibility owner |
| Conditional risk/adoption | yes | History/Yjs/DOM/docs/regeneration contracts | Complete: P1–P8 evidence below |
| Verification/handoff | yes | Checks and execution packet | Complete: registry, docs, doctrine, lint and runtime receipts recorded |
| P1 autoreview | N/A | Never run helper on `next` | Direct source review and exact executable proof used |
| Goal plan complete | yes | Run check-complete | Passed after the final evidence reconciliation |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Native/Plate/proof owners read | Decide |
| Decide | complete | Target, semantic rules, hard cuts and mapper receipt | Implement |
| Implement | complete | Native transaction policy, Plate modes, two product roots, docs and doctrine | Prove |
| Prove and hand off | complete | Exact tests, managed browser receipts, production probe, registry and validators | None |

Findings:
Removing propose/markup selects edit/accepted and hides additions. Forcing propose/markup suggests ordinary typing. Widening the union alone leaves projected changes applied to the wrong snapshot.

Blind reverse mapping is also insufficient: a deletion across pending content can map into accepted output while retaining a pending prerequisite. Publishing that as accepted can prevent rejection of its parent under current decision laws. Classify publication before emitting it.

Yjs is an indirect consumer of the same conflation. Updating only React and mode presets would miss commit projection encoding.

Review fixes:
Cut the proposed general mixed-publication planner in favor of existing pending transaction semantics. Preserve selected projection rather than substitute another fixed preset. The final model pass also replaced the prototype-specific reverse use of `acceptedEdit` with a direction-aware mapping contract, made pending-content editing a settled law, and required explicit input/intent/publication transaction state. Joint product-route proof closed the earlier hydration and first-paint failures.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Raw tokens passed to RootChange instead of PreparedTokenSlice | 1 | Use owning constructor | Corrected; probe passes |
| Guessed absent owner/test filename | 2 | Bounded file discovery | Actual steps/contracts located |
| Formatter unavailable / artifacts ignored | 3 | Keep probe as authored, no tooling churn | No formatter success claimed |
| Patch attempted delete/add same plan in one call | 1 | Single update hunk | No partial write; replaced template successfully |
| Applied the isolated 20 ms mapper ceiling to the complete update | 1 | Restore the plan's relative whole-operation comparison | Failed receipt preserved; corrected production probe passes |
| Native browser read compact operations as the retired record-tree shape | 1 | Decode the public persisted operation tuples | Corrected oracle; native browser proof passes |
| Large typing expected automatic DOM omission | 1 | Follow explicit-virtualization doctrine | Corrected oracle requires complete ordinary Editable DOM |
| Mounted heap used one noisy post-GC denominator | 1 | Take three identical readings and compare medians | Corrected contract passes |
| Performance passes ran concurrently despite a one-worker contract | 1 | Configure the suites serially with zero retries | v5 contracts pass all six cohorts |
| Unrelated editor-test mutation invalidated a valid managed run | 2 | Preserve integrity and rerun after source stabilized | Final accepted run passes without invalidation |

Verification evidence:
- Focused authored/Yjs closeout after formatting: 123 pass, 0 fail. Earlier full proof includes authored 114, authored partition, Yjs partition 273, React 64, focused Yjs 65, Plate suggestion 4 and suggestion React 7.
- Exact product proof: `/blocks/playground` and `/blocks/editor-ai` suggestion suite 26/26; native clipboard replay 2/2; strict runtime error capture remained enabled.
- Native managed browser: authored behavior 55/55. Typing v5 normal and large each pass 3/3 in one worker. Mounted v5 views-1, views-2, views-8 and fully-mounted-large each pass 3/3 in one worker.
- Product performance: normal, large, stress and pathological cohorts pass 4/4.
- Production probe: `result.json` passes four cohorts for isolated mapping and complete public edit/markup updates. `result-failed-complete-operation.json` preserves the invalid absolute-budget attempt.
- Integration: Plite production build and app typecheck pass; suggestion lint partitions, authored lint, React lint and Yjs lint pass; scoped `git diff --check` passes.
- Documentation and generated output: `www build:source`, `www check:docs`, `www build:registry`, `pnpm install`, generated skill mirrors and Plate Next v210 validation pass.
- Full `www typecheck` reaches package-integration checking and reports two pre-existing checkout conflicts: the unchanged API-key contract omits installed `history`, and an unrelated table API edit removes `getColumnCount`. Authored source/type contracts and the Plite app typecheck pass. Plite/Plate package-wide typecheck remains blocked by the existing TS6202 circular project references; direct source checks pass.
- No commit, push, PR, release or unrelated-checkout cleanup performed.

Final handoff:
- Public API: `authored={{ intent: 'edit', projection: 'markup' }}` gives direct accepted editing while pending suggestions stay visible.
- Runtime law: projection selects input coordinates, intent requests publication policy, and the transaction records the resolved accepted/proposed publication. A pending-dependent gesture remains reviewable with the current author.
- Plate: changing mode preserves the selected projection; entering Suggesting from accepted selects markup so pending work cannot disappear.
- Product: playground and editor-ai explicitly open in Editing with markup projection. Existing pending additions, deletions and overlaps remain visible, reviewable and stable across undo, paste and mode round trips.
- Storage: current checkpoint/wire formats and native authored identities remain authoritative; no second suggestion store or public policy layer was added.

Timeline:
- 2026-09-17 Plan created; native evidence and independent adoption mapping consumed.
- 2026-09-17 Frozen owner/classification probe and 76 current contracts passed.
- 2026-09-17 Target and execution/proof packet finalized.
- 2026-09-17 Native intent/projection/publication separation, Plate adoption and explicit product roots implemented.
- 2026-09-17 Exact browser, persistence, composition, clipboard and product-route regressions closed.
- 2026-09-17 Production/mounted performance contracts corrected where their oracles contradicted current storage, rendering or execution law; all final v5 cohorts passed.
- 2026-09-17 Docs, doctrine v210, generated registry and closeout verification completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete implementation and proof |
| Where am I going? | Final user handoff |
| What is the goal? | Default direct editing with visible, reviewable pending suggestions |
| What have I learned? | Coordinates/publication must be separate; accepted edits cannot accidentally depend on undecided content |
| What have I done? | Native/Plate/product adoption, docs/doctrine, registry and exact correctness/performance proof |

Open risks:
No unresolved authored-editing correctness risk remains in the accepted scope. Checkout-wide package integration still has the unrelated history/table type-contract drift recorded above; package-wide Plite/Plate TypeScript project references still form the known TS6202 cycle.
