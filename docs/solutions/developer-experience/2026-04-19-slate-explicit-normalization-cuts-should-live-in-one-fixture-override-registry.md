---
title: Slate explicit-normalization cuts should live in one fixture override registry
date: 2026-04-19
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - `snapshot-contract.ts` and the broader `packages/slate/test` suite disagreed about whether ordinary ops should auto-merge adjacent text
  - fixing the core toward the explicit-only normalization contract turned one stale oracle row into a 55-fixture failure cluster
  - the legacy transform harness kept trying to pull the engine back to implicit adjacent-text/spacer canonicalization
root_cause: wrong_api
resolution_type: workflow_improvement
severity: high
tags: [slate, slate-v2, normalization, fixtures, legacy, explicit-cut, testing]
---

# Slate explicit-normalization cuts should live in one fixture override registry

## Problem

`packages/slate` had already chosen a narrower live normalization contract:
heavier adjacent-text and spacer cleanup is explicit-only, not something every
ordinary structural op does automatically.

The engine was partly there, but the old legacy transform harness was still
treating the opposite behavior as kept truth.

That is how one honest engine fix turned into a wall of fake failures.

## Symptoms

- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1` first failed on
  the old `transforms/normalization/move_node.tsx` expectation
- after the engine was aligned with the explicit-only contract,
  `bun test ./packages/slate/test` failed on `55` legacy transform fixtures
- the failures all clustered around the same family:
  - adjacent text that no longer auto-merged
  - spacer text that no longer disappeared automatically
  - helper outputs that still assumed ordinary ops performed broad
    canonicalization

## What Didn't Work

- Reverting the engine back to legacy auto-merge just to quiet stale fixtures
- Treating `55` failures like `55` unrelated bugs
- Leaving the broad transform harness as an ambient source of truth when the
  live docs had already narrowed the claim
- Patching fixture outputs one by one with no central ownership

## Solution

Keep the engine on the explicit-only normalization contract, then classify the
stale legacy family once at the harness boundary.

The concrete changes were:

1. Narrow implicit normalization in
   [`packages/slate/src/core/normalize-node.ts`](</Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts>)
   so adjacent-text canonicalization is explicit-only instead of triggered by
   every ordinary op.
2. Keep the broad current oracle honest in
   [`packages/slate/test/snapshot-contract.ts`](</Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts>)
   by rewriting stale rows and helper expectations that no longer matched the
   live claim.
3. Add one explicit-cut registry in
   [`packages/slate/test/fixture-claim-overrides.ts`](</Users/zbeyens/git/slate-v2/packages/slate/test/fixture-claim-overrides.ts>)
   for the legacy fixture family that still encoded implicit adjacent-text or
   spacer canonicalization.
4. Make the package harness in
   [`packages/slate/test/index.spec.ts`](</Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts>)
   skip those rows from one place instead of scattering `skip` markers through
   the fixture tree.
5. Sync the control docs so the live tranche/claim no longer said “move to
   tranche 4” while `slate` was still being reopened.

The key implementation seam is small:

```ts
const canCanonicalizeAdjacentText =
  options.explicit && !touchesDirectChildCleanup
```

And the harness ownership stays equally blunt:

```ts
const isExplicitCut = isExplicitCutFixture(fixturePathFromTestRoot)
const testFn = /\\bexport const skip\\s*=\\s*true\\b/.test(source)
  ? it.skip
  : isExplicitCut
    ? it.skip
    : it
```

## Why This Works

The important distinction is between:

- **engine truth**
- **legacy evidence**
- **live claim width**

Legacy fixtures are evidence.
They are not allowed to silently override a live contract that has already been
chosen and documented.

Once the explicit-only normalization posture is the live contract, the stale
legacy rows stop being “bugs to fix” and become “cuts to classify”.

Putting that classification in one registry does three useful things:

1. it keeps the engine honest
2. it keeps the suite green
3. it gives the docs one concrete owner for the cut family

That is a lot better than reverting the core or hand-editing fixture outputs
forever.

## Prevention

- When a core behavior narrows intentionally, do not let the broad legacy
  transform harness keep pretending those rows are still ambient truth.
- If a large failure cluster shares one semantic cause, cut or reclassify it at
  one owner seam. Do not patch the rows one by one.
- Keep the current proof stack layered:
  - `snapshot-contract.ts` for the live broad current oracle
  - package-local suite for the kept claim
  - one explicit-cut registry for legacy families that no longer belong
- Sync the control docs the same turn. If the roadmap says tranche 4 while the
  code still needs `slate` API decisions, the docs are lying.

Related docs:

- [2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md)
- [2026-04-19-slate-absolute-api-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-absolute-api-replan.md)
- [normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md)
