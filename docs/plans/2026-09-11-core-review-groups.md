# Group core architecture reviews

Objective:
Group only Plite core, Plite view architecture and Plate core in the
existing review queue. Preserve the 61 semantic questions and their immutable
records; reduce the 58 pending investigations to 50.

Boundaries:
The project-owned review index, ledger helper and its contract tests,
generated ledger, research schema/index/log. No product or shared skill changes,
publication, cross-project installation, browser proof or package release work.

Constraints:
Only the approved architecture groups may combine reviews. Keep each feature's
independent identity and all historical records and proof states intact.

Completion threshold:
The three approved groups contain exactly 11 questions;
47 other pending questions remain independent. Queue ordering respects external
prerequisites and AI-last. Group lookup exposes every member's evidence/history;
individual draft/record operations preserve verdict, adoption and proof identity.
Focused helper tests, live queue/lookup, scoped lint and ledger check pass.

Verification surface:
`tooling/scripts/review-ledger.test.mjs` and the live CLI.

Blocked condition:
An in-scope helper or record-integrity failure cannot be
resolved with the available local source. Unrelated product proof is outside scope.

Work Checklist:
- [x] Resolve approved grouping and inspect current index/helper/history contracts.
  Sources: user corrections; Task workflow; Research Wiki maintain.
- [x] Implement group metadata, derived queue/order/counts and group lookup.
  Preserve feature addresses and immutable records. Source: research schema.
- [x] Prove external dependency order, group membership validation, exact lookup,
  independent feature routes and mixed completion without status promotion.
  Sources: Task proof policy; Agent Native Reviewer action/source/route/proof.
- [x] Update discovery and research index/log; regenerate and check the ledger.
  Sources: Research Wiki maintain; Maintain Workflow owned-source method.
- [x] Inspect final diff, run scoped lint, reconcile obligations and hand off.
  Sources: Task; Autogoal checklist retention.

Decisions: groups schedule one architecture investigation while retaining each
original question's verdict and proof. Reuse per-question draft/record commands;
do not add a parallel record store or rewrite historical scope IDs. This is Plate
ledger configuration and helper behavior; there is no reusable skill delta or
cross-project sync. No generated SKILL.md, AGENTS source or package API changes.

Verification evidence:
- `node --test tooling/scripts/review-ledger.test.mjs`: 22 tests pass, including
  three new group contracts covering ordering, cycles, lookup and completion.
- `pnpm lint:fix tooling/scripts/review-ledger.mjs
  tooling/scripts/review-ledger.test.mjs`: passes.
- Live `queue`, three group lookups and independent math/emoji/compiler/UI
  lookups pass. The queue has 53 total reviews, 50 pending reviews and 47
  independent pending questions; AI remains last.
- `refresh`, `render`, `check`: pass with 789 source groups, 3,637 files,
  61 question IDs and 17 immutable records. No added/removed source group
  required remapping. Refresh changes source observations, not review states.
- [Live route and link verification](artifacts/core-review-groups/verification.json)
  checks the exact membership, independent routes, all 64 ledger anchors,
  affected documentation links and record integrity.
- Agent Native Reviewer: group lookup discovers the complete member evidence;
  exact feature lookup stays independent; per-question draft/record and mixed
  completion are exercised by the helper tests; generated output is reproduced
  and checked through its source helper. No actionable parity gap remains.
- Final diff inspected. No skill/rule mirror was changed; the project-owned
  schema and README provide discovery. No shared-method sync applies. Product
  types, browser/device tests, package changesets, registry generation and
  Autoreview are N/A for this local workflow change on `next`.

Status: complete. Next: `$best-api-review audit plite-core` when requested.
The reviews themselves have not been executed by this ledger maintenance.

Open risks:
None for the scoped grouping change. Source freshness and unexecuted product
reviews remain visible under their original questions.
