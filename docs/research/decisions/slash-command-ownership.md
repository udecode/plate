---
title: Slash insertion and command discovery ownership
type: decision
status: proposed
updated: 2026-09-18
review_scope: slash
current_review: 2026-09-18-slash-command-composition-ownership
review_history:
  - ../review-records/2026-09-18-slash-command-composition-ownership.json
source_refs:
  - ../../../apps/www/src/registry/components/editor/slash.tsx
  - ../../../apps/www/src/registry/components/editor/inline-combobox.tsx
  - ../../../apps/www/src/registry/components/editor/insert-toolbar-button.tsx
  - ../../../apps/www/src/registry/components/editor/transforms.ts
  - ../../../packages/platejs/src/features/slash-command/lib/BaseSlashPlugin.ts
  - ../../../packages/platejs/src/features/combobox/lib/BaseComboboxPlugin.ts
related:
  - ../reviews.md#slash
  - registry-ui-ownership.md
  - ../../vision/plate.md
reconciled_executions:
  - 2026-09-18-recovered-2026-08-30-fix-combobox-popup-y-position
  - 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit
  - 2026-09-18-recovered-2026-09-16-slash-ai-suggested-paragraph
---

# Slash insertion and command discovery ownership

**Keep slash presentation copied and delete its repeated insertion protocol.**
The package owns the slash trigger, transient input schema and atomic combobox
completion. The copied registry owns the command catalog, labels, icons,
keywords, grouping, installed-feature choices, AI membership and JSX.

The current component declares 21 product items. Seventeen block items repeat
the same availability check, read-only guard, target matcher and typed insertion
callback; 15 actions materially overlap the Insert toolbar while their labels,
groups and interaction policy differ. That repetition is evidence for a better
typed feature operation, not a package-owned slash command catalog.

## Target ownership

`BaseSlashPlugin` continues to own trigger recognition and the slash input
schema. `BaseComboboxPlugin.api.commit` continues to remove the transient input
and run the chosen edit in one synchronous transaction, preserving rollback and
one-step undo. Neither owner should learn product commands.

Plate's typed plugin insertion path should own semantic block identity and the
choice to reuse a matching empty block. Plite already owns structural
`blocks.insertAfter(..., { replaceEmpty })`; it cannot decide whether a heading
level, list type or feature-owned element is the same semantic target. The
current `transforms.ts` matcher/callback recipe therefore moves upward into the
typed Plate plugin operation and is deleted from copied source.

After that repair, `slash.tsx` may use a small lexical factory if it preserves
descriptor inference and makes the explicit catalog easier to edit. It must not
be exported from `platejs/slash-command`, create a command registry, or become a
shared presentation catalog. The Insert toolbar and Slash menu deliberately
have different labels, groups, membership, focus policy and asynchronous
actions.

## Assessed units

| Unit | Verdict | Reason |
| --- | --- | --- |
| Slash trigger and transient input | **Keep** | The package has a neutral current job and schema/runtime proof. |
| Combobox completion | **Keep** | Atomic removal plus transaction callback is shared by slash, mentions, emoji and other inline inputs. |
| Registry block insertion recipe | **Pursue deletion** | Two copied production owners repeat 30 calls around existing typed plugin insertions; the semantic law belongs to Plate. |
| Product command catalog and rendering | **Keep copied** | Twenty-one item choices include product labels, icons, groups, keywords, AI membership and local trigger policy. |
| Public slash item factory or command catalog | **Stop** | It would publish one copied product configuration and duplicate the plugin portal as a command authority. |

Five units were expected and reviewed. No unit is unresolved. Historical slash
regression plans remain behavior context with unknown current proof; they do not
establish package ownership.

## Proof boundary

Current source and existing tests establish the owner graph, atomic combobox
commit, one-step undo and structural empty replacement. They do not prove a
proposed Plate `insert`/`upsert` contract, generated Base/Radix menu behavior,
keyboard/pointer focus, async actions, or complete registry installation after
adoption. Those are downstream design and implementation gates.
