# Preserve toolbar focus and style the block marquee

Objective:
Fix the two #5085 non-mark controls and #5088 marquee paint at their durable
Plate owners; done when adoption and exact browser proof are execution-ready.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/5085-5088-toolbar-marquee-ownership.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, breaking adoption and proof concrete, and
  `check-complete` passes.

Verification surface:
- `apps/www/src/registry/components/editor/toolbar.tsx`
- `apps/www/src/registry/components/editor/comment-toolbar-button.tsx`
- `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx`
- `packages/plite-react/src/editable/runtime-root-lifecycle.ts`
- `packages/selection/src/react/BlockSelection.internal.tsx`
- `packages/selection/src/react/BlockSelectionPlugin.tsx`
- registry block-selection/editor owners and focused Browser/Chrome tests

Constraints:
- Planning-only until explicit acceptance. The user accepted and invoked only
  the #5085 slices; #5088 remains a separate unexecuted packet.
- Hard-cut dead API names; no aliases or dual fields.
- Do not lint or run Autoreview in this session.
- No commit, push, PR, release, issue close, or fixed/completed label.

Boundaries:
- In scope: #5085 Comment and Turn Into from an expanded floating selection;
  #5088 marquee paint throughout the held gutter drag.
- Source owners: copied registry ToolbarButton and split-button primitives;
  Selection package marquee portal contract; copied BlockSelectionKit
  presentation policy.
- Non-goals: mark-button behavior, generic outside-click semantics, structural
  selection representation, DnD, classic toolbar parity, or new theme APIs.
- Direct Plite boundary: keep Plite React's documented
  `mousedown.preventDefault()` focus-preservation contract unchanged.

Output budget strategy:
- Audit only the shared button, two failing controls, focus boundary, marquee
  portal, registry kit, and exact tests.

Blocked condition:
- Block only if a real control requires native button focus or the marquee
  cannot accept app-owned classes without moving presentation into Selection.

Plate Plan state:
- status: ready
- phase: #5085 executed; #5088 ready
- next: reporter confirmation for #5085 or separate #5088 execution
- handoff: #5085 complete on pushed `5104eb4`; #5088 prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Two atomic #5085 controls, cumulative #5088 paint, absolute long-term fix, and standing constraints recorded. |
| Active goal and plan verified | yes | Active Regression goal owns the iteration; this is its Plate architecture gate. |
| Current owners read | yes | Toolbar controls/base, Plite focus boundary, selection portal, registry styling, tests, and exact Chrome inspected. |
| Best API target resolved | yes | ToolbarButton intrinsically preserves editor focus; marquee exposes one truthful class owner. |
| Mode and execution boundary resolved | yes | Standard planning only; explicit acceptance precedes product edits. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/tests/behavior claims cite live source.
- [x] Reusable public call shape has one Best API verdict.
- [x] Every decision row has owner, adoption, proof, risk, and verdict.
- [x] The one public hard cut has complete adoption and no bridge.
- [x] Execution slices and focused proof are concrete.
- [x] Browser, registry, and issue-provenance gates are resolved.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All decision and execution rows resolve. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Current source and exact Chrome on `2b206974844c62c487337da12733293db10f674b`. |
| Best API review | yes | Resolve P0/P1 public shape | One button semantic and one class-name hard cut selected. |
| Conditional risk and adoption | yes | Complete browser/registry/provenance work | Failure cases and exact proof named below. |
| Verification recorded | yes | Record planning and execution proof | Proof matrix is concrete. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, order | Final handoff below. |
| P1 autoreview | N/A | Planning-only N/A | Explicit standing instruction forbids Autoreview. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5085-5088-toolbar-marquee-ownership.md` | `[autogoal] complete` on 2026-08-24. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live issue, source, tests, videos, and exact Chrome read. | Decide |
| Decide | completed | Shared control and portal presentation owners selected. | Prove and hand off |
| Prove and hand off | completed | Slices, hard cut, and exact proof specified. | User review |

Decision brief:
- outcome: every floating toolbar editor command activates without losing its
  selection owner, and the held block-selection rectangle visibly paints.
- chosen shape: every editor-command toolbar button primitive prevents native
  mouse focus transfer by default; Selection accepts
  `selectionAreaClassName`; BlockSelectionKit supplies brand classes to the
  body portal.
- strongest rejected alternative: add handlers to Comment and Turn Into or
  move portal presentation into the package; both duplicate the real owner.
- consequence: remove redundant mark handlers and hard-cut unused
  `rightSelectionAreaClassName` with no alias.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editor toolbar mouse focus | Only mark and scattered controls cancel `mousedown`; Comment and Turn Into lose focus | `ToolbarButton`, `ToolbarSplitButtonPrimary`, and `ToolbarSplitButtonSecondary` preserve editor focus on mouse press | Copied registry `toolbar.tsx` | All three primitives operate on the editor; keyboard focus remains available while mouse focus transfer would discard command context | Compose caller `onMouseDown`; delete every redundant prevent-only consumer handler; audit all consumers for a true native-focus exception | primitive tests plus Comment/Turn Into/mark/dropdown browser rows | A dropdown or file-picker trigger might rely on native mouse focus | rearchitect |
| Plite outside-focus boundary | Correctly releases on uncancelled outside mouse press | Keep unchanged | Plite React | It cannot guess which external controls operate the editor | No adoption | Existing package contract | Weakening it would break outside clicks | keep |
| Marquee presentation hook | Body portal gets only `plite-selection-area`; dead `rightSelectionAreaClassName` is unused | `selectionAreaClassName` applies app classes to the portal | Selection plugin state + internal portal | App owns colors; package owns the portal/lifecycle | Hard-cut field name; configure BlockSelectionKit | package render test and registry typecheck | Dynamic Tailwind classes must be literal at the consumer | rename |
| Registry marquee styling | EditorContainer descendant classes cannot reach a body portal | Move literal brand classes into BlockSelectionKit's `selectionAreaClassName` | Copied BlockSelectionKit | Presentation remains app-owned and colocated with the feature | Remove unreachable EditorContainer selectors | computed-style and exact pixel proof | Theme contrast/regression | move |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red exact controls | Regression/browser test | Add Comment and Turn Into sibling cases with command-target/focus/popup/follow-up oracles | Accepted plan | Both fail on current source | Exact Chromium red |
| 2. Shared toolbar invariant | Registry toolbar primitives | Add `toolbar.spec.tsx` for composed caller handlers and plain/split mouse defaults; compose the invariant into all three editor-command button primitives; remove every prevent-only consumer handler, including the obsolete mark-spec assertion; audit dropdown and file-picker triggers | Red controls | Comment draft marks and reply editor appear; Turn Into menu opens; mark, dropdown, split-button, and file-picker paths remain green | `toolbar.spec.tsx`, `mark-toolbar-button.spec.tsx`, exact browser cases, focused registry tests, `www` typecheck |
| 3. Red marquee paint | Regression/browser test | Replace DOM existence with held-phase geometry and nontransparent paint assertion | Slice 2 stable | Current portal fails with transparent paint | Exact Chromium red plus Chrome screenshot control |
| 4. Hard-cut marquee class owner | Selection + BlockSelectionKit | Rename field, apply it to the body portal, add a portal-class render row to `BlockSelectionPlugin.spec.tsx`, move literal brand classes, and remove unreachable EditorContainer selectors | Red paint | Package and registry tests green; no stale field users | Selection focused/full tests and typecheck, `www` typecheck, zero stale-name/source-selector audit, changeset |
| 5. Exact cumulative closure | Regression/Patch | Replay all three atomic cases after last shared edit | Package green | Comment, Turn Into, and full block-selection lifecycle pass 5/5 exact Chrome | Combined receipt, fingerprints, Browser/Chrome artifacts |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Comment is a focus-owner failure | Exact Chrome click leaves the expanded range unmarked, focuses body, closes the toolbar, and opens no UI | Assert the original range gains draft-comment marks, the main selection collapses by command design, and the focused `Reply...` editor appears | ready |
| Turn Into is the same primitive failure | Exact Chrome click keeps range but closes toolbar and opens no menu | Assert editor focus/selection and visible menu during action | ready |
| Generic prevention is safe | Mark, history, indent, link, list, suggestion, table, toggle, and AI callers already duplicate the same contract; Plite package codifies it | Remove prevent-only duplicates; test plain, dropdown, split primary/secondary, file-picker, fixed-toolbar, floating-toolbar, and keyboard rows | ready |
| Marquee exists but is unpainted | Exact Chrome: 100x78 portal, two selected blocks, transparent background, zero border | Held-phase computed style plus positive/negative pixel controls and 5/5 screenshot classifier | ready |
| App owns marquee colors | Current brand classes live in registry EditorContainer but cannot reach body | Literal BlockSelectionKit class config and portal class unit test | ready |

Conditional evidence:
- High-risk scenarios: generic prevention breaks dropdown or file-picker
  activation; Comment UI opens without draft-marking the intended range;
  portal classes paint at rest or linger after release. Exact cases cover each.
- External research: N/A; source and exact reporter route are conclusive.
- Issue provenance: #5085 body plus Felix's 2026-08-23 delta; #5088 body,
  2026-08-17 delta, and 2026-08-23 recording remain cumulative.
- Registry/browser owners apply. Docs and release are N/A. A Selection package
  changeset is required for the hard cut.

Findings:
- Plite's outside-focus contract is correct and already package-tested.
- The three shared toolbar button primitives omit the editor-control focus
  invariant. At least AI, history, indent, link, classic/current list, mark,
  suggestion, table, and toggle callers duplicate prevent-only handlers while
  Comment and Turn Into omit them.
- The marquee's DOM geometry and structural selection are correct. Its only
  current failure is paint: the body portal is outside EditorContainer's
  descendant CSS selector.
- `rightSelectionAreaClassName` has no live consumer or implementation and can
  be replaced directly before stable release.

#5085 execution delta:
- The first shared focus fix exposed a second owner: Radix menu autofocus moved
  focus into a portal and FloatingToolbar unmounted itself because its open gate
  recognized only editor focus.
- `Toolbar` now derives owned-overlay state from Radix ARIA trigger props,
  aggregates open overlay IDs, and reports the aggregate state to
  FloatingToolbar. FloatingToolbar stays mounted while its own overlay is open.
- The visual `isDropdown` prop remains presentation-only. Comment, Turn Into,
  icon-only dropdown, split secondary, keyboard, file-picker, and Bold paths
  share the primitive contract without caller-specific exceptions.
- Plite React remains unchanged because its outside-focus selection law is
  correct.
- Pushed ref `5104eb406fc8550c8527d89b829d4320ebf2f368` passed focused units,
  toolbar variants, full `www` typecheck, Browser QA, focused Chromium 3/3,
  exact headed Chrome receipt, and installed Chrome 151 at 5/5.
- #5088 slices 3-5 were not executed in this run.

Decisions and tradeoffs:
- One intrinsic toolbar semantic across plain and split buttons beats caller
  patches and future repeats. Keyboard navigation remains native; only mouse
  focus transfer is suppressed.
- App-provided classes beat package brand defaults. Do not move the portal back
  into model-owned DOM or add global stylesheet dependence.

Review fixes:
- N/A; planning-only and Autoreview is forbidden this session.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Mark-only proof generalized to all controls | 1 claimed completion | Replay each control family | Comment and Turn Into are separate red cases. |
| `toBeVisible()` treated geometry as paint | 1 claimed completion | Read computed style and pixels during drag | Exact Chrome proves transparent paint. |

Verification evidence:
- Current ref: `2b206974844c62c487337da12733293db10f674b`.
- Exact Chrome #5085: Comment and Turn Into each close the toolbar and open no
  UI; Bold remains green.
- Exact Chrome #5088: held drag selects two blocks and creates a 100x78 portal,
  but computed background is transparent, border is zero, and z-index is auto.
- Source audit found the unreachable registry styles and the unused state name.
- `check-complete.mjs` returned `[autogoal] complete`.

Final handoff prepared:
- Ownership and target API: ToolbarButton owns focus preservation;
  `selectionAreaClassName` owns portal classes.
- Public breaks and adoption: hard-cut one unused state field; configure the
  registry kit; remove unreachable/redundant code.
- Browser/provenance: three atomic exact Chrome cases with cumulative oracles.
- Proof and execution risks: dropdown/mark negative controls and marquee pixel
  controls precede completion.
- Execution order and user attention: accept this plan, then execute slices 1-5.

Timeline:
- 2026-08-24: exact Chrome reproduced both non-mark controls and transparent
  marquee paint on current source.
- 2026-08-24: Best API and Plate/Plite ownership decisions resolved.
- 2026-08-24: user accepted #5085 execution; shared focus and owned-overlay
  lifetime repairs completed and passed exact pushed-ref proof.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ready planning handoff |
| Where am I going? | User acceptance, then red proof and execution |
| What is the goal? | Make focus and marquee presentation single-owner invariants |
| What have I learned? | Both old greens asserted adjacent states |
| What have I done? | Reproduced, traced, decided, and specified proof |

Open risks:
- The consumer audit includes dropdown and native file-picker triggers. A true
  focus-taking exception must use another primitive rather than weaken the
  editor-command default.
