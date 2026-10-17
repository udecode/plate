# Slash commands

Slash presentation stays copied, and insertion goes through each feature's typed `upsert` or `insert`. The copied registry owns the command catalog, labels, icons, keywords, grouping, installed-feature choices, AI membership and JSX. The 2026-10-04 audit kept the typed-upsert catalog and pursued one cut: `platejs/slash-command` still publishes a trigger-only plugin whose only consumer is the copied `slash.tsx`, which `docs/vision/plate.md` makes registry-owned and which the first-wave emoji verdict cuts in the same shape ([triage audit](../2026-10-04-ledger-triage-audit.md)). `node tooling/scripts/review-ledger.mjs show slash` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Query | Ordinary text, per the `autocomplete` subject; the transient input schema and `BaseComboboxPlugin` are gone. |
| Trigger policy | `BaseSlashPlugin` as `ComboboxState`, until the Pursue cut moves it to the registry. |
| Completion | `useCombobox`'s `complete` replaces the trigger and query and runs the chosen edit in one synchronous, refusable transaction with one-step undo; shared by slash, mentions and emoji. |
| Semantic block identity | Plate's typed plugin insertion decides whether to reuse a matching empty block; Plite owns structural `blocks.insertAfter(..., { replaceEmpty })`. |
| Catalog | 21 product items in copied `slash.tsx`; a small lexical factory is allowed there if it keeps descriptor inference, never exported. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The copied `transforms.ts` matcher and callback recipe | Typed `insert` and `upsert` own it; deleted. |
| A public slash item factory or command catalog | Publishes one product configuration and duplicates the plugin portal. |
| One catalog shared with the Insert toolbar | Different labels, groups, membership, focus policy and async actions. |

## What other editors do

Not compared in this scope's reviews.

## Main changes

- Copied callers lost the raw transaction recipe; nine Chromium cases cover Base and Radix at desktop and narrow widths.

## Open work

- Cut the trigger-only `platejs/slash-command` plugin into the registry. owner: the slash Pursue. stop: the cut lands.
