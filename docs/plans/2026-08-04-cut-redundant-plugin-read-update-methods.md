# Cut redundant plugin read/update methods

Objective:
Cut every first-party plugin `read` or `update` method that only renames an
existing generic editor operation. Keep methods only when they own additional
feature semantics, invariants, transactions, or projections.

Flow mode:
one-shot execution

Completion threshold:
- Inventory every authored first-party production plugin `read` and `update`
  method under `packages/*/src`.
- Give every row a `cut` or `keep` verdict with a generic equivalent or a
  concrete semantic reason.
- Delete every accepted wrapper without an alias and migrate all current
  source, tests, registry examples, docs, and release prose.
- Re-audit the live tree against the ledger with zero missing or extra rows.
- Pass focused behavior, source-first type, docs, formatting, stale-symbol,
  and final plan checks, or record an exact unrelated infrastructure blocker.

Verification surface:
- Ledger: `docs/plans/artifacts/cut-redundant-plugin-read-update-methods/plugin-method-ledger.tsv`.
- Source audit: Babel AST extraction of direct return-object methods from the
  34 initial owner files, compared as a file/capability multiset with ledger
  `keep` rows.
- Focused tests: affected Basic Nodes, Basic Styles, List Classic, Toggle,
  Code Block, AI Chat, and Table specs.
- Type proof: affected package Turbo typechecks and `pnpm --filter www typecheck`.
- Docs proof: `pnpm --filter www check:docs`.
- Runtime shortcut proof: direct dispatcher executions for configured H1 and
  Blockquote shortcuts.
- Browser target: `/blocks/basic-blocks-demo`, with `/dev/editor-perf` as the
  direct-route fallback.
- Review: scoped P2 autoreview bundle, with a manual source audit if its engine
  cannot start.

Constraints:
- Hard cut only: no aliases, deprecations, compatibility shims, or dead-API
  tests.
- Preserve configured schema identities and exact transaction/history
  behavior.
- Do not add callback parameter annotations, casts, `*OptionsFor` carriers, or
  editor/transaction plumbing to rescue inference.
- Do not cut semantic methods merely because their names resemble generic
  CRUD verbs.
- Do not run local registry generation; it is CI-owned.
- Do not modify unrelated shared WIP.

Boundaries:
- In scope: first-party plugin-authored `read` and `update` methods, direct
  callers, focused tests, current docs, and owning v54 changesets.
- Out of scope: raw Plite extension methods, compiler internals, unrelated
  plugin architecture changes, and shared Table keyboard-test WIP.
- Plate product plugins remain above Plite; this packet does not add a Plate
  wrapper around a Plite operation.

Blocked condition:
The code packet is blocked only if a deleted method has no behaviorally exact
generic equivalent, caller migration loses schema/target/history semantics, or
the live survivor multiset differs from the ledger. Environment failures are
recorded with the exact owner and do not authorize unrelated source edits.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Quantitative goal | yes | 216 initial methods, 34 files, zero unclassified rows |
| Public API review | yes | `best-api`, `plate-next`, and `hard-cut` loaded before implementation |
| Docs and release | yes | `docs-creator` and `changeset` loaded before adoption edits |
| Package review/sync doctrine | no | Cross-package capability inventory, not package-by-package sync |
| Broad Core file scoring | no | Core plugin methods are rows; Core architecture is not rescored |

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Inventory | complete | 216 rows across 34 production files |
| Classification | complete | 14 cut, 202 keep, zero unclassified |
| Implementation | complete | 14 wrappers removed and all current callers adopted |
| Verification | complete-with-caveats | Tests/types/docs/source audit pass; exact external browser/reviewer blockers recorded below |
| Closeout | complete | Manual P2 audit corrected shortcut ownership and final checks are recorded |

Work Checklist:
- [x] Copy every explicit request, scope boundary, stop condition, and handoff
      requirement into the goal plan.
- [x] Build a durable row-level inventory before cutting methods.
- [x] Classify every method by behavior rather than name.
- [x] Delete generic wrappers and migrate all current callers without aliases.
- [x] Preserve feature-specific methods with a concrete semantic reason.
- [x] Sweep removed symbols through packages, registry source, and current docs.
- [x] Update existing v54 changesets instead of duplicating release prose.
- [x] Run focused tests, typechecks, docs checks, formatting, and exact ledger
      re-audit.
- [x] Attempt Browser proof and record the exact unrelated build owner.
- [x] Attempt scoped P2 autoreview; manually inspect the packet when the
      installed Codex CLI rejects the required reviewer model.
- [x] Record remaining risks, changed groups, and next owner.

## Inventory result

The initial ledger contains 216 methods in 34 files:

- 14 cut.
- 202 kept.
- 0 unclassified.

The live AST re-audit contains 202 methods in 33 files and exactly matches the
202 ledger `keep` rows as a file/capability multiset:

```json
{
  "expected": 202,
  "actual": 202,
  "missing": [],
  "extra": []
}
```

## Removed methods

- `AIChatPlugin.update.removeAnchor` ->
  `editor.plugin(AIChatPlugin).update({ history: 'skip' }).remove({ at: [] })`.
- `BaseBlockquotePlugin.update.toggle` ->
  `editor.update.blocks.toggle(schema.type, { wrap: true })`.
- `BaseH1Plugin.update.toggle` through `BaseH6Plugin.update.toggle` ->
  `editor.update.blocks.toggle(schema.type)`.
- `BaseTextIndentPlugin.update.set` / `unset` -> generic
  `editor.update.nodes.set` / `unset` with the plugin-owned fixed property key.
- `baseCodeBlockPluginWithUpdate.read.isAtStart` ->
  `editor.read.selection.isAtBlockStart({ match: { type } })`.
- `BaseTodoListPlugin.update.toggle` ->
  `editor.update.nodes.toggle(schema.type)`.
- `BaseTablePlugin.update.setMarginLeft` ->
  `editor.plugin(TablePlugin).update.set({ marginLeft }, { at })`.
- `BaseTogglePlugin.read.isActive` ->
  `editor.read.nodes.some({ at: selection, match: { type } })`.

## Survivor decision

The row-level semantic reason for every survivor is in the ledger. The major
families are:

- Table: grid topology, span-aware selection, borders, sizing, paste, merge,
  split, row/column mutation, and navigation algorithms.
- Footnote, Suggestion, Comment, AI, and Copilot: identity graphs, tracked
  mutations, preview/streaming lifecycles, batches, and history policy.
- Classic and flat lists: topology, indentation, numbering, task state, and
  multi-node movement.
- Code Block, Link, Layout, and Indent: structured children, validation,
  split/wrap behavior, width redistribution, and constraint policy.
- Block Selection and Navigation Feedback: selected-ID batches and viewport /
  navigation state, not ordinary text-selection CRUD.
- Media, Mention, Emoji, Date, Equation, Tag, Exit Break, TOC, Tabbable, and
  Toggle: validated construction, caret placement, projections, traversal, or
  lifecycle behavior.
- Core Override, DOM, Node ID, and Affinity: runtime policy and editor-kernel
  integration rather than feature-level aliases.

No Plite or Plate capability gap blocks this packet. Every cut has an exact
existing generic operation; every survivor has distinct semantics.

## Shortcut ownership correction

The first implementation moved heading and blockquote hotkeys into package
React plugins. Manual P2 review rejected that because importing a plugin would
gain behavior that previously belonged to the registry preset. The final shape
keeps the hotkeys in `basic-blocks-kit.tsx` and inlines the generic block
operation inside each configured shortcut. Package behavior stays unchanged.

## Release classification

This work completes APIs already covered by the active v54 migration changesets.
It updates `.changeset/basic-styles-v54-runtime.md` and
`.changeset/toggle-v54-runtime.md`; a second changeset for the same unpublished
migration surface would duplicate release prose. No barrels or exported file
layout changed, so `pnpm brl` is not applicable. No registry changelog is added
because the registry edits are direct adoption of published package API cuts,
not a registry-only feature.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Inventory coverage | yes | 216/216 reviewed; 14 cut; 202 kept; zero missing/extra |
| Generic hard cut | yes | Removed symbols have no current source/docs matches outside historical changelog prose |
| Semantic survivors | yes | Every `keep` row names the owning feature behavior in the ledger |
| Package behavior tests | yes | 114 affected fast tests, 19 Table presentation tests, and isolated 8 Table hook tests pass |
| Runtime shortcut behavior | yes | Direct dispatcher proof produced H1 and wrapped Blockquote trees with `defaultPrevented: true` |
| Package type proof | yes | Six affected package graphs pass; Table source builds and its only type failure is unrelated shared keyboard-spec JSX WIP |
| App and docs type proof | yes | `pnpm --filter www typecheck` and `pnpm --filter www check:docs` pass |
| Formatting | yes | Scoped Biome check passes and `git diff --check` is clean |
| Browser interaction | attempted | Both target routes return the same CI-owned stale registry import for deleted `plate-types.ts`; no task source is implicated |
| P2 autoreview | attempted | Scoped 313,760-byte bundle and TruffleHog pass; installed Codex CLI rejects required `gpt-5.6-sol`; manual P2 audit corrected shortcut ownership |
| Release artifact | yes | Existing basic-styles and toggle v54 changesets repaired; duplicate notes rejected |
| Barrels | no | No export or exported-file-layout change |

Changed list:
- Runtime/API: Basic Nodes headings and blockquote, Basic Styles text indent,
  List Classic todo, Toggle active read, Code Block start read, AI Chat anchor
  removal, and Table margin-left setter.
- Callers: affected package tests/hooks, two installation examples,
  `basic-blocks-kit.tsx`, and `table-node.tsx`.
- Docs: current AI, heading, blockquote, basic-blocks, table, plugin-method, and
  plugin API references in the touched language variants.
- Release: two existing v54 changesets.
- Generated parity: `apps/www/src/generated/api-reference-manifest.json` was
  regenerated because the current shared schema source made the tracked
  manifest stale; its two-line schema delta is outside this method cut.
- Evidence: this plan and the row-level TSV ledger.

Verification evidence:
- Exact AST ledger comparison: expected 202, actual 202, missing 0, extra 0.
- Removed-symbol `rg` audit: zero current-source matches; one historical
  `removeAnchorAIChat` changelog entry is intentionally untouched.
- `bun test` affected fast set: 114 pass, 0 fail, 314 expectations.
- `bun test ./packages/table/src/lib/BaseTablePlugin.presentation.slow.tsx`:
  19 pass, 0 fail, 27 expectations.
- `bun test packages/table/src/react/useTableCellElement.spec.tsx`: 8 pass,
  0 fail.
- The affected fast set includes the final 22 Basic Nodes tests.
- Source-first typecheck: Basic Nodes, Basic Styles, List Classic, Toggle,
  Code Block, and AI pass. Table builds; unrelated
  `TablePlugin.onKeyDown.spec.tsx` JSX overload errors remain outside scope.
- `pnpm --filter www typecheck`: pass.
- `pnpm --filter www check:docs`: pass.
- Scoped Biome and `git diff --check`: pass.
- Browser: `/blocks/basic-blocks-demo` and `/dev/editor-perf` both fail before
  render because `apps/www/src/__registry__/index.tsx` still imports deleted
  `@/registry/components/editor/plate-types.ts`; local registry generation is
  forbidden.
- Scoped P2 autoreview: TruffleHog clean; review engine cannot start because
  the installed Codex CLI is too old for `gpt-5.6-sol`. The skill forbids a
  silent model switch for this failure.

Needs your attention:
- The CI-owned registry index must be regenerated by its normal workflow before
  Browser proof can exercise registry routes.
- The shared Table keyboard-test WIP owns its JSX overload errors.
- The local Codex CLI must be upgraded before automated `gpt-5.6-sol` P2 review
  can run.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final proof and handoff |
| Where am I going? | Goal closure after the mechanical plan check |
| What is the goal? | Keep generic CRUD generic and feature methods semantic |
| What have I learned? | 14 of 216 methods were aliases; shortcut ownership must remain registry-local |
| What have I done? | Cut 14 methods, migrated callers/docs, proved the 202-row survivor set |

Open risks:
- Browser interaction is not observed because the shared generated registry
  index cannot compile until its CI-owned regeneration runs.
- Automated P2 review is not observed because the installed Codex CLI rejects
  the required model. Manual source review found and fixed one behavior-expanding
  shortcut placement.
- The Table package-wide typecheck remains noisy from unrelated shared
  `TablePlugin.onKeyDown.spec.tsx` edits; focused Table runtime tests pass.
