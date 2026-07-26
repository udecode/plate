# Remove redundant find-replace adapter

Objective:
- Replace the registry demo's redundant `toPlatePlugin(FindReplacePlugin)`
  conversion with terminal configuration on the Base descriptor.

Completion threshold:
- The demo uses `FindReplacePlugin.configure({ component, options })`.
- The scoped source audit finds no `toPlatePlugin(FindReplacePlugin)`.
- Find-replace package proof and live demo Browser proof pass.
- The broad www typecheck is run; any failure outside the changed file is
  classified rather than silently widened into this packet.

Verification surface:
- `pnpm turbo typecheck --filter=./packages/find-replace --filter=./apps/www`
- `pnpm --filter @platejs/find-replace test`
- Scoped `rg` audit across the demo and find-replace owner.
- Browser route `/blocks/find-replace-demo`, search input, highlighted editor,
  console, and failed requests.

Constraints:
- Preserve the renderer-neutral Base owner.
- Use terminal `.configure({ component })`; do not expose the renderer
  registry or add another adapter.
- Do not edit generated registry output or unrelated `toPlatePlugin` callers.

Boundaries:
- Allowed edits: the named demo and this goal ledger.
- Source map: `FindReplacePlugin`, Base terminal component configuration,
  `usePlateEditor` Base plugin input, package tests, and the live demo route.
- This is a named file/API correction, not package review, Core sweep, sync,
  builder redesign, or broad adapter hard cut.

Blocked condition:
- Stop only if direct Base configuration fails type/runtime proof and the
  failure demonstrates a missing Core capability.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt captured | yes | User said `go fix` after the exact adapter diagnosis. |
| Plate Next doctrine | yes | Skill, root vision, Plate vision, and common vision read. |
| Goal lifecycle | yes | Active quantitative goal created for source, type, and Browser proof. |
| Public API fork | no | Accepted direct Base terminal configuration already exists and is tested in Core. |
| Browser route | yes | Registry example maps to `/blocks/find-replace-demo`; Browser is the required app proof. |

Work Checklist:
- [x] Remove the redundant conversion and its import.
- [x] Run the scoped same-class source audit.
- [x] Run focused package and www proof.
- [x] Verify the live demo interaction and browser diagnostics.
- [x] Record final evidence and close the goal.

Phase / pass table:

| Phase | Status |
| --- | --- |
| source correction | complete |
| focused proof | complete |
| Browser proof | complete |
| closure | complete |

Verification evidence:
- `rg` over the demo plus package owner: one direct
  `FindReplacePlugin.configure` match; zero
  `toPlatePlugin(FindReplacePlugin)` and zero public `render.node` matches.
- `pnpm turbo typecheck --filter=./packages/find-replace`: 12/12 tasks passed.
- `pnpm --filter @platejs/find-replace test`: passed.
- `pnpm --filter @platejs/find-replace build`: passed.
- `pnpm biome check --write
  apps/www/src/registry/examples/find-replace-demo.tsx`: clean, no fixes.
- `pnpm turbo typecheck --filter=./apps/www`: registry/docs parity passed and
  55/56 tasks passed; the final www TypeScript step failed on existing shared
  comment, suggestion, table, toggle, Yjs, footnote, and readonly-value
  migration errors. It reported no diagnostic in the changed find-replace
  demo.
- Browser opened `/blocks/find-replace-demo` with HTTP 200. Changing the search
  input from `text` to `decorations` produced exactly one
  `.bg-yellow-100` leaf whose text was `decorations`.
- Browser console contained only React DevTools info and the HMR connection;
  no warning or error. The dev server reported a clean route request.
- `git diff --check` passed for the demo and this ledger. Targeted diff review
  confirmed the only product-source delta is `render.node` to terminal
  `component`; no generated files, exports, or unrelated callers changed.

Reboot status:
- Fresh source, package, diff, and Browser evidence is recorded above; no
  continuation work remains in this packet.

Open risks:
- None in the changed path. The broad www typecheck remains red from unrelated
  shared migration work explicitly listed above.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Direct Base configuration | yes | Current source uses terminal `component` and `options` on `FindReplacePlugin.configure`. |
| Scoped correction sweep | yes | One current direct call; zero obsolete conversion and renderer-registry calls. |
| Package proof | yes | Typecheck 12/12, tests, build, and focused Biome all passed. |
| Broad www gate | yes | Run completed; changed file has zero diagnostics and unrelated shared migration failures are classified above. |
| Browser proof | yes | Route returned 200; search interaction rendered the exact yellow-highlight leaf with no console warning/error. |
| Autoreview | no | Trivial one-field call-shape correction was reviewed from the exact targeted diff. |
