---
title: Upload lifetime and draft asset ownership
type: decision
status: accepted
updated: 2026-09-21
review_scope: uploads
current_review: 2026-09-21-uploads-provider-items
review_history:
  - ../review-records/2026-09-18-uploads-lifecycle-ownership.json
  - ../review-records/2026-09-19-uploads-node-model-correction.json
  - ../review-records/2026-09-19-uploads-files-sdk-integration.json
  - ../review-records/2026-09-19-uploads-official-files-sdk.json
  - ../review-records/2026-09-20-uploads-registry-dependency.json
  - ../review-records/2026-09-20-uploads-static-owner-cut.json
  - ../review-records/2026-09-20-uploads-files-server-colocation.json
  - ../review-records/2026-09-21-uploads-provider-items.json
source_refs:
  - ../../../packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts
  - ../../../packages/platejs/src/react/features/upload/UploadPlugin.tsx
  - ../../../packages/platejs/src/features/media/lib/BaseMediaPlugin.ts
  - ../../../apps/www/src/registry/components/editor/upload.tsx
  - ../../../apps/www/src/registry/lib/files.ts
  - ../../../apps/www/src/registry/app/api/files/route.ts
  - ../../../apps/www/src/registry/app/api/files/s3-route.ts
  - ../../../apps/www/src/registry/components/editor/upload/ephemeral.ts
  - ../../../apps/www/src/registry/components/editor/media.tsx
  - ../../../apps/www/src/registry/components/editor/dnd.tsx
  - ../../../apps/www/src/registry/examples/playground-demo.tsx
  - ../../../apps/www/tests/browser/files-sdk.spec.ts
related:
  - ../reviews.md#uploads
  - ../../vision/plate.md
  - clipboard-content-fitting.md
  - history-ownership.md
reconciled_executions:
  - 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit
  - 2026-09-19-uploads-files-sdk-design
  - 2026-09-19-uploads-files-sdk-final-audit
  - 2026-09-19-uploads-files-sdk-testing-method
  - 2026-09-20-uploads-files-sdk-implementation
  - 2026-09-20-uploads-files-ui-colocation
  - 2026-09-20-uploads-upload-api-hard-cut
  - 2026-09-20-uploads-gateway-test-import-fix
  - 2026-09-20-uploads-registry-dependency-implementation
  - 2026-09-20-uploads-static-owner-cut-implementation
  - 2026-09-20-uploads-files-server-colocation-implementation
  - 2026-09-20-uploads-r2-live-verification
  - 2026-09-20-uploads-playground-ephemeral-implementation
  - 2026-09-21-uploads-provider-items-implementation
  - 2026-09-21-uploads-provider-items-doc-contract-closure
---

# Upload lifetime and draft asset ownership

**Use one official Files SDK-compatible upload plugin under `platejs/upload`,
replacing the current media upload capability and generic transport API.** The
user explicitly prefers one supported SDK over maintaining SDK replaceability.
Expose only the single-file `UploadClient` operation Plate consumes, using the
SDK's call and outcome types. A real `FilesClient` satisfies it structurally;
session-local examples and tests may implement only that operation. Do not
publish a mirrored storage API or add another adapter plugin. Keep core
independent of upload storage and preserve existing media rendering without an
upload gateway.

The [design and adoption plan](../../plans/2026-09-19-official-files-sdk-integration.md)
and [implementation plan](../../plans/2026-09-19-official-files-sdk-implementation.md)
and [upload API hard cut](../../plans/2026-09-20-upload-api-hard-cut.md) are
complete. Configure a compatible `UploadClient` and a synchronous
`getUrl(UploadOutcome)` through `UploadPlugin.configure`. Persist a stable
application download address, keep the authored `upload` draft schema,
and preserve committed-editor/root/history authority. Split copied UploadKit
activation from MediaKit, and keep its upload renderer in the same copied
`upload` item. Remove direct upload imports from optional DnD and ordinary
static media. No storage facade or new Plite API is needed.

Keep the copied `upload` item provider-neutral. Consumers install exactly one
explicit provider recipe: `upload-ephemeral`, `upload-r2`, or `upload-s3`.
Persistent provider items reuse the `files-api` gateway policy and contribute
only their own adapter route and environment contract. Do not select storage
providers through a runtime environment switch in one route.

The [implementation outcome](../review-records/2026-09-20-uploads-files-sdk-implementation.json)
records the adopted package, copied gateway and UI, generated distribution,
documentation, clean installed-consumer builds, browser picker/XHR proof, and
the final source-bound owner scale run. The route intentionally fails closed
until its application provides access policy and storage configuration. Live
S3, authenticated application policy, native file drag, Firefox/WebKit and
production deployment remain unexecuted.

The [UI colocation correction](../review-records/2026-09-20-uploads-files-ui-colocation.json)
records the copied ownership boundary: the upload registry item owns
`UploadKit`, its renderer, picker, progress and preview. No separate
media-upload item or reverse registry dependency remains.

The [upload API hard-cut outcome](../review-records/2026-09-20-uploads-upload-api-hard-cut.json)
records the final public names: `UploadPlugin` from `platejs/upload`, the
`upload` schema and plugin key, and the copied `upload.tsx` owner. `FilePlugin`
remains the completed generic file node under `platejs/media`; Files SDK client,
gateway and storage names remain at the provider boundary. Focused package and
copied UI behavior, generated contracts, registry distribution, current docs,
hard-cut scans and Plate Next doctrine v223 pass.

The follow-up gateway-test execution corrects the installed-SDK test import to
the surviving Files SDK server owner. Five gateway cases and 35 assertions pass
against the installed SDK, and its source-first installed-package typecheck is
clean.

The [registry dependency review](../review-records/2026-09-20-uploads-registry-dependency.json)
established that the old `UploadKit` default required `/api/files`, but its
decision to make every `upload` installation pull `files-api` is superseded by
the explicit provider items. The base item remains independently installable
client/UI source; persistent recipes add its server contract.

The [static owner review](../review-records/2026-09-20-uploads-static-owner-cut.json)
cuts the configuration-only `upload-static` registry item. `BaseUploadPlugin`
owns null static rendering beside its null HTML codec, while copied `UploadKit`
overrides that default with `UploadElement` for editable UI. The full static
editor kit composes the base descriptor directly; `media-static` remains
independent of upload. The implementation outcome records package SSR omission,
editable override, 317 fresh registry payloads, current-doc and hard-cut closure,
and Plate Next doctrine v224 with synchronized workflow mirrors.

The bounded static-owner census reviewed all four production roles: the base
schema plugin, copied editable renderer override, full static aggregate and
completed-media static kit. The cut removes the one configuration-only source,
registry item and dependency, its registry-level test, docs row and app icon.
The base plugin, editable override and direct aggregate composition survive;
`media-static` remains a deliberate non-consumer. Nothing is deferred.

The [Files server colocation review](../review-records/2026-09-20-uploads-files-server-colocation.json)
correctly removed the one-consumer `files-storage.ts` helper, but its combined
R2/S3 runtime owner is superseded. `lib/files.ts` retains the shared gateway,
ACL, namespace, durable URL, trusted-inline and error policy. Each persistent
provider route constructs one adapter and exports the shared handlers.

The live R2 verification runs that owner against a private Cloudflare bucket.
A unique object uploads through the gateway's bounded proxy path, returns exact
bytes through direct, durable, ranged and signed reads, and is deleted and
confirmed absent. The sanitized evidence retains no credential, signed URL or
object key. A deployed Next route with real application session policy, live S3,
multipart and browser-native progress remain separate proof gaps.

The [playground ephemeral execution](../review-records/2026-09-20-uploads-playground-ephemeral-implementation.json)
keeps that durable copied recipe intact while letting visitors exercise uploads
without shared storage. The deployed playground supplies a per-editor
`UploadClient`, maps outcomes to session-owned object URLs, accepts only those
URLs through its media descendants, and revokes them on editor disposal. This
also corrects asynchronous completion to use the editor view that admitted the
draft, preserving authored-view node identity. Package type/lifecycle checks,
copied registry tests, fresh 317-payload generation and both Chromium upload
paths pass. Blob URLs intentionally do not survive refresh or sharing.

The [provider-item review](../review-records/2026-09-21-uploads-provider-items.json)
and its implementation expose those three consumer jobs directly. Generated
`upload` contains only copied client/UI source and no AWS dependency or server
route. `upload-ephemeral` owns session object URLs and cleanup. `upload-r2` and
`upload-s3` each target `app/api/files/route.ts`, depend on `upload` and the
shared `files-api` policy, and install one provider contract. Source contract,
installed-SDK gateway/type, generated registry, docs/changelog and both
Chromium upload paths pass. The prior live R2 proof remains valid because its
adapter and gateway behavior are unchanged; live S3 remains unexecuted.

The [bound design outcome](../review-records/2026-09-19-uploads-files-sdk-design.json)
records four passing headless cohorts, 16 lifetime guards and 27 existing owner
tests. One stress timing pair exceeds its pair budget; the frozen overall rule
still passes. This proves the bounded design integration, not the final plugin,
live R2/S3 service or native input. Task execution owns adoption and those checks.

The [final audit outcome](../review-records/2026-09-19-uploads-files-sdk-final-audit.json)
corrects the gateway recipe to authorize `upload` and `download`; wire `presign`
and `complete` both use the `upload` permission. The application must deny
explicit-key writes in `authorize` and recheck current write access for proxy
PUT in the per-request Files factory. Four diagnostic cases against published
Files SDK 2.6.0 expose these gaps and an upstream bundled-error identity defect:
app-thrown `FilesError` denials fail closed but serialize as 500. A fixed
installed release with verified 401/403 behavior, or an explicit app response
boundary, gates gateway publication. Client bearer headers do not accompany
proxy PUT or media GET; the copied private recipe needs browser-compatible
session auth. The plan also states cross-document asset policy and signed URL
revocation limits. This is design correction, not product proof.

The [testing-method outcome](../review-records/2026-09-19-uploads-files-sdk-testing-method.json)
adapts Files SDK's layered tests to this integration: an in-memory HTTP
router, real client-to-gateway round trips, separate XHR/browser behavior,
repeatable R2/S3 fakes, opt-in live providers and clean installed-package
checks. Upstream source tests use an internal error class and cannot certify
the published cross-entrypoint denial status; the copied route must test
that boundary itself. These are execution proof requirements, not completed
product tests.

The [official-integration comparison](../../plans/artifacts/upload-draft-asset-protocol/files-sdk-official-review.md)
supersedes the preceding recommendation to keep an app-written transport
adapter. That abstraction had no surviving requested job after the user's
clarification. Plate still owns draft identity, admission, completion and
history. The application owns server authorization and durable media delivery.
Files SDK's storage keys and expiring URLs do not replace that document law.

The [provider source evidence](../../plans/artifacts/upload-draft-asset-protocol/files-sdk-review.md)
remains applicable: the current bounded R2 gateway path proxies through the
application server, and SDK React hooks abort on unmount. The plan retains
editor-owned requests, explicit app access configuration and stable gateway
URLs without recreating a provider-independent API. Choosing an
official SDK is a product direction, not a claim of ecosystem standardization
or proven live-provider behavior.

Retain the September 19 dedicated-draft decision. Its implementation is
present in current source, and its plan records focused proof. The ledger has
no reconciled source-bound execution outcome for that completed plan; this
review does not convert the plan's status into a fresh runtime claim. Provider
selection, the public upload contract and package placement are reopened;
draft/root/history laws are retained. No product code or provider deployment
changed in this review.

## Prior node-model review (historical)

The following preserves the earlier comparison and its then-current evidence.
The preceding provider review and current implementation take precedence over
its prospective design language and old API paths.

**Pursue redesigning the upload protocol, but do not delete the dedicated draft
asset state by default.** The prior review correctly found broken admission,
completion and lifetime authority, then overreached by blaming the separate
placeholder node. A reserved or retryable asset slot is a different document
state from completed media. Making `url` optional in every media schema would
spread that state across image, file, audio and video without removing it.

Keep one editor-owned upload capability. Submit each picker, paste or drop
selection as one validated batch, preserve the exact root-aware `NodeKey`
through completion, and use the installed media descriptor's persisted schema
identity. Task design must compare the exact draft-slot schema against a
per-media pending union; the dedicated slot is the stronger baseline. No generic
asynchronous-job framework earns its cost.

## User job and hard laws

A user chooses files, sees their reserved locations and progress, continues
editing, and can retry, cancel, undo, or remove an upload. Completion must affect
only the intended live node, including inside a secondary root. Invalid input
must leave the document unchanged. Invalid results must remain visible as
failures. React remounts cannot restart transport, and document identity must
survive movement without letting stale work modify a replacement node.

File objects, controllers, progress, errors, and preview URLs remain local
resources. Durable media content belongs to its media schema. Plite owns
transactions, node identity, roots, lifecycle and history; Plate owns file
admission and upload-to-media semantics; the application owns transport,
server policy and copied presentation.

## Current evidence

The [observation probe](../../plans/artifacts/2026-09-18-uploads-review/observations.test.ts)
records seven observations: five defects and two lifetime/restoration gaps.
Its assertions deliberately describe current behavior, not desired regression
behavior; its green result means those observations were reproduced.

1. **Rejected file paste deletes its empty source.** The clipboard command
   removes the current empty block before `insertMedia` validates. Validation
   returns a handled result and commits that removal with the error effect.
2. **A secondary-root upload can replace another node.** Lookup resolves the
   correct `NodeKey`, but completion passes `current[1]` to `replaceMedia`.
   That unqualified path resolves in the main root. With a placeholder at the
   same path, the wrong node receives the completed image.
3. **A rejected result URL loses its failure state.** `replaceMedia` returns
   without mutation when normalization rejects a nonempty URL. Completion
   nevertheless removes the upload task, leaving an unresolved placeholder
   with no retained error.
4. **Schema identity is confused with capability identity.** Overriding the
   image schema type to `photo` leaves completion writing `type: 'image'`.
   Schema validation rejects the replacement and the task enters an error state.
5. **The placeholder picker bypasses batch limits.** Its first file uses
   `api.upload`, then remaining files use `insertMedia`. A maximum of three
   images accepts four through that split. Remaining files also use current
   selection instead of an explicit destination beside the chosen placeholder.
6. **Full document replacement preserves old upload authority.** Replacing the
   document with equal pending content preserves the node key. The replacement
   emits the internal `document.replace` annotation without a document-change
   flag, and the old request can complete into that replacement. The design
   must distinguish updating content from starting another document lifetime.
7. **Partial-batch redo restores unfinished content without its resource.**
   Complete A, undo A+B, then redo: A returns completed; B returns as an empty
   placeholder, with no file, task, or restarted request. Ignoring B's old late
   result is correct. Whether B resumes, retains a retryable file, or becomes an
   explicitly empty slot needs an honest product contract.

The copied `DndKit` additionally calls `PlaceholderPlugin.update` without an
installed check, while its registry usage advertises standalone `DndKit`.
This is a source-established missing-capability path, not a replayed browser
claim. Validation and transport-error toasts also replay retained errors on
view mount; the errors are durable task state, not acknowledged notifications.

## Assessed units

Nine units expected, nine reviewed, zero excluded, zero unresolved verdicts.
Every current ledger member is included. Detailed contract design and missing
runtime proof remain explicit below.

| Unit                                               | Verdict                                                 | Evidence and surviving owner                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persisted draft slot and completion transition     | **Keep the concept; redesign the contract**             | Reserved position, restored documents, failure retry and an empty picker are draft-asset jobs. A dedicated slot keeps completed media schemas valid. Replace generic `placeholder` naming, ambiguous `mediaType` identity and caller-visible conversion plumbing; preserve a root-aware transition to the installed media schema.                     |
| File admission and batch API                       | **Pursue consolidation**                                | Direct upload and batch insertion use different count semantics; the picker combines them incorrectly. One Plate submission validates the whole selection before any document change or request. Preserve explicit app file policy.                                                                                                                   |
| Completion identity and result validation          | **Pursue repair at the owner**                          | Root, schema override and invalid-URL probes fail. Use existing root-aware `NodeKey` operations and installed media identity; retain an error unless a valid result was applied or authority was revoked.                                                                                                                                             |
| Request, progress and cancellation lifetime        | **Pursue complete authority; keep the editor owner**    | Preserve controllers, supersession and per-task subscriptions. Consume Plite's existing replacement annotation through public commit events, including equal-content replacement. Plugin removal cleanup exists; it does not prove editor-exit cancellation. Define termination at the real owning lifetime without tying requests to preview mounts. |
| Transactions and history                           | **Keep Plite authority; design unfinished restoration** | Uploads begin after commit, aborted updates start none, and completed insertion undo/redo passes. Skipped commits map both history branches. Partial-batch redo loses the unfinished resource; Plate owns its restoration policy. Do not revive upload-specific undo-stack rewriting or make history replay network requests.                         |
| Paste, native drop, DnD and picker entrypoints     | **Pursue one admission path**                           | Adapters retain target capture and native-event handling, then submit one explicit batch. Remove caller-owned empty-block deletion and first/rest splitting. File drop must truthfully check installed upload capability.                                                                                                                             |
| Transport and provider integration                 | **Keep application ownership**                          | `MediaKit` supplies abort/progress transport; UploadThing router and route are copied source. No provider-specific upload state remains to promote into Plate. Live service behavior is unverified.                                                                                                                                                   |
| Preview, progress UI and notification presentation | **Keep copied rendering and view URLs**                 | Six current tests pass for remount/progress and object-URL cleanup. The draft slot needs explicit empty, uploading and failure presentation; shared upload state does not justify a package-owned styled component.                                                                                                                                   |
| Public options, exports, installation and teaching | **Pursue adoption cleanup**                             | `disableEmptyPlaceholder` only starts a history batch; `disableFileDrop` enables an alternate handler. Media docs still teach removed image-upload options and inconsistent placeholder identity. Cut misleading options and obsolete teaching with the accepted API, preserving inferred transport, result and error contracts.                      |

## Strongest target and alternatives

Proposed ownership flow:

```text
picker / paste / drop
  -> one Plate batch admission and explicit target
  -> transaction inserts or fills dedicated draft asset slots
  -> afterCommit starts application transport
  -> validate result and recheck live request authority
  -> installed media owner replaces the same root-aware NodeKey
```

The document slot records durable draft intent, such as the target media kind;
it does not serialize `File`, progress, controller or transport status.
Reloading or receiving a slot from collaboration must not invent a request. Its
preview reads the local task when one exists and otherwise offers the explicit
empty or retry state. Do not introduce a public asset registry just to
correlate a file with a node.

Keeping the current design with configuration cannot repair these ownership
failures. Retaining the current generic `placeholder` API unchanged also keeps
capability names confused with persisted schema identities, split admission and
public conversion plumbing. Those are the cuts supported by the evidence.

Per-media pending nodes are weaker as the default target. They relax the
currently required `url` property in four completed-media schemas, force every
renderer and codec to understand a source-absent state, and still require one
cross-media upload owner. That moves the draft-state branch rather than deleting
it. A single generic media union would cut more nouns, but would also collapse
independent image, file, audio and video codec/rendering jobs without evidence.

A type-changing slot-to-media transition is not itself an ownership defect.
Plite's `NodeKey` supplies stable identity across that transition. The current
wrong-root bug occurs because completion throws away the key/root and writes by
bare path; the schema-override bug occurs because it writes a capability name
instead of the installed descriptor's schema type.

Waiting for upload completion before inserting anything removes placeholders,
but loses visible reserved position, movement, and undo while transport runs.
Keeping only a transient overlay similarly transfers placement and history
coordination to the view and does not preserve authored empty slots.

Moving requests back into React contradicts headless completion and the proven
remount law. Duplicating upload controllers across media plugins loses shared
batch admission. Moving a general job scheduler into Plite adds product policy
without solving the actual gap: the root failure occurs when Plate discards an
identity Plite already understands. Full document replacement is also an upload
consumer gap: public `on.commit` already exposes the `document.replace`
annotation, including equal-content replacement. Its descriptor is internal;
design should settle its supported typed access without inventing another
runtime signal. Reuse that existing authority; do not infer lifetime from node
keys or add a general session framework. `changed.has('document')` and
`changed.has('replace')` do not identify an equal-content replacement.

Retain one upload lifetime capability and one transport function. Its final
public name, draft-slot schema and submission shape belong to design. The
generic `PlaceholderPlugin`, direct single-file `api.upload` plus batch
`insertMedia` split, and caller-visible `replaceMedia` protocol do not earn
survival merely because a dedicated draft state does.

## Prior decisions and proof limits

The September 7 execution report moved transport from preview effects to the
headless package and retained app transport and view object URLs. Keep those
boundaries. Reopen its implied completeness for ingress, exact-target
completion and the separate placeholder representation. Its recovered ledger
record has unknown current proof; historical scale and browser claims are not
transferred to this review.

Issue 4803 preserves the real history requirement: undo/redo should act on
completed media without an intermediate upload step or a missing-batch crash.
Its old `updateUploadHistory` implementation is not the current owner. The
clipboard decision's post-commit File identity and rollback law is retained.

Current local runs: 30 package upload/placeholder tests pass; six copied
placeholder and object-URL tests pass; seven observation cases reproduce the
behavior above. Existing browser upload cases were inspected, not rerun. They
use a fake transport and do not certify UploadThing or copied picker behavior.

The draft-slot design must settle target identity, selection, serialization,
collaboration, unfinished document reload, undo-before-completion and redo,
cancellation, per-node readonly and root lifetime. If design reopens per-media
pending nodes, it must prove that optional-source grammar and renderer/codec
branching are smaller than the dedicated slot. A replacement runtime or
subscription strategy requires the existing owner-versus-candidate scale probe
before acceptance. No performance, live service, native-device,
replacement-runtime or release claim is made here.

No product source or public doctrine changed during this audit. Adoption must
repair the media documentation, affected behavior-law evidence and versioned
API doctrine rather than treating historical test labels as current proof.

## Next owner

```text
$task design plan upload: adopt Files SDK directly in one platejs/upload plugin, replace MediaUploadPlugin and its generic transport API, and settle durable media URLs, editor lifetimes, package boundaries and provider proof
```

First settle the direct client configuration and durable media-address
contract. Preserve the implemented editor-owned draft protocol, replace the
old public upload surface once, and prove the selected R2/S3 deployment paths.
