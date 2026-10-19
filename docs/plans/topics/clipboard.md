# Clipboard interchange and content fitting

Every paste, an exact projected selection included, runs through one `domCommands.insertData` command, whose feature middleware and the one compiled slice fitter decide the result. The projected path composes deletion and insertion into one spec that publishes nothing when insertion declines, and `ContentSlice` rewrites keep the roots that surviving nodes reference. The 2026-10-04 audit found the 2026-09-13 Pursue target in live source and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [transfer plan](../2026-09-13-clipboard-transfer-policy.md)). `node tooling/scripts/review-ledger.mjs show clipboard` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Paste interpretation | One DOM clipboard owner: handlers and codecs produce a complete slice, `next(replacementData)` feeds canonical insertion, and exact target replacement applies it through the fitter in one atomic update. |
| Exact projected targets | The mounted-view adapter that says which visible ranges a selection means stays; it no longer decodes payloads or falls back on its own. |
| Copy | Selects visible content, runs `state.slice.export` so export middleware such as diff stripping applies, and writes through the shared host writer. |
| Fitting | One compiled engine: `state.slice.fit` previews, `tx.slice.replace` applies, `state.slice.fitContent` fits a detached parent. |
| Slice rewriting | Closing structural edges and pruning content are separate laws; a rewrite keeps every root a surviving node references. |
| Feature policy | Table rectangular placement, HTML, Word, Markdown and tab-separated parsing keep their own owners above the fitter; a table edge paste grows both dimensions and updates `columnWidths` atomically. |
| Uploads in paste | File objects stay in the `afterCommit` closure; upload correlation reuses prepared transaction identity. |
| Node arrays | `getFragment` stays as a node-array query; it is not complete interchange. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Patching each caller | Kept competing interpretation and repeated payload handling. |
| A public clipboard plugin or transfer object | No user job beyond DOM transfer, `ContentSlice` and target replacement. |
| Bare node transfer without `ContentSlice` | Nodes alone cannot carry open edges and referenced roots. |
| One canonical range instead of projected extraction | Authored retained fragments and ordered visible segments need more than one range. |
| Moving every feature's paste repair into the core fitter | Schema fitting is neutral; table and format policy have their own owners. |
| Public supplied-slice export, exact-child or group placement arms | Each had only an internal caller. |
| Live `NodeKey` allocation during detached spec construction | Correlation reuses prepared transaction identity instead. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- A whole-payload format reports what a paste leaves out. The initiating
  editable delivers one result per paste its built-in formats handle; copied UI
  decides the presentation, and harmless cleanup stays silent.
- A `DataTransferFormat` decode returns a `ContentSlice` and its encode returns
  a string, or either returns `null` to delegate to the next format. Per-editor
  DOM plugin state resolves through its runtime owner, so mounted views read the
  activation's configuration instead of resolving it again at each caller.

## What other editors do

Not compared in this scope's reviews; they weighed Plite and Plate owners. The ProseMirror, Lexical and Tiptap pages under `docs/research/sources/` hold slice and paste prior art.

## Main changes

- The projected paste pipeline lost its own decoding, handler terminal and fallback insertion; the separate clipboard-handler contribution pipeline became pure command registration.

## Open work

- No current browser, device, Plate package or performance replay is claimed for the adopted design; the September 18 history migration did not rerun it. owner: the next clipboard review. stop: a review on the current tree.
