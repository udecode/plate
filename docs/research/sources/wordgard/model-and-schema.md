# Wordgard: model and schema

## Architecture imports Plite rejected

- **Rejected imports.** The 2026-07-27 full audit of Wordgard at `01eb2b5eae509509677345fd603acad001827dff` rejected four imports: a second document, state and view stack beside Plite's; blanket bypasses of keydown handling on mobile; central-authority collaboration as the default; and decoration-driven editability (docs/editor-audits/reports/wordgard-full-strict.md:21-22). Neither that audit nor the 2026-09-02 diff audit at `b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54` authorized a Wordgard architecture transplant; the diff audit took only three narrow Plite regression tests (wordgard-full-strict.md:29-30; docs/editor-audits/reports/wordgard-latest-diff-2026-09-02.md:16-19; docs/editor-test-harvester/wordgard/report.md:5-6). Limit: both audit summaries are preserved conclusions; the full reports live under docs/plans/artifacts and are absent from a fresh checkout.

## Document tree and JSON

- **Tree and JSON.** `wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:test/test-node.ts` lines 7-136 pin tree walks, text extraction, partial ranges, construction checks and JSON round trips. Plite holds equal or stronger cases in `packages/plitejs/test/interfaces/Node/string/text.tsx`, `packages/plitejs/test/interfaces/Text/equals/exact-equals.js`, `packages/plitejs/test/create-editor-value-contract.ts` and `packages/plitejs/test/schema-contract.ts` (report.md:83). Paths re-checked 2026-10-08; the tests were not rerun.

## Compiled schema

- **Compiled schema.** `test/test-schema.ts` lines 7-76 and `test/test-node.ts` lines 90-135 at b5ad0d0 pin a compiled schema that owns containment, defaults, wrapping and property validation, and rejects unknown element and property kinds. Plite's `packages/plitejs/test/schema-contract.ts` covers compile, `createAndFill`, `findWrapping`, `fit`, property kinds, defaults, registration and rejection (report.md:85).

## Positions

- **Positions.** `test/test-pos.ts` lines 23-77 at b5ad0d0 pin that structural addresses resolve consistently through nested content and give stable traversal results. Plite fixtures `packages/plitejs/test/interfaces/Editor/above/point.tsx` and `packages/plitejs/test/interfaces/Node/levels/success.tsx` cover this (report.md:86).

## Corrections

- **Corrections.** `test/test-correction.ts` lines 9-85 at b5ad0d0 pin three things: corrections (Wordgard's normalization) receive only the affected node, content or property regions; they can emit several repairs; and they repair an invalid initial state. Plite's `packages/plitejs/test/normalization-contract.ts` covers initial repair, extension ordering, changed targets, scoped reruns, fixpoint, cycles and fuzz. The node and text notification contract the report also named, `extension-change-events-contract.test.ts`, was renamed to `packages/plitejs/test/plugin-change-events-contract.test.ts` in e0c1500b95 (2026-09-15) and still notifies node and text changes from committed intents (report.md:91; checked 2026-10-08).
