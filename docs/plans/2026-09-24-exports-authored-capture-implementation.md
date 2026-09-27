---
review_scopes: [exports]
review_basis: [2026-09-24-exports-model-switch-final-audit]
work_kind: implementation
---

# Exports authored capture implementation

Status: Completed.

Objective:

Adopt the accepted authored capture and conflict-fidelity design in
`2026-09-24-exports-authored-capture-and-conflict-fidelity.md` across Plite,
Plate format adapters, the registry export menu, docs and release artifacts.

Source authority:

- [Accepted design](2026-09-24-exports-authored-capture-and-conflict-fidelity.md),
  especially its hard laws, conflict policy, adoption slices and proof matrix.
- [Export fidelity decision](../research/decisions/export-fidelity.md).

Completion threshold:

- [x] Plite owns a synchronous projection capture with one review revision,
      separate pending/conflicted counts and a sound active-runtime guard.
- [x] HTML, Markdown and DOCX consume one capture before their first await;
      review DOCX refuses unresolved conflicts explicitly.
- [x] The registry menu treats pending and conflicts as unresolved, captures
      before asynchronous work and leaves open-state changes to its primitive.
- [x] Every old split-source caller is migrated and the old option is deleted.
- [x] Focused package, browser and exported-artifact proof passes, including a
      source mutation during asynchronous HTML conversion.
- [x] Docs, package changesets, registry changelog and generated registry are
      current.
- [x] The final projection benchmark meets the frozen budget and the exports
      review ledger records the implementation outcome.

Verification surface:

- Plite authored tests and typecheck partition.
- Plate static, Markdown and DOCX tests plus affected typecheck partitions.
- `www` typecheck, lint, docs checks, registry tests and registry generation.
- Chromium proof on `/blocks/docx-demo` and inspection of HTML, Markdown and
  DOCX artifacts for accepted, proposed, review and conflicted cases.
- Frozen benchmark rerun, ledger render/check and Autogoal plan completion.

Constraints:

- Accepted/proposed capture does not materialize review markup or properties.
- Review HTML and Markdown preserve the canonical authored envelope. Review
  DOCX emits no file when conflicts cannot be represented faithfully.
- Keep format adapters separate. Add no export subsystem, cache, live view,
  compatibility alias or second menu-state owner.
- Suggestion author admission remains a separate scope.

Boundaries:

The work includes Plite authored capture, Plate format adapters, the registry
projection menu, docs, release metadata, browser and artifact proof, and the
frozen projection benchmark. It excludes suggestion-author admission, a
generic export subsystem, export caching, native-viewer parity and a new
cross-browser support claim.

Blocked condition:

None. The required source, package, browser, documentation, generator and
ledger tools were available, and no user decision or credential remains.

Work Checklist:

- [x] Add the capture, runtime-guard and conflict contracts.
- [x] Migrate format adapters and all split-source callers.
- [x] Repair the projection menu and primitive-owned reopen behavior.
- [x] Update public docs, release metadata and API doctrine.
- [x] Run package, browser, artifact and benchmark proof.
- [x] Record and reconcile the exports ledger outcome.

Verification evidence:

- `pnpm --filter plitejs test:partition:authored`: 417 passed;
  `pnpm --filter plitejs typecheck`: 13 tasks passed.
- Plate static, Markdown and DOCX export partitions: 56, 206 and 103 passed;
  `pnpm --filter platejs typecheck`: 88 tasks passed.
- Registry toolbar, dropdown-focus and registry suites: 32 passed. Registry
  generation and freshness, docs source parity, registry source, API reference,
  route generation and both `www` TypeScript projects passed.
- Chromium `tests/browser/docx.spec.ts`: 3 passed. The exported HTML opened and
  showed proposed text, clean Markdown and DOCX omitted it, tracked DOCX
  contained one Word revision, and the menu reopened on the first click after
  export. The DOCX contract also proved that conflicted review returns an error
  and no blob.
- The asynchronous HTML mutation contract kept body, envelope and diagnostics
  on the pre-mutation revision. The split-source caller search returned no
  production or documentation consumers.
- The final projection benchmark passed correctness and every frozen cohort.
  At 1,000 paragraphs p95 fell from 2.792 ms to 0.478 ms; at 5,000 it fell
  from 14.193 ms to 3.411 ms, with zero markup segments materialized.
- `pnpm lint:fix`, registry changelog validation, Plate Next v236 validation
  and `git diff --check` passed. The Best API source rule and generated skill
  mirror both contain the converter-capture doctrine.

The implementation preserves the accepted limits: HTML and Markdown review
remain visible clean bodies plus the canonical authored envelope; DOCX refuses
conflicts it cannot encode as tracked revisions. No export subsystem, cache,
compatibility alias or second menu-state owner was added. Suggestion author
admission remains a separate scope.

Open risks:

Current Chromium automation opens the exported HTML and inspects Markdown and
DOCX package XML, but it does not reopen the current DOCX artifacts in native
Word or Pages. Review HTML and Markdown keep native review data in their
envelope while their visible body stays clean; this is not a complete converter
fidelity claim. The Base UI menu adapter has unit focus proof rather than the
Radix browser regression proof.

Next action:

None. The implementation outcome is superseded for closure bookkeeping by
`../research/review-records/2026-09-24-exports-authored-capture-closure.json`.
