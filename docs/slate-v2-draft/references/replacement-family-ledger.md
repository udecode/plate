---
date: 2026-04-07
topic: slate-v2-replacement-family-ledger
---

# Slate v2 Replacement Family Ledger

## Purpose

This doc records, family by family, what the current `slate-v2` stack preserves,
redefines, or still keeps intentionally narrow.

Roadmap mapping:

- completed `POC RC` is real
- this ledger feeds the broader `True Slate RC` verdict read
- family existence is not the same thing as blanket full-flexibility recovery

Use it with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)

Roadmap mapping:

- this ledger is part of the live verdict stack for the completed `POC RC`
- it does **not** by itself prove the broader `True Slate RC` claim

## Status Legend

- **Preserved**
  - current v2 keeps the core family behavior directly
- **Redefined**
  - current v2 carries the family through a narrower or cleaner current seam
- **Comparison-only**
  - legacy visibility exists, but there is no current family claim yet
- **Intentionally Later**
  - deferred on purpose and outside the active live set

Current active-set read:

- `comparison-only`: none
- `intentionally later`: none at the family level

Remaining narrowness lives inside some documented family contracts, not in
missing family seams.

That matters because:

- the completed `POC RC` verdict is honest today
- the broader `True Slate RC` destination is now carried on explicit broader
  contract width plus better-value cuts where wider legacy behavior is not part
  of the live claim

Core transform/helper claim width is tracked in:

- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

This file does not imply generic core helper parity beyond the named family
surfaces below.
The broader contract recovery that used to live on the `True Slate RC` path is
still filtered through the reopened exhaustive API/public-surface audit and the
post-RC browser/input follow-up read.
This ledger is one input into that verdict, not the thing that closes it.

## Recovered Contributor-Facing Concept Slots

- `android-tests`
  - restored as a current Android / IME hub slot
- `check-lists`
  - restored as a current interactive checklist slot
- `code-highlighting`
  - restored as a current editable token-highlighting slot
- `custom-placeholder`
  - restored as a current placeholder-seam slot
- `inlines`
  - restored as a current inline-family contributor slot
- `search-highlighting`
  - restored as a current projection-driven highlight slot
- `slate-hyperscript`
  - restored as a contributor-facing package slot with fixture and smoke proof

## Current Family Ledger

### Anchor Lifecycle

Status:

- **Preserved**

Current truth:

- `Slate + EditableBlocks + withHistory(createEditor())`
- explicit reset/load boundary
- committed selection recovery
- undo/redo lifecycle

Evidence:

- current `rich-inline`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)
- [rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts)

### Inline Family

Status:

- **Redefined**

Current truth:

- links are explicit current inline elements
- mentions are explicit app-owned inline suggestion behavior
- `inlines` is restored as the contributor-facing umbrella slot
- HTML paste policy is current and explicit:
  - paragraph
  - link
  - `strong`
  - `em`
  - `code`

What this is not:

- legacy plugin-wrapper architecture
- blanket rich-HTML parity

Evidence:

- legacy `mentions`
- legacy `inlines`
- legacy `paste-html`
- current `mentions`
- current `links`
- current `inlines`
- current `paste-html`
- [inlines.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inlines.test.ts)

### Decoration / Highlight Family

Status:

- **Redefined**

Current truth:

- highlight behavior is projection-driven
- `search-highlighting` and `code-highlighting` are restored contributor-facing
  slots on that current seam
- decorated copy semantics are still carried by the current surface

Evidence:

- legacy `search-highlighting`
- legacy `code-highlighting`
- current `highlighted-text`
- current `search-highlighting`
- current `code-highlighting`
- [search-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/search-highlighting.test.ts)
- [code-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/code-highlighting.test.ts)

### Anchor / Projection Family

Status:

- **Redefined**

Current truth:

- persistent anchors are covered through `Bookmark`-backed annotation behavior
- widget UI now sits on the same family through annotation-backed and
  selection-backed widget stores
- the family is proved on current v2 terms, not through a legacy surface clone

Evidence:

- current `persistent-annotation-anchors`
- [persistent-annotation-anchors.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts)

### Placeholder / IME Family

Status:

- **Preserved**

Current truth:

- empty-editor placeholder behavior is green
- `custom-placeholder` is restored on the current placeholder seam
- IME-sensitive placeholder lanes are green

Evidence:

- legacy `custom-placeholder`
- current `placeholder`
- current `custom-placeholder`
- current IME lanes:
  - `placeholder`
  - `inline-edge`
  - `void-edge`
- [placeholder.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder.test.ts)
- [android-tests.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-tests.test.ts)

### Shadow DOM / iframe Browser-Boundary Family

Status:

- **Preserved**

Current truth:

- shadow DOM is current and browser-proved
- iframe is current and browser-proved
- this family is covered as a current editor-shaped surface, not only as a
  legacy row

Evidence:

- legacy `shadow-dom`
- legacy `iframe`
- current `shadow-dom`
- current `iframe`
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Huge Document Family

Status:

- **Redefined**

Current truth:

- current huge-document behavior is benchmark-backed on the frozen
  paragraph-heavy `1000`-block lane
- this is measured truth for that lane only

Evidence:

- replacement huge-document benchmark lane
- legacy huge-document benchmark lane

### Plaintext Family

Status:

- **Preserved**

Current truth:

- plaintext editing is current and direct

Evidence:

- legacy `plaintext`
- current `plaintext`
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Read-only Family

Status:

- **Preserved**

Current truth:

- read-only editorial behavior is current and direct

Evidence:

- legacy `read-only`
- current `read-only`
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Richtext Family

Status:

- **Redefined**

Current truth:

- current `richtext` is a real current family seam
- browser proof covers:
  - `strong`
  - `em`
  - `code`
  - `blockquote`
  - `heading-one`
  - expanded-selection bold add/remove
  - continued typing on the paragraph lane
- runtime proof covers:
  - arbitrary intrinsic tags
  - `renderLeaf(...)` host ownership
  - expanded-selection mark add/remove

What this is not:

- blanket parity for every old richtext behavior
- old toolbar/plugin architecture

Evidence:

- legacy `richtext`
- current `richtext`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [richtext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts)

### Markdown Family

Status:

- **Redefined**

Current truth:

- `markdown-shortcuts` is a current family surface
- `markdown-preview` is a current family surface
- legacy markdown rows are still visible as comparison evidence
- the claim is the explicit current shortcut/preview seams, not blanket
  markdown-editor parity
- the family now has direct runtime and browser proof on the current seam

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to shortcut/preview seams

Evidence:

- legacy `markdown-shortcuts`
- legacy `markdown-preview`
- current `markdown-shortcuts`
- current `markdown-preview`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [markdown-shortcuts.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts)
- [markdown-preview.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/markdown-preview.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Forced-Layout Family

Status:

- **Redefined**

Current truth:

- `forced-layout` is a current family surface
- the claim is the explicit layout-enforcement example seam, not every legacy
  layout policy ever shipped around Slate
- the family now has direct runtime and browser proof for enforcement behavior

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to explicit layout-enforcement behavior

Evidence:

- legacy `forced-layout`
- current `forced-layout`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [forced-layout.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/forced-layout.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Styling Family

Status:

- **Preserved**

Current truth:

- `styling` keeps the visible editor-style contract directly on the current
  surface
- the family now has direct runtime and browser proof for both style and
  editable behavior

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to explicit editor-style contracts

Evidence:

- legacy `styling`
- current `styling`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [styling.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/styling.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Hovering-Toolbar Family

Status:

- **Redefined**

Current truth:

- `hovering-toolbar` is a current family surface
- the claim is the explicit current overlay/toolbar seam, not broad parity for
  every old floating-toolbar architecture
- the family now has direct runtime and browser proof for show, hide, and mark
  toggle behavior

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to the explicit current overlay/toolbar seam

Evidence:

- legacy `hovering-toolbar`
- current `hovering-toolbar`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [hovering-toolbar.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/hovering-toolbar.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Editable-Voids Family

Status:

- **Redefined**

Current truth:

- `editable-voids` is a current family surface
- the claim is the current explicit nested-editable / void seam, not blanket
  parity for every old product-level void behavior
- the family now has direct runtime and browser proof for live control surfaces
  and multiple inserted void blocks

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to the explicit nested-editable / void seam

Evidence:

- legacy `editable-voids`
- current `editable-voids`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [editable-voids.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/editable-voids.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Images Family

Status:

- **Redefined**

Current truth:

- `images` is a current family surface
- the claim is the current image-element seam plus current browser proof, not
  broad media-product parity
- the family has direct runtime proof and browser proof for insert/delete
  behavior

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to the current image-element seam

Evidence:

- legacy `images`
- current `images`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [images.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/images.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Embeds Family

Status:

- **Redefined**

Current truth:

- `embeds` is a current family surface
- the claim is the current embed seam plus current browser proof, not every
  old embed behavior
- the family has direct runtime proof and browser proof for embed swap behavior

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to the current embed seam

Evidence:

- legacy `embeds`
- current `embeds`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [embeds.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/embeds.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Tables Family

Status:

- **Redefined**

Current truth:

- `tables` is a current family surface
- the claim is the explicit current table seam plus browser proof, not blanket
  parity for every old structural table behavior
- the family now has direct runtime and browser proof for multi-cell editing

Proof posture:

- runtime-backed
- browser-backed
- compat-backed through current and legacy matrix rows
- intentionally narrow to the explicit current table seam

Evidence:

- legacy `tables`
- current `tables`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [tables.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/tables.test.ts)
- [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)

### Scroll-Into-View Family

Status:

- **Redefined**

Current truth:

- `scroll-into-view` is a current family surface
- `Editable` and `EditableBlocks` own an explicit
  `scrollSelectionIntoView(...)` seam
- this family is carried by current runtime/browser proof, not by a legacy
  comparison row
- the family now has direct runtime proof for callback/default behavior and
  browser proof for scroll + selection coupling

Proof posture:

- runtime-backed
- browser-backed
- no honest legacy compatibility floor
- intentionally narrow to the current callback/default scroll seam

Evidence:

- current `scroll-into-view`
- [slate-react test proof files](/Users/zbeyens/git/slate-v2/packages/slate-react/test)
- [scroll-into-view.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/scroll-into-view.test.ts)

## Current Read

Current read:

- the active live set has current family seams across the old middle/heavy
  example stack
- widened families now have direct runtime and browser proof, not just
  example-level existence
- the remaining risk is not “missing family pages”
- it is the gap between:
  - current seam existence
  - and honest blanket replacement depth

## Batch 4 Proof-Depth Snapshot

Runtime + browser stronger now:

- markdown
- forced-layout
- styling
- hovering-toolbar
- editable-voids
- tables
- scroll-into-view

Browser-leading, still narrower:

- images
- embeds

Oracle-thin by design relative to core `slate` harvest:

- markdown
- forced-layout
- styling
- hovering-toolbar
- editable-voids
- images
- embeds
- tables
- scroll-into-view

## Batch 8 Proof Posture Snapshot

Runtime-backed + browser-backed + compat-backed:

- markdown
- forced-layout
- styling
- hovering-toolbar
- editable-voids
- images
- embeds
- tables

Runtime-backed + browser-backed + intentionally current-only:

- scroll-into-view
