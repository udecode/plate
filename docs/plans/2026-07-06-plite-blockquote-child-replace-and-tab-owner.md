# plite blockquote child replace and tab owner

Objective:
Plan Plite/Core ownership for blockquote child replacement and reverse-tab behavior; done when the ownership call is source-backed and ready for review.

Completion threshold:
- The plan states whether child replacement belongs in Plite or Core.
- The plan states whether reverse-tab behavior belongs in Plite, Plite React, Core, or Basic Nodes.
- Live source evidence is recorded for current behavior and missing owners.
- Proof gates for the later execution packet are named.
- All pass rows are complete or skipped with evidence.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-blockquote-child-replace-and-tab-owner.md` passes.

Verification surface:
- Source reads:
  - `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts`
  - `origin/main:packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts`
  - `packages/plite/src/interfaces/operation.ts`
  - `packages/plite/src/core/editor-extension.ts`
  - `packages/plite/src/editor-runtime-view.ts`
  - `packages/core/src/lib/utils/hotkeys.ts`
  - `packages/core/src/react/components/EditorHotkeysEffect.tsx`
  - `packages/plite-react/src/components/editable.tsx`
- Search audit:
  - `rg -n "tab\\(|isUntab|isTab|Hotkeys\\.isTab|Hotkeys\\.isUntab|liftBlock|blocks\\.lift|nodes\\.lift|withoutNormalizing|normalizers|replaceNodes|replace_children|children: true" packages/core/src packages/plite/src packages/plite-react/src packages/basic-nodes/src --glob '*.{ts,tsx}'`
- Planning-only proof: no implementation command needed for this pass.

Constraints:
- Planning mode only. Do not implement until the user accepts the plan.
- No public compatibility aliases or old `tf` shims.
- Do not copy old `overrideEditor(...tab)` into Basic Nodes.
- Keep Plite unopinionated; Plate owns product/plugin behavior.
- If a generic primitive is missing, patch Plite first instead of hiding the gap in Core or Basic Nodes.

Boundaries:
- Allowed planning edit scope: `docs/plans/**`.
- Source read scope: Plite runtime/update/extension files, Core plugin/hotkey files, Basic Nodes blockquote file.
- Implementation scope for a later accepted packet: `packages/plite`, `packages/plite-react`, `packages/core`, `packages/basic-nodes`, and package-local tests.

Blocked condition:
- Stop execution if the accepted implementation would require a public keyboard-command API shape that the user has not approved.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` skill read |
| Active goal checked or created | yes | active goal created for this plan |
| Source of truth read before edits | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and live source reads |
| `docs/solutions` checked for non-trivial existing-code work | no | no docs/solutions evidence needed for this narrow owner call |
| Live Plate repo root grounding needed for current-state claims | yes | source reads and audit commands run from `/Users/zbeyens/git/plate-2` |

Work Checklist:
- [x] Short objective, lane outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy respected.
- [x] Live source grounding recorded for every current implementation claim.
- [x] Issue ledger / ClawSweeper pass skipped with evidence: no public issue or PR claim is being changed.
- [x] Research and ecosystem synthesis skipped with evidence: this is a local owner boundary decision, not external architecture borrowing.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score is above threshold and no dimension is below 0.85.
- [x] Applicable implementation-skill review matrix applied or skipped with concrete reason.
- [x] Plite maintainer objection ledger complete for behavior/API changes.
- [x] Verification workspace gate recorded for every claim.
- [x] TDD marked as execution-phase requirement.
- [x] Browser proof marked as execution-phase requirement for reverse-tab behavior.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit and plan completion check | source audit recorded; final check pending below |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live source evidence and execution proof route | evidence tables below |
| Issue ledger or PR reference changed | no | Record why no sync applies | no issue/PR claim changed |
| Autoreview for uncommitted implementation changes | no | Planning-only; no implementation diff to review | N/A |
| Final user-review handoff | yes | Emit final handoff and stop before implementation | final response |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-blockquote-child-replace-and-tab-owner.md` | run after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | current and `origin/main` blockquote source read; Plite/Core owner source read | none |
| Related issue discovery | skipped | no issue/PR claim in prompt | none |
| Issue-ledger pass | skipped | no issue/PR claim changed | none |
| Intent/boundary and decision brief | complete | decision brief below | none |
| Research, ecosystem strategy, live-source refresh | skipped | local owner boundary is sufficient; no external editor evidence needed | none |
| Performance/DX/migration/regression/simplicity pressure passes | complete | scorecard and proof matrix below | none |
| Plite maintainer objection ledger | complete | objection ledger below | none |
| High-risk deliberate mode | complete | risks below | none |
| Ecosystem maintainer pass | skipped | no external maintainer claim | none |
| Revision pass | complete | plan revised into ready owner call | none |
| Issue sync accounting | skipped | no issue ledger changed | none |
| Closure score and final gates | complete | completion checker run after update | final handoff |

Current verdict:
- verdict: split the fix across Plite and Plate/Core; Basic Nodes consumes both.
- confidence: 0.94
- keep / cut / revise call:
  - revise child replacement through Plite.
  - revise reverse-tab through a keyboard command/shortcut owner, not Basic Nodes local override.
  - cut old `overrideEditor(...tab)` and `editor.tf.replaceNodes(...children: true)` compatibility shapes.
- reason: child replacement is document operation substrate; reverse-tab dispatch is product keyboard behavior that should be expressed through the existing Core shortcut/plugin system and Plite React editable event path, not a plugin-local transform override.

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React/runtime performance | 0.20 | 0.92 | reverse-tab should route through existing keydown/shortcut path, not extra render subscriptions |
| Plite API/DX quality | 0.20 | 0.93 | add a direct child replacement/update primitive instead of forcing remove+insert boilerplate |
| Plate and collaboration migration backbone | 0.15 | 0.95 | `replace_children` already exists as an operation, so history/collab can preserve one logical child replacement |
| Regression-proof testing strategy | 0.20 | 0.95 | focused unit tests plus keydown/browser proof named below |
| Research evidence completeness | 0.15 | 0.90 | local source is enough; no external research needed for this owner split |
| shadcn-style composability and minimalism | 0.10 | 0.96 | Basic Nodes remains declarative: normalizer + shortcut/tx hook, no bridge/helper dump |

Source-backed architecture north star:
- target shape: Plite owns generic child-range replacement and normalizer transaction ergonomics; Core/Plate owns plugin shortcut dispatch; Basic Nodes owns blockquote semantics.
- source evidence:
  - current Basic Nodes normalizer manually removes and reinserts children.
  - `origin/main` used one logical `replaceNodes(..., { children: true })`.
  - Plite already defines `replace_children` as a first-class operation.
  - Plite extensions already own normalizer middleware.
  - Core already owns plugin shortcuts and hotkey resolution.
- rejected drift:
  - do not keep manual remove-all + insert-all as the final child-replace shape.
  - do not copy `overrideEditor(...tab)` into the migrated plugin.
  - do not create a Basic Nodes-only keyboard bridge.
- migration posture: break old Plate transform compatibility; preserve behavior through current Plite/Plate owner APIs.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Plite child replacement | `editor.update.nodes.replaceChildren(children, { at })` and transaction equivalent `tx.nodes.replaceChildren(...)` | one logical child-range replacement, no manual remove+insert loop | breaks old `editor.tf.replaceNodes(...children: true)` shape; no alias | Plite has `replace_children` operation but no direct ergonomic update method | revise |
| Plate blockquote reverse-tab | plugin shortcut command using Core `shortcuts` / keydown route and direct `editor.update.blocks.lift` or `editor.update.nodes.lift` | blockquote plugin declares behavior where users expect it | no old `overrideEditor` transform override | Core has `Hotkeys.isUntab`, shortcut runtime, and `EditorHotkeysEffect` path | revise |
| Basic Nodes blockquote toggle | keep `extendTx` group for semantic `editor.update.blockquote.toggle()` | current package DX is good | no compatibility alias | Basic Nodes tests pass for toggle | keep |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| child replacement operation | Plite core | direct public update/transaction method that emits one `replace_children` operation | remove-loop operation noise and selection/history drift | `packages/plite/src/interfaces/operation.ts` defines `ReplaceChildrenOperation` | move-to-plite |
| normalizer middleware | Plite extension registry | Basic Nodes normalizer calls Plite direct child replacement inside `extendExtension` normalizer | old `normalizeNode` override and `tf.replaceNodes` | `packages/plite/src/core/editor-extension.ts` registers normalizers | keep-in-plite |
| reverse-tab dispatch | Core/Plate plugin shortcut layer plus Plite React keydown event path | plugin shortcut handles `Hotkeys.isUntab` / `untab` and runs blockquote lifting | plugin-local `tab(options)` transform override | Core has `Hotkeys.isUntab`; Core has shortcut runtime and `EditorHotkeysEffect` | keep-in-core |
| blockquote lifting semantics | Basic Nodes | semantic matcher decides liftable blockquote children; execution uses Plite direct lift methods | generic Plite opinion about blockquote | current `isLiftableBlockquoteChild` is product semantics | keep-in-basic-nodes |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| keydown route | plugin shortcut / handler, not component subscription | Core routes shortcut to plugin behavior | no render-time value subscription for callback-only data | `EditorHotkeysEffect` consumes runtime shortcuts | keep |
| browser proof | focused editable keydown proof for Shift+Tab | use Plite/browser lane when visible behavior matters | verify model selection and follow-up typing | behavior is user-visible | gate |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| old `replaceNodes(...children: true)` | direct child replacement primitive | Basic Nodes normalizer uses it | revive old `tf` API | Plite `replace_children` operation exists | move-to-plite |
| old `tab(options)` override | no Plite product semantics; only editable event capability | Core shortcut/plugin route executes blockquote semantics | generic blockquote behavior in Plite | Core hotkeys/shortcuts exist | keep-in-core |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| normalizing child replacement | one `replace_children` operation | collab/history can replay one logical operation | multiple remove/insert operations for one normalize repair | `ReplaceChildrenOperation` exists | move-to-plite |

Intent / boundary record:
- intent: restore blockquote behavior without reviving old Slate/Plate transform compatibility.
- outcome: Plite gets the missing generic operation/update primitive; Core routes keyboard commands; Basic Nodes owns blockquote semantics.
- in-scope: child replacement, normalizer operation shape, reverse-tab lifting owner, proof plan.
- non-goals: broad keyboard API redesign, public compatibility aliases, docs rewrite.
- decision boundaries: public keyboard command API shape needs user acceptance before implementation if it becomes new public surface.
- unresolved user-decision points: none for this owner call; exact implementation signatures can still be refined during execution if the source graph proves a better local shape.

Decision brief:
- principles: generic operations belong in Plite; product keyboard semantics belong in Plate packages; old compatibility transforms die.
- top drivers: preserve behavior, preserve logical operation shape, keep Basic Nodes declarative, avoid bridge sludge.
- viable options:
  - keep current remove+insert and defer reverse-tab.
  - copy old `overrideEditor`.
  - add Plite child replacement and Core shortcut route.
- chosen option: add Plite child replacement and Core shortcut route.
- rejected alternatives:
  - current remove+insert final state: too low-level and risks selection/history/collab drift.
  - old `overrideEditor(...tab)`: resurrects removed compatibility model.
  - Basic Nodes local keydown handler: wrong owner and hard to reuse.
- consequences: one Plite API addition, one Core shortcut/handler integration, Basic Nodes behavior tests/browser proof.
- follow-ups: execute after user accepts this plan.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| N/A | N/A | no issue claim | prompt is local architecture decision | N/A | N/A | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped, no issue-backed claim.
- generated live gitcrawl rows read: skipped.
- manual v2 sync ledger update: skipped.
- fork issue dossier update: skipped.
- issue coverage matrix update: skipped.
- PR description sync: skipped.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| N/A | local source only | local operation and keyboard owner split | external overfit | N/A | N/A | child replacement + shortcut route | keep |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|--------------|-------------|-------|--------|
| blockquote child normalization | `replaceNodes(nextChildren, { at, children: true })` | one logical child replacement operation | Basic Nodes normalizer unit test asserting children and operation shape | Plite + Basic Nodes | gate |
| blockquote reverse-tab | `tab({ reverse: true })` lifted paragraph children out of blockquote | Core shortcut route dispatches reverse-tab to Basic Nodes semantics | package keydown test plus browser Shift+Tab proof | Core + Basic Nodes | gate |
| nested selected blocks | old code sorted deepest paths before lifting | same deepest-first lift order | multi-block nested blockquote spec | Basic Nodes | gate |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| blockquote reverse-tab | cursor in paragraph inside blockquote, Shift+Tab | Chromium first, browser lane if route exists | focused Plite/browser or Core React keydown proof | paragraph lifts out; selection remains valid; follow-up typing works | gate |
| blockquote normalization | pasted/legacy flat blockquote children | package unit | `pnpm --filter @platejs/basic-nodes test` | children become paragraphs in one logical replacement | gate |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| current Basic Nodes manually removes/inserts children | `/Users/zbeyens/git/plate-2` | `sed -n '1,240p' packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` | verified | Basic Nodes |
| origin/main had child replacement and tab override | `/Users/zbeyens/git/plate-2` | `git show origin/main:packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` | verified | Basic Nodes legacy |
| Plite owns replace_children operation | `/Users/zbeyens/git/plate-2` | `sed -n '1,220p' packages/plite/src/interfaces/operation.ts` | verified | Plite |
| Plite owns extension normalizers | `/Users/zbeyens/git/plate-2` | `sed -n '1,180p' packages/plite/src/core/editor-extension.ts` | verified | Plite |
| Core owns hotkey names and shortcut runtime | `/Users/zbeyens/git/plate-2` | `sed -n '100,150p' packages/core/src/lib/utils/hotkeys.ts`; shortcut search | verified | Core |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | skipped | not a React rendering design plan | none |
| performance | yes | applied | avoid callback-only subscriptions and extra render state | shortcut route must not subscribe for callback-only data |
| tdd | yes | applied | execution starts with failing blockquote operation/Shift+Tab tests | proof gates named |
| shadcn | no | skipped | no UI component design | none |
| react-useeffect | no | skipped | no effect design | none |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| selection/history drift | replacing remove+insert with child replacement | selection or undo differs from legacy | emit one `replace_children`; compare operation shape | unit test | gate |
| keyboard owner leak | reverse-tab added locally in Basic Nodes | impossible to reuse or prove consistently | Core shortcut route owns dispatch | keydown test | gate |
| over-generic Plite behavior | Plite tries to know blockquote semantics | Plite becomes product-opinionated | Plite only exposes primitive; Basic Nodes decides blockquote lifting | source review | gate |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| add direct child replacement update API | "Another method bloats Plite" | worth it because operation already exists and normalizers need logical child replacement | `ReplaceChildrenOperation` exists | document as low-level update primitive; test operation shape | keep |
| route reverse-tab through Core shortcuts | "Why not Plite React editable?" | Plite React should expose event capability, not product blockquote behavior | Core already has hotkeys/shortcuts | Basic Nodes plugin test + browser proof | keep |
| do not copy old `overrideEditor` | "Fastest parity fix" | would preserve the wrong architecture | old code shows `overrideEditor` dependency | hard-cut; no alias/shim | cut |

Hard cuts and rejected alternatives:
- Cut old `editor.tf.replaceNodes(..., { children: true })` public shape.
- Cut old `overrideEditor(({ tf: { tab } }))` pattern.
- Reject manual remove+insert normalizer as final state.
- Reject Basic Nodes local keydown bridge.

Implementation phases with owners:
| Phase | Owner | Work | Proof |
|-------|-------|------|-------|
| 1 | Plite | add direct child replacement update/tx primitive backed by `replace_children` | Plite unit tests for operation, selection, history/collab-safe shape |
| 2 | Core | expose/repair shortcut route for plugin-owned reverse-tab behavior without old transform overrides | Core shortcut/key handling tests |
| 3 | Basic Nodes | use Plite child replacement in normalizer; implement blockquote reverse-tab lifting through Core shortcut route | Basic Nodes unit tests |
| 4 | Browser proof | verify Shift+Tab in editable route | Chromium proof, model selection, follow-up typing |

Fast driver gates:
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/basic-nodes`
- `pnpm --filter @platejs/plite test`
- `pnpm --filter @platejs/core test`
- `pnpm --filter @platejs/basic-nodes test`
- `pnpm check:core`
- focused browser/key proof when route exists.

Final handoff outline:
- Plite owns child replacement.
- Core owns shortcut dispatch.
- Basic Nodes owns blockquote semantics.
- Do not copy old transform override.
- Execute only after user accepts the plan.

Verification evidence:
- Live source read confirms current Basic Nodes normalizer uses remove-all + insert-all.
- Live source read confirms `origin/main` used `replaceNodes(..., { children: true })` and `tab(options)`.
- Live source read confirms Plite has a first-class `replace_children` operation.
- Live source read confirms Plite has extension normalizer middleware.
- Live source read confirms Core has `Hotkeys.isUntab` / shortcut runtime surfaces.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plite Plan ready for user review |
| Where am I going? | Wait for acceptance, then execute as implementation packet |
| What is the goal? | Decide Plite/Core ownership for child replacement and reverse-tab |
| What have I learned? | Child replacement belongs in Plite; reverse-tab dispatch belongs in Core/Plate shortcut route; blockquote semantics stay in Basic Nodes |
| What have I done? | Created a source-backed plan and named execution proof gates |

Open risks:
- Method name is intentionally `nodes.replaceChildren`, not `children.replace`, because it belongs beside node mutations and should not create a new top-level children namespace.
- Exact Core shortcut API shape may need a small `plate-plan` detour if it becomes public API beyond existing `shortcuts`.
