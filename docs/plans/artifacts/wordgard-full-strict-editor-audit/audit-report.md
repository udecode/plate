# Full Wordgard versus live Plite and Plate audit

## Bottom line

No: every Wordgard feature is **not** matched by a superior Plite or Plate
equivalent.

This full current-source audit prefers the local Plite/Plate implementation for
96/101 atomic concepts. Wordgard is
stronger for one concept, one is equivalent, two are genuine tradeoffs, and one
cannot be decided with current evidence. The correct conclusion is “the local
stack is preferred for most evaluated concepts,” not “Plate is superior at
everything.”

No Wordgard architecture transplant is justified. Two local proof packets are
material: a P1 stale clipboard benchmark repair and P2 raw mobile input phase
proof.

## Decision order

1. Strongest local mechanisms to keep: canonical structural change, compiled
   schema/slice fitting, explicit input ownership, multi-root JSON, independent
   history/Yjs/React owners, and Plate product-plugin ownership.
2. Material changes: one P1 clipboard benchmark caller repair and one P2
   raw-device input phase proof packet. Neither changes runtime behavior or
   public API by default.
3. Rejected reference machinery: a second document/state/view stack, blanket
   mobile keydown bypasses, central-authority collaboration as a default, and
   decoration-driven editability.
4. Unresolved evidence: raw Android/iOS traces, a common tile-renderer
   benchmark/non-React consumer, and a common bidi benchmark or failing
   platform-geometry case.

## Authority and completeness

- Wordgard: clean `main` tracking
  `origin/main` at
  `01eb2b5eae509509677345fd603acad001827dff`.
- Plite/Plate evidence: live working checkout based at
  `a56801377441f3680227b4a81bb36a9e4617fdf8`; the live inventory hashes bind every
  inspected file. A relevant type-only working diff exists in
  `packages/core/src/lib/plugin/createBasePlugin.ts`; the failing benchmark
  and runtime invocation are unchanged at the base commit.
- Fresh Wordgard inventory: 120 tracked files,
  19110 TypeScript declaration nodes, and
  101 atomic concepts.
- Coverage: 114 mapped files,
  6 exact file exclusions,
  19021 mapped declarations,
  89 exact declaration exclusions, zero
  unexplained files, zero unexplained declarations, and zero parse diagnostics.
- The old grouped audit and the latest Wordgard commit diff were not inventory
  inputs.

## Classification ledger

| Classification             | Count | Exact concept IDs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reference stronger         |     1 | `WG-STATE-012`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Plite stronger             |    42 | `WG-CMD-001`, `WG-CMD-003A`, `WG-CMD-003E`, `WG-COLLAB-001`, `WG-COLLAB-002`, `WG-DOC-001`, `WG-DOC-002`, `WG-DOC-006`, `WG-DOC-007`, `WG-DOC-009`, `WG-DOC-010`, `WG-DOC-011`, `WG-DOC-018`, `WG-HIST-001`, `WG-HIST-002`, `WG-HIST-003`, `WG-PROOF-001`, `WG-PROOF-002`, `WG-STATE-001`, `WG-STATE-002`, `WG-STATE-003`, `WG-STATE-006`, `WG-STATE-007`, `WG-STATE-008`, `WG-STATE-009`, `WG-STATE-010`, `WG-STATE-011`, `WG-STATE-014`, `WG-STATE-015`, `WG-VIEW-002`, `WG-VIEW-003`, `WG-VIEW-005A`, `WG-VIEW-005B`, `WG-VIEW-005C`, `WG-VIEW-006A`, `WG-VIEW-006B`, `WG-VIEW-007`, `WG-VIEW-008A`, `WG-VIEW-008B`, `WG-VIEW-009`, `WG-VIEW-010A`, `WG-VIEW-016` |
| Plate stronger             |    29 | `WG-META-004`, `WG-CMD-003C`, `WG-CMD-004`, `WG-PRODUCT-001A`, `WG-PRODUCT-001B`, `WG-PRODUCT-002`, `WG-PRODUCT-003A`, `WG-PRODUCT-003B`, `WG-PRODUCT-001C`, `WG-PRODUCT-003E`, `WG-PRODUCT-004A`, `WG-PRODUCT-004B`, `WG-PRODUCT-001D`, `WG-PRODUCT-003C`, `WG-PRODUCT-003D`, `WG-PRODUCT-004C`, `WG-PROOF-003`, `WG-TABLE-001`, `WG-TABLE-002`, `WG-TABLE-003`, `WG-TABLE-004`, `WG-TABLE-005`, `WG-TABLE-007`, `WG-VIEW-012B`, `WG-VIEW-013`, `WG-VIEW-014A`, `WG-VIEW-014B`, `WG-VIEW-014C`, `WG-VIEW-015`                                                                                                                                                       |
| Plite/Plate stack stronger |    25 | `WG-META-002`, `WG-META-003`, `WG-META-005`, `WG-CMD-002`, `WG-CMD-003B`, `WG-CMD-003D`, `WG-DOC-003`, `WG-DOC-004`, `WG-DOC-005`, `WG-DOC-008`, `WG-DOC-012`, `WG-DOC-013`, `WG-DOC-014`, `WG-DOC-015`, `WG-DOC-016`, `WG-PROOF-004`, `WG-STATE-004`, `WG-STATE-005`, `WG-TABLE-006`, `WG-VIEW-001`, `WG-VIEW-010B`, `WG-VIEW-010C`, `WG-VIEW-011`, `WG-VIEW-012A`, `WG-VIEW-012C`                                                                                                                                                                                                                                                                                  |
| equivalent                 |     1 | `WG-DOC-017`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| different tradeoff         |     2 | `WG-META-001`, `WG-STATE-013`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| insufficient evidence      |     1 | `WG-VIEW-004`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Preferred implementation ledger

| Preferred implementation | Count | Exact concept IDs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reference                |     1 | `WG-STATE-012`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Plite                    |    42 | `WG-CMD-001`, `WG-CMD-003A`, `WG-CMD-003E`, `WG-COLLAB-001`, `WG-COLLAB-002`, `WG-DOC-001`, `WG-DOC-002`, `WG-DOC-006`, `WG-DOC-007`, `WG-DOC-009`, `WG-DOC-010`, `WG-DOC-011`, `WG-DOC-018`, `WG-HIST-001`, `WG-HIST-002`, `WG-HIST-003`, `WG-PROOF-001`, `WG-PROOF-002`, `WG-STATE-001`, `WG-STATE-002`, `WG-STATE-003`, `WG-STATE-006`, `WG-STATE-007`, `WG-STATE-008`, `WG-STATE-009`, `WG-STATE-010`, `WG-STATE-011`, `WG-STATE-014`, `WG-STATE-015`, `WG-VIEW-002`, `WG-VIEW-003`, `WG-VIEW-005A`, `WG-VIEW-005B`, `WG-VIEW-005C`, `WG-VIEW-006A`, `WG-VIEW-006B`, `WG-VIEW-007`, `WG-VIEW-008A`, `WG-VIEW-008B`, `WG-VIEW-009`, `WG-VIEW-010A`, `WG-VIEW-016` |
| Plate                    |    29 | `WG-META-004`, `WG-CMD-003C`, `WG-CMD-004`, `WG-PRODUCT-001A`, `WG-PRODUCT-001B`, `WG-PRODUCT-002`, `WG-PRODUCT-003A`, `WG-PRODUCT-003B`, `WG-PRODUCT-001C`, `WG-PRODUCT-003E`, `WG-PRODUCT-004A`, `WG-PRODUCT-004B`, `WG-PRODUCT-001D`, `WG-PRODUCT-003C`, `WG-PRODUCT-003D`, `WG-PRODUCT-004C`, `WG-PROOF-003`, `WG-TABLE-001`, `WG-TABLE-002`, `WG-TABLE-003`, `WG-TABLE-004`, `WG-TABLE-005`, `WG-TABLE-007`, `WG-VIEW-012B`, `WG-VIEW-013`, `WG-VIEW-014A`, `WG-VIEW-014B`, `WG-VIEW-014C`, `WG-VIEW-015`                                                                                                                                                       |
| Plite/Plate stack        |    25 | `WG-META-002`, `WG-META-003`, `WG-META-005`, `WG-CMD-002`, `WG-CMD-003B`, `WG-CMD-003D`, `WG-DOC-003`, `WG-DOC-004`, `WG-DOC-005`, `WG-DOC-008`, `WG-DOC-012`, `WG-DOC-013`, `WG-DOC-014`, `WG-DOC-015`, `WG-DOC-016`, `WG-PROOF-004`, `WG-STATE-004`, `WG-STATE-005`, `WG-TABLE-006`, `WG-VIEW-001`, `WG-VIEW-010B`, `WG-VIEW-010C`, `WG-VIEW-011`, `WG-VIEW-012A`, `WG-VIEW-012C`                                                                                                                                                                                                                                                                                  |
| tie                      |     1 | `WG-DOC-017`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| different tradeoff       |     2 | `WG-META-001`, `WG-STATE-013`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| insufficient evidence    |     1 | `WG-VIEW-004`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Where the local stack is strongest

- Canonical structural change, schema compilation, slice fit, normalization,
  transactions, and multi-root JSON stay in Plite rather than a second retained
  model: `packages/plite/src/core/change/document-change.ts`,
  `packages/plite/src/core/schema-compiler.ts`, and
  `packages/plite/src/core/slice-fit/compiled-slice-fitter.ts`.
- Browser editing has explicit event/command/repair ownership:
  `packages/plite-react/src/editable/editing-kernel.ts` and
  `packages/plite-react/src/editable/input-router.ts`.
- History, Yjs collaboration, table policy, HTML codecs, React rendering,
  multi-root hosts, and product plugins remain independently owned and more
  broadly proved than Wordgard's integrated equivalents.
- Plate's product packages cover lists, tables, links, media, comments, AI,
  suggestion, DnD, and copied UI without forcing those policies into Plite.

## Where the blanket claim fails

- `WG-STATE-012` — Wordgard's typed phrase sets and partial localization
  overrides are better than the current copied-UI label ownership. The audit
  still rejects importing that registry into Plite/Plate core because this is
  application UI ownership, not editor substrate ownership.
- `WG-DOC-017` — deep equality, validation helpers, and typed errors are
  equivalent.
- `WG-META-001` — one integrated package versus explicit substrate/host/product
  packages is a tradeoff, not a universal win.
- `WG-STATE-013` — Wordgard's custom bidi engine and the local platform-geometry
  approach optimize different constraints. Reopen only with failing browser
  cases and a shared benchmark.
- `WG-VIEW-004` — Wordgard's tile renderer versus React plus current
  virtualization lacks a common huge-document benchmark and a proven non-React
  local consumer. There is not enough evidence to choose.

## Material packets

- `WG-VIEW-011` (P1) — Clipboard slice context and browser HTML wire format: keep the local clipboard architecture and repair the stale strict benchmark contract.
- `WG-PROOF-004` (P2) — Browser editor, DOM, selection, input, and composition tests: keep the local browser graph and add the named raw-device phase proof.
- `WG-VIEW-009` (P2) — Beforeinput command routing and native DOM delta reconciliation: keep the local editing kernel and close the raw-device phase proof.
- `WG-VIEW-010B` (P2) — Keyboard and pointer selection routing: keep selective event ownership and add exactly-once raw-device proof.

The P1 row is the
[clipboard benchmark contract repair](./material-dossiers.md#clipboard-benchmark-contract-repair).
The three P2 rows are one
[raw mobile input phase proof](./material-dossiers.md#mobile-input-phase-proof)
packet. Both preserve the public API and change no runtime behavior by default.

Current measured weaknesses:

- `pnpm check:plite` passed typecheck and all package tests, then failed its
  contracts stage because
  `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs` calls
  unavailable `getOptions()` from its initial codec callback. Chromium closure
  did not run after fail-fast.
- Raw-device proof plumbing is not runnable. Root `package.json` has no
  `test:mobile-device-proof[:raw]` script, and
  `bun tooling/plite/donor/proof/mobile-device-proof.mjs` resolves a missing
  `tooling/plite/packages/browser/src/core/release-proof.ts`.

## Options and recommendation

1. Import Wordgard's document/state/view architecture. Reject: it duplicates
   stronger local canonical-change, schema, host, history, Yjs, and product
   owners.
2. Copy only the blanket iOS/Android `Enter`/`Backspace` keydown bypass.
   Reject: it can suppress custom bindings and does not prove which native phase
   owns the semantic edit.
3. Keep the local architecture, repair both proof callers, and reopen runtime
   work only if the repaired benchmark or device trace exposes a product
   failure. Recommended.

Blast radius for option 3 is initially proof-only: the clipboard benchmark
fixture, `@platejs/browser`, `@platejs/plite-react`, the device-lab workflow,
and release-proof artifacts. No public API, serialized document,
collaboration format, or Plate plugin shape changes.

## Dependency-ordered packet list

1. After user acceptance, run `plate-plan` for the P1 benchmark/proof repair;
   rerun the focused benchmark and full strict gate.
2. Run `plite-plan` for the P2 proof/workflow-only packet.
3. Restore one root-owned, fail-closed raw-mobile proof command against the live
   `@platejs/browser` release-proof owner.
4. Produce and validate real Android Chrome and iOS Safari phase traces.
5. Close with no runtime change when traces pass. If a trace fails, return to
   `plite-plan` with the exact failing phase; invoke `best-api` or
   `plate-plan` only if the evidence actually crosses those boundaries.

## Independent lanes

- Test harvest: 27/27 files, 6,039 lines, 644/644 declared `it(...)`
  call sites, 33/33 behavior families, zero uncertain rows.
- Fresh Wordgard runtime proof: 572/572 Node tests and 733/733 upstream
  headless Chrome tests passed.
- Strict local proof: typecheck and package tests passed; contracts failed on
  the stale clipboard benchmark caller; Chromium closure was not reached.
- Issue lane: `null` and stale. The configured
  `code.haverbeke.berlin` upstream has no supported issue-provider adapter;
  no issue-derived claim is made.

## Facts, inference, recommendation

Facts are the immutable source cursors, manifest counts, exact matrix rows,
current source owners, fresh Wordgard test results, and the observed broken
raw-mobile proof command.

Inference is limited to qualitative preference under Plate's current
multi-root, JSON, React, Yjs, product-plugin, and proof constraints. It is not
a universal performance or product-quality ranking.

Recommendation: keep the local architecture. Accept the P1 clipboard benchmark
repair through `plate-plan` and the P2 raw-device proof packet through
`plite-plan`. Runtime work remains conditional on repaired proof finding a
real behavior failure. `best-api` remains N/A unless evidence produces a
public API decision.

## Claim ceiling

- Local preferred: 96/101.
- Overall absolute superiority: not proved.
- Raw Android/iOS input: not proved.
- Strict Plite handoff: not green; contracts fail before Chromium closure.
- Tile-renderer performance: not compared.
- Bidi correctness/performance: no universal winner.
- Issue coverage: unknown because the provider lane is unsupported.

## Artifacts

- [Full source manifest](./source-manifest.json)
- [Strict 1:1 matrix](./concept-matrix.md)
- [Material dossier](./material-dossiers.md)
- [Issue lane](./issue-lane.md)
- [Full test harvest](../../../editor-test-harvester/wordgard/report.md)
- [Live Plite inventory](./live-plite-source-manifest.json)
- [Live Plate inventory](./live-plate-coverage-manifest.json)
