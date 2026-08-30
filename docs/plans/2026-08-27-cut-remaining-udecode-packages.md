# Cut remaining udecode packages

Objective:
Remove every live `@udecode/*` package and make `platejs`, `platejs/react`,
feature-local helpers, copied registry source, and the independent `depset` CLI
the only surviving owners.

Completion threshold:
The cut is complete when the old package directories are gone, no live import,
manifest, workspace path, dependency field, or built artifact reaches the old
namespace, and package, docs, registry, Browser, release, Plite, and root checks
pass.

Verification surface:
- Package sources, manifests, exports, built output, lockfile, workspace config,
  release tooling, docs, registry metadata, generated registry payloads, and
  Oxlint policy.
- `platejs`, Basic Nodes, Cursor, Floating, Link, Markdown, Media, `depset`, and
  the `select-editor` copied registry family.
- Packed release consumers, the standalone registry demo, strict Plite
  Chromium closure, and the root repository gate.

Constraints:
- No compatibility alias, runtime shim, renamed generic helper package,
  `platejs/utils`, or `platejs/react-utils`.
- `platejs` root stays React-free. React contracts live at `platejs/react`.
- Plate packages and normal Plate apps import `platejs`; raw Plite docs and
  proof apps remain direct Plite consumers because they test Plite itself.
- Do not publish, commit, push, open a PR, or edit `templates/**`.
- Historical v48 migration archives and changelogs may name old packages as
  history. They are not current dependencies or guidance.

Boundaries:
- Deleted packages: `@udecode/utils`, `@udecode/react-utils`, `@udecode/cn`,
  and `@udecode/cmdk`.
- Surviving owners: `packages/platejs`, exact feature packages, copied registry
  source under `apps/www/src/registry`, and `packages/depset`.
- Non-goals: feature-package consolidation, new `platejs/<feature>` paths,
  release publication, and a Changesets linking redesign.
- The removed directories are recoverable from
  `/Users/zbeyens/.Trash/plate-udecode-hard-cut-20260827`.

Blocked condition:
Block only if the copied registry family cannot preserve behavior without a
new package, packed `platejs` leaks React or undeclared dependencies, or the
final registry demo cannot run. None of those conditions occurred.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements captured | yes | Full namespace cut, facade ownership, Plite direction, optional peers, docs, registry, release, and proof boundaries are explicit above. |
| API target | yes | Best API verdict is hard cut: facade-wide contracts in `platejs`, React contracts in `platejs/react`, copied UI local, one-owner helpers local. |
| Package and docs owners | yes | Live package sources, manifests, docs, nav, registry metadata, release scripts, and agent rules were audited before edits. |
| Browser route | yes | `/blocks/editor-select` exercises the copied command implementation and outside-click hook. |
| Release artifacts | yes | `.changeset/platejs-foundation.md`, the `depset` patch release entry, and the registry changelog cover the public deltas. |

Decision ledger:

| Surface | Final owner | Adoption | Proof | Verdict |
| --- | --- | --- | --- | --- |
| Generic headless utilities | `platejs` or exact feature owner | Imports, manifests, exports, tests, and built files migrated | Package tests, types, packed consumers, zero audit | cut |
| Shared React helpers | `platejs/react` | `useComposedRef` and `useIsomorphicLayoutEffect` exported; dead generic exports removed | React tests, root-isolation pack proof | cut |
| Styling helper | app and copied registry `cn` | Registry consumers use `@/lib/utils` | registry build and app typecheck | localize |
| Controlled command | `select-editor` copied family | Command source, score helper, tests, and metadata copied with the item | focused tests, registry build, Browser | localize |
| Outside-click behavior | copied registry hook | `use-on-click-outside` registry item owns installation | focused test, metadata, Browser | localize |
| `depset` | `packages/depset` | Physical path, repository metadata, lockfile, and release mapping updated | build, test, typecheck, pack | keep |
| Old namespace enforcement | root Oxlint | Repo-wide import ban plus Plate/Plite and React direction rules | executable invalid-import fixtures | enforce |
| Package doctrine | Best API, Plate Vision, Plate Next workers | Source rules updated and mirrors regenerated | v115 registry and mirror audit | codify |

Optional dependency decision:
Optional peer dependencies remain valid only for an independently consumed
public feature. They do not justify generic helper packages. The copied command
family owns its Radix and `fzf` dependencies in registry metadata, while React
and React DOM remain optional peers of the Plate facade and are absent from the
packed headless root proof.

Historical exclusions:
- `content/docs/migration/v48.mdx`, generated copies of that compatibility
  archive, and package changelogs retain accurate old package names.
- GitHub organization URLs containing `udecode` are repository URLs, not npm
  dependencies.
- Dependency-field parsing across generated registry JSON reports zero
  `@udecode/*` entries.

Agent-native capability map:

| User or agent action | Doctrine owner | Runtime owner | Proof | Result |
| --- | --- | --- | --- | --- |
| Import shared Plate contracts | Best API and Plate Vision | `platejs` or `platejs/react` | public types and packed consumers | pass |
| Add a copied UI-only helper | Plate UI | copied registry family | registry build and Browser | pass |
| Reject retired imports | Oxlint | `oxlint.config.ts` | invalid import fixture | pass |
| Release the consolidated facade | release scripts and Changesets | package manifests and builds | package and boundary release checks | pass |

Work Checklist:
- [x] Delete all old package directories and move `depset` to its flat owner.
- [x] Migrate every live package, app, registry, manifest, lockfile, and tooling consumer.
- [x] Keep `platejs` headless and expose React-only helpers from `platejs/react`.
- [x] Copy the command implementation and outside-click hook into their registry owners.
- [x] Delete dead public docs and update the surviving Utils API reference in English and Chinese.
- [x] Add Changesets, registry changelog, Oxlint enforcement, and durable package doctrine.
- [x] Regenerate barrels, API references, docs source, registry payloads, changelog JSON, lockfile, and skill mirrors.
- [x] Run focused tests, package types/builds, packed consumers, Browser proof, release checks, strict Plite closure, and root checks.
- [x] Audit final source, manifests, dependency fields, built output, and workspace paths for the retired namespace.
- [x] Record exclusions, proof limits, recoverability, and the final handoff.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary readiness | yes | All implementation slices and required hard-cut gates are complete. |
| Best API review | yes | No generic helper package survives; public ownership follows the accepted facade/local/copied-source rule. |
| Public package proof | yes | Release packages and isolated boundaries pass; 4 packed packages and 30 subpaths were verified with NodeNext, Bundler, runtime, and dead-code elimination consumers. |
| Package checks | yes | Root build/typecheck is green across 46 workspace packages; focused owner suites are green. |
| Registry proof | yes | Registry build, registry source check, app typecheck, docs checks, and changelog generation pass. |
| Browser proof | yes | Filter, keyboard selection, custom creation, deletion, reinsertion, and external close pass on `/blocks/editor-select`; console warnings/errors are empty. |
| Strict Plite closure | yes | `pnpm check:plite` passes with 710 Chromium tests, 8 declared skips, and 79 bounded batches. |
| Root closure | yes | `pnpm check` passes lint, type-aware lint, builds, types, 3,145 fast tests, 695 slow tests, and auxiliary suites. |
| Docs quality | yes | Current docs were source-audited and edited in reference voice; Unslop pass preserved API literals; source and parity checks pass. |
| Agent source and mirror sync | yes | Rule sources were edited, `pnpm install` regenerated mirrors, Plate Next v115 validates, and `platejs` is current. |
| P1 autoreview | no | Branch `next` explicitly forbids `autoreview`; root and owner proof replace that unavailable gate. |
| Report-backed replay | no | This architecture cut has no external behavior report, bad ref, or reporter-visible paint claim. |
| Publication | no | User authorized implementation only; no commit, push, PR, or npm publication occurred. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, imports, packages, docs, registry, release, and doctrine mapped | none |
| Decide | completed | Hard cut and one-owner adoption locked | none |
| Implement | completed | Packages deleted, consumers migrated, outputs regenerated | none |
| Prove and hand off | completed | Focused, Browser, release, Plite, and root proof recorded | user review |

Verification evidence:
- `pnpm install`: 49 workspace projects; lockfile current; skills/resources synced.
- Focused tests: Plate 923; Basic Nodes 57; Cursor 19; Link 64;
  Markdown 201; Media 80; Floating 24; `depset` 12; registry family 16;
  tooling 74. All passed.
- `pnpm turbo build` for affected owners and the full root build passed. A
  retired-import scan of emitted JS, CJS, and declarations is empty.
- `pnpm plite:release:packages` and `pnpm plite:release:boundaries` passed.
- `pnpm check:plite` passed: 710 Chromium tests, 8 declared skips, 79 bounded
  batches; types, package tests, contracts, benchmark targets, and public types
  passed.
- `pnpm check` passed: lint, type-aware lint, 46-package build/typecheck,
  3,145 fast tests, 695 slow tests, and auxiliary suites.
- `pnpm --filter www build:registry`, `pnpm --filter www typecheck`, `pnpm
  --filter www check:docs`, `pnpm --filter www build:source`, and the registry
  changelog checker passed.
- Browser on `/blocks/editor-select`: selected an existing item, filtered to
  `Node Selection`, created `node`, removed items with Backspace, filtered and
  inserted `Button`, closed from an external control, and observed zero console
  warnings or errors.
- `depset-0.1.2.tgz` packed with its executable, declarations, README, and
  license.
- Final audits report zero old package manifests, import statements, workspace
  paths, dependency fields, and built artifact references. Historical v48 and
  changelog prose is the explicit exclusion.
- Plate Next v115 validates with current `platejs` fingerprint
  `sha256:de7466a847f27585510d3bc3c809f23a0fbdc1bafd59eecc565faee15fc13ba4`.

Reboot status:
Resume only if a final namespace audit, generated registry check, or package
release boundary regresses. The implementation itself has no remaining slice.

Open risks:
The broader clean-project `test:create-install` reaches the generated app and
proves the retired dependency is gone, then fails on an existing unrelated
`ScriptPlugin.update.toggle('sub')` type mismatch in registry `basic-marks.tsx`.
That API problem is outside this package cut; registry generation, app
typecheck, Browser behavior, packed packages, strict Plite, and root closure are
green.
