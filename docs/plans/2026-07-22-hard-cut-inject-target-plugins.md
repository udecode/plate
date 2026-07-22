# Hard-cut plugin target configuration

Objective:
Replace every live `inject.targetPlugins` and nested target configuration shape with one top-level immutable `targetPluginKeys` descriptor field, including runtime reconfiguration, schema compilation, package adoption, and registry examples.

Completion threshold:
One authored API owns plugin targets; old live authoring shapes have zero matches outside historical release material; target changes compile and publish atomically; lifecycle resources invalidate correctly; package, app, browser, release, lint, and review gates pass.

Verification surface:
Core plugin descriptors, schema compilation, injection matching, `editor.configure`, lifecycle publication, affected feature packages, registry source, current docs, changesets, `check:core`, and standalone registry demo routes.

Constraints:
No compatibility alias, dual signature, generated registry build, manual edit under `apps/www/public/r`, `apps/www/public/rd`, or `templates`, and no plugin-instance dependency requirement for ordinary target allowlists.

Boundaries:
Plate owns plugin-key composition and resolves installed keys to configured node types. Plite remains unaware of Plate plugin keys. Historical migration and changelog prose may name the deleted API.

Blocked condition:
Stop only if the single top-level field cannot preserve immutable compilation, live publication rollback, or optional-target behavior without a second public targeting API. No such blocker remained.

Start Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Public API hard cut | yes | User selected one alternative and authorized execution. |
| Plite ownership change | no | Resolution stays in Plate Core; no Plite API is required. |
| Generated registry output | no | CI owns generated public registry and templates. |

Work Checklist:

- [x] Add top-level readonly `targetPluginKeys` with a frozen empty default.
- [x] Delete public `inject.targetPlugins` and nested target alternatives.
- [x] Resolve installed target keys to configured element types for schema compilation.
- [x] Use the same field for runtime injection matching.
- [x] Preserve the field through descriptor snapshots, configuration publication, and rollback.
- [x] Support typed and runtime-validated `editor.configure(plugin, { targetPluginKeys })`.
- [x] Invalidate plugin lifecycle extensions when target keys change.
- [x] Migrate affected packages, registry kits, tests, current docs, audits, and changesets.
- [x] Repair registry fixtures discovered by browser proof without touching generated output.
- [x] Repair `check:core` source-first Bun dispatch and cover the runner contract.
- [x] Run lexical audits, focused proof, package proof, app proof, browser proof, full Core proof, and autoreview.

Phase / pass table:

| Phase | Status | Result |
|---|---|---|
| API and immutable model | complete | One frozen top-level field owns targeting. |
| Compiler and injection adoption | complete | Keys resolve through the installed plugin model. |
| Runtime reconfiguration | complete | Atomic publication, validation, no-op detection, rollback, and lifecycle invalidation are covered. |
| Feature and registry migration | complete | Package and app sources use the single API. |
| Release and documentation closure | complete | Existing package changesets and current teaching surfaces are aligned. |
| Verification and review | complete | All named gates are green; final autoreview has no findings. |

Completion Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Old API source audit | yes | Only `content/docs/migration/v48.mdx` and `packages/core/CHANGELOG.md` retain historical names. |
| Core focused tests | yes | 95 tests passed across five target/compiler/injection files; final publication/compiler pair passed 38 tests. |
| Core type contracts | yes | `pnpm --filter @platejs/core typecheck` passed after final runtime and lifecycle fixes. |
| Affected packages | yes | Basic styles, indent, list, caption, and toggle package tests and typechecks passed. |
| App source proof | yes | `apps/www` typecheck passed, including docs parity and both TypeScript checks. |
| Browser proof | yes | Single-block, multiple-editors, and playground demos rendered; editor, image, alignment, and list assertions passed. |
| Full Core gate | yes | Final `pnpm check:core` passed all 45 reviewed package typechecks, lints, contracts, and package test inventories after the lifecycle fix. |
| Release artifacts | yes | Existing Core and affected-package changesets were updated; `pnpm exec changeset status` passed. |
| Generated barrels | no | No export or exported file-layout change. |
| Autoreview | yes | Two valid live-reconfiguration findings were fixed; final structured review returned zero findings at 0.82 confidence. |

Verification evidence:
- `pnpm lint:fix`: 4,848 files checked, green.
- `pnpm --filter @platejs/core typecheck`: green, including contract declarations.
- Focused Core tests: 95/95 green; final lifecycle/compiler tests: 38/38 green.
- Final `pnpm check:core`: green across all 45 reviewed packages after the reviewer-driven lifecycle fix.
- `apps/www` typecheck and affected feature-package tests/typechecks: green.
- `pnpm exec changeset status`: green.
- Browser: `/blocks/single-block-demo` loaded one editor; `/blocks/multiple-editors-demo` loaded three editors and four images; `/blocks/playground-demo` loaded one editor, two images, centered content, and list items.
- Final autoreview: zero findings; patch correct with 0.82 confidence.

Reboot status:
The current checkout was re-audited after both reviewer-driven runtime fixes. No continuation packet is required.

Open risks:
No code risk remains. CI-owned registry JSON and templates intentionally remain ungenerated locally and will be produced by CI.
