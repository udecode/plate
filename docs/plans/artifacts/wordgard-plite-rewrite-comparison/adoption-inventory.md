# Hard-cut adoption inventory

This inventory owns the current call sites that are expected to break when the
rewrite replaces operation truth, closed range selections, live path refs,
per-operation normalization, and the wide eager commit shape. Counts are
TS/TSX files in the current checkout, including tests and examples. The
implementation slice must regenerate the lists with `rg` before each cut;
TypeScript is the final completeness oracle.

## Live refs to anchors

Current non-substrate callers of `PathRef`, `PointRef`, or `RangeRef`:

| Owner | Files | Concrete responsibility |
| --- | ---: | --- |
| `packages/core` | 2 | Navigation-feedback stored target |
| `packages/diff` | 1 | Change-tracking inserted/property range tracking |
| `packages/footnote` | 1 | Definition/reference registries |
| `packages/platejs/src/features/list` | 4 | List move/remove/normalize path tracking |
| `packages/table` | 2 | Expanded row/column deletion path tracking |
| `apps/www` | 1 | Inline-combobox insertion point |

Adoption rule: replace every live ref with an `Anchor<Path | Point | Range>`
whose association and deletion policy are explicit. Delete `PathRef`,
`PointRef`, `RangeRef`, `tx.refs`, their per-operation transformers, and their
React/Plate compatibility types in the same slice. No aliases.

## Operation truth to changes/intents

Current non-substrate files mentioning `Operation`:

| Owner | Files |
| --- | ---: |
| `packages/core` | 13 |
| `packages/diff` | 11 |
| `packages/caption` | 1 |
| `packages/code-block` | 1 |
| `packages/docx-io` | 1 |
| `packages/footnote` | 1 |
| `packages/media` | 1 |
| `packages/table` | 1 |
| `apps/www` | 7 |
| `apps/plite` | 3 |

Adoption rule: callers that care about document effect consume
`commit.changes`; callers that care about user intent consume the derived
`commit.intents`; replay/serialization uses `DocumentChange`. Delete public
`editor.apply`, mutable operation queues, and operation-based commit impact.
Yjs is the only adapter allowed to request optimized semantic lowering, and it
must prove that lowering produces the same after-snapshot.

## Closed text range to selection protocol

Current non-substrate files that both import from `@platejs/plite` and mention
`Range` or `Selection`:

| Owner | Files | Owner | Files |
| --- | ---: | --- | ---: |
| `packages/ai` | 8 | `packages/caption` | 2 |
| `packages/comment` | 1 | `packages/core` | 15 |
| `packages/cursor` | 7 | `packages/diff` | 1 |
| `packages/find-replace` | 1 | `packages/floating` | 2 |
| `packages/footnote` | 1 | `packages/layout` | 2 |
| `packages/link` | 3 | `packages/platejs/src/features/list` | 3 |
| `packages/math` | 1 | `packages/selection` | 6 |
| `packages/suggestion` | 1 | `packages/table` | 3 |
| `packages/test-utils` | 1 | `packages/utils` | 1 |
| `apps/www` | 12 |  |  |

Adoption rule: text-only algorithms narrow with
`selection.kind === 'text'`; generic UI works through the selection protocol;
tables use a real cell selection; serialization registers codecs per selection
kind. Delete `Selection = Range | null` and any implicit assumption that every
selection has exactly one anchor/focus range.

## Normalization and state patches

Non-substrate normalization call sites are currently owned by `packages/core`,
`packages/selection`, `packages/suggestion`, and two `apps/www` files. Convert
schema invariants to compiled schema/fitting and plugin invariants to changed-
range corrections. Delete per-operation normalizer registration after the last
caller migrates.

`statePatches` is used by four `packages/ai` files and one `apps/www` example.
Convert persistent plugin state to reducer fields and explicit mapped effects;
history stores inverted effects. Delete public state-patch replay.

`EditorCommit` formatting/subscription examples live in two `apps/www` files,
and `subscribeCommit` is used by two more. Migrate them to the compact commit
shape rather than preserving eager flags for examples.

## Package-wide closure

The named counts are discovery evidence, not permission to ignore other
breakage. Final adoption requires:

1. `rg` returns no legacy refs, public apply/operation queues, closed selection
   aliases, state-patch replay, or old normalizer registration outside explicit
   migration fixtures.
2. Source-first typecheck passes for every scoped Plite package, every affected
   Plate package, `apps/www`, and `apps/plite`.
3. Existing behavior fixtures are migrated by semantics, not deleted to make
   the compiler green.
4. Public exports and docs contain only the new API; no compatibility aliases,
   deprecated shims, or dual runtime flag remain.
