---
date: 2026-04-02
topic: slate-v2-issue-clusters
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Issue Clusters

## Scope

This is the full macro-theme rescore over all `682` open Slate issues already triaged into the ledger.

The `682` count is the frozen `2026-04-02` research snapshot.

Post-snapshot maintainer triage update:

- Dylan executed Batch A
- `54/54` queued issues are now closed
- live repo open-issue count is `628`

The point of this file is not to replace the ledger. The point is to collapse the issue-by-issue noise into a small set of ranked architectural themes that can drive v2 requirements, package ownership, and maintainer triage.

## Method

- source of truth: [open-issues-ledger.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/open-issues-ledger.md)
- corpus size: `682` open issues
- every issue is assigned to one macro theme
- counts below sum to `682`
- raw ledger cluster labels became too fine-grained to rank directly, so this pass remaps the ledger back into eight stable macro themes using primary subsystem, secondary subsystem, issue type, scope, and cluster semantics
- score formula follows the master plan:
  - `priority = (pain * recurrence) + architectural_depth + breadth + v2_leverage`

## Theme Ranking

| Theme | Issues | Pain | Recurrence | Arch Depth | Breadth | V2 Leverage | Priority |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mobile, IME, And Input Semantics | 129 | 4.29 | 2.03 | 3.86 | 4.62 | 4.18 | 21.37 |
| Performance And Scalability | 13 | 3.77 | 1.92 | 4.53 | 3.89 | 3.92 | 19.58 |
| React Runtime, Identity, And Subscription Model | 111 | 3.61 | 1.69 | 3.64 | 3.86 | 3.81 | 17.41 |
| Selection, Focus, And DOM Bridge | 172 | 3.56 | 1.48 | 3.61 | 4.42 | 3.74 | 17.04 |
| Clipboard, Serialization, And External Formats | 37 | 3.32 | 1.65 | 3.57 | 4.44 | 3.05 | 16.54 |
| Core Model, Operations, Normalization, And History | 69 | 3.23 | 1.49 | 3.72 | 3.63 | 3.95 | 16.11 |
| API, Typing, And Extensibility | 33 | 2.64 | 1.42 | 2.94 | 3.59 | 2.39 | 12.67 |
| Docs, Examples, Support Noise, And Repo Churn | 118 | 2.00 | 1.29 | 1.72 | 3.41 | 0.88 | 8.59 |

## Top-Line Take

The full `682`-issue corpus still does not say “users reject Slate’s data model.” It says users keep bleeding at the runtime boundary: input methods, DOM selection ownership, React invalidation breadth, and browser-facing editing semantics.

The biggest change from the `201`-issue pass is not a new theme. It is stronger confidence. The old issues keep reinforcing the same runtime and engine seams instead of introducing a different center of gravity.

Performance is the useful outlier. It is low-count but high-leverage, which is exactly why raw issue volume would have been a stupid ranking method.

One macro-taxonomy mistake is worth calling out explicitly: decorations, render-time marks, and annotation anchors were flattened across performance, React runtime, selection, and API-shape themes. That seam is recurrent enough to name directly even though it is cross-cutting.

## Theme 1: Mobile, IME, And Input Semantics

**Issues:** `129`

This is the top-priority theme in the full corpus. It covers Android, iOS, Firefox Android, Windows IMEs, Hangul, Chinese, Vietnamese, predictive typing, placeholders during composition, empty-state input, and suggestion replacement behavior.

What matters here:
- `101` issues are valid or likely-valid.
- `97` are cross-package and `27` land directly in `slate-react`.
- Direct v2 pressure is high: `98` direct, `16` indirect.
- Severity stays ugly even across the old tail of the corpus.

Representative issues:
- `#6022` Android mark-toggle typing dismisses keyboard and jumps cursor
- `#5989` Hangul composition breaks when placeholder is visible
- `#5984` Android backspace requires two presses
- `#5931` Windows suggestions append instead of replace
- `#5130` Android Firefox predictive typing breaks badly

Why this matters for v2:
- Slate needs a firmer input-event contract.
- Empty-state and placeholder behavior are part of the hot path, not decorative edge cases.
- Runtime commits and DOM reconciliation need to be less eager and less state-leaky during composition.

## Theme 2: Performance And Scalability

**Issues:** `13`

Low count, high leverage. This theme jumps because the issues that do show up are deep, valid, and strongly connected to the same runtime and engine seams.

What matters here:
- `12` issues are valid or likely-valid.
- Direct v2 pressure is high: `9` direct, `3` indirect.
- Package pressure spans `slate`, `slate-react`, `slate-history`, and cross-package seams.
- This is the clearest proof that issue count alone is a bad roadmap ranking tool.

Representative issues:
- `#6038` batch-aware apply engine
- `#5992` huge-document cut is slow
- `#5945` large plaintext paste is slow
- `#5216` Safari selection lag
- `#5131` rerender count on selection changes

Why this matters for v2:
- Performance work should stay benchmark-driven.
- The leverage is high because the same fixes touch transaction boundaries, subscription breadth, normalization cost, and browser-selection behavior.

## Theme 3: React Runtime, Identity, And Subscription Model

**Issues:** `111`

This is the cleanest `slate-react` architecture cluster in the full corpus. It is about editor instance replacement, rerender breadth, decoration timing, focus initialization, hydration identity, controlled-value drift, and path resolution reliability under React-driven updates.

What matters here:
- `88` issues are valid or likely-valid.
- `78` land directly in `slate-react` and `27` more are cross-package.
- Direct v2 pressure is high: `72` direct, `22` indirect.
- This theme stays large across the entire history of open issues instead of collapsing into recent noise.

Representative issues:
- `#5709` `useSlate` holds old editor instance after recreation
- `#5697` `ReactEditor.findPath` reliability proposal
- `#5987` decorate callback updates move the caret
- `#5568` focus regression
- `#5488` controlled value/update pain
- `#5131` rerenders on selection change

Why this matters for v2:
- This is the strongest argument for a transaction-first engine with a cleaner runtime boundary.
- The signal is not “make the core React-shaped.”
- The signal is “give `slate-react` a coherent committed snapshot model, better identity rules, and narrower subscriptions.”

## Cross-Cutting Seam: Decorations, Marks, And Annotations

**Issues:** `19` explicitly-tagged ledger rows, plus adjacent inline-selection fallout

This seam was hidden by the macro remap because it spans multiple ranked themes at once:

- React invalidation and rerender breadth
- decoration range shape and cross-node access
- mark rendering and leaf-splitting ergonomics
- selection offsets inside decorated content
- annotation and comment anchors on selections

It is not a separate ranked macro theme because that would double-count the full-corpus totals. It is still a real recurrent seam, not a footnote.

Representative issues:

- `#5987` async decorate update moves the caret
- `#3354` stable decorate array causes an infinite rerender loop
- `#3352` cannot decorate siblings or span them cleanly
- `#3383` overlapping marks and decorations with shared semantics lose payload
- `#2465` mark rendering ergonomics are brittle because of the leaf-splitting model
- `#4483` dynamic decorations are too globally invalidating
- `#4477` collaborative comment anchors want a real annotation model

Why this matters for v2:

- `slate-react` needs a first-class render-time projection model for decorations and marks instead of treating them like incidental leaf churn.
- `slate-v2` needs stable range and mark semantics that can survive multi-leaf selections, overlapping metadata, and annotation anchors.
- `slate-dom-v2` still matters when decorated content interacts with DOM selection or inline boundaries, but this is not just a DOM problem.

## Theme 4: Selection, Focus, And DOM Bridge

**Issues:** `172`

This is the largest theme by raw count. It covers DOM point/path translation, focus restoration, inline-boundary behavior, shadow DOM, zero-width offsets, table and void selection, gesture directionality, and selection repair after editor actions.

What matters here:
- `135` issues are valid or likely-valid.
- `102` are cross-package, with additional pressure in `slate`, `slate-react`, and ecosystem adapters.
- Direct v2 pressure is high: `110` direct, `29` indirect.
- The failures are not cosmetic. Many are cursor-loss, wrong-path, or crash-class issues.

Representative issues:
- `#6034` wrong down-arrow cursor at end of table
- `#5938` `DOMEditor.findPath` returns no or wrong path
- `#5760` zero-length text node offset crash
- `#5749` shadow DOM drag-and-drop throws
- `#5690` double-click before inline element can crash Slate

Why this matters for v2:
- Slate needs a cleaner runtime ownership model for DOM selection.
- Selection repair should not depend on brittle incidental render state.
- Stable identity and explicit commit boundaries should help, but they are not enough by themselves. A real selection bridge still has to exist.

## Theme 5: Clipboard, Serialization, And External Formats

**Issues:** `37`

This theme is smaller, but coherent. It covers HTML paste parsing, clipboard fragment collisions, empty-line export, node-type preservation on paste, foreign DOM ingestion, and document-format adapter pressure.

What matters here:
- `31` issues are valid or likely-valid.
- `21` are cross-package, with meaningful spill into ecosystem adapters and `slate-react`.
- Direct v2 pressure is mixed but real: `16` direct, `11` indirect.
- The failures span both concrete bugs and boundary-design questions.

Representative issues:
- `#5630` paste into selected content leaves undeletable block shape
- `#5328` HTML containing `data-slate-fragment` can break parsing
- `#5233` clipboard fragment format should be customizable
- `#5151` paste into fully selected node changes its type
- `#5253` portable text JSON loading request

Why this matters for v2:
- Serialized-document boundaries and clipboard schema isolation are not solved by runtime cleanup alone.
- This theme argues for clearer import/export seams and less accidental coupling to Slate’s private fragment format.

## Theme 6: Core Model, Operations, Normalization, And History

**Issues:** `69`

Lower count than the runtime-boundary themes, but still high leverage. This is the engine-model cluster: operation ownership, normalization debt, history grouping, collaboration edges, and structural boundary semantics.

What matters here:
- `57` issues are valid or likely-valid.
- Package pressure centers on `slate`, with meaningful spill into `slate-history`, ecosystem layers, and cross-package behavior.
- Direct v2 pressure is high: `49` direct, `11` indirect.
- This theme stayed stable across the older corpus instead of fading out.

Representative issues:
- `#5977` custom operations are not handled cleanly
- `#5874` same node inserted more than once desyncs
- `#5811` normalization loops explode on custom schema
- `#5771` collaboration selection ops can explode
- `#5587` Grammarly integration breaks history grouping

Why this matters for v2:
- This is where the transaction-first engine actually earns its keep.
- Operation ownership, normalization debt, identity, and history boundaries need a cleaner model.
- If v2 does not improve this theme, it is just prettier runtime paint.

## Theme 7: API, Typing, And Extensibility

**Issues:** `33`

This theme mixes real API and typing seams with a fair amount of expectation mismatch.

What matters here:
- `24` issues are valid.
- Package pressure splits across `slate`, `slate-react`, repo-only surface area, and some cross-package seams.
- Direct v2 pressure is real but not dominant: `11` direct, `11` indirect.
- This theme matters more for DX sharpness than for the first engine cut.

Representative issues:
- `#5287` `isBlock` guard behavior is wrong
- `#5246` Unicode-aware string helpers should be public
- `#5599` hyperscript shorthand typing/docs pain
- `#5404` `useSlateStatic` return type issue
- `#5710` document replacement ergonomics

Why this matters for v2:
- There is real pressure for sharper type contracts, clearer ownership boundaries, and better operation/extensibility seams.
- But this theme also contains a lot of “I expected Slate to behave differently” noise. Do not confuse API clarity with a mandate to grow the core.

## Theme 8: Docs, Examples, Support Noise, And Repo Churn

**Issues:** `118`

This is not a v2 architecture theme. It is a maintainer-load theme.

What matters here:
- Validity is mostly triage debt: `32` invalid, `23` stale candidates, `7` likely-invalid, `3` duplicate candidates.
- `65` issues land in docs-only pressure and `28` land in `site/examples`.
- Direct v2 pressure is basically nonexistent: `3` direct, `7` indirect.
- This theme is huge enough to distort perception if it is not explicitly de-weighted.

Representative issues:
- `#6007` NPM and GitHub releases do not match
- `#5436` sticky toolbar example request
- `#5403` show-more/show-less example request
- `#5212` editable void example is misleading
- `#5202` clone/install repo issue from old tooling history

Why this matters:
- This theme should not steer v2 architecture.
- It does justify the triage apparatus: reply posture, maintainer action, duplicate target, linked artifacts, and stale handling are carrying real weight.
- If this theme is ignored, it will drown the real product and architecture signals.

## What The Full-Corpus Rescore Proves

1. The main pain is runtime-boundary fragility, not a rejection of Slate’s data model.
2. Mobile and IME issues are the highest-priority user pain, not an annoying browser footnote.
3. `slate-react` deserves its own first-class v2 runtime story.
4. Core model and operation semantics still matter, but they are not the majority of user pain.
5. Performance stays low-count but high-leverage, so benchmark-backed engine work is still justified.
6. Docs, support, and repo churn are large enough that they must be triaged away explicitly or they will poison roadmap decisions.

## What This Does Not Prove

- It does not prove Slate should become React-shaped.
- It does not prove every mobile/input issue is Slate-owned.
- It does not prove raw issue count equals roadmap priority.

## Next Artifacts

The next useful files are:

- [package-impact-matrix.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/package-impact-matrix.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)

Those should turn the theme map into package ownership and concrete v2 requirements.
