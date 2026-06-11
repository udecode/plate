# Editor Selection Navigation Coverage

Use this when a Slate v2 bug touches selection, navigation, focus, hidden DOM,
multi-root behavior, synced roots, editable voids, clipboard-after-selection,
delete-after-selection, or insert-break-after-selection.

This matrix is generic editor law. It is not a content-root checklist.

## How To Use

For each `slate-patch` bug, pick the smallest honest slice that covers the bug
class. Add one sibling topology when the same owner likely handles it. Record
skipped rows when the final handoff could otherwise imply broader coverage.

Do not run the whole matrix for every bug. Do not claim full coverage unless the
whole relevant command x direction x topology x state surface is actually green.

## Command Families

| Family | Rows |
| --- | --- |
| Character movement | `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` |
| Character extension | `Shift+ArrowLeft`, `Shift+ArrowRight`, `Shift+ArrowUp`, `Shift+ArrowDown` |
| Word movement | `Option+ArrowLeft`, `Option+ArrowRight` |
| Word extension | `Shift+Option+ArrowLeft`, `Shift+Option+ArrowRight` |
| Document or line edge movement | `Cmd+ArrowLeft`, `Cmd+ArrowRight`, `Cmd+ArrowUp`, `Cmd+ArrowDown`, `Home`, `End` |
| Document or line edge extension | `Shift+Cmd+ArrowLeft`, `Shift+Cmd+ArrowRight`, `Shift+Cmd+ArrowUp`, `Shift+Cmd+ArrowDown`, `Shift+Home`, `Shift+End` |
| Mouse selection | click, click-drag, drag top-to-bottom, drag bottom-to-top, drag starting from unfocused editor |
| Follow-up mutation | type, `Backspace`, `Delete`, `Enter`, paste after movement or range selection |
| Follow-up state | copy, undo, redo, focus another root then return |

## Directions

| Direction | What It Proves |
| --- | --- |
| forward into | caret or focus enters the target surface correctly |
| backward into | reverse navigation is not a mirror-image afterthought |
| forward out | selection can leave the surface without getting trapped |
| backward out | reverse exit preserves anchor/focus semantics |
| up/down into | visual-line movement maps to the right model point |
| up/down out | vertical movement exits nested or hidden surfaces cleanly |
| across one boundary | the local owner works |
| across many boundaries | repeated owner handoff works without double selection or skipped nodes |

## Topologies

| Topology | Examples |
| --- | --- |
| plain blocks | normal paragraphs/headings/lists |
| inline boundaries | links, inline voids, marks split across leaves |
| block void | image/media-like blocks |
| editable void | void shell with editable descendants |
| hidden DOM | accordion, tabs, collapsible, popover-like hidden content |
| DOM coverage boundary | boundary, model-backed, materialize policies |
| content root | root owned by a block shell |
| multi-root | header/body/footer or sibling editable roots |
| synced root | same model state mounted in multiple places |
| virtualized DOM | partial DOM or page/block virtualization |
| mixed topology | visible -> hidden -> root -> synced/void -> visible |

## Starting States

| State | Required Assertions |
| --- | --- |
| collapsed at start | next movement lands on the first intended point |
| collapsed at end | forward movement crosses the next boundary exactly once |
| expanded forward | Shift movement extends from the stable anchor |
| expanded backward | reverse selection keeps anchor/focus orientation sane |
| selected all | next extend/collapse avoids double highlight and stale DOM |
| multi-line block | up/down chooses visual line positions, not only model order |
| after focus handoff | click or keyboard focus does not import stale DOM selection |
| after undo/redo | restored selection belongs to the original root/path |
| after hidden materialize | revealed content gets real DOM selection once mounted |

## Required Rows For DOM Coverage Materialize

When a bug touches `selectionPolicy: 'materialize'`, the slice must prove the
first keyboard entry opens hidden content and the next extension does not stay
model-owned after that content is mounted.

Required minimum:

- `Shift+ArrowDown` and `Shift+ArrowUp` from visible text into closed hidden
  content, with exact model selection plus mounted DOM assertion.
- A mid-line caret on the last rendered line before hidden content. Do not only
  test block-edge positions; native vertical movement skips hidden DOM from
  mid-line too.
- At least two hidden component shapes when the owner is generic hidden DOM
  coverage, for example accordion plus collapsible or tab panel.
- A negative row after materialize: once the boundary is selected/mounted, the
  next plain vertical `Shift+Arrow` stays native unless it enters another
  unmounted materialize boundary.
- Mutually exclusive hidden surfaces such as tabs: repeated `Shift+Arrow`
  extension across a spanning selection must keep the focus-side panel active.
  Interior hidden panels must not materialize and cycle active state.

## Assertions

Every selected slice should assert the model first:

- exact Slate selection anchor/focus paths and offsets;
- value mutation after type/delete/backspace/enter/paste;
- undo/redo restores both value and selection;
- copy payload matches the model range when copy is involved.

Browser-visible slices also assert:

- DOM selection is not doubled;
- browser selection does not include non-editable chrome;
- focus belongs to the expected editable/root;
- hidden content only opens when the policy says it should;
- no stale placeholder, zero-width, or boundary DOM captures the selection;
- follow-up typing lands at the selected model point.

## Coverage Claim Levels

| Claim | Bar |
| --- | --- |
| exact repro | one failing user path is red/green |
| class slice | exact repro plus one sibling direction or topology sharing the owner |
| route coverage | all relevant command families for one example route |
| engine coverage | same command families across plain, hidden DOM, root, void, synced, and virtualized topologies |
| private-alpha claim | engine coverage plus focused browser proof, package tests, and full-gate decision |

## Default Slice For Selection Bugs

Start here unless the bug clearly needs less:

1. Exact reported command and direction.
2. Reverse direction for the same command family.
3. Shift variant if the report is collapsed movement, or collapsed variant if
   the report is extended movement.
4. One follow-up mutation: type, delete/backspace, or insert break.
5. One sibling topology that uses the same owner.

If any of those rows fail, fix the owner before adding more route-specific tests.
