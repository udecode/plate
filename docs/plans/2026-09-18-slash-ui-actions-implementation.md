---
review_scopes:
  - ui
  - slash
review_basis:
  - 2026-09-18-ui-menu-focus-and-block-insertion-ownership
  - 2026-09-18-slash-command-composition-ownership
work_kind: implementation
---

# Slash UI action ownership implementation

Status: Completed

Objective:
- Execute `docs/plans/2026-09-18-slash-ui-actions-design.md` completely across
  Plate insertion, copied menu adapters, registry callers, proof, doctrine, and
  release artifacts.

Goal plan: `docs/plans/2026-09-18-slash-ui-actions-implementation.md`

Completion threshold:
- Typed block `insert` and `upsert`, both dropdown adapters, every enumerated
  caller migration, helper deletion, generated output, documentation, doctrine,
  release artifacts, and focused package/provider/browser proof are complete or
  carry an exact external blocker.

Verification surface:
- Focused Plate model/type tests, provider adapter and registry component tests,
  source-first package checks, registry/API generation, generated Base/Radix
  installs, targeted browser interaction, plan checker, and review-ledger
  execution receipt.

Constraints:
- Preserve the accepted design, Plite boundary, table API, inference, copied
  presentation ownership, async target capture, and one-transaction Slash law.
- Do not edit templates or unrelated work.

Boundaries:
- Source of truth: the accepted design plan and current source.
- Allowed edits: the implementation owners and generated/doctrine/release
  artifacts named in that plan.
- Publication: no commit, push, PR, merge, or release.
- External sources: N/A; installed provider source is authoritative.
- Browser surface: generated Base/Nova and Radix/Luma editors.

Blocked condition:
- Stop only for a repeated external/tool blocker that prevents the required
  product proof after all independent implementation work is complete.

Work Checklist:
- [x] Implement and prove typed block insertion/upsert.
- [x] Implement and prove item-scoped dropdown final focus for Base and Radix.
- [x] Migrate all focus refs, Insert, and Slash callers; delete transforms.
- [x] Update public JSDoc, Vision, source doctrine, generated output, and release artifacts.
- [x] Run focused through closure verification, reconcile findings, and record execution.

Resolved risks:
- Base and Radix item focus run only after an unprevented closing selection;
  callback, suppression, fallback, checkbox and radio behavior have one shared
  adapter contract, with keyboard and pointer behavior proven in Chromium.
- One private block policy now owns source resolution and empty-block semantics.
  Authored structural owners retain construction, registration, selection and
  return behavior; generated contracts emit exact block/inline mutation kinds.
- Insert creates a sibling for a matching empty block, Slash upsert reuses it,
  list identity remains semantic, and asynchronous media callers keep captured
  targets and secondary-surface focus.

Open risks:
- None.

Verification evidence:
- `pnpm --filter platejs typecheck`: 86/86 tasks passed.
- `pnpm test:types` and `pnpm --filter platejs typecheck:contracts`: passed,
  including generated block/inline eligibility and authored-insert suppression.
- `pnpm --filter platejs lint`: 75/75 tasks passed; CLI typecheck/lint passed.
- Focused model, owner, adapter and copied-control suite: 184 tests passed across
  11 files. The CLI generator suite passed 89 tests; its final block/inline
  mutation-kind case passed independently after the final emission shape.
- `pnpm --filter www test:www-browser:chromium tests/browser/multi-editor.spec.ts`:
  9/9 tests passed for Base UI and Radix at desktop and narrow widths.
- API reference, editor generation, registry generation/freshness, registry
  source, changelog, barrels, Plate Next v216 and source/mirror checks passed.
- Source audit found no live `transforms.ts`, `insertBlock`,
  `@plate/transforms`, or menu `focusEditorRef` path in the affected registry.
- Agent-native ownership review found one source path for each generated
  artifact: CLI owns editor mutation metadata, registry/changelog generators
  own copied output, and Plate Next source rules own their exact mirrors.

Proof limits:
- The app-wide `tsc` reaches all changed Slash/dropdown sources without an
  affected error, then fails on three current-checkout issues outside this
  plan: `scripts/registry-package-dependencies.mts:343`,
  `tests/browser/table-selection.spec.ts:543`, and
  `packages/platejs/src/lib/plugins/HistoryPlugin.ts:23`. Focused package,
  generated-source and browser gates above remain green.
