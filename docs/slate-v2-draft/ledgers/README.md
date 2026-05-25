---
date: 2026-04-13
topic: slate-v2-exact-ledgers-index
---

# Slate v2 Exact Ledgers

Exact 1:1 legacy-file ledgers that complement the human control ledger in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

Rule:

- these ledgers are the archaeology layer
- they must stay exact per legacy file
- they do not dictate one-current-file-per-legacy-file recovery
- code proof should live in the smallest current behavior-domain owner file
- dead harness files should close as `explicit-skip` or `mapped-mixed`, not
  fake-recovered source cosplay

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [legacy-slate-react-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-react-test-files.md)
- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-history-test-files.md)
- [legacy-playwright-example-tests.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-playwright-example-tests.md)

Status key:

- `mapped-mirrored`: current proof already carries the legacy file value
- `mapped-recovered`: current proof recovered the legacy file value on a new owner
- `mapped-mixed`: one legacy file splits into mirrored, recovered, and/or
  explicit-skip subclaims
- `same-path-current`: the same relative current test file still exists in `slate-v2`
- `explicit-skip`: intentionally outside the live contract
- `needs-triage`: no honest exact mapping exists yet
