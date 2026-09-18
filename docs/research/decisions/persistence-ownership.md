---
title: Document persistence ownership
type: decision
status: implemented
updated: 2026-09-16
review_scope: persistence
current_review: 2026-09-16-persistence-source-closure
review_history:
  - ../review-records/2026-09-16-persistence-detached-migration.json
  - ../review-records/2026-09-16-persistence-immutable-migration-contract.json
  - ../review-records/2026-09-16-persistence-immutable-conversion-implementation.json
  - ../review-records/2026-09-16-persistence-teaching-closure.json
  - ../review-records/2026-09-16-persistence-source-closure.json
source_refs:
  - ../../../packages/plitejs/src/core/value-codec.ts
  - ../../../packages/plitejs/src/core/persisted-document.ts
  - ../../../packages/plitejs/src/core/public-state.ts
  - ../../../packages/plitejs/src/core/representation.ts
  - ../../../packages/plitejs/src/core/selection-protocol.ts
  - ../../../packages/platejs/src/migrations/documentMigrations.ts
  - ../../../packages/platejs/src/migrations/migratePlateV54.ts
  - ../../../packages/cli/src/run-migration.ts
related:
  - ../reviews.md#persistence
  - plite-core-ownership.md
---

# Document persistence ownership

**Pursue one complete migration operation bound to immutable target facts.**
Keep one complete saved document, versioned feature metadata, application schema
lineage, and separate local history. Cut the runner's mutable editor and plugin
store authority, caller-input aliasing, implicit raw-source guess, hidden
selection-mapper side channel, and incomplete output contract. Moving those
dependencies into a persistence manager would preserve the problem.

Status: Implemented. The repeated review and accepted
[design/adoption plan](../../plans/2026-09-16-persistence-immutable-conversion.md)
now govern the canonical runtime. Authored codec v6, detached conversion,
current-only editor admission, CLI/demo callers, hard cuts, public teaching and
doctrine are adopted. Production scale and browser save/reopen proof pass.

## Adopted design

The implementation uses explicit application conversion, removes automatic editor
migration and the generic `prepareDocument` hook, and binds the target once in
the existing migration definition. Raw input carries per-call source intent instead
of a definition-wide `unversioned` default. A typed step result carries its
selection mapper; successful conversion returns a complete current envelope.
The public compiler retains its detached JSON contract. No persistence manager
or executable artifact identity is added.

The [planning probe](../../plans/artifacts/2026-09-16-persistence-design/ownership-probe.test.ts)
reproduces a previously uncovered v54 combination: flattening a legacy code-line
insertion retains the inserted text but loses its authored review metadata.
The plan therefore requires preserving historical review meaning before
destructive shaping. Bypassing ElementId preparation also shows that schema
generation alone admits empty/duplicate IDs and generator collisions. Its pure
admission validator must be retained through the existing identity owner.

Five ownership checks, four authored-admission checks and a structural
callback/result type model pass. The authored checks also reproduce loss of
native pending state from a stale `suggestion: false` marker, proposed-projection
ID duplicates, and a codec-valid checkpoint rejected against the actual document.
Those early probes alone do not prove a detached converter. Subsequent integrated
prototypes pass 17 conversion/reopen fixtures, six historical cases and 23
selection/retention checks. The large current-authored corpus preserves its
10,055-change checkpoint with zero guarded replay, reduction or body decoding.
The earlier review records remain immutable and describe their own evidence.

The complete planning prototype exposed a further owner constraint: generic
completion must not make current authored metadata depend on pending-edit replay.
The adopted authored design treats directly validated live checkpoints as current
authority and keeps retained operation bodies cold. Historical format conversion
may reconstruct its source once. A replay-based corruption oracle does not earn
the right to become normal load machinery. The final plan must retain this law
and includes the existing 10,000-block/10,055-change current checkpoint in its
complete-operation proof. Removing eager non-insert decoding alone loses live
property indexes. Persisting existing compact footprints restores index parity
in nine bounded fixtures; the versioned codec and its malformed-input/continued-
editing contracts were implemented in codec v6. The planning prototype's 42
timing pairs met their budgets while two repeated cohorts exceeded the 15%
reproducibility threshold. The final built converter passes 36/36 production
rows, and those cohorts repeat at 2.87% and 0.57% drift.

## Job and hard laws

Save a complete document and reopen or upgrade it without losing primary or
named roots, unknown JSON metadata, or supported feature state. An application
owns its lineage and supported historical identities. Wrong lineage, unknown
historical fingerprints, future versions, incomplete chains, and invalid output
must fail before publishing a replacement. Ordinary unversioned current content
must remain usable without the optional CLI or generated application types.

Document metadata codecs serve installed features and shared effects independently
of the application's AST version. Local undo history has its own exact schema
and replay requirements. Comments' external thread records and Yjs room cutovers
remain application jobs. This review does not allocate another Plate version:
the existing unreleased target remains v54.

## Decisive evidence

The [current runner](../../../packages/platejs/src/lib/editor/documentMigrations.ts#L290)
accepts a live editor, passes it to every step, checks each result only for a
`children` array, and returns a bare document plus numeric source/target values.
It does not return the target schema envelope or validate the complete output.
Missing steps are checked during execution, after earlier callbacks may run.

The [audit probe](../../plans/artifacts/2026-09-16-persistence-review/contract-probe.test.ts)
and [observations](../../plans/artifacts/2026-09-16-persistence-review/contract-probe.json)
reproduce five distinct hazards:

- A step uses its supplied editor to commit a write. The next step is missing,
  so migration throws, but the write remains. This is a deliberately effectful
  custom callback, not evidence that the built-in v54 transform corrupts data.
  The public context grants the authority that makes the failure possible.
- A separate step mutates the supplied document itself. The later missing-step
  failure leaves the caller-owned input changed because the runner passes it by
  reference. Detaching the editor alone would not make migration atomic.
- A step returns `Date` in document metadata. `migrateDocument` reports success;
  loading that output rejects it as non-JSON. The standalone operation and the
  editor load therefore do not provide the same completion guarantee.
- With an explicit unversioned floor, migrating the returned bare document again
  runs the step again. The documented application envelope avoids this; the
  runner leaves attaching that identity to every caller.
- Without an unversioned floor, raw input is silently reported as current and no
  step runs. That is an undocumented source assertion and contradicts the
  durable rule that raw historical input needs explicit source intent.

The built-in v54 step exposes two more contract problems in source. It reads
list migration policy from a mutable plugin store, so output is coupled to
ambient editor state rather than immutable application format facts. It also
attaches a custom selection mapper to the returned document through a private
`WeakMap`; cloning or replacing that object loses behavior the public step type
cannot express. The shipped runner currently consumes that side channel before
returning, so this is an ownership flaw rather than a reproduced shipped-path
failure.

The [CLI](../../../packages/cli/src/run-migration.ts#L161) compensates by constructing
an editor per file, running the migration, loading its result as current data,
then reading the final value and selection. Runtime loads instead use
[Plate's snapshot transform](../../../packages/platejs/src/lib/editor/withPlite.ts#L975)
to migrate, map selection, prepare and pass the result into Plite fitting and
metadata hydration. Both paths have meaningful work; their coordination should
be one owned document-conversion contract.

## Strongest target and owner

Proposed ownership flow, not an existing API:

```text
saved { document, schema, selection? }
  or raw document plus explicit source intent
  -> validate source identity and preflight the complete chain
  -> isolate input and run steps against immutable target facts
  -> apply structural or explicit typed selection mapping
  -> prepare and validate the complete target document
  -> current { document, schema, selection? } plus an execution report
  -> save directly, or load through the normal editor boundary
```

Keep one migration runner. Reuse Plite's JSON, document-shape, schema and
selection laws, and move neutral mechanics to that owner where necessary.
Plate owns its historical v53/v54 conversion and configured product policy;
applications supply lineage and steps; the CLI owns files, dry-run/check/write,
and reports. Package facades must not create a second implementation.

Delete the general mutable `editor` parameter from ordinary step contexts,
ambient store reads, the private `WeakMap` selection protocol, implicit raw
source classification, duplicated envelope matching, caller-built target
identity, and the CLI's editor-per-file construction/load/read loop. Steps
receive isolated input and the exact immutable schema/format capabilities their
job needs; custom mapping is an explicit typed step/result capability. Preflight
the required chain before callbacks. Validate output before exposing a
successful result. Input isolation cannot sandbox arbitrary application closures
or undo external side effects; do not promise otherwise.

Prefer explicit conversion at the application's load boundary. If automatic
editor migration remains as a convenience, it must delegate to the same complete
operation without owning another migration lifecycle or acceptance policy.
Design must compare that adapter against deleting the editor option entirely.

This is more than replacing `editor` with today's `compileEditor()` result.
That [compilation](../../../packages/platejs/src/lib/editor/withPlite.ts#L1171)
publishes detached schema and binding facts, not fitting, selection mapping or
installed preparation. v54 consumes custom persisted identities, schema-owned
properties, list policy, element-ID preparation and authored conversion.
Preserve those capabilities through their actual owners. Do not hide a scratch
editor behind a supposedly pure migration facade or create a generic plugin
runtime solely for offline conversion.

## Coverage and dispositions

Expected **4** ledger units; reviewed **4**; excluded **0**; unresolved unit
dispositions **0**. The detailed contract and production adoption are complete
in the linked plan.

| Ledger unit                                | Verdict             | Evidence and retained job                                                                                                                                                                                                                                                                                                                                       | Next owner                  |
| ------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `plitejs/core/value-codec`                 | Stop replacement    | Versioned JSON codecs preserve feature data, explicit old decoders, immutable snapshots, and effect transport. The existing whole-document read retains roots and metadata while excluding local-only fields. A second serializer or universal app version adds no current value.                                                                               | Keep existing owner         |
| `platejs/migrations`                       | Pursue, implemented | The v54 profile, AST, code-block and suggestion transformations remain. The generic runner's editor/store authority, input aliasing, implicit raw-source rule, hidden mapping protocol, partial validation and bare output are cut. The separate legacy-comment extractor remains because importing external thread associations is an independent offline job. | Canonical detached owner    |
| `export/platejs/./migrations`              | Pursue, implemented | This is the sole format-migration API owner. Root exports are cut, CLI/scaffold imports use the subpath, and `V53_*` provenance/catalog constants are private.                                                                                                                                                                                                  | Keep exact public boundary  |
| `example/registry/document-migration-demo` | Pursue, adopted     | The demo owns its app lineage and explicit v53 source outside the default kit. It converts before editor construction, saves complete JSON and reopens without reapplying historical steps.                                                                                                                                                                     | Keep as browser proof route |

The migration directory's 15 files were assessed as entrypoints, historical
transforms, provenance, extractor, and their focused specs. Additional shared
owners are the actual runner in `lib/editor`, Plate's snapshot/preparation
integration, core document publication/restore and the CLI. The comment and
suggestion snapshot demos show why external thread state stays application-owned;
their in-memory snapshots do not prove a storage backend.

## Alternatives screened

| Direction                                                                                     | Decision                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep/configure everything                                                                     | Rejected: configuring an unversioned floor or adding a wrapper does not isolate caller data, remove editor/store authority or complete standalone output validation.                                                          |
| Only preflight steps, clone input and validate the result                                     | Required local repairs, but leaves target identity, installed lifecycle, explicit selection mapping and offline completion split across callers.                                                                              |
| Pass a read-only editor or hide a scratch editor                                              | Rejected as the durable target: a type projection does not freeze plugin stores, and a hidden editor preserves lifecycle and per-file construction under a detached name.                                                     |
| Collapse app migrations into `defineValueCodec.previousVersions`                              | Rejected: feature codec versions also serve effects and history; app lineage/fingerprints and cross-field AST changes have different owners. Share private JSON mechanics without forcing one version clock.                  |
| Delete all migration machinery and leave plain app functions                                  | Rejected: exact identity checks, ascending chain dispatch, structural selection mapping and runtime/CLI parity are current repeated jobs. Keep one bounded operation.                                                         |
| Move the existing runner unchanged to Plite                                                   | Rejected: relocation leaves a mutable editor context and Plate-specific preparation dependencies intact. Move only genuinely neutral laws after removing the coupling.                                                        |
| Complete immutable migration at the existing document boundary                                | Selected and implemented: removes caller completion work, input aliasing and live policy authority while retaining real conversion semantics. Production codec, package inference, browser and reproducible scale proof pass. |
| Persist editor snapshots, history, collaboration state or view state as one universal session | Rejected: local interaction state, application records and canonical document data have different lifetimes and compatibility laws. No current job justifies that replacement.                                                |

## History and proof limits

The [final-pass review](../review-records/2026-09-16-persistence-immutable-migration-contract.json)
supersedes the first persistence record's target precision while retaining its
four-unit verdict and app-owned lineage
from [registry migration separation](../../plans/2026-08-18-separate-registry-migrations.md)
and the single v54 boundary from the
[version hard cut](../../plans/2026-09-03-hard-cut-plate-migrations-after-v54.md).
Those plans do not make the runner's editor dependency a hard law. The state
review's retention of fields/effects remains appropriate. Authored live-state
work establishes that pending review facts belong in the saved document, not
only in undo history; this audit does not redesign that representation.

Executed on the final review snapshot; the later single-file drift is assessed
below:

- `bun test ./packages/plitejs/test/value-codec.test.ts ./packages/plitejs/test/document-state-contract.ts ./packages/plitejs/test/state-field-contract.test.ts ./packages/plitejs/test/history/history-persistence-contract.spec.ts`: **39 passed** across four files.
- `bun test ./packages/platejs/src/migrations ./packages/platejs/src/lib/editor/documentMigrations.spec.ts ./packages/cli/test/run-migration.test.ts`: **96 passed**, **193 assertions**, across eight files. Includes CLI dry-run/write/stdin, runtime parity, selections and cleanup.
- `bun test ./docs/plans/artifacts/2026-09-16-persistence-review/contract-probe.test.ts`: **1 passed**, observing the five current-contract hazards above.

Existing tests validate their exercised behavior, not the proposed architecture.
No performance, proposed type inference, browser, real storage-provider, packed
release or physical-device claim is made. The v54 type continuity tests were
read, not freshly typechecked. A requested parallel source reader failed with
a usage-limit error before returning findings; the lead completed that source
review, so there is no independent-review claim.

The implementation supersedes the recorded old runner sources while preserving
those immutable reviews as historical evidence. Authored codec v6 persists live
footprints, direct current-checkpoint admission keeps retained bodies cold, and
detached schema, document, field and selection owners need no editor. The v54
step decodes historical meaning before shaping and uses frozen source policy.

Production proof includes 64 migration tests, 169 Plite persistence/authored
tests, the 68-test CLI generation suite, package typechecks/builds/lint, a 27-case
packed import smoke, generated API/docs/registry gates and managed Chromium
save/reopen. The frozen complete-operation comparison passes 36/36 rows; the two
formerly noisy cohorts repeat at 2.87% and 0.57% drift. Its durable receipt digest
is recorded in the linked plan and implementation review.

## Implementation acceptance

The [completed plan](../../plans/2026-09-16-persistence-immutable-conversion.md)
implements explicit raw-source intent, input isolation, metadata conservation,
inferred callbacks, sole-subpath exports and runtime/CLI parity. Best API,
Plate Plan, Plate Docs, Plate Plugin Creator, Plate/Plite Vision and Plate Next
doctrine version 202 teach the adopted contract; generated mirrors validate.

The aggregate www TypeScript gate stops after its generated editor, API, docs,
registry and route checks because unrelated `comment.spec.ts` code references
two missing helpers. Full Plite lint is likewise blocked by unrelated React files;
affected persistence partitions pass. No physical-device, storage-provider,
distributed Yjs cutover or publication claim is made.

- [x] Enumerate every selected ledger unit and materially different consumers.
- [x] Reconsider all material keep/change/add/delete/move/replace alternatives.
- [x] Verify decisive hazards and distinguish them from passing existing tests.
- [x] Record source references, historical relation and explicit proof limits.
- [x] Record the linked immutable review with matching fingerprints for the
      final review and all four source units. The global ledger check remains
      blocked by unrelated stale `browser/ai-session` inventory. The later
      `public-state.ts` evidence-input drift is assessed above; no persistence
      evidence gap is hidden as a passing source-freshness claim.
- [x] Implement the selected owner model, hard cuts and caller adoption.
- [x] Pass focused production correctness, package, browser and cost gates.
- [x] Record the implementation review and current source fingerprints.
