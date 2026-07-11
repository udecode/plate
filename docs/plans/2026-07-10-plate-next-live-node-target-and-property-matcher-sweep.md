# Plate Next live-node target and property-matcher sweep

Objective:
Repair Plate Next with the live-node/property-matcher law, migrate every
equivalent consumer shortcut, and prove affected package surfaces without
widening into unfinished package migrations.

Goal plan:
`docs/plans/2026-07-10-plate-next-live-node-target-and-property-matcher-sweep.md`

Template:
`docs/plans/templates/plate-next.md`

Completion threshold:
- `.agents/rules/plate-next.mdc`, its generated skill mirror, and the Plate
  Next plan template require live node targets, optional node-path lookup, and
  shallow property matchers.
- Current package, app, and Plite-doc source has zero
  `editor.api.findPath(...)`, `editor.api.some(...)`, or
  `editor.read.nodes.pathOf(...)` calls.
- Supplied live nodes are not rediscovered through type-and-ID scans.
- Exact scalar and one-of metadata predicates use property matchers. Computed,
  path-dependent, truthiness, content, structure, and narrowing predicates
  remain callbacks.
- Production package source has no non-null assertion on
  `editor.read.nodes.path(...)`; unresolved public reads return or no-op.
- Plite contract tests, migrated package checks, focused affected tests, docs
  checks, formatting, and exact source audits pass. Unmigrated-package failures
  are classified separately and are not disguised as green.

Verification surface:
- Plite node-target, matcher, transform, and query-middleware contracts.
- `pnpm check:core` for touched Core ownership.
- Caption and Suggestion package suites plus focused AI, Link, and Excalidraw
  specs.
- Focused Turbo typecheck for Core, Caption, Basic Nodes, Code Block,
  Selection, and Suggestion.
- `www` docs consistency check and exact package/app/docs source audits.
- Static mock audit for old flat aliases and matcher-call-only harnesses.

Constraints:
- Use current Plite APIs; do not add aliases, wrappers, or another public API.
- Plate owns product composition; Plite owns editor substrate.
- Do not migrate unrelated stale package APIs merely to make a broad command
  green.
- Property matchers intentionally ignore `text` and `children`; those remain
  predicates.
- Handle unresolved package-level reads. `{ required: true }` is limited to
  proven Plite invariants and test fixture assertions.
- Do not edit `templates/**`; those are CI-owned output.
- Do not commit.

Boundaries:
- Allowed: Plate Next source rule, generated skill, Plate Next plan template,
  this plan, and package/app/docs files containing the accepted shortcut
  classes.
- No Plite public API change: `NodeTarget`, `read.nodes.path`, property
  matchers, and `read.nodes.some` already exist.
- No broad package migration, registry generation, release work, or browser
  architecture work.
- Historical migration plans, changelogs, and CI-owned templates may retain old
  names as provenance.

Blocked condition:
Only a reproduced current Plite type/runtime gap blocks this packet. Existing
package failures caused by removed Plate APIs are migration debt and remain
owned by each package's later Plate Next pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Shortcut skill repair, all-usage sweep, zero-match audit, and proof requirements were recorded before closeout. |
| Plate Next source read | yes | `.agents/rules/plate-next.mdc` and generated skill inspected. |
| Mode classified | yes | Explicit cross-package API-class sweep, not package-by-package migration or broad Core review. |
| Best Plite shape selected | yes | Keep current `NodeTarget`, `read.nodes.path`, shallow matchers, and `read.nodes.some`. |
| Public API fork required | no | Existing Plite contracts cover every accepted shortcut. |
| Rename pass required | no | No symbol or file rename belongs to this packet. |
| Package file score ledger required | no | User explicitly requested one API-class sweep across packages rather than one-package review mode. |
| Core drift ledger required | no | Core changes were limited to exact optional path-owner corrections. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inventory | done | Initial classes: 20 `findPath` files, 24 `api.some` files, 3 live-node rediscovery files, and 16 exact matcher candidate files. |
| Skill repair | done | Source rule, generated mirror, and template encode the accepted law. |
| Consumer migration | done | Flat aliases cut; exact metadata callbacks simplified; stale mocks repaired. |
| Focused proof | done | 64 Plite contracts, 6 Caption tests, 101 Suggestion tests, and 8 focused affected tests pass. |
| Shared proof | done | `pnpm check:core`, focused Turbo typecheck, and docs check pass. |
| Closure audit | done | Current package/app/docs aliases, live-node rediscovery, unsafe path assertions, and content-matcher misuse all audit to zero. |

Work Checklist:
- [x] Every explicit user requirement and scope boundary was captured before
      closeout.
- [x] Cross-package API-class sweep mode was selected; broad package migration
      remained out of scope.
- [x] Best Plate v2 verdict recorded: consume Plite shortcuts directly.
- [x] Legacy aliases and duplicate wrappers were rejected.
- [x] No bridge, helper dump, broad cast, or implicit type/ID scan was added.
- [x] Gap ledger closed: no Plite or Plate capability gap blocks the shortcut.
- [x] Skill source, generated mirror, and autogoal template were repaired.
- [x] `editor.api.findPath` and `editor.api.some` package consumers were swept.
- [x] Current apps and Plite docs were audited for the same flat aliases.
- [x] Live-node type/ID rediscovery was replaced by direct targets or
      `read.nodes.path(node)` where the path itself is required.
- [x] Exact scalar and one-of metadata predicates were converted to property
      matchers.
- [x] Remaining predicates were classified as computed, path-dependent,
      truthiness, content/structure, or narrowing behavior.
- [x] Test doubles were repaired to expose `read.nodes.path` /
      `read.nodes.some` and to accept predicate-or-property matcher contracts.
- [x] Production package path reads contain no non-null assertion or unjustified
      strict lookup.
- [x] Plite focused contract tests passed.
- [x] Core shared gate passed.
- [x] Caption and Suggestion package suites passed.
- [x] Focused AI, Link, and Excalidraw specs passed.
- [x] Focused migrated-package typecheck passed.
- [x] Broad stale-package failures were classified rather than patched outside
      their Plate Next owner passes.
- [x] Docs consistency check passed; browser rendering blocker was classified
      as unrelated package migration debt.
- [x] Changed TypeScript specs were formatted.
- [x] No barrel/export change requires `pnpm brl`.
- [x] Manual scoped source review found no remaining actionable shortcut issue;
      structured local autoreview was skipped because the checkout has a large
      inherited migration diff and no task-only baseline bundle.
- [x] Changed list, needs-attention rows, proof, and next owner are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named focused and shared proof | Passed commands recorded below. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Keep Plite shortcuts; reject aliases and scans. |
| Plite/Plate gap ledger | yes | Record blocker or no-gap verdict | No capability gap; only consumer migration debt. |
| Related scoped sweep | yes | Re-scan all named usage classes | Final exact audits are zero; two remaining callbacks are path-dependent and intentionally retained. |
| Package file checklist | no | Record why one-file-per-row scoring does not apply | This is an explicitly broadened API-class sweep. |
| Shared Core gate | yes | Run `pnpm check:core` | Passed. |
| Package/API proof | yes | Run focused package tests and typecheck | Migrated owners pass; stale packages classified below. |
| Source audit | yes | Audit removed flat names and matcher misuse | Zero current package/app/Plite-doc matches. |
| Rename/extracted-file ledgers | no | Record no topology change | No files renamed, extracted, or added as runtime owners. |
| Autoreview | no | Perform scoped manual review or create a task-only bundle | Manual review used because local mode would review the unrelated inherited migration. |
| Final format/check | yes | Format touched specs and run plan check | Biome passed; autogoal check is the final command. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `editor.api.findPath(node)` consumers | 4 | hard-cut | Plite reads | 20 initial package files; zero current matches | Keep `editor.read.nodes.path(node)` only where a path is needed. |
| `editor.api.some(options)` consumers | 4 | hard-cut | Plite reads | 24 initial package files; zero current matches | Use `editor.read.nodes.some(options)`. |
| Live-node type/ID rediscovery | 5 | hard-cut | Plite node target | Three initial Caption consumers; zero current rediscovery matches | Pass live node or resolve its path once. |
| Exact metadata callbacks | 2 | simplify | Plite matcher | Scalar and one-of contracts pass | Keep property objects for exact metadata. |
| Content/structure predicates | 0 | keep | Caller | `NodeApi.matches` deliberately excludes `text` and `children` | Keep callbacks. |
| Path/computed predicates | 0 | keep | Caller | Tag and List Classic predicates consume path or computed membership | Keep callbacks. |
| Predicate-only test doubles | 3 | repair | Owning specs | AI mock failure reproduced and fixed | Model both matcher forms. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User review |
|--------|-------------------|-----------------------|--------|-------------|
| Live node target | Pass node directly; call `read.nodes.path(node)` only when returning/comparing a path | Type/ID tree scan, `findPath` alias | Runtime identity index already gives root-safe lookup | none |
| Existence query | `editor.read.nodes.some(options)` | Flat `editor.api.some` wrapper | Clear read ownership and no duplicate API | none |
| Exact node metadata | `match: { type }`, `match: { id }`, or array-valued one-of | Equality-only callback | Less boilerplate with one normalized matcher contract | none |
| Content/computed policy | Predicate | Magical object matching of text/children or path logic | Preserves explicit semantics and narrowing | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is wrong | Smallest owner | Proof | Decision |
|----------|--------------------|------------------------------|----------------|-------|----------|
| No shortcut gap | None | Aliases or scans would duplicate working Plite APIs | Plite current API | 64 focused contracts | Keep current API. |
| Package migration debt | Several packages still import removed Plate APIs before tests/typecheck load | Restoring compatibility would violate the hard cut | Later package-specific Plate Next passes | Broad typecheck and focused package test import errors | Defer by package; do not block this API-class sweep. |

Related scoped sweep ledger:
| Trigger | Scope | Query / method | Initial matches | Patched | Deferred | Remaining risk |
|---------|-------|----------------|----------------:|--------:|---------:|----------------|
| Flat path alias | `packages/**` source/tests | `rg` for `.api.findPath(` | 20 files | 20 | 0 | zero current matches |
| Flat existence alias | `packages/**` source/tests | `rg` for `.api.some(` | 24 files | 24 | 0 | zero current matches |
| Live-node rediscovery | `packages/**` | multiline `read.nodes.find` type/ID scan | 3 files | 3 | 0 | zero current matches |
| Exact metadata callback | `packages/**` | scalar, OR, and `includes` matcher audit | 16 candidate files | all eligible | 2 intentional predicates | remaining callbacks require path/computed behavior |
| Unsafe path assertion | `packages/**` production | `read.nodes.path(...)!` and strict path audit | several inherited uses | all production uses | 2 test assertions | test-only strict assertions remain valid |
| Stale test doubles | package specs | object keys and callable-only matcher audit | 7 old API mocks plus 2 matcher mocks | all | 0 | zero old mock keys |
| Current docs/apps | `content/docs/plite`, `apps/**` | old flat-name audit | current examples found during sweep | all | historical docs/templates | zero current-source matches |

Packet ledger:
| Packet | Owner | Hypothesis | Decision | Proof |
|--------|-------|------------|----------|-------|
| Skill law | Plate Next | Future package passes would recreate verbose scans | keep | Source/generated/template audit. |
| Consumer aliases | Plate packages | Flat APIs are compatibility debt | keep hard cut | Zero-match audit. |
| Property matchers | Plite query runtime | Equality callbacks are needless boilerplate | keep | Runtime/type contracts and package tests. |
| `{ text: ... }` experiment | Suggestion test | Property matching might include content | revert | Focused failure proved content is deliberately excluded; predicate restored. |
| Broad stale-package migration | Package owners | Make every touched package green in this packet | defer | Failures occur on removed exports/APIs before shortcut behavior runs. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking | Owner / next |
|-------------------|---------------|------------------|--------------|
| AI | Full suite imports removed `createTSlatePlugin` | Focused `undoAI` shortcut behavior passes | AI Plate Next pass |
| List / List Classic | Removed `useReadOnly`, missing package exports, and old transforms | Shortcut mocks are repaired; modules fail before target tests load | List package passes |
| DnD, Excalidraw, Link, Math, Media, Tabbable, Table, Tag, Toggle | Removed Plate exports/APIs in unfinished package migrations | Broad typecheck failures predate and exceed this API-class change; focused Link/Excalidraw proof passes | One Plate Next pass per package |
| `apps/www` route | App compile resolves the same unmigrated package exports | Docs consistency passes; route cannot render until package migration closes | App proof after package sweep |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| Skill/workflow | Plate Next source rule, generated mirror, and plan template now enforce live targets, property matchers, optional reads, and flat-alias cuts. |
| Package reads | `findPath` and `api.some` consumers use `read.nodes.path` and `read.nodes.some`. |
| Matchers | Exact `type`/`id` and one-of callbacks use property objects; semantic predicates remain. |
| Live-node consumers | Caption and related owners use direct node targets or one root-safe path lookup instead of type/ID scans. |
| Tests | Mocks expose grouped read APIs and AI mutation mocks support predicate-or-property matching. |
| Docs/apps | Current Plite docs and app integration examples use grouped read shortcuts. |
| Reverted experiment | Suggestion text matcher reverted to `TextApi.isText(...) && node.text === ...`. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Unmigrated package gates remain red | They import removed Plate APIs, so broad package proof cannot be honestly green yet | Out-of-scope package drift table | Continue Plate Next package-by-package; do not restore aliases. |
| 2 | Browser docs route remains blocked | `apps/www` compiles the unfinished package graph | `apps/www` route compile output | Re-run Browser proof after those package migrations. |

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|------:|----------------|------------|
| zsh did not split a newline file list in the first mechanical command | 1 | Use null-delimited paths | No files were changed by the failed command; rerun succeeded. |
| Suggestion object matcher used `text` | 1 | Read `NodeApi.matches` contract and restore predicate | Full Suggestion suite passes. |
| AI mocks called object matchers as functions | 2 specs | Model predicate-or-property contract | Focused AI behavior passes. |
| First `www` dev command passed a literal `--` | 1 | Use package script arguments directly | Server started. |
| Next dev auto-edited local TypeScript dependency | 1 | Restore package version and run `pnpm install` | No unintended TypeScript package diff remains. |
| Browser route compiled to 500 | 1 | Inspect import errors instead of patching app | Classified as unfinished package migration debt. |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/state-query-contract.ts ./test/node-match-contract.ts ./test/transforms-contract.ts ./test/query-extension-contract.ts` -> 64 pass, 0 fail.
- `pnpm check:core` -> passed; Core 726 tests, Plite 1,930 pass / 85 skip,
  Utils 64, Basic Nodes, Selection 110, Diff 62, and Code Block 86 passed.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/caption --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/selection --filter=./packages/suggestion` -> passed.
- `pnpm --filter @platejs/caption test` -> 6 pass, 0 fail.
- `pnpm --filter @platejs/suggestion test` -> 101 pass, 0 fail.
- Focused AI, Link, and Excalidraw specs -> 8 pass, 0 fail.
- `pnpm --filter www check:docs` -> passed.
- Biome on the final six repaired specs -> passed with no fixes.
- Source/generated Plate Next rule audit -> generated skill contains all new laws.
- Exact current-source audits -> zero flat aliases, zero `pathOf`, zero live-node
  type/ID rediscovery, zero non-null path reads, zero `text`/`children` object
  matcher misuse, and zero stale old mock keys.
- Full package typecheck/test attempts expose only the package migration debt
  recorded above; no compatibility API was revived to mask it.

Final handoff contract:
- Target: all current package consumers of the accepted Plite node-target and
  matcher shortcuts.
- Result: shortcuts are encoded in Plate Next and current source is swept.
- Plite API change: none required.
- Compatibility result: no alias or wrapper retained.
- Proof: focused runtime/type/package/docs gates pass; broad stale-package
  failures are explicitly owned.
- Next owner: resume package-by-package Plate Next migration, starting with the
  next package that still fails on removed Plate exports.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure audit. |
| Where am I going? | Autogoal mechanical close, then concise handoff. |
| What is the goal? | Keep Plite shortcuts canonical and remove equivalent Plate boilerplate. |
| What have I learned? | Current Plite API is sufficient; the only trap was treating content as shallow metadata. |
| What have I done? | Repaired the skill, swept consumers and mocks, and proved the migrated owner surfaces. |

Timeline:
- 2026-07-10: inventoried flat aliases, live-node scans, and matcher callbacks.
- 2026-07-10: repaired Plate Next law and generated mirror.
- 2026-07-10: migrated package/app/docs consumers and corrected test harnesses.
- 2026-07-10: closed focused tests, shared gates, and zero-match audits.

Open risks:
The shortcut work is closed. Several untouched package migrations still fail on
removed Plate APIs, and browser proof through `apps/www` remains blocked until
those packages are migrated. Restoring compatibility aliases would make that
debt harder to finish and is explicitly rejected.
