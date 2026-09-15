# Neutral editor API and public documentation adoption

Status: Complete

User authorization: “Ok go all” accepts the reviewed neutral public naming and
Plate-only documentation direction. Execute locally through verification.
No commit, push or publication is requested.

Decisions: [neutral naming](../research/decisions/editor-public-naming.md) and
[documentation audit](2026-09-12-plate-public-docs-audit.md). Keep the earlier
audit evidence and immutable reviews as history; this file owns adoption.

## Accepted target

- Public roots use `EditorRoot` in each React entrypoint; the copied visible
  editor remains `Editor`; passive `EditorProvider` keeps its independent job.
- Public export names contain neither Plate nor Plite branding. Use Editor for
  editor-specific roles and ordinary domain nouns where they are sufficient.
  Shared declarations change at their source and keep facade identity.
- One `data-editor-*` contract, including `data-editor-authored`, owns runtime
  DOM output and its consumer markers. Remove the test-only announcer marker.
  Exact repair classification remains private. Preserve view/root/native laws.
- Serialized clipboard and authored envelopes use one coordinated neutral
  encoder/decoder contract. Prior Plate/Plite wire names are unsupported.
- Public docs teach Plate only. Preserve Performance and From Plite to Plate
  (EN/CN) as the explicit exceptions. Consolidate useful raw reference coverage,
  update metadata, search, LLM/docs registry and copied examples together.
- Internal package names, implementation filenames, historical research,
  immutable doctrine versions and third-party source are not a brand-removal
  corpus. Required source imports and source ownership remain truthful.

## Acceptance

- [x] Capture a complete public-export map with collisions resolved by owner.
- [x] Adopt source declarations, reexports, actual callers and type contracts.
- [x] Migrate DOM producers/consumers and exact mutation classification; delete announcer marker.
- [x] Prove current clipboard/authored HTML and DOCX round trips; delete prior branded readers.
- [x] Consolidate public docs coverage and routes; remove internal-layer teaching from EN/CN, rendered snippets and metadata.
- [x] Apply the same documentation boundary to navigation, paging, search, LLM exports and registry installation.
- [x] Repair affected source rules, durable law and versioned doctrine; regenerate and check mirrors.
- [x] Regenerate barrels, entrypoint metadata, API manifest and registry through owners.
- [x] Complete source package types, affected tests, packed-export contract checks and required browser matrix; resolve attributable failures.
- [x] Verify affected public routes and docs parity; reconcile every original audit group and review findings.
- [x] Inspect final changes and decision trail, retain exact proof/limits, and close the native goal only after the authorized outcome is complete.

## Ownership and checkpoints

Root owns the global mechanical rename pass, export-map reconciliation,
package integration, generators, doctrine and final proof. Workers initially
map read-only. After the global pass, exact ownership will be handed to the DOM
codec worker and docs worker; root will not rewrite their files concurrently.

Evidence lives in `.audit/plate-public-docs/` and `docs/plite/reference/`.
The append-only decision trail is `.audit/plate-public-docs/decisions.tsv`.

All accepted implementation and verification work is complete. No commit, push,
PR, release or publication was authorized.

## Before, after, and breaking changes

```tsx
// Before
import { Plate, PlateContent } from 'platejs/react';
<Plate editor={editor}><PlateContent /></Plate>;

// After
import { EditorRoot, EditorContent } from 'platejs/react';
<EditorRoot editor={editor}><EditorContent /></EditorRoot>;
```

The styled copied `Editor` still sits inside `EditorRoot`. `EditorProvider`
continues to bind controls to an existing editor without mounting an editable
view. No lifecycle wrapper or old-name compatibility export was added.

| Before | After |
| --- | --- |
| `Plate` / `Plite` | `EditorRoot` in the respective React entrypoint |
| `PlateContent`, `PlateContainer` | `EditorContent`, `EditorContainer` |
| `PlateElement`, `PliteElement` | `EditorElement` in the respective renderer entrypoint |
| `PlateStatic`, `PlateView` | `EditorStatic`, `EditorPreview` |
| `PliteDOMResolutionError`, `PlateError` | `DOMResolutionError`, `EditorError`, including instance names |
| `defineBasePlugin`, `definePlatePlugin` | `definePlugin` in the respective headless/React entrypoint |
| `data-plite-editor` | `data-editor` |
| `data-plite-*`, `data-plate-*` output | `data-editor-*` |
| `plite-*`, `plate-*` runtime CSS classes | `editor-*` |
| `data-plate-authored` output | `data-editor-authored` |
| `application/x-plite-fragment` output | `application/x-editor-fragment` |
| `application/vnd.plate.authored+json` input | unsupported; use `application/vnd.editor.authored+json` |
| `plate/authored.json` DOCX member | unsupported; use `editor/authored.json` |
| `data-plate-mention`, `data-plate-media-*`, `data-plate-natural-*` input | unsupported; use `data-editor-*` |
| `plate-image`, `plate-media-embed` HTML classes | unsupported; use `editor-image`, `editor-media-embed` |

Consumers must update renamed imports/types, CSS and DOM selectors, custom
clipboard readers, and copied UI integrations together. Package import paths
remain unchanged. The complete accepted symbol map is
[identifier-map.json](../../.audit/plate-public-docs/identifier-map.json).

Current codecs read and write only neutral clipboard, authored HTML/DOCX,
mention and media payloads. Ephemeral drag formats use neutral names at both
producers and readers. Documentation URLs redirect to canonical Plate coverage.

## Proof state

- Export-map baseline: 81 entrypoints, 707 affected exports, 377 names; exact map and adoption receipts are retained in `.audit/plate-public-docs/`.
- Applied 8,263 AST identifier replacements in 741 active source files and 2,840 attribute replacements in 315 files; semantic collision and codec repair followed separately.
- The follow-up hard cut passes 528 focused tests across DOM, static, DOCX,
  mention and media partitions. Exact source scans find no prior branded reader
  in the active Plite/Plate package source.
- `pnpm --filter plitejs typecheck`: 13 tasks pass. `pnpm brl`: 4 tasks pass.
- Export census after adoption: 81 entrypoints and 4,640 export occurrences; no branded exported names, missing accepted mappings, inferred runtime-signature names, transitive reachable type names or public members.
- Plate source graph: 83 typecheck tasks pass; test-helper graph: 34 tasks pass. The www source typecheck passes after explicitly bounding the dynamic navigation helper return type.
- Focused runtime proof: 517 core, 295 React, 91 static and 48 table React tests pass; affected helper adoption additionally passes 373 React, 231 Bun and 118 helper tests.
- Tooling docs/schema/copied-generator contracts: 95 tests pass. Public package import smoke: 26 tests pass.
- Full `pnpm check:plite:contracts`: 254 Node contracts, 25 benchmark contracts, 53 benchmark targets, four package builds and strict public-consumer types pass. Evidence: `.audit/plate-public-docs/check-plite-contracts-final.log`.
- Documentation coverage reconciles all 174 original nonexception groups; 1,679 named imports resolve and 86 redirect destinations/hash targets validate. Receipts are under `docs/plite/reference/public-*.json`.
- Full source closure: 93 typecheck tasks, 152 package test tasks plus three prerequisites, and lint over 871 actual files all pass. Exact logs/hashes are in `.audit/plate-public-docs/final-clean-verification-receipt.json`.
- Full `pnpm --filter www typecheck` passes, including API/source/registry parity, generated route types, website types and package integration types. Log: `/tmp/editor-naming-www-typecheck-complete.log`.
- Both active registry outputs (`r` and `rd`) contain the current payload set with no retired filenames or unapproved Plite bodies. API manifest signatures/documentation contain no Plite fields; type-import formatting verifies identical symbols at the actual Plate facade. Receipts: `docs/plite/reference/registry-publication-audit.json` and `.audit/plate-public-docs/no-legacy-naming-receipt.json`.
- HTTP proof: 37 initial page/channel requests, 1,025 delivered code snippets without stale identifiers, 138 LLM sections, and all 16 EN/CN redirect hash targets pass. Only the approved comparison topics appear in Plite search results. Receipts: `.audit/plate-public-docs/http/verification-receipt.json` and `anchor-recheck.json`.
- Doctrine version 187 validates with the original two active and 44 retired package attestations preserved. Seven affected generated skill owners contain no rejected public identifiers. Source rules and mirrors were regenerated through `pnpm install`.
- Before-rename authored HTML baseline: 1 test, 7 assertions pass.
- Packed release proof passes for four packages and 86 public subpaths: runtime/declaration parity, NodeNext and Bundler declarations, Node/SSR execution, DCE, 81 runtime entrypoints and 42 optional-peer closures. The reviewed entrypoint-size baseline is current.
- Earlier audit/review evidence remains historical. Intermediate browser runs exposed unmatched CSS helper strings and were invalidated/interrupted during source repairs; no final pass is claimed from those runs. Drag-preview isolation, error instance names and all example CSS producers are corrected and covered by the final package/lint runs.
- Final managed browser matrix passes: Chromium 785 passed/8 skipped; Firefox 674/119; mobile Chromium 372/421; WebKit 695/98; mobile WebKit 2/0. Each main project completed 125 bounded batches; mobile WebKit completed its focused batch. The DOM corruption fixture corrupts an actual owned marker and verifies custom `data-editor-*` attributes survive. Retained log: `.audit/plate-public-docs/verification-final/browser-matrix.log`.
