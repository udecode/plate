# Progress

- Started review of `packages/slate/src/transforms-node/*` with source-first diff against legacy.
- Read legacy/current same-path diffs for the full transforms-node family.
- Confirmed one concrete package type regression on `setNodes<T>` and fixed it.
- Reviewed the rest of the family for the same public-contract narrowing pattern.
- Recovered generic public contracts across the node-transform family on
  `interfaces/editor.ts`, `index.ts`, `create-editor.ts`, and the
  `transforms-node/*` exports.
- Added focused generic-contract coverage in `packages/slate/test/transforms-contract.ts`.
- Verified `slate` build and targeted transform tests pass. Site-wide typecheck
  still has unrelated existing errors in `check-lists.tsx` and `embeds.tsx`,
  but `richtext.tsx` is clean again.
