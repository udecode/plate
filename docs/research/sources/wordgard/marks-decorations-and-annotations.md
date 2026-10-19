# Wordgard: marks decorations and annotations

## Mark sets

- **Mark sets.** `test/test-prop.ts` lines 12-101 at b5ad0d0 pin formatting equality and add and remove under duplicate, replacement and parameterized values. Wordgard stores marks as ordered, class-backed mark sets, while Plite stores formatting as JSON leaf properties, so only the equality and add/remove laws port. Plite covers them in `packages/plitejs/test/transforms-contract.ts`, `packages/plitejs/test/document-change.test.ts` and `packages/plitejs/test/transforms/setNodes/marks/mark-across-range.tsx` (report.md:84, 143).

## Decoration and widget layers

- **Decoration layers.** `test/webtest-content.ts` lines 275-664 at b5ad0d0 pin these laws: point and range decoration layers order deterministically, invalidate together, update wrappers locally, keep end widgets stable, clear stale attributes, and keep model edits coherent when rendering hides descendants. Plite splits these laws across `packages/plitejs/test/react/annotation-store-contract.tsx`, `rendered-dom-shape-contract.tsx`, `projected-command-contract.test.ts` and `dom-coverage-native-bridge-contract.test.ts`; the `widget-layer-contract.tsx` the report also named was deleted in e0c1500b95 (2026-09-15). Wordgard lets a decoration set `isAtom`. Plite rejects that API shape because presentation must not silently change what is editable (report.md:110; wordgard-full-strict.md:21-22).

## Point and range sets

- **PointSet and RangeSet.** Wordgard added packed `PointSet` and `RangeSet` containers by b5ad0d0 (`test/test-pointset.ts` lines 24-65, `test/test-rangeset.ts` lines 24-79). Their tests pin that ordered points and ranges keep endpoint association through inserts and deletes and merge deterministically. RangeSet also forbids overlap: building one throws 'Overlapping ranges' (`wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:src/editor/decoration.ts` line 918), and open issue #66 asks for overlap support. Plite rejects the packed stores. Its structural `Anchor` maps path, point and range values through the canonical `DocumentChange` (`packages/plitejs/src/core/anchor.ts`; `packages/plitejs/test/anchor-mapping-contract.ts`), and its annotation and decoration sources allow overlaps, so importing the sets would add a second position model (report.md:119, 144; wordgard-latest-diff-2026-09-02.md:23-26).

## Decoration refresh

- **Refresh and overlap.** `test/webtest-content.ts` lines 275-664 at b5ad0d0 also pin that decorations refresh at adjacent and end boundaries, map across preserved changed sections, and compose overlapping feature ranges. Plite's node-keyed decoration sources map and refresh only the changed buckets (`packages/plitejs/test/react/decoration-manager-contract.test.ts`). Plate Comments keeps source order for overlapping ranges (`packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx`) (report.md:122, 166).

## MultiSet

- **MultiSet rejected.** At b5ad0d0 Wordgard's `MultiSet` had no consumer and no test, and `MultiIterator.goto` advances without comparing against the requested position (`wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:src/editor/decoration.ts` lines 1119-1125), so a seek can overshoot. Plite rejects it (report.md:145; wordgard-latest-diff-2026-09-02.md:24-25). Limit: found by reading source; no failing case was run.
