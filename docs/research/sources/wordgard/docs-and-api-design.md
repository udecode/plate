# Wordgard: docs and API design

## Localization

- **Localization.** The 2026-07-27 audit at `01eb2b5` found Wordgard's localization ergonomics stronger than Plate's, but placed them in application UI, not the editor core (docs/editor-audits/reports/wordgard-full-strict.md:23). Limit: the preserved summary does not say which ergonomics, and the full report is absent from a fresh checkout.

## Declaration and runtime agreement

At frozen Wordgard head `c715d4ded8fc780f52c13206e589ea31e4148dd4`, the public-contract audit found a declared `state.Transaction.foo` with no runtime value and an SVG serializer that emitted a duplicate opening tag. Source: `docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md:136`, backed by its public-contract probes. Limit: these are historical contract discrepancies at that head, not claims about the valid published 0.3.1 package or later Wordgard revisions.
