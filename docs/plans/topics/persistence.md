# Document persistence and migration

A saved document is one complete envelope with versioned feature metadata, application schema lineage and separate local history. Migration is one detached operation bound to immutable target facts: raw input carries per-call source intent, the chain is preflighted before any callback, input is isolated, and success returns a complete current envelope. The 2026-10-04 audit found this adopted and stopped; the silent loss of unknown top-level stored fields at migration completion belongs to the model scope's Pursue ([triage audit](../2026-10-04-ledger-triage-audit.md), [immutable conversion plan](../2026-09-16-persistence-immutable-conversion.md)). `node tooling/scripts/review-ledger.mjs show persistence` prints the full history.

## Layer and owner

```text
saved { document, schema, selection? }
  or raw document plus explicit source intent
  → validate source identity and preflight the complete chain
  → isolate input and run steps against immutable target facts
  → structural or explicit typed selection mapping
  → prepare and validate the complete target document
  → current { document, schema, selection? } plus an execution report
  → save directly, or load through the normal editor boundary
```

| Responsibility | Decision |
| --- | --- |
| Plite | Versioned JSON codecs, document shape, schema and selection laws; the whole-document read keeps roots and metadata and excludes local-only fields. |
| `platejs/migrations` | The only format-migration API: the v54 profile, AST, code-block and suggestion transforms, and the separate legacy-comment extractor. Root exports are cut and `V53_*` constants are private. v54 decodes historical review meaning before destructive shaping and reads frozen source policy. |
| Applications | Lineage, supported historical identities and steps; conversion runs at the app's load boundary, before editor construction. Comment thread records and Yjs room cutovers stay app jobs. |
| CLI | Files, dry-run, check and write, and reports, through the same detached operation. |
| Authored state | Codec v6 persists live footprints; a directly validated live checkpoint is current authority, and retained operation bodies stay cold. |
| Identity | The existing ElementId owner keeps its pure admission validator; schema generation alone admits empty or duplicate IDs. |
| Failure | Wrong lineage, unknown fingerprints, future versions, incomplete chains and invalid output fail before a replacement publishes. Ordinary unversioned current content works without the CLI or generated types. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The live-editor runner | A missing later step left an earlier step's write in place, inputs were mutated by reference, non-JSON output reported success, raw input was silently current, and list policy came from a mutable plugin store. |
| A private `WeakMap` selection mapper | Lost on clone; now a typed step result. |
| Automatic editor migration and `prepareDocument` | Conversion is explicit at the load boundary. |
| A persistence manager, or a read-only or hidden scratch editor | Preserves the lifecycle and per-file construction under another name. |
| Folding app migrations into `defineValueCodec.previousVersions` | Feature codec versions also serve effects and history. |
| Plain app functions only | Exact identity checks, ordered dispatch, selection mapping and runtime and CLI parity are repeated jobs. |
| One universal session of snapshots, history, collaboration and view state | Different lifetimes and compatibility laws. |

## What other editors do

Not compared in this scope's reviews.

## Main changes

- The runner lost its editor and store authority, input aliasing and hidden mapper; the CLI lost its editor-per-file loop. The 10,000-block, 10,055-change checkpoint loads with zero replay, and the built converter passes 36 of 36 production rows.

## Open work

- Unknown top-level stored fields are dropped at migration completion. owner: the `model` subject's Pursue. stop: its build.
- An older persisted v54 draft, offline history and live rooms need an app-owned cutover for the ordinary-text autocomplete change ([plan](../2026-10-01-autocomplete-ordinary-text-adoption.md)). owner: that plan. stop: a release version is allocated.
- No physical-device, storage-provider or distributed Yjs cutover proof. owner: the next persistence review. stop: such a run.
