# Inline one-use plugin chains audit

Scope: the exact direct-chain topology class in production
`packages/*/src/**/*.{ts,tsx}`, plus the smallest Core type/runtime owners
required to preserve inference and behavior.

## Final verdict

One exported plugin owns one direct inferred builder chain. A private stage is
valid only when it is an independently installed identity, a multi-owner
descriptor, a real external boundary, or the minimum documented declaration
stage required by TypeScript. Public AST types derive from the final exported
descriptor. Context-bound factories expose portable results rather than their
rich authoring editor.

## Topology audit

The production descriptor search returns six justified matches:

- `ReactDOMPlugin` and `ReactPlugin` in `getPlateCorePlugins.ts` are installed
  independently in the Core tuple and therefore have durable runtime identity.
- Code Block and Code Highlight each retain one exact private source/final
  declaration-stage pair. All four constants are marked
  `@plate-plugin-declaration-stage`; only the private final stages are
  annotated, and neither the stages nor their internal definition types are
  exported. Direct inferred exports passed source typecheck but failed
  declaration emit with TS7056 at both Base exports and both React adapters.
  Smaller structural node contracts and Core carrier compaction experiments
  did not remove the compiler ceiling and were reverted.

Unjustified one-use descriptor staging: **0**.

The production export audit returns **0** explicit `BasePlugin` / `PlatePlugin`
annotations or casts on exported plugin descriptors.

The package input-rule audit returns **0** package-level `BaseEditor<typeof
Plugin>` rule-editor aliases or reconstructed rule factory contracts. Core owns
the portable public factory boundary.

## Corrections

- Flat schema portals use `schema.type` or `schema.key`; required generic
  element/mark handles are non-optional in `PluginAuthorSchemaView`.
- Candidate-time dependency contexts resolve the candidate descriptor's
  schema identity instead of a stale installed dependency.
- Table public elements derive from the final plugin; recursive algorithms use
  the private `TableNode` domain contract in `internal/grid.ts`.
- `createRuleFactory` keeps the exact installed editor inside the author
  callback and projects emitted rules to portable `InputRuleEditor`.
- Code Block and Code Highlight use the documented paired private declaration
  exception while both public exports remain unannotated inferred aliases.
- Mark input rules read the canonical compiled `binding.propertyKey`, fixing
  the flat-schema runtime regression proven by Basic Nodes tests.
- Media's shared factory remains because five production plugins reuse it; its
  public descriptors stay inferred and its generic retains the exact element.

## Doctrine and agent route

- The packet introduced immutable Plate Next v51-v54 checks. v54 owns the
  context-bound-factory/public-portability rule. A separate integrated
  flat-schema packet added v55. The final TS7056 correction adds v56.
- Current doctrine fingerprint:
  `sha256:5a658e04380afe1316e4d3e4cfe8854e95f911e5c30060d3c371c81e953eb925`.
- `plate-next` is the consumer audit/sync route. `plate-plugin-creator` owns
  authoring guidance. `best-api` and `docs/vision/plate.md` agree on the public
  inference boundary.
- `pnpm install` regenerated all skill mirrors and resources from source rules.

## Proof

- 15-package source-first typecheck: **34/34 tasks passed**.
- 15-package declaration build: **32/32 tasks passed**.
- 15-package test run: **881/881 tests passed** across Basic Nodes, Callout,
  Code Block, Code Drawing, Comment, Date, Footnote, Link, List, Legacy list model,
  Math, Media, Suggestion, Table, and Utils.
- Core typecheck and build passed; Core tests: **697/697** with 2,296
  expectations. One existing React unique-key warning remains non-blocking.
- Focused `resolvePlugins.spec.tsx`: **51/51**.
- Plate Next registry validation: **42 active, 1 retired**, current v56.
- Scoped Biome and `git diff --check` passed.
- Final structured autoreview reports no accepted actionable findings and
  confirms the v56 private declaration-stage evidence/deletion gate.
- Browser: N/A. The packet changes package type/runtime topology and has no
  rendered route or component behavior.

## Release and export impact

Existing package changesets already cover the public v54/schema/runtime
migration surfaces. This packet adds no distinct user-facing API beyond those
accepted changesets, so another duplicate changeset would be dishonest.
Registry changelog is N/A. No public file or barrel layout changed in this
closure, so `pnpm brl` is N/A.

## Remaining risk

None in the packet scope. The only exceptional topology is the two documented
Code Block-package TS7056 pairs, guarded by direct-failure evidence,
declaration build, focused behavior tests, and the source audit.
