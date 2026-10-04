---
title: Slash insertion and command discovery ownership
type: decision
status: adopted
updated: 2026-10-04
source_refs:
  - ../../../apps/www/src/registry/components/editor/slash.tsx
  - ../../../apps/www/src/registry/components/editor/inline-combobox.tsx
  - ../../../apps/www/src/registry/components/editor/insert-toolbar-button.tsx
  - ../../../packages/platejs/src/internal/plugin/blockInsertion.ts
  - ../../../packages/platejs/src/lib/editor/pluginRuntimeTypes.ts
  - ../../../packages/platejs/src/features/slash-command/lib/BaseSlashPlugin.ts
  - ../../../packages/platejs/src/react/features/combobox/useCombobox.ts
related:
  - ../review-scopes/slash.json
  - registry-ui-ownership.md
  - ../../vision/plate.md
---

# Slash insertion and command discovery ownership

**Audit of 2026-10-04.** Pursue. The adopted typed-upsert catalog holds, but platejs/slash-command still publishes a trigger-only plugin whose only terminal consumer is copied slash.tsx; plate.md makes that registry-owned, and the first-wave emoji verdict cuts the same shape. The [triage audit](../../plans/2026-10-04-ledger-triage-audit.md) and records `2026-10-04-slash-audit` and `2026-10-04-slash-audit-2` hold the evidence.

**Keep slash presentation copied and delete its repeated insertion protocol.**

The [autocomplete ownership decision](autocomplete-ownership.md) owns the
query representation. The slash query is ordinary text, and the transient input
schema and `BaseComboboxPlugin` no longer exist. The catalog and insertion
verdicts stand.

The package owns the slash trigger policy, and `useCombobox` owns atomic
completion. The copied registry owns the command catalog, labels, icons,
keywords, grouping, installed-feature choices, AI membership and JSX.

The copied component declares 21 product items. Its block actions call the
owning plugin's typed `upsert`; inline actions call typed `insert`. Insert and
Slash still overlap in available features while retaining different labels,
groups, membership, focus policy, and asynchronous actions. That is evidence
for shared feature operations, not a package-owned Slash command catalog.

## Target ownership

`BaseSlashPlugin` owns the slash trigger policy as `ComboboxState`.
`useCombobox`'s `complete` replaces the typed trigger and query and runs the
chosen edit in one synchronous, refusable transaction, preserving rollback and
one-step undo. Neither owner should learn product commands.

Plate's typed plugin insertion path owns semantic block identity and the choice
to reuse a matching empty block. Plite owns structural
`blocks.insertAfter(..., { replaceEmpty })`; it cannot decide whether a heading
level, list type, or feature-owned element is the same semantic target. The
former `transforms.ts` matcher/callback recipe is deleted from copied source.

`slash.tsx` may use a small lexical factory if it preserves
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
| Registry block insertion recipe | **Adopted deletion** | Plate owns typed semantic `insert`/`upsert`; copied callers no longer carry a raw transaction recipe. |
| Product command catalog and rendering | **Keep copied** | Twenty-one item choices include product labels, icons, groups, keywords, AI membership and local trigger policy. |
| Public slash item factory or command catalog | **Stop** | It would publish one copied product configuration and duplicate the plugin portal as a command authority. |

Five units were expected and reviewed. No unit is unresolved. Historical slash
regression plans remain behavior context with unknown current proof; they do not
establish package ownership.

## Proof boundary

Current source and proof establish the owner graph, atomic combobox commit,
one-step undo, semantic empty-source replacement, inferred plugin action types,
and generated block/inline eligibility. Focused tests pass for block semantics,
feature-owned construction, Slash commit, and both copied providers; nine
Chromium cases cover Base and Radix at desktop and narrow widths. Registry,
generated-contract, API, doctrine, and source freshness checks pass. The full
website compiler retains three recorded current-checkout failures outside this
adoption.
