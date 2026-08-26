# Complete Base-first registry variants

Objective:
Make Plate's public registry Base-first, keep explicit Radix support, and make
every public item install through either supported provider. Audit the full
graph, split only the source owners that translate provider behavior, fix every
in-scope gap found, and leave durable source, install, browser, and review proof.

Completion threshold:
This accepted implementation run is complete when Base/base-nova is the
default; all 380 public payloads resolve and install under Base and Radix; every
direct provider-bound owner has paired Base and Radix authors; provider-neutral
assemblies are not copied; unsupported providers fail closed; registry, docs,
audit, install, compiler, browser, changelog, doctrine, and P1 review gates pass;
all external blockers and proof limits are named; and the autogoal checker
accepts this plan.

Verification surface:
- Upstream `../shadcn` range and `apps/v4` inventory.
- `apps/www` registry metadata, provider authors, routes, build scripts,
  generated Base graph, sparse Radix overlay, docs block, and tests.
- Isolated shadcn 4.19 Base and Radix consumer fixtures using packed local
  package artifacts rather than checkout source aliases.
- Fresh Chrome interaction proof for toolbar, popover, dropdown, and context
  menu behavior, plus HTTP route and console/network evidence.
- Registry changelog, shadcn sync artifacts/status, Plate Vision, source agent
  rules, and generated skill mirrors.

Constraints:
- Build registry output with `pnpm --filter www build:registry` on `next`; do
  not edit generated registry or template output by hand.
- Edit `.agents/rules/*.mdc` as agent doctrine source, then run `pnpm install`
  to regenerate skill mirrors.
- Keep one semantic item id and one flat installed target per public item.
- Treat shadcn's documented direct `components/ui` `asChild` to `render`
  install transform as valid provider resolution.
- Do not claim shipped, fixed on a final ref, or released from local unpushed
  proof.
- Do not advance the full shadcn sync baseline for a partial accepted slice.

Boundaries:
- In scope: registry source and routing, four physical provider owners,
  provider-neutral consumer migration, Fumadocs registry composition, focused
  tests, generated registry output, docs/config teaching, changelog, sync
  artifacts, Vision, and owning agent rules.
- Out of scope: Aria provider support, one source copy per preset, broad shadcn
  docs/theme/create adoption, package public APIs, package exports, templates,
  and unrelated Plite or docs-reference repairs.
- Luma, Lyra, Nova, Vega, Maia, Mira, Sera, and Rhea are style presets. They are
  not component providers and do not justify source variants.

Blocked condition:
Block only if an exact public item cannot install through Base after its full
dependency closure and direct provider owner are audited, and safe source,
fixture, route, and compiler alternatives cannot establish or repair the
contract. No such blocker occurred.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Explicit user requirements captured | yes | Base variants, Base default like shadcn, full audit, current-item splitting, other-gap discovery, implementation, and final proof are recorded above. |
| Accepted implementation authority | yes | The user said `ok go`, then confirmed Base variants and Base default; no second planning pause applied. |
| Required skills loaded | yes | `sync-shadcn`, `autogoal`, `task`, `plate-ui`, `shadcn`, `best-api`, `docs-creator`, `registry-changelog`, `agent-native-reviewer`, `unslop`, `autoreview`, and Browser instructions were read and applied. |
| Upstream refs resolved | yes | Base `cd54e0927f3853a777f700a0bbf34507cf697b9c`; target `b9938d94635fca7a4560449713b0b1ba87d77bc6`; ancestry passed. |
| Output budget set | yes | Complete inventories stayed in run artifacts; shell reads and review scope were capped. |
| Provider hard-cut counterfactual | yes | Delete, merge, inline, and reuse review rejected graph-wide variants and retained only four behavior-owning adapters. |
| Browser path selected | yes | Registry HTTP routes plus a focused Base Vite harness and fresh Chrome session owned runtime proof. |
| Release artifact selected | yes | Registry changelog applies; no package changeset applies because no package source or published package API changed. |

Work Checklist:
- [x] Copy every explicit user requirement, boundary, stop condition,
  deliverable, proof surface, and final handoff requirement into this plan.
- [x] Resolve and prove the exact upstream base/target range and preserve its
  complete run inventory.
- [x] Reconcile all 6,342 upstream rows to durable decisions and keep the
  partial-sync baseline semantics explicit.
- [x] Audit all 435 active items, 323 production registry files, 451 active
  item paths, and 380 public payloads with zero unclassified rows.
- [x] Delete the item-level Radix-only exclusion policy and make completeness a
  supported-provider invariant.
- [x] Make `base` and `base-nova` the Plate defaults while preserving explicit
  Radix and legacy new-york resolution.
- [x] Reject Aria and unknown styles rather than advertising an unproved graph.
- [x] Retain exactly four physical provider owners: `editor-context-menu`,
  `editor-dropdown-menu`, `floating-popover`, and `toolbar`.
- [x] Keep assemblies, classic items, docs items, and provider-neutral source
  canonical rather than copying them into provider directories.
- [x] Normalize Plate adapter composition and focus behavior with
  `onInitialFocus` and `onFinalFocus`, while allowing shadcn's direct UI
  install transform where it fully resolves syntax.
- [x] Migrate every behavior-dependent consumer to the correct Plate adapter
  and repair dependency metadata.
- [x] Make all ten public classic items install under both providers without
  adding classic provider copies.
- [x] Make the installable Fumadocs block provider-neutral with native
  disclosure and the selected shadcn Separator.
- [x] Centralize provider metadata, build Base canonically, emit only the four
  Radix overlays, clean old provider output, and trace the actual production
  Base/Radix assets.
- [x] Audit route, registry index, dependency rewrite, CLI/config, LLM/docs,
  and test defaults for Base-first consistency.
- [x] Regenerate registry output through the owning build command and pass the
  registry source checker.
- [x] Install every public item under isolated Base and Radix shadcn fixtures,
  then refresh the 15 changed semantic consumers under both providers.
- [x] Prove zero provider-only compiler diagnostic sites and compile the
  focused Base adapter harness cleanly.
- [x] Run focused registry and interaction tests, docs build/parity, audit
  scripts, formatter/linter, changelog check, and mirror comparison.
- [x] Run final fresh Chrome interaction and console/network proof for all four
  provider owners.
- [x] Record additional defects, rejected review claims, unrelated blockers,
  and proof limits in durable artifacts.
- [x] Run three P1 autoreview invocations, fix the two valid findings, reject
  false claims with exact evidence, and finish with a clean final review.
- [x] Update sync status/deltas/dashboard without advancing the full baseline.
- [x] Fill the final handoff and close the goal only after the mechanical goal
  checker passes.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Named completion threshold | yes | Local implementation satisfies the Base-first, full-install, sparse-variant, proof, and review threshold. |
| Upstream range artifacts | yes | Run `docs/sync/shadcn/runs/2026-08-24-cd54e09-to-b9938d9/` contains nonempty name-status, numstat, commit, inventory, and plan artifacts. |
| Inventory completeness | yes | 6,342 upstream rows equal 402 smart merges plus 251 Plate forks plus 1,832 exclusions plus 3,857 no-ops. |
| Registry audit completeness | yes | 435 items, 323 production files, 380 public payloads, zero unclassified rows, zero missing UI symbols, and zero Base debt. |
| Supported-provider completeness | yes | All 380 public items install under `base-nova` and `radix-nova`; all ten public classic items are included. |
| Sparse physical variants | yes | Central metadata names four owners; Base canonical graph and four-item Radix overlay build successfully. |
| Registry source and route contract | yes | Source checker passes; 22 focused registry tests pass with 803 assertions; every refreshed dependency route returned HTTP 200. |
| Provider compiler proof | yes | Full consumers have 197 identical diagnostics per provider; focused changed surfaces have 21 identical diagnostic sites and zero provider-only sites; Base adapter harness exits 0. |
| Focused component behavior | yes | Table toolbar 1/1 with 5 assertions, math 4/4 with 15 assertions, and code block 2/2 with 3 assertions pass through the root Bun DOM preload. |
| Production tracing | yes | Four Vercel runtime tests pass and cover canonical `public/r` plus `src/__registry__/radix`. |
| Docs source parity | yes | `build:source` and direct docs source-parity check pass. |
| Browser interaction proof | yes | Fresh Chrome opens and closes toolbar, popover, dropdown, and context menu; final DOM is closed and console has zero warnings/errors. |
| Browser stability ledger | no | This is not a reporter-backed native selection, DnD, compositor, or shipped-fix claim; focused final interaction and network trace are the applicable boundary. |
| Visual screenshots | no | No visual redesign or screenshot-parity claim exists; DOM state, interactions, and network/console logs prove the changed behavior. |
| Registry changelog | yes | `generate-ui-changelog-entries.mjs --check` reconciles 81 source/generated events including `2026-08-25-base-first-registry`. |
| Published package changeset | no | Registry-only copied UI and app routing changed; no published package source, API, types, or runtime changed. |
| Barrel generation | no | No package export or exported file topology changed. |
| Agent source and mirror sync | yes | `pnpm install` regenerated skills; four source/generated skill pairs match byte for byte. |
| Agent-native review | yes | Review passes with no P0-P3 gap and rejects a redundant wrapper skill. |
| P1 autoreview | yes | Third and final review reports no P0/P1 findings, patch correct, confidence 0.91. |
| CI-owned templates | no | No template source, manifest, or lockfile was manually edited. |
| Full sync baseline advancement | no | This is a partial accepted slice; `lastSyncedCommit` stays at the prior baseline and `lastPlannedCommit` records the target. |
| Exact final pushed ref | no | Work is local and unpushed; the handoff excludes shipped/final-ref claims. |
| Broad www checks | no | Exact unrelated stale API-reference and Plite selection blockers are recorded under Open risks; focused owners pass. |
| Goal plan checker | yes | Fresh `check-complete.mjs` proof is the final local closeout command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and authority | completed | User requirements, accepted implementation authority, skills, Vision, and boundaries captured | none |
| Upstream range and accounting | completed | Exact SHA range, ancestry, 6,342-row inventory, and reconciled decisions | none |
| Full registry audit | completed | Exhaustive item/file/public-payload manifests and zero Base debt | none |
| Provider architecture | completed | Four owner pairs, Base canonical graph, sparse Radix overlay, neutral consumers | none |
| Install and source proof | completed | Both 380-item fixtures, refreshed consumers, source checks, tests, and compiler comparison | none |
| Browser and docs proof | completed | Fresh four-owner Chrome proof, route ledger, docs build/parity | none |
| Doctrine and release artifacts | completed | Vision/rules, mirrors, changelog, sync status, dashboard | none |
| Final review | completed | Third P1 pass clean at 0.91 confidence | none |
| Closeout | completed | Audit and plan finalized for mechanical goal check | none |

Sync evidence:
- Base: `cd54e0927f3853a777f700a0bbf34507cf697b9c`,
  `2026-06-01T20:22:30+04:00`, `registry: updated shadcnstudio registry url
  with style support (#10847)`.
- Target: `b9938d94635fca7a4560449713b0b1ba87d77bc6`,
  `2026-08-24T16:02:51+04:00`, `fix(ci): bump @changesets/cli for npm 12
  publish detection (#11613)`.
- Base ancestry passed. The target remained the latest planned upstream state
  used by this accepted slice.
- Complete run row count: 6,342; `apps/v4` commit count: 191.

Decision counts:
| Decision | Count | Result |
| --- | ---: | --- |
| `smart-merge` | 402 | retained in accepted sync accounting |
| `plate-fork` | 251 | retained with Plate ownership |
| `exclude-upstream` | 1,832 | settled exclusions retained |
| `no-op` | 3,857 | no Plate action |
| `adopt-upstream` | 0 | no unresolved direct adoption |
| `delete-plate-residue` | 0 | no residue deletion row |
| `needs-question` | 0 | no hidden user decision |
| Total | 6,342 | equals upstream inventory |

Architecture decision:
- Base is the default provider and `base-nova` is the default style.
- Radix remains an explicit supported provider; `new-york` aliases resolve to
  it for compatibility.
- Aria is unsupported and fails closed.
- Presets select tokens and provider routing. They do not multiply Plate
  component source.
- Four adapters are justified by provider behavior, focus, composition, or
  props. Everything else stays canonical or relies on shadcn's direct UI
  install transform.

Additional gaps found:
- Classic item filtering violated supported-provider completeness.
- Plate chose Radix/new-york by default and generated Radix canonically.
- Build and route code duplicated variant names.
- The first audit missed dropdown and context-menu owners.
- Adapter consumers leaked Radix composition and focus prop names.
- Base toolbar lacked Plate overlay-open behavior.
- Tooltip, HoverCard, Select, and two classic leaf consumers retained
  provider-specific assumptions.
- Fumadocs bundled fixed Radix packages.
- Docs, LLM output, checks, and init config taught the wrong default.
- Old provider output could survive build inversion.
- Production tracing named deleted Base staging rather than canonical Base and
  sparse Radix output.
- The initial root fixture command checked no source because it ignored project
  references.

Verification evidence:
- `pnpm --filter www build:registry`: pass; canonical Base and four Radix
  overlay payloads regenerated from source.
- Registry source checker: pass.
- Registry suite: 22 pass, 0 fail, 803 assertions.
- Focused component suites: 7 pass, 0 fail, 23 assertions.
- Vercel runtime suite: 4 pass, 0 fail, 4 assertions.
- `pnpm --filter www build:source`: pass; docs source parity: pass.
- Exhaustive audit: 435 active items, 235 Plate items, 200 docs items, 323
  production files, 380 public payloads, four variant owners, zero Base debt.
- UI compatibility: 51 direct shadcn items, 20 modules, 179 usage rows, zero
  missing symbols.
- Isolated shadcn 4.19 installs: 380/380 Base and 380/380 Radix; latest refresh
  of all 15 changed semantic consumers succeeds under both.
- Provider compiler comparison: zero Base-only and zero Radix-only diagnostic
  sites; focused Base harness exits 0.
- Fresh Chrome proof: `toolbarOpened=1`, `popoverOpened=1`,
  `dropdownOpened=1`, `contextOpened=1`; final overlays closed; zero console
  warnings/errors; no failed request and no HTTP response at or above 400.
- Registry changelog: 81/81 events agree.
- Four doctrine skill mirrors match their source-generated counterparts.
- Final P1 review: no actionable finding, patch correct, confidence 0.91.
- Durable detail: `docs/plans/artifacts/registry-primitive-variants/audit.md`,
  `consumer-proof.md`, and `browser-proof.md`.

Review ledger:
- First P1 pass accepted the production tracing defect and rejected the claimed
  classic Base install failure after the exact fixture proved shadcn's direct
  `asChild` to `render` transform.
- Second P1 pass rejected missing-dependency and stale-popover claims using
  current payload/source/install evidence. It accepted that adapter focus names
  leaked Radix and drove the hard cut to `onInitialFocus`/`onFinalFocus`.
- Third and final P1 pass found no P0/P1 defect. Repo policy forbids a fourth
  invocation for this unchanged scope.

Error attempts:
| Error or failed attempt | Different move | Resolution |
| --- | --- | --- |
| Used unsupported `--preset=base-nova` syntax | Read current shadcn CLI help/source | Used `--base base --preset nova`. |
| Vite fixture tried to join the workspace root | Remove only the temporary workspace marker | Fixture installed in isolation. |
| zsh expanded an unmatched pattern | Quote exact paths and patterns | Commands reran with literal arguments. |
| Audit scripts resolved `.tsx` incorrectly under Node | Run their Bun-owned entrypoints | All audit scripts pass. |
| Audit prose omitted the script subcommand | Record exact executable commands | Durable audit names all three scripts. |
| Changelog tool did not support `--help` | Read the owning skill and source | `--write` and `--check` used correctly. |
| Early compatibility data retained an obsolete Aria set | Regenerate from current provider policy | Aria is classified unsupported. |
| Broad upstream output exceeded the read budget | Keep complete TSVs and inspect counted slices | 6,342 rows reconcile without chat dumping. |
| First response test expected internal `list-classic-demo` | Separate public items from previews | Ten public classic items are tested. |
| Root `tsc --noEmit` checked no referenced source | Run `tsc -b` and focused projects | Provider prop gaps became visible. |
| Local packages were unpublished to the fixture | Pack 53 exact current `dist` packages with overrides | No source alias reaches the checkout. |
| First design assumed two provider owners | Let compiler differences determine owners | Dropdown and context menu raised the total to four. |
| Changelog generation was first run without `--write` | Use the explicit write mode | Source and generated artifacts agree. |
| Grouped DOM specs collided through global mocks | Run focused specs in separate configured processes | All seven focused tests pass. |
| Math/table retained `asChild` behind Plate adapters | Remove provider syntax from adapter calls | Both provider installs compile equally. |
| Code-drawing Select widened values | Add domain guards | Nullable/string provider values are safe. |
| First trigger adapters dropped caller props | Generalize and forward neutral trigger props | Consumer behavior is preserved. |
| Browser/Chrome blocked top-level JSON with `ERR_BLOCKED_BY_CLIENT` | Use route tests, CLI installs, and server HTTP logs | All registry requests returned 200. |
| Table demo hit unrelated schema-id and uncached-data errors | Use focused harness and exact adapter consumers | Four-owner interaction proof is isolated. |
| `pnpm` swallowed the Vite port flag | Run Vite directly on 5173 | Fresh harness loaded at the intended port. |
| Playwright helper lacked `networkidle` support | Use DOMContentLoaded and network trace | Final page and request state were observed. |
| Chrome locators timed out after successful dismissal | Inspect final DOM and event ledger | Closed-state result was confirmed. |
| Autoreview output paths inside the clone were rejected | Write review outputs under `/tmp` | Review runner accepted the paths. |
| Full dirty-checkout review bundle exceeded its manifest limit before model use | Clone an exact dataset-only review checkout | All three actual model reviews ran on bounded scope. |
| Biome command was unavailable | Use the repo's Ultracite command | All 51 final TypeScript files format and lint cleanly. |
| Registry tests first ran from repo root and missed `public/r` | Run registry suite from `apps/www` | 22 tests pass. |
| Focused compiler messages differed in generic rendered text | Compare normalized diagnostic sites | Zero provider-only sites remain. |
| Raw DOM specs ran from `apps/www` without root Bun preload | Run them from repo root | 7 tests and 23 assertions pass. |

Final handoff:
- Local outcome: Base-first registry implementation complete and verified; not
  committed, pushed, released, or certified against a final remote ref.
- Provider model: Base default, Radix explicit, Aria rejected, presets do not
  create component providers.
- Physical variants: exactly four owner pairs; all other public source remains
  canonical.
- Public install result: 380/380 items under both Base and Radix.
- Additional gap result: tracing and focus API leaks were the final valid P1
  defects; both are repaired. Other late review claims were disproved by exact
  current payload and install evidence.
- Baseline: `lastSyncedCommit` unchanged; partial sync and target plan retained.
- Durable proof: registry audit, consumer proof, browser proof, sync run, and
  this completed goal plan.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local closeout after the clean third P1 review. |
| Where am I going? | Mechanical goal validation, then concise user handoff. |
| What is the goal? | A complete Base-default registry with only real provider variants. |
| What did the audit prove? | Four physical owners serve all 380 public items under Base and Radix. |
| What remains task-owned? | Nothing after the plan checker and goal status update. |

Open risks:
- The implementation is local and unpushed. It is not delivery or release
  proof and has no immutable final-ref fingerprint.
- `pnpm --filter www check:docs` is blocked by an unrelated stale API-reference
  manifest.
- Broad www typecheck is blocked by unrelated current-tree Plite selection
  drift; focused provider diagnostics are equal and task-owned checks pass.
- The generic full-consumer fixtures retain 197 shared current-tree/host
  diagnostics on each provider; none is provider-only.
- The table demo retains unrelated schema-id and Next uncached-data failures;
  the focused four-owner harness supplies the applicable browser proof.
- Browser navigation to top-level registry JSON can be extension-blocked; route
  tests, both CLI installs, and exact HTTP server logs cover that boundary.
