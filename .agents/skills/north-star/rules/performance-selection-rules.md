# Performance Selection Rules

## Precedence

- performance/scalability beats aesthetic API elegance
- explicit ownership/layering beats convenience
- canonical semantics stay package-owned
- sugar stays local unless it becomes genuinely canonical

## Decision Sequence

1. Is this surface on a hot path or a scalability boundary?
2. Does the nicer ergonomic shape add:
   - eager work
   - dispatch cost
   - allocation churn
   - merge ambiguity
   - invalidation complexity
3. Can the same DX be preserved with:
   - lazy/contextual derivation
   - owner-scoped defaults
   - a narrower higher-level builder
4. If yes, keep the lower-cost core shape and move ergonomics upward.
5. If no, keep the lower-cost/scalable shape anyway and document the DX
   tradeoff explicitly.

## Concrete Rules

- prefer owner-scoped defaults only when they do not add hidden hot-path work
- prefer lazy/contextual getters over eager derived state when values are not
  always needed
- prefer declarative config until it starts adding runtime or merge ambiguity
- reject abstractions that increase dispatch, matching, allocation, or
  invalidation cost without proportionate DX gain

## Reaffirmation Examples

- `north-star reaffirmed: performance-selection-rules`
- `north-star reaffirmed: laws`
- `north-star reaffirmed: pattern-catalog`
