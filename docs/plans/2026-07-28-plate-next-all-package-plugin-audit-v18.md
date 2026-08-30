# Plate Next v18 all-package plugin audit

Objective:
Review every live package plugin against `plate-next` v18 and
`plate-plugin-creator`, publish an exact repair ledger, and make zero
`packages/**/src` changes.

Completion threshold:
- Every workspace package is classified.
- Every production plugin constructor/adaptation has one review row.
- Every exported live plugin symbol is covered with zero duplicate or missing
  manifest IDs.
- Plugin-owned helper and React family topology is reviewed.
- Every accepted finding has priority, owner, evidence, decision, and next.
- Source stays frozen; no package is attested to v18.

Verification surface:
- 58 package manifests and 1,377 package source files.
- 195 primary production expressions: 189 constructors and 6 adaptations.
- 180 exported live plugin symbols.
- 381 files in the transitive plugin-owner/helper closure.
- 1,090 test-only expressions classified separately from the live-owner review.
- Static audits for builder drift, casts/annotations/`any`, helper plumbing,
  transaction use, capability ownership, and React family topology.
- Source-only result: no typecheck, runtime, browser, or behavior claim.

Constraints:
- Best Plate v2 shape on Plite; no legacy compatibility goal.
- Owner-first colocation has no line ceiling.
- Constructor owns independent contributions; `.extend()` needs a real earlier
  capability, imported/prebuilt adaptation, or shared factory boundary.
- Capability groups, active transactions, flat plugin APIs, inferred builder
  types, named state contracts, and component/hook family ownership follow the
  two named skills.
- Findings are review output, not authorization to edit product source.

Boundaries:
- Read scope: `packages/**/src/**/*.{ts,tsx,mts,cts}` plus package manifests,
  exports, tests, and package-local callers needed to classify live owners.
- Write scope:
  `docs/plans/2026-07-28-plate-next-all-package-plugin-audit-v18.md` and
  `docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/**`.
- Frozen: package source, tests, barrels, manifests, docs, apps, skills,
  doctrine versions, generated registries, changesets, and release metadata.
- No commit, push, PR, browser mutation, or cross-thread message.

Blocked condition:
Only live-source enumeration failure or an owner that remained unclassifiable
after three source/caller/type-owner inspections could block closure. Neither
occurred.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | All package plugins, current skill rules, review only, no source updates |
| Skills read | yes | Full `plate-next` v18 and `plate-plugin-creator` owners plus required Vision references |
| Goal created | yes | Quantitative objective records exact coverage and source freeze |
| Source boundary frozen | yes | Artifact-only write scope recorded before scanning |
| Doctrine state recorded | yes | Active tracked packages started at v17/stale under v18; this audit does not attest |
| Public API decisions isolated | yes | Markdown, DnD selection, NodeId, Tag composition, and other forks route to `best-api` |

Work Checklist:
- [x] Enumerate all workspace packages and package source files.
- [x] Build constructor and pure-adaptation manifests.
- [x] Reconcile every exported production Plugin symbol.
- [x] Build and resolve the transitive plugin-owner/helper closure.
- [x] Review all 195 production expressions against authoring-stage and
      capability rules.
- [x] Review helper, transaction, cast, inference, component, hook, and
      topology candidates.
- [x] Classify all 58 packages, including 21 without a live plugin owner.
- [x] Separate 1,090 test-only expressions from live production semantics.
- [x] Give all 120 findings priority, owner, evidence, decision, and next.
- [x] Record kept independent boundaries and false positives.
- [x] Publish row-level plugin, package, finding, source-closure, and static
      candidate ledgers.
- [x] Verify zero missing symbols, duplicate IDs, or unresolved relative
      imports.
- [x] Verify the frozen source snapshot remained unchanged.
- [x] Validate doctrine registry without updating package attestations.
- [x] Keep `packages/**/src` untouched.
- [x] Record proof limits and future repair order.

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Inventory | complete | 58 packages, 1,377 source files |
| Manifest | complete | 189 constructors plus 6 adaptations |
| Symbol reconciliation | complete | 180 of 180 exported live symbols covered |
| Owner closure | complete | 381 files, zero unresolved relative imports |
| Semantic review | complete | 195 of 195 production rows have verdict/evidence/next |
| Package review | complete | 58 of 58 package rows classified |
| Finding synthesis | complete | 120 prioritized rows |
| Source freeze | complete | Snapshot checker reports zero owner-closure changes |
| Handoff | complete | Report and ledgers linked below |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Production row coverage | yes | `plugin-review-ledger.tsv` has 195 data rows |
| Package coverage | yes | `package-review-ledger.tsv` has 58 data rows |
| Export coverage | yes | 180 covered, zero missing |
| Duplicate IDs | yes | Zero constructor/adaptation duplicate IDs |
| Helper closure | yes | 381 files, zero unresolved imports |
| Finding ownership | yes | 120 rows include priority, anchor, decision, and repair owner |
| Score/priority gate | yes | 3 P0 and 47 P1 findings are blockers, never called clean/current |
| Best Plate v2 recommendation | yes | Core-first repair order and rejected hacks are recorded |
| Plite/Plate gaps | yes | Exact Core, Plite DOM, and public API owners are named below |
| Doctrine attestation | no | Review-only mode leaves all v18 package attestations unchanged |
| Package proof | no | No product code changed; source-only audit is the explicit proof boundary |
| Browser proof | no | No runnable UI behavior changed |
| Barrel generation | no | No exports or source files changed |
| Final artifact check | yes | Manifest, closure, ledger, snapshot, doctrine, and scoped formatting checks pass |

## Verdict

The plugins do not all follow v18.

| Package class | Count | Meaning |
|---|---:|---|
| P0 blocked | 1 | Core type/builder kernel invalidates global inference law |
| P1 blocked | 21 | Runtime, transaction, capability, hook, or semantic-owner violation |
| P2 repair | 5 | Concrete ownership/type/topology drift |
| P3 repair | 1 | Low-risk one-use topology only |
| Source-clean | 9 | No v18 drift found in source review; not runtime-proven or attested |
| No live plugin owner | 21 | Substrate, support, tooling, or UI package |

There are 120 findings: 3 P0, 47 P1, 51 P2, and 19 P3. Seventy-one
production expressions have a directly linked finding. The other 124
expressions are either source-clean or clean inside a package still blocked by
package-level drift; none is falsely attested current.

## Repair order

1. Core type kernel, builder inference, and honest optional-plugin lookup.
2. Media factory inference and Selection transaction/weak-peer/hook ownership.
3. Suggestion nullability, Link and Markdown capability ownership, AI/Table
   casts, and Legacy list model stale capability capture.
4. DnD, Toggle, Utils, Selection, and Core EventEditor React families.
5. Remaining P2/P3 one-owner helpers, taxonomy directories, dead aliases,
   constants, and test families.

## Best Plate v2 recommendations

| Target | Recommendation | Rejected shape |
|---|---|---|
| Core builders | Repair generic owners once and prove inference with compile-only tests | Consumer annotations, `any`, double casts, fake structural descriptors |
| Optional plugins | Typed portal plus `installed`; no fabricated fallback plugin | Throw/catch discovery or empty descriptor fallbacks |
| Capability staging | Constructor first; stage only a real earlier capability | `.extend()` merely to access context |
| Transactions | Use supplied active `tx` and tx-scoped reads | Nested editor updates or editor reads during a transaction |
| React ownership | One semantic component-family file and one hook-family file | Hooks/components inside plugin descriptors or taxonomy folders |
| Helpers | Inline one-owner context/tx plumbing; keep independent algorithms/adapters | `transforms/`, `queries/`, `utils/`, or wrapper files without another owner |
| Public API forks | Resolve through `best-api` before implementation | Compatibility aliases or parallel call surfaces |

## Plite / Plate gap ledger

| Gap | Smallest owner | Why package-local workaround is wrong | Required proof |
|---|---|---|---|
| Builder/config/capability inference | Plate Core plugin type kernel | Casts merely hide a global contract failure | Compile-only dependency/API/read/update/selector matrix |
| Transaction-bound clipboard ingress | Plite DOM | Selection cannot safely reopen insertion inside active tx | Selection paste regression with one transaction |
| Rule factory inference | Plate Core input-rules factory | Math/consumer casts duplicate the same generic defect | Compile-only rule-family inference plus focused behavior |
| NodeId schema-free block policy | `best-api` then Plate Core/Plite schema owner | Legacy `node.inline` structural guessing has no honest owner | Schema and raw-editor NodeId behavior proof |
| Same-key Tag personalities | `best-api` | Local composition hard-codes a public API decision | Accepted call shape plus type/runtime adoption proof |
| DnD-owned selection behavior | `best-api`, Selection, and Plite boundary | DnD should not become a second selection subsystem | Selection/DnD integration proof |

## Kept boundaries

- Core compiler/publication/store, Base assembly, HTML codec compiler, React
  render pipeline, and static render pipeline are independent infrastructure.
- DnD `getDropPath`, Yjs adapter factories, Table
  `applyTableMutationPlan`, and Table `planTableCellDrop` are durable
  algorithm/adapter boundaries.
- Media `ImagePreviewStore.extendSelectors` is a Zustand receiver, not a
  deleted Plate builder method.
- BaseBlockquote's extension and shipped Core configure order are justified.
- CSV, Docx, Juice, Code Drawing, Date, Excalidraw, Find Replace, Mention, and
  Slash Command are source-clean in this audit.

## Artifact ledger

| Artifact | Rows / result | Purpose |
|---|---:|---|
| `audit-report.md` | 120 findings | Human review report |
| `audit-findings.tsv` | 120 | Machine-readable prioritized findings |
| `plugin-review-ledger.tsv` | 195 | One verdict per production expression |
| `package-review-ledger.tsv` | 58 | Every package classified |
| `plugin-manifest.tsv` | 986 | 189 production plus 797 test constructors |
| `plugin-adaptation-manifest.tsv` | 299 | 6 production plus 293 test adaptations |
| `plugin-source-closure.tsv` | 381 | Transitive owner/helper source closure |
| `static-candidates.tsv` | 167 | Same-class static audit candidates |
| `topology-inventory.tsv` | 255 | Helper/React topology candidates |
| `manifest-verification.json` | zero mismatches | Independent manifest reconciliation |
| `audit-verification.json` | zero ledger mismatches | Independent ledger reconciliation |
| `audit-summary.json` | exact totals | Audit summary |

## Related static sweeps

| Rule class | Scope | Result | Patched |
|---|---|---:|---:|
| Plugin builder casts/annotations | `packages/**/src` | 5 casts plus 1 annotation, all Core-owned | 0 |
| Hook implementation in descriptor | `packages/**/src` | DnD, Selection, Toggle, Utils | 0 |
| Initial-state `satisfies` | `packages/**/src` | Toggle | 0 |
| Context/tx helper candidates | plugin owner closure | 155 reviewed; infrastructure and durable algorithms separated from one-owner plumbing | 0 |
| Deleted builder/options APIs | `packages/**/src` | 0 Plate matches; one Zustand receiver classified clean | 0 |
| Nested update / explicit normalize | feature production plugin scope | No unresolved generic pattern; exact Selection/transaction findings recorded | 0 |

## Errors corrected during inventory

| Attempt | Problem | Correction |
|---|---|---|
| Initial source glob | `src/**` filter returned zero | Enumerated package manifests, then each package `src` |
| Initial parser | TypeScript compiler API unavailable | Used the workspace Babel parser |
| JSX parsing | JSX plugin was applied to `.ts` | Enabled it only for `.tsx` |
| Initial package count | Top-level scan missed nested `udecode/*` workspaces | Enumerated all package manifests: 58 packages, 1,377 source files |
| Test classification | `*.slow.*` was counted as production | Added slow/spec/test path classification |
| Extension count | Regex counted `state.transaction.extend` | Counted only AST plugin-builder chains |
| Adaptation coverage | Pure, casted, and local-alias chains were missed | Added adaptation, casted-callee, and local-builder-alias capture |

Changed list:
| Group | Current-run changes |
|---|---|
| Product source/tests/API | None |
| Skills/doctrine/version registry | None |
| Audit plan | This file |
| Audit artifacts | Manifest, scanners, ledgers, report, verification, and snapshot files under the allowed artifact directory |

Open risks:
- Source review cannot prove runtime behavior or declaration inference.
- Findings may share one Core fix; counts are audit rows, not an estimate of
  independent implementation commits.
- Concurrent source writes would invalidate anchors; the final snapshot check
  protects the 381-file owner closure only.
- All 42 active tracked packages remain stale under v18 until repaired, proven,
  and explicitly attested.

Verification evidence:
- `build-plugin-manifest.mjs`: 58 packages, 1,377 source files, 189 production
  constructors, 6 production adaptations, and 1,090 test-only expressions.
- `verify-plugin-manifest.mjs`: 180/180 exported live symbols covered; zero
  missing symbols, duplicate IDs, or unresolved closure imports.
- `build-plugin-closure.mjs`: 381 owner/helper files; zero unresolved relative
  imports.
- `build-audit-ledgers.mjs`: 195 plugin rows, 58 package rows, 120 findings.
- `check-source-snapshot.mjs`: owner/helper closure unchanged after review.
- `version.mjs validate/status`: registry valid at v18; 0 current, 42 stale,
  0 drifted, and 1 retired.
- Scoped Biome check: audit generator/scanner scripts clean.
- Autogoal completion checker: this plan is mechanically complete.

Reboot status:
Resume implementation from `CORE-01`/`CORE-02`/`CORE-03`; regenerate manifests
before changing packages because anchors are live-source-derived. Do not mark a
package v18 current until its linked findings are repaired and focused proof
passes.

Final handoff:
- Human report:
  `docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/audit-report.md`
- Production expression ledger:
  `docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/plugin-review-ledger.tsv`
- Package ledger:
  `docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/package-review-ledger.tsv`
- Finding ledger:
  `docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/audit-findings.tsv`
- Product source changes: zero.
