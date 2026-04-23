---
date: 2026-04-09
topic: slate-v2-remaining-scope-reinterview
status: completed
source: /Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md
profile: quick
final_ambiguity: 0.04
---

# Slate v2 Remaining Scope Re-Interview

## Read

The remaining `True Slate RC` scope is clearer now than the roadmap said.

What is settled:

- this is a rewrite, not a nostalgia port
- capability parity matters more than literal legacy semantics
- the best design wins if it is provably safer and more valuable
- every deviation must be justified in proof, PR description, and migration docs

## Decisions

### 1. Live normalization policy

Best rule:

- ordinary live commits guarantee the invariants needed for correctness
- they do **not** need to force full canonical Slate shape
- heavier canonicalization may happen on:
  - load / replace / reset
  - import / paste ingestion
  - explicit `Editor.normalize()`
  - app-owned custom `normalizeNode(...)`

Why:

- this keeps the transaction-first engine stable
- it avoids rebreaking mixed-inline clipboard, refs, and React selection
- it still preserves capability parity through explicit canonicalization seams

### 2. Non-canonical live shapes

Allowed only when they earn their keep.

Required rule:

- each allowed non-canonical live shape must have a named record that says:
  - why it exists
  - where it is allowed
  - what boundary canonicalizes it
  - which proof rows keep it safe

Why:

- maintainers need auditability
- otherwise “flexibility” just becomes undocumented sludge

### 3. Collaboration lane

Treat collaboration as an architecture/invariants lane, not a “go build more
demos” lane.

That means:

- prove operation semantics and invariants
- do not block the roadmap on more collaboration showcase examples

### 4. Next mainline blocker

After the current normalization work, the next mainline blocker is:

- broad API / public-surface reconciliation
- plus major file/test deletion closure

Why:

- this is the most maintainers-facing remaining gap
- it is where missing Slate value is still most likely to show up as real cuts
- collaboration remains important, but mostly as an architecture proof lane

## Remaining Risk

Normalization is not “done”.

What remains risky:

- broad always-on live inline-container coercion
- default live adjacent-text cleanup beyond the current explicit seam

Those are only worth taking if they survive the full clipboard + range-ref +
`slate-react` runtime proof stack.

## Recommended Next Order

1. finish the current normalization family only where the seam is already
   provably safe
2. move to API/public-surface + file/test deletion closure as the mainline
   blocker
3. keep collaboration as an invariants/design lane
4. only return to broader live normalization if a better design survives proof

## Consequence For The Roadmap

The roadmap should stop saying “normalization is the immediate next move” as if
it is the only blocker left.

The honest phrasing now is:

- normalization remains an open risky lane
- but the next mainline blocker after the current safe tranche is
  API/public-surface reconciliation plus file/test deletion closure
