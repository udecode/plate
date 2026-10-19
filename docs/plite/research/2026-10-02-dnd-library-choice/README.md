# Drag library choice

Status: Review complete. Replacement adoption deferred.

## Verdict and scope

Keep the native driver now. Pragmatic Drag and Drop is the strongest replacement candidate, but one bounded integration must establish a maintenance benefit before adoption. Do not reintroduce React DnD or replace the default driver with modern dnd-kit.

A library can take responsibility for browser mechanics and their tests. Its suite cannot prove our editor's content, suggestions, schema fitting, roots, selection or history.

The user directly selected DnD. The global queue returned `model`; this review does not change queue order. Three same-family researchers compared three libraries and five editors. The bounded source comparison is complete. No product implementation, dependency installation, upstream test run, browser run or new benchmark was performed.

Stop rule: distinguish the viable ownership alternatives and identify the smallest experiment that could change the choice. CodeMirror, other editors, issue harvesting, new transfer semantics and Upload transport are excluded.

## User asks

> evaluate react-dnd - should we use another state of the art library? compare vs other editors

> ah ok i didndt see that. should we use any library to have full coverage + testing then ? or just test ourself --- if it's plite native or plate core now, why would we need "DndKit"?

## History reconciliation

Retain the October 1 native-transfer review, interrogation, design and amended design's single Plite transfer owner. The October 2 execution records adoption with partial proof. Reopen only the browser driver comparison: the prior native-versus-React-DnD work did not evaluate Pragmatic Drag and Drop or modern `@dnd-kit/dom`.

The [existing benchmark](../../../plans/2026-10-01-dnd-transfer-benchmark.md) uses development builds. At 5,000 blocks, moving-pointer dragover p95 was 0.8 ms native versus 0.2 ms React DnD, within its baseline-plus-1-ms budget. Listener growth improved. This is not proof that native is universally faster, or a comparison with the new candidates.

A separate session is repairing post-correction transfer validation. This review does not certify that repair or repeat its correctness review.

## Current ownership and DndKit

```text
Native events -> Plite DOM source and landing -> Plite transfer
Copied handle/menu/shortcut -----------------> Plite transfer
Plite transfer -> document, schema, selection and history
```

The copied `DndKit` is unrelated to npm `dnd-kit`. In [registry dnd.tsx](../../../../apps/www/src/registry/components/editor/dnd.tsx), `DndPlugin` at line 414 installs the block wrapper, indicator, root presentation context and move shortcuts. Line 446 exports the one-plugin kit. The deleted packaged React DnD plugin and this copied descriptor are different owners.

The kit supplies handles, menus, preview styling and accessible move controls. `DndRoot` shares a table-selection boolean and tooltip context, not a drag manager. Native handles call `editor.api.dom.drag.start`; move actions call the transfer API. This operation works without the registry kit:

```ts
editor.api.transfer.move({ to: 'next' });
```

Keep the optional preset for those controls. Applications can omit it or replace its presentation. Moving it into core would impose copied React UI on the engine. Removing just the array would remove the normal registry installation shape without removing an owner.

"UI only" is too strong for the current file. Its exported `cutBlocks` also coordinates clipboard writing and subsequent deletion, and the separate block menu imports it. That shared clipboard action deserves an ownership review at the clipboard boundary. Its presence does not justify a DnD engine in the kit, or prove that its asynchronous operation can be moved into core unchanged.

## Library comparison

| Candidate | Useful responsibility | Retained cost or gap | Disposition |
| --- | --- | --- | --- |
| Current native driver | Native routing, source lifetime, MIME bridge and editor landing | We maintain browser quirks and tests | Keep as baseline |
| Pragmatic Drag and Drop | Native element, text-selection and external adapters; dynamic targets and completion | Source anchors, exact view routing, serialization, final admission and scheduler coordination remain ours | Defer adoption; strongest experiment |
| Modern `@dnd-kit/dom` | Pointer/touch/pen activation, keyboard drag interaction, collision and feedback | Native text/files/apps still need another driver; selection, feedback and scrolling also write DOM | Stop as default replacement; reopen for a demonstrated pointer/touch job |
| React DnD | Manager/monitors and native HTML5 payload handling | Separate touch backend; its keyboard option only cancels; retained serialization and provider/backend coordination | Stop reintroduction |

Modern dnd-kit differs from legacy `@dnd-kit/core`. Its [documented sensors](https://dndkit.com/extend/sensors/) are Pointer and Keyboard. The inspected `DragSensor` is absent from public core exports and has no native `drop` handler, at both the inspected head and 0.5.0 revision. It does stop the manager on `dragend`; complete native interoperability is not established. This conclusion is not borrowed from legacy documentation.

PDD's [three adapters](https://atlassian.design/components/pragmatic-drag-and-drop/core-package/adapters/) fit native interoperability better. But every accepted nested target receives a drop; a refused child allows ancestors to match. Plite must choose one recipient. Its text payload contains a starting Text node rather than our mapped source range, so native capture remains necessary.

PDD auto-scroll and dnd-kit scrolling own scheduling and scroll writes. Plite coordinates those writes with selection and repair. This is a behavior requirement to preserve, not an assertion that today's scheduler implementation cannot change.

The strongest reason to adopt PDD is maintained browser behavior, not speed. Its missing-source recovery handles leaked Firefox pointer events before ending a session; Plite currently ends on the first pointermove. This is a source-backed maintenance opportunity, not a reproduced Plite bug. Conversely, an adapter that retains those mechanisms and adds a second event owner would lose.

## Strongest replacement and decisive experiment

```text
Private PDD gesture lifecycle
  -> Plite DOM source context, MIME, landing and exact recipient
  -> existing Plite transfer or external import
  -> existing copied UI
```

No public backend framework or new document state is justified.

| Candidate cut | Current responsibility | Replacement proof |
| --- | --- | --- |
| Random session ID, MIME token and matching | Connect a same-page drop to the live source | PDD local payload plus editor context; preserve foreign formats and one recipient |
| Generic native-end and missing-source routing | Finish the gesture and release resources | Surviving monitor plus view teardown; test cancellation, source removal and unmount |
| Tests of delegated library internals | Generic event ordering and registration cleanup | Upstream tests, with our adapter integration still covered |

Keys/range anchors, view permissions, source freshness, full MIME export, geometry, admission, repair and history remain editor work. The composed-scrollport helper also serves mouse selection, so adopting DnD scrolling cannot delete it wholesale.

Before benchmarking, the replacement must handle:
- native text source capture and exactly one drop through nested views;
- an Editable portaled into an iframe, which Plite already ships;
- same-window foreign text carrying a custom MIME format, since PDD's text adapter exposes plain/HTML while its external adapter excludes local drags;
- cancellation and source removal without losing editor resource cleanup.

Count every required native bridge or fork against the maintenance benefit. PDD's use of global window, document and HTMLElement makes iframe mounting a real compatibility question.

Then compare matched production builds at 1,000 and 5,000 blocks for delivered bytes, mount/unmount listeners and memory, dragover CPU/layout and scroll frames. Freeze non-regression limits first. A speedup is unnecessary if browser maintenance moves upstream without a material behavior or runtime regression. Keep the candidate only when the finished integration deletes responsibility; otherwise discard it.

Recommended next owner, not invoked by this review:

```text
$benchmark dnd native-vs-pragmatic: first prove native text, nested-view
ownership, iframe mounting and same-window custom MIME; then compare a private
PDD lifecycle replacement against native for maintenance deletion and production
cost. Keep Plite transfer semantics and copied controls.
```

## Other editors

| Editor at inspected revision | Implementation | Relevant proof limit |
| --- | --- | --- |
| ProseMirror | Native DataTransfer, retained slice/selection, modifier copy and schema-aware drop | Source handling does not prove OS or mobile parity |
| Tiptap | Native handle; Floating UI positions it; ProseMirror commits the drop | The handle clears transfer data without writing rich external payloads |
| BlockNote | Native handles, custom serialization and ProseMirror integration; keyboard move shortcuts | Inspected drag tests skip Firefox |
| Lexical | Native text drag and a native React block plugin; separate file command | Block tests skip Firefox/collaboration; inspected native text test is Chromium-only |
| Slate | Native React handlers, fragment transport and range mapping | Inspected source is a fork; no dedicated touch or keyboard reorder controller established in the bounded read |

This pattern supports engine-owned mutation. It does not prove hand-written browser mechanics are cheapest. Exact commits, licenses, selected paths and remote-tip differences are in [repo-registry.tsv](repo-registry.tsv) and [read-log.tsv](read-log.tsv). Several editor clones predate upstream heads. ProseMirror's canonical forge differs from its GitHub mirror; no uninspected tip is called inspected.

## Testing

Use the existing editor tests with either driver. Add a test only for a missing failure boundary.

| Owner | What its evidence establishes |
| --- | --- |
| Library | Its activation, event ordering, cleanup and scrolling algorithms |
| Plite core | Atomic move/refusal, complete copy, roots, suggestions and history |
| Mounted editor | Native selection/focus, follow-up typing, external data, one recipient, cancellation and scrolling coordination |
| Copied UI | Handles, indicator, menus and shortcuts invoke the intended actions |

PDD's [testing guidance](https://atlassian.design/components/pragmatic-drag-and-drop/core-package/testing/about) explicitly recommends testing the consuming experience. Its inspected text-selection Playwright test returns early outside Firefox. React DnD's test backend simulates manager actions. These do not establish our touch-device, OS-application, Chromium or WebKit behavior.

PDD also requires application-built accessible alternatives, per its [accessibility guidance](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/). Our move controls remain useful with either driver. "Full coverage" is not a library capability.

## Challenge and evidence accounting

Three fresh-context same-family reviewers challenged the conclusion. All retained Defer. Accepted changes add iframe and same-window custom-MIME gates and correct the claim that DndKit is purely presentation. The shared cut action is recorded as a clipboard ownership concern, not a new DnD architecture. No transfer API cut was justified. Challenge delta: improved; no second design pass needed.

Eight repositories were inspected. Forty-three selected files were checked against their stated commits and hashed. Six leads are recorded, four retained and two rejected. One replacement investigation is recommended; three findings are compiled without product work. No issues or PRs were harvested. No upstream or editor suite, browser, production build or device test ran in this review.

The [query](query-ledger.tsv), [lead](lead-ledger.tsv), [rejection](rejected-ledger.tsv) and [promotion](promoted-ledger.tsv) ledgers preserve the investigation. This report is its one bounded discovery shard. Next external search shard: none until the replacement experiment provides evidence.

The same-family decision-trail review corrected an overbroad claim about dnd-kit's completion: `dragend` stops its manager even though it has no native `drop` handler. The writing pass also removed the broad UI-only claim and separated current behavior from proposed deletion. Reflection found no new workflow rule beyond the existing source/proof distinction.

The initial ledger check failed on changing scratch-feature inventory; the same check passed at HEAD cf15725603 in a detached worktree, which was removed. The remaining `browser/zz-word-dnd2.probe` source was classified under DnD so the inventory could reconcile; it is not test proof. After refresh and render, the ledger check passed with 822 source groups and 67 scopes. The final record and check result belong to the linked decision page.
