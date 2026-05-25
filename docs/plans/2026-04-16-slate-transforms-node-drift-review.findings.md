# Findings

- Public type contract drift still exists across the node-transform family, not
  just `setNodes`: legacy `Transforms.*` and `editor.*` methods were generic
  over `T extends Node`, while current v2 still narrows most of them to
  non-generic option bags and instance signatures.
- `packages/slate/src/transforms-node/*` same-path files are still rewrite-heavy
  rather than source-close legacy ports. That is not automatically wrong, but
  it means the family is not "recovered" in source terms.
- The strongest proven gap was `setNodes<T>` and it is now fixed. The same
  failure mode still appears likely for `insertNodes`, `liftNodes`,
  `mergeNodes`, `moveNodes`, `removeNodes`, `splitNodes`, `unsetNodes`,
  `unwrapNodes`, and `wrapNodes`.
- Current docs/ledgers already admit partial transform-family closure rather
  than full same-path parity, especially for broader path/match/selection/void
  lanes.
