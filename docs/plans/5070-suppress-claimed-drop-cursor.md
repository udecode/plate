# Suppress claimed Plite drop cursors

Objective:
Make a handled Plate block drag suppress Plite's default text drop cursor; done
when ownership, adoption, and exact Chrome proof are execution-ready.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/5070-suppress-claimed-drop-cursor.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, execution slices concrete, browser risk resolved, and
  `check-complete` passes.

Verification surface:
- `packages/plite-react/src/components/editable.tsx`
- `packages/plite-react/src/editable/runtime-drag-events.ts`
- `packages/plite-react/src/editable/clipboard-input-strategy.ts`
- `packages/plite-react/src/editable/input-router.ts`
- `packages/dnd/src/internal/DndStorePlugin.ts`
- focused Plite React and DnD tests, `tooling/e2e/homepage-dnd.test.ts`, and
  exact Chrome on `/`

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  execution against it.
- No public compatibility aliases or runtime shims.
- Do not lint or run Autoreview in this session.
- No commit, push, PR, release, or public fixed/completed claim.

Boundaries:
- In scope: #5070's held-drag blue inline indicator and the handled-drag event
  ownership contract that creates it.
- Source owners: Plite React drag runtime and Plate DnD's handler declaration.
- Non-goals: block-DnD geometry, preview, drop-line styling, root-DnD redesign,
  native selection, or the already-fixed `removeChild` crash.
- Direct Plate adoption owners: `DndStorePlugin` and the homepage DnD proof.

Output budget strategy:
- Keep the source audit to the drag handler chain, DnD handler, and exact test.

Blocked condition:
- Block only if the handled signal cannot cross the current event runtime
  without changing the public handler contract, or exact Chrome cannot expose
  the held-drag state.

Plite Plan state:
- status: ready
- phase: prove and hand off
- next: user acceptance
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Absolute long-term fix, exact reporter replay, no lint/Autoreview, and local-only boundary recorded. |
| Active goal and plan verified | yes | Active Regression goal owns the three-issue iteration; this is its Plite architecture gate. |
| Current owners read | yes | Current drag cursor, handler pipeline, DnD handler, browser test, and exact Chrome state inspected. |
| Best API target resolved | yes | Existing `on.dragOver` handled result owns command and affordance; no new API. |
| Mode and execution boundary resolved | yes | Standard planning only; explicit acceptance precedes product edits. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/tests/behavior claims cite live source.
- [x] Reusable public call shape has one Best API verdict.
- [x] Every decision row has owner, adoption, proof, risk, and verdict.
- [x] No public break or private bridge is required.
- [x] Execution slices and focused proof are concrete.
- [x] Browser and issue-provenance work is resolved.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All decision and execution rows resolve. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Current source plus exact Chrome held drag on `2b206974844c62c487337da12733293db10f674b`. |
| Best API review | yes | Resolve public shape | Keep the existing handled signal; fix its ignored result. |
| Conditional risk and adoption | yes | Resolve browser/provenance work | Three failures and exact proof named below. |
| Verification recorded | yes | Name focused planning and execution proof | Commands and exact assertions are in the proof matrix. |
| Handoff prepared | yes | Prepare ownership, proof, risks, order | Final handoff below. |
| P1 autoreview | N/A | Planning-only N/A | Explicit standing instruction forbids Autoreview. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5070-suppress-claimed-drop-cursor.md` | `[autogoal] complete` on 2026-08-24. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live issue, source, test, and exact Chrome state read. | Decide |
| Decide | completed | Existing handled signal wins; Plite cursor follows ownership. | Prove and hand off |
| Prove and hand off | completed | Slices and exact proof specified. | User review |

Decision brief:
- outcome: A claimed block drag never shows Plite's text insertion cursor.
- chosen shape: propagate the existing drag-over ownership result through the
  Plite runtime; DnD returns handled only during its own drag.
- strongest rejected alternative: hide the cursor with CSS or query
  `document.getSelection()`; the cursor is a Plite DOM node, not native
  selection or CSS caret paint.
- consequence: no new public noun, flag, callback, or compatibility path.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Drag-over ownership result | `applyEditableDragOver` consumes plugin results, but wrappers return `void` | Return whether Plite owns drag-over built-ins through the existing handler chain | Plite React drag runtime | Public handlers already return handled state; dropping it violates the contract | Internal return types and focused tests | handled/unhandled drag-over unit rows | Wrong polarity could suppress normal text/file cursor | rearchitect |
| Default drop cursor | `Editable` paints after every runtime drag-over | Paint only when Plite owns the event; clear otherwise | Plite React `Editable` | Command and affordance need one owner | No caller API change | DOM test plus exact Chrome `data-plite-drop-cursor=0` | Stale cursor must clear on ownership transition | rearchitect |
| Block DnD claim | DnD claims `drop`, not `dragOver` | Return `store.isDragging` from `dragOver` and `drop` | Plate DnD plugin | Plate's block drop line replaces Plite's text cursor only during an owned drag | DnD package test and homepage E2E | false for arbitrary/native drags; true for owned block drag | Claiming all drags would break files/text | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red ownership proof | Plite React + DnD tests | In `dom-coverage-native-bridge-contract.test.ts`, prove `applyEditableDragOver` returns Plite ownership only for the default path; add a rendered Editable void-target case that proves a custom-handled drag cannot leave a cursor; extend `DndPlugin.slow.tsx` with owned/unowned drag-over rows | Accepted plan | Current source returns `undefined`, the wrapper discards it, and DnD never claims drag-over | Focused red tests |
| 2. Propagate ownership | Plite React | Preserve the boolean through `applyEditableDragOver`, `handleDragOver`, `useEditableDragHandler`, the root event binding type, and the cursor wrapper; use named polarity at every hop | Red proof | Normal Plite drag-over still owns its cursor; custom-handled drag-over clears/skips it | Plite React focused/full tests and typecheck |
| 3. Claim block drag | DnD | Add conditional `dragOver` handler beside `drop` | Slice 2 green | `pipeHandler` returns false for arbitrary/native drag and true only while React DnD owns the block drag | `DndPlugin.slow.tsx`, DnD full test, and typecheck |
| 4. Exact regression closure | Regression/Patch | Strengthen homepage held-drag test to assert Plite cursor absence during the real native drag | Package green | Order, drop line, no Plite cursor, errors, typing, and selection pass 5/5 in exact Chrome | Focused Chromium plus exact Chrome 5/5 and proof receipt |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| The blue line is Plite-owned | Exact Chrome shows `<span data-plite-drop-cursor>` with empty DOM selection | Held-drag browser assertion checks the DOM node and pixels | ready |
| Handled events suppress built-ins | `pipeHandler` already returns plugin handled state and Plite's `isDragEventHandled` consumes the same contract | Plite React unit/rendered DOM red-green for handled and unhandled drag-over across every wrapper hop | ready |
| DnD does not steal unrelated drops | Current `drop` handler already gates on `isDragging` | DnD tests for arbitrary, native file/text, and owned block drags | ready |
| Reporter workflow remains intact | Existing homepage test covers order/errors/follow-up but samples the wrong phase | One real held drag asserts no text cursor before release, then all cumulative end states | ready |

Conditional evidence:
- High-risk scenarios: handled result polarity hides every cursor; a stale cursor
  survives when ownership flips; DnD claims external file/text drags. Each has
  a focused negative test.
- External research: N/A; current source and exact browser DOM identify the
  owner conclusively.
- Issue provenance: #5070 body, Felix's 2026-08-17 delta, and 2026-08-23
  screenshot are cumulative requirements.
- Browser owner: exact Chrome is mandatory because the defect exists only
  during a native held drag. Benchmark/docs/release are N/A.

Findings:
- The old test queried `document.getSelection()` while the visible line was a
  separate `data-plite-drop-cursor` span.
- Plite calls the plugin drag-over handler before its built-in behavior, but
  discards the ownership result before painting the cursor.
- DnD already uses the correct conditional handled shape for `drop`; `dragOver`
  needs the same ownership declaration.

Decisions and tradeoffs:
- Keep the existing boolean handler contract. Do not add `hideDropCursor`, a
  DnD CSS mask, a body class dependency, or a Plate-only DOM deletion effect.

Review fixes:
- N/A; planning-only and Autoreview is forbidden this session.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| DOM selection used as caret oracle | 2 claimed fixes | Inspect visible DOM/pixels during the held phase | Exact Chrome identified `data-plite-drop-cursor`. |
| `caret-color` diagnostic | 1 | Inspect the blue node owner | Cursor stayed blue because it is a Plite span, not CSS caret paint. |

Verification evidence:
- Current ref: `2b206974844c62c487337da12733293db10f674b`.
- Exact Chrome held drag: `body.dragging=true`, DOM selection has zero ranges,
  and one visible `data-plite-drop-cursor` span is painted.
- Current `homepage-dnd.test.ts` passes while missing that held-drag node.
- Planning source audit covered every producer/consumer in the cursor and DnD
  handled-signal chain.
- `check-complete.mjs` returned `[autogoal] complete`.

Final handoff prepared:
- Ownership and target runtime: Plite React preserves the existing handled
  result; DnD claims only its active block drag.
- Public breaks and Plate adoption: no public shape break; one DnD handler row.
- Browser/provenance: cumulative #5070 exact Chrome held-drag proof.
- Proof and execution risks: negative cursor/drag-owner tests precede code.
- Execution order and user attention: accept this plan, then execute slices 1-4.

Timeline:
- 2026-08-24: current source and exact Chrome identified the visible line as
  Plite's drop-cursor DOM, not native selection.
- 2026-08-24: Best API and Plite ownership decisions resolved.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ready planning handoff |
| Where am I going? | User acceptance, then red proof and execution |
| What is the goal? | Suppress Plite's cursor only when another handler owns the drag |
| What have I learned? | The old oracle inspected the wrong owner |
| What have I done? | Reproduced, traced, decided, and specified proof |

Open risks:
- The internal return-type propagation touches a hot event path; focused
  ownership tests and exact browser replay are mandatory.
