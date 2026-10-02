# Package test recipes
Use only the affected package sections after Testing’s value gate. These are
implementation recipes and reviewed exceptions, not a coverage mandate.

### `autoformat` registry integration

- Keep rule arrays in the owning copied registry item.
- Use `PLUGINS` or base plugin descriptors, not copied raw identities.
- Add only the base plugins a rule actually needs.
- Collapse tiny mark or block suites into matrices when the contract is the same.
- Do not import `AutoformatKit` or app registries in package tests.
- Prove cross-feature behavior such as code-block wiring in
  `apps/www/src/__tests__/package-integration`.

### `markdown`

- Configure `MarkdownPlugin` locally in the package helper.
- Do not import `MarkdownKit` or any app registry from `apps/www`.
- Prefer direct string assertions for tiny whitespace-sensitive serializer outputs.

### `ai / streaming markdown`

- Keep one mixed-document smoke case.
- Add a few explicit chunk-boundary tests.
- Do not hide streaming behavior behind snapshots or giant hand-written trees.

### `plate`

- Use `createEditor` for:
  - pure plugin option stores
  - selector extension
  - plugin API composition
  - transform composition
  - parser and deserializer contracts
  - HTML `insertData`
  - DnD-style contracts
- Grow the compile-only type lane here first:
  - plugin creation
  - editor creation
  - inference
  - option merging
  - API merging
- Port upstream Slate React invariants by behavior, not by file.
- When a Plate foundation source test mounts `EditorRoot` while the same run also loads public-package React entrypoints, treat duplicate-instance warnings as test noise. Suppress them in the test wrapper with `suppressInstanceWarning` instead of changing runtime warning logic.
- For provider-only React specs in the Plate foundation, reuse the shared `packages/platejs/src/react/__tests__/TestPlate.tsx` helper instead of re-declaring local `const Plate = ...` wrappers.

### `selection`

- Test current `moveSelection` and `shiftSelection` behavior at their shipped
  owner. If ownership or public shape is disputed, route the decision to
  `best-api` and the relevant layer plan; testing does not decide it.

### DOCX entrypoints and app integration

- Keep app-owned cross-package integration tests under `apps/www/src/__tests__/package-integration`.
- Keep buckets local under that folder instead of scattering app-owned integration coverage through `src/lib`.
- Package tests must not pull app aliases, app kits, or registries into package graphs.
- Fixture-heavy `docx-paste` suites are valid reasons to keep `__tests__/`.

### `plitejs`

- Focus on pure editor, query, and transform behavior first.
- Keep runtime coverage on navigation, selection math, structural queries, transform edge cases, extension transforms, and `createEditor` legacy sync.
- Keep a small compile-only type lane for public `plitejs` contracts.
- Use selective upstream mining. Pull invariants that cheaply improve local public-contract coverage; do not mirror upstream blindly.
- Add direct helper specs for custom Slate code when indirect coverage is lying.
- Use `lcov` as package truth. Bun’s text coverage summary is noisy for targeted package runs.
- Stop once the remaining misses are mostly deferred DOM wrappers plus low-risk non-DOM dust.
- Later Plate foundation work should mine these upstream `slate-react` invariants:
  - `use-slate-selector`: selector equality and stale-rerender prevention
  - `use-slate`: editor version and subscription behavior
  - `use-selected`: selection rerender and path stability
  - `editable`: value-change vs selection-change partitioning
  - `decorations`: decoration propagation and redecorate behavior
  - `chunking`: chunk or index invalidation only if remaining foundational gaps justify it
- Skip `react-editor` DOM focus coverage unless a real Plate bug forces it.
- Playwright example coverage stays out.

## Reviewed Exceptions

### Plate React `createEditor` allowlist

Keep Plate React `createEditor` when the contract is actually about:

- React or provider wiring
- rendered output or DOM behavior
- store rerender semantics
- Plate plugin conversion boundaries
- the known Plate-only selection APIs: `moveSelection` and `shiftSelection`

Do not treat these files as backlog just because they still use Plate.

### `__tests__/` allowlist

Keep `__tests__/` when it holds:

- package-local helpers or fixture banks
- intentionally split multi-file suites like `withAutoformat`
- fixture-heavy integration suites like `docx-paste`
- app-owned cross-package integration suites under `apps/www/src/__tests__/package-integration`
