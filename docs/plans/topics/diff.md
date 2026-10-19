# Structural document comparison

Diff keeps ordinary schema-valid JSON and compares immutable span correspondence with composable effects. Detached resolution derives a result, and live review import goes through native authored commands with baseline validation. The 2026-10-04 audit found the target live and pursued one cut: a three-way `compare` and `resolveComparison` API with no product consumer, and a live-review import that shipped as a free function over an erased editor instead of a typed authored write ([triage audit](../2026-10-04-ledger-triage-audit.md), [diff plan](../2026-09-10-structural-document-diff.md)). `node tooling/scripts/review-ledger.mjs show diff` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Document shape | Ordinary schema-valid JSON; no annotated-node protocol. |
| Comparison | Immutable span correspondence with composable effects. |
| Three-way review | Keeps every branch contribution; needs a product consumer before it stays public. |
| Live review import | Native authored commands with baseline validation, written as a typed authored write. |
| Prerequisite | Native authored changes ([authored plan](../2026-09-10-native-authored-changes-and-suggestions.md)). |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| An annotated-node document protocol | Changes the stored shape for a review job. |
| Merge-only review output | Drops branch contributions. |
| A public persistent graph | No consumer. |
| A second diff manager | Duplicates the authored owner. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Structural comparison reads fixed, schema-valid revisions without installing
  editor state. It returns immutable span correspondence, grouped effects,
  diagnostics, and a canonical `DocumentChange`; three-way resolution keeps
  every branch contribution and requires explicit choices for conflicts.
  Comparison presentation stays read-only. An explicit authored import checks
  the exact live baseline and frontier before publishing one native proposal, so
  comparison does not become another review or position system. It keeps one
  comparison and one native import path, never annotated-node diff tags or a
  matcher re-run during conflict resolution.

## What other editors do

Seven upstream witnesses support the design; they certify none of the plan's 43 production acceptance families. The review records under `node tooling/scripts/review-ledger.mjs show diff` name them.

## Main changes

- None since the audit; the Pursue cut is not built.

## Open work

- Cut the unconsumed three-way API and make live import a typed authored write. owner: the next diff plan. stop: the cut lands or a product consumer appears.
- Reopen the design on a failed structural-quality or native invariant, or a stronger alternative. owner: the next diff review. stop: such a finding.
