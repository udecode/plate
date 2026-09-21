---
review_scopes:
  - uploads
  - media
  - clipboard
  - dnd
  - history
review_basis:
  - 2026-09-19-uploads-node-model-correction
work_kind: implementation
---

# Upload draft asset protocol

Status: Complete

Objective:
Implement one atomic upload admission path, a dedicated persisted draft-asset
state, root-aware completion, explicit replacement and history lifetimes,
complete hard-cut adoption, and focused proof.

Flow mode:
direct Task execution

Goal plan:
docs/plans/2026-09-19-upload-draft-asset-protocol.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Mode:

- `standard`: current local source and the accepted uploads review settle the
  architecture inputs. No external editor comparison or performance redesign
  is needed.

Completion threshold:

- The plan is ready when the target state machine, public API, Plite boundary,
  hard-cut adoption, execution order, release artifacts, and proof commands
  contain no unresolved product choice, and `check-complete` passes.

Verification surface:

- Planning: the accepted uploads review and decision, live media schemas and
  upload owner, copied picker/DnD/provider consumers, package exports, current
  changesets and registry changelog, behavior-law rows, `review-ledger check`,
  `git diff --check`, and this plan's `check-complete` command.
- Execution: focused `platejs` media/media-react/DnD partitions, the `plitejs`
  root export contract, copied component tests, registry generation, the
  Chromium clipboard-upload case, and exact Chrome checks for picker and file
  DnD on `/blocks/playground`.

Constraints:

- Product implementation and focused verification are authorized under Task.
- Add no compatibility alias or runtime shim for the branch-only
  `PlaceholderPlugin` API.
- Persist only authored draft intent and completed media. Keep `File`, request
  tokens, controllers, progress, failures, and object URLs local.
- Validate a selected batch before changing document content or starting any
  request.
- Complete only the exact live draft slot identified by its root-aware
  `NodeKey`; a reused path never inherits authority.
- History replay never starts a request. Whole-document replacement revokes
  every request even when the replacement content is equal.
- Keep application transport and copied presentation configurable. Plite owns
  node identity, root-aware transactions, replacement signaling, and history
  mapping.

Boundaries:

- In scope: the persisted draft slot, upload plugin API and private task state,
  picker/paste/native-drop/DnD adapters, completion validation, replacement,
  undo/redo restoration, copied UI, exports, docs, release artifacts, registry
  output, and focused proof.
- Source owners: `packages/platejs/src/features/media/**`,
  `packages/platejs/src/react/features/media/**`,
  `packages/platejs/src/dnd/react/**`, `packages/plitejs/src/core/public-state.ts`,
  `packages/plitejs/src/index.ts`, copied media/DnD registry components,
  UploadThing application configuration, media docs, and current upload tests.
- Non-goals: a generic asynchronous-job framework, provider lifecycle in
  Plate, one generic media node, serialized request state, automatic restart on
  reload/history/collaboration, live UploadThing certification, and unrelated
  uses of “placeholder” in Plite DOM coverage or `BlockPlaceholderPlugin`.
- No new Plite mutation primitive is required. `NodeKey` already addresses
  `nodes.set` and `nodes.unset` across roots. Plite only needs to publish its
  existing `documentReplacement` annotation descriptor.

Output budget strategy:

- Read named owners first, expand only from evidence, and keep source scans
  bounded to upload symbols and materially different consumers.

Blocked condition:

- Execution blocks only if `NodeKey` cannot address a type-changing `set` plus
  draft-property `unset` in one transaction, or if skipped-history mapping
  cannot satisfy the mixed completed/pending batch contract. Preserve the
  failing focused case and route that owner back to Plite; do not add a
  path-based workaround.

Plate Plan state:

- phase: handoff
- next: none
- handoff: complete with the native file-DnD proof limit recorded below

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Objective, constraints, state machine, adoption, and proof below cover atomic admission, root authority, persisted drafts, replacement, and history. |
| Task plan and execution authority verified | yes | The accepted plan was followed by direct Task execution authority. |
| Current owners read | yes | `BasePlaceholderPlugin.ts`, `BaseMediaPlugin.ts`, the React adapter, copied media/picker/DnD/static kits, UploadThing adapter, Plite transaction/history owners, docs, tests, changesets, and registry changelog were inspected. |
| Best API target resolved | yes | Best API verdict: accept the dedicated draft slot after renaming it and delete the split admission/conversion API. Exact target is below. |
| Runtime scale applicability resolved | yes | The target preserves one local task and progress subscription per active file plus one scan over active tasks on relevant commits; it adds no runtime layer or fan-out variable. Benchmark is not applicable unless execution changes that law. |
| Pre-acceptance Benchmark probe selected | no | No scale-sensitive owner, algorithm, cache, observer, or subscription topology changes. Existing task-count and commit-scan complexity remain unchanged. |
| Mode and execution boundary resolved | yes | Direct execution completed in the current authorized checkout. |
| Package/API pack selected | yes | Public `platejs/media`, `platejs/media/react`, DnD callback, and `plitejs` root-export changes are planned. |
| Public surface or package boundary identified | yes | `BasePlaceholderPlugin`, `PlaceholderPlugin`, upload state/types/methods, DnD file placement, and `documentReplacement` are the affected surfaces. |
| Release artifact path selected | yes | Update `.changeset/media-v54-runtime.md`, `.changeset/plite-canonical-architecture.md`, and the draft `2026-09-07-media-upload-lifetime` registry entry against final branch behavior. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; existing one-package major changesets are updated because the replaced upload API is branch-only relative to `main`. |
| Barrel/export impact decision recorded | yes | Renamed exported files and symbols require `pnpm brl`; generated barrels are included. |
| Browser pack selected | yes | Clipboard, picker, DnD, progress, completion, failure, and undo are user-visible browser behavior. |
| Browser route / app surface identified | yes | `/blocks/clipboard-upload-proof` and `/blocks/playground`; `apps/www/tests/browser/clipboard-upload.spec.ts` and DnD coverage are the current owners. |
| Browser tool decision recorded | yes | Use managed Playwright for the existing route and exact Chrome/Computer Use for native picker/file-DnD interaction. `setInputFiles` alone proves only the DOM adapter. |
| Console/network caveat policy recorded | yes | Capture strict console/page errors. Mock only UploadThing's external response for local success; do not claim live provider service. |
| Observable browser case captured | yes | Invalid file paste must preserve the empty block; accepted picker/drop batches show draft slots, progress, and final media; undo/redo must not issue another request. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has a Best API verdict before target lock.
- [x] Scale applicability has a source-backed no-Benchmark decision.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical draft intent, local request resources, and copied presentation are classified.
- [x] Public breaks and deletion of the old API have complete adoption answers.
- [x] Execution slices and focused proof are concrete.
- [x] Package API, export, release-artifact, docs, registry, and browser work are recorded.
- [x] The release plan updates existing branch-owned changesets rather than describing branch-only APIs as removals from `main`.
- [x] Registry source and generated-output commands are recorded.
- [x] Browser proof distinguishes managed diagnostics, exact Chrome interaction, and live-provider claims.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every design and adoption choice | Target API, state machine, ledger, slices, and proof matrix are complete. |
| Fresh source evidence | yes | Reconcile changed authority owners before execution | Commits `ae4cf47fe8` and `b2835dba73` changed only commit start-time capture/formatting in the three stale Plite files. They do not change NodeKey mutation, replacement annotations, or skipped-history mapping. Slice 1 proves the relied-on contracts on current source. |
| Best API review | yes | Delete weaker nouns and split protocol | Dedicated `MediaUploadPlugin`, one `submit`, private completion, and no aliases are locked. |
| Pre-acceptance scale proof | no | Preserve the current task/subscription/scan law | Scale contract below records the exact unchanged runtime law and re-open condition. |
| Production scale rerun contract | no | Reopen only if execution changes runtime topology | No speed or capacity claim is planned. |
| Conditional risk and adoption | yes | Cover roots, replacement, history, copied UI, docs, releases, and browser paths | Each appears in a numbered slice and proof row. |
| Verification recorded | yes | Record fresh implementation proof and known limits | The closure evidence below records package, component, registry, managed browser, and exact Chrome picker results. |
| Handoff prepared | yes | Name ownership, breaks, proof, risks, and order | Final handoff section is complete. |
| P1 autoreview | no | Do not invoke on `next` | Repository rule forbids Task Autoreview on `next`; source-based acceptance remains required. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-upload-draft-asset-protocol.md` | Final planning verification command. |
| Public API / package boundary proof | yes | Run source scans and partition typechecks | Exact commands are in slices 1, 2, 5, and 6. |
| Release artifact classification | yes | Update package and registry release sources | Two existing package changesets plus one existing draft registry entry; no duplicate event is planned. |
| Published package changeset | yes | Keep one package per existing file and no forbidden minor bump | `platejs` and `plitejs` already have separate major v54 changesets relative to `main`. |
| Registry changelog | yes | Update source, regenerate JSON, and check | Use `generate-ui-changelog-entries.mjs --write` and `--check`. |
| Package typecheck/build/test | yes | Run affected Plite root and Plate media/media-react/DnD partitions | Commands are listed under execution proof. |
| Barrel/export generation | yes | Run `pnpm brl` after file/symbol renames | Generated barrel diff must contain the new names and no old upload exports. |
| Browser interaction proof | yes | Exercise clipboard proof and playground picker/DnD | Managed Chromium plus exact Chrome path are specified. |
| Browser console/network check | yes | Capture strict errors and label the UploadThing mock | No live-provider claim is allowed. |
| Browser final proof artifact | yes | Save route, action, result, trace/log, source identity, and final fingerprints | Use `docs/plans/artifacts/upload-draft-asset-protocol/`. |
| Exact case replay | yes | Reproduce all seven audit observations before accepting the replacement tests | Proof matrix maps every observation to a target assertion. |
| Final ref and fingerprints | yes | Record the final local ref and issue-owned source/test/fixture hashes | Recorded in `docs/plans/artifacts/upload-draft-asset-protocol/verification.md`. |
| Clean final runtime | yes | Start a fresh owned server from final local source; record unpushed status rather than claiming a pushed tree | Fresh Next dev server ran at `http://localhost:3297` from this checkout. |
| Retry-free stability | partial | Run picker and DnD interaction 5/5 in exact Chrome | Managed Chromium picker passed 5/5 and exact Chrome picker reached transport. The available Chrome automation rejects file payloads for drag events, so native file-DnD 5/5 remains unclaimed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted review, live owner scans, package/history/DnD/docs/release sources | None |
| Decide | complete | Public contract, state machine, hard cuts, ownership, and history law below | None |
| Prove and hand off | complete | Implementation, release artifacts, generated outputs, and focused proof are recorded | None |

Decision brief:

- outcome: replace the generic placeholder protocol with a dedicated persisted
  media-upload draft slot and one atomic file admission method.
- chosen shape: `BaseMediaUploadPlugin` / `MediaUploadPlugin`, persisted
  `{ type: 'upload', kind, children }`, generated `update.insert` for an
  intentional unbound slot, `update.submit(files, options)` for every file
  ingress, `api.cancel(key)`, and selector `task`.
- strongest rejected alternative: pending state on image/file/audio/video
  nodes. It makes required URLs optional in four completed-media schemas,
  spreads source-absent renderer and codec branches, and still needs the same
  cross-media request owner.
- consequence: this is a deliberate hard break inside the unreleased v54
  redesign. All callers, docs, registry item names, generated contracts, and
  branch release prose move together; no alias preserves the weaker model.

## Target public contract

The persisted node represents authored draft intent, not a network request:

```ts
type MediaUploadKind = 'audio' | 'file' | 'image' | 'video';

type MediaUploadElement = {
  type: 'upload';
  kind: MediaUploadKind;
  children: [{ text: '' }];
};
```

`type` follows the installed `BaseMediaUploadPlugin.schema.type`; the literal
above is its default. `kind` is a product domain value. It is never a plugin
name or a completed-media schema type.

```ts
type MediaUploadRule = {
  kind: MediaUploadKind;
  maxBytes?: number;
  maxFiles?: number;
  minFiles?: number;
};

type MediaUploadSubmitOptions =
  | ({ slot: NodeKey } & {
      at?: never;
      after?: never;
      replaceEmpty?: never;
    })
  | ({ slot?: never } & BlockInsertOptions);

MediaUploadPlugin.configure({
  initialState: {
    maxFiles: 5,
    rules: {
      image: { kind: 'image', maxBytes: 4 * 1024 * 1024, maxFiles: 3 },
      video: { kind: 'video', maxBytes: 16 * 1024 * 1024, maxFiles: 1 },
    },
    transport: async (file, { onProgress, signal }) => ({ url: '…' }),
    onError: (failure) => reportUploadFailure(failure),
  },
});

editor.plugin(MediaUploadPlugin).update.submit(files);
editor.plugin(MediaUploadPlugin).update.submit(files, {
  after: blockKey,
  replaceEmpty: true,
});
editor.plugin(MediaUploadPlugin).update.submit(files, { slot: uploadKey });
editor.plugin(MediaUploadPlugin).api.cancel(uploadKey);
```

The headless descriptor's generated
`editor.plugin(BaseMediaUploadPlugin).update.insert({ kind }, options)` remains
the one explicit way to author an unbound slot without a `File`. It starts no
request. Every path that accepts files uses `submit`.

`submit` returns `true` when it consumes a non-empty file input, including a
batch rejected with a typed admission failure, and `false` when no file input
or writable target exists. A rejected batch changes no document content and
starts no request. The plugin invokes `onError` only after an accepted
transaction commits, or once when an asynchronous task enters a failed state.
There is no replayable global error store.

Replace the current numeric `UploadErrorCode` values with string-discriminated
`MediaUploadAdmissionError` and `MediaUploadFailure` unions. Admission covers
unsupported file type, file too large, too few files, and too many files.
Missing-transport failure is a configuration phase with no task or document
mutation. Transport and invalid-result failures include the `File` and
`NodeKey`; result failure distinguishes a missing URL from a URL rejected by
the installed media normalizer. Invalid `maxBytes`, `minFiles`, or `maxFiles`
configuration throws during plugin activation instead of masquerading as user
input failure.

The task selector returns this local resource:

```ts
type MediaUploadTaskState =
  | { status: 'uploading'; progress: number }
  | {
      status: 'failed';
      progress: number;
      failure: Extract<
        MediaUploadFailure,
        { phase: 'transport' | 'result' }
      >;
    };

type MediaUploadTask = {
  file: File;
  getSnapshot(): MediaUploadTaskState;
  subscribe(listener: () => void): () => void;
};
```

`usePluginStore(MediaUploadPlugin, 'task', key)` reads one resource. Rename
`upload` configuration to `transport`, `uploadConfig` to `rules`,
`maxFileCount` to `maxFiles`, and per-rule count/size fields to `minFiles`,
`maxFiles`, and `maxBytes`. Delete `multiple`; `maxFiles: 1` expresses that
policy. Delete `disableEmptyPlaceholder`; each user submission is always an
explicit history boundary. Replace the inverted React-only
`disableFileDrop` with `nativeDrop: false` on `MediaUploadPlugin`.

## State and authority

| Document state | Local resource | Meaning | Allowed next states |
| --- | --- | --- | --- |
| no draft slot | none | No upload intent at this identity | admitted slot or completed media through another API |
| draft slot with `kind` | none | Persisted unbound intent from explicit insert, reload, collaboration, copy, undo/redo, or cancellation | uploading or removed |
| draft slot with `kind` | uploading task | One committed local request owns this exact key | failed, completed media, superseded, or cancelled |
| draft slot with `kind` | failed task | The request or result failed; the slot remains retryable | uploading through `submit({ slot })`, cancelled, or removed |
| completed media with required `url` | none | Image/file/audio/video owns its strict final schema | ordinary media edits/history |

Admission validates the whole ordered batch first. In `{ slot }` mode, the
first file must map to the slot's `kind`; it reuses that slot, and later files
create adjacent slots in input order. Global and per-file-type counts apply to
the complete selection, including the first file. A valid committed retry
supersedes the old task only in `afterCommit`; an aborted outer transaction
leaves the old task intact.

A private local, history-skipped admission effect gives rejected submissions a
real commit boundary for `afterCommit(onError)` without changing document
content or storing the failure. Missing transport follows the same rejection
path. Insertion submissions always add the explicit history-push tag; binding
an existing slot does not create a document history entry.

Each task closes over a private request token and its slot `NodeKey`. Movement,
including movement across roots, keeps the task while that key still resolves
to the same installed draft schema and `kind`. Node removal, type/kind change,
whole-document replacement, plugin removal, or editor cleanup aborts and drops
the task. A reused path has no authority. Read-only state blocks new admission;
it does not revoke a request already authorized by a committed slot. This keeps
background completion independent of a mounted or editable view.

Completion resolves the built-in descriptor for `kind`, reads the installed
descriptor's `schema.type`, normalizes the returned URL through that descriptor,
and then rechecks the request token and draft key. One `history: 'skip'`
transaction uses `tx.nodes.set(..., { at: key })` and
`tx.nodes.unset('kind', { at: key })`; it never converts a bare path. The final
node retains the slot key and caption child key, contains the completed media
properties, and contains no draft-only property. Missing or invalid URLs move
the task to `failed`; they never clear the task or mutate the node.

## History, replacement, and serialization law

- A batch insertion is one explicit history entry. Per-file completion is
  skipped history mapped into that entry.
- If completion wins before undo, undo removes the completed media and redo
  restores the completed media without transport.
- If undo wins first, it removes the draft slot and aborts the task. Redo
  restores an unbound draft slot and starts no transport.
- For a mixed batch, redo restores completed media for files that completed
  before undo and unbound slots for unfinished files. No restored slot owns a
  stale `File` or request.
- Retrying a restored or failed slot is an explicit new submission.
- Export Plite's existing `documentReplacement` annotation descriptor from
  `plitejs`. The upload owner checks it before ordinary changed-node cleanup,
  so equal-content `tx.value.replace` also aborts every task.
- Plate JSON, history, collaboration, and internal slices preserve only
  `{ type, kind, children }`. Copying a draft produces an unbound slot with a
  new key. External HTML/plain-text and static export omit unresolved drafts;
  they never invent a URL or serialize local task state.

## Ingress and presentation law

- Clipboard calls `submit(files, { after: blockKey, replaceEmpty: true })`.
  It no longer deletes the empty block before validation.
- Toolbar calls `submit(files)`.
- The draft-slot picker calls `submit(files, { slot: nodeKey })`; delete the
  first-file `api.upload` plus rest-files `insertMedia` split.
- React native drop is opt-in with `nativeDrop: true`. It resolves the event's
  block to a `NodeKey` and uses relational block placement.
- Replace DnD's file callback `{ key, target?: Path }` placement with
  `{ key: NodeKey, edge: 'before' | 'after' }`. The copied adapter maps
  `before` to `{ at: key }` and `after` to `{ after: key }`, preserving roots
  without exposing a bare insertion path.
- Copied UI becomes `MediaUploadElement` in registry item `media-upload`.
  It reads `element.kind` directly, renders unbound/uploading/failed states,
  and keeps `useObjectUrl(file)` in the view.
- `MediaKit` configures UploadThing as `transport` and maps `onError` to one
  toast. Delete `MediaUploadToast` and the component error effect so remounts
  cannot replay notifications.
- `BaseMediaKit` registers `BaseMediaUploadPlugin` for schema/static parsing.
  Static output omits an unresolved slot rather than rendering fake media.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Draft model | generic `placeholder` with `mediaType` | `upload` with required `kind` | Plate media schema | Draft intent is persisted; plugin/schema identity is not | Rename package/React files, keys, types, tests, docs, registry item, generated contracts | schema/typecheck/round-trip tests | Confusing unrelated placeholder nouns | accept hard cut |
| Completed media | four nodes with required `url` | unchanged strict schemas | image/file/audio/video plugins | Pending state does not belong in completed assets | none beyond completion conversion | existing media contract plus no-`kind` assertion | Conversion can leak draft props | accept |
| File admission | `api.upload` plus `insertMedia` | one `update.submit` | Media upload plugin | One validation, placement, history, and request-start policy | migrate paste, toolbar, picker, native drop, DnD, docs | atomic batch tests and browser cases | Slot retry needs an effect-only commit when no document changes | accept |
| Explicit empty draft | generated placeholder `update.insert` | generated media-upload `update.insert({ kind })` | Base media upload plugin | Authoring an unbound slot is distinct from admitting files | rename call sites/docs | type inference and persisted-node test | Could be mistaken for request start | retain and document |
| Config | `upload`, `uploadConfig`, `multiple`, string sizes, inverted disables | `transport`, `rules`, `maxFiles`, numeric `maxBytes`, `nativeDrop` | base plugin; React owns native drop | Remove duplicate/inverted policy and config parse failures | copied MediaKit and docs | activation validation and inference tests | Breaking config | accept hard cut |
| Errors | replayable global error plus view effects | typed failures, failed task, one-shot `onError` | plugin state machine; app presents | Remount must not replay a notification | delete global error selector/toast component/effects | remount and callback-count tests | Callback may run after stale authority | token gate before report | accept |
| Completion | public path-based `replaceMedia` | private key-based conversion | media upload plugin | Callers should not own protocol internals | delete method and all callers/docs | root/custom-schema/invalid-result tests | `set` plus `unset` must validate atomically | accept with blocker test |
| Target schema | capability name written as `type` | installed descriptor `schema.type` | completed media descriptor | Configured schema type is canonical | private kind-to-descriptor map | overridden-schema test | descriptor absent/misconfigured | dependencies plus fail closed |
| Lifetime | key plus bare-path completion; changed-doc scan | key/token authority, replacement annotation, cleanup | Plate tasks; Plite identity/annotation | Moves survive; disappearance/replacement revokes | commit and cleanup handlers | move/remove/equal-replace tests | equal replacement has no document diff | export annotation |
| History | skipped completion with incomplete mixed-batch law | explicit four-case contract above | Plite history mapping; Plate task cleanup | Replay cannot recreate local resources | rewrite focused history tests | insert/complete/undo/redo matrix | highest implementation risk | accept, prove before UI |
| DnD placement | rootless `target?: Path` | `NodeKey` plus before/after edge | Plate DnD callback | A path without root is not stable public authority | callback type/docs/copied adapter/tests | named-root DnD unit and Chrome run | Public DnD break | accept |
| Presentation | placeholder-name scan and toast effects | kind-driven `MediaUploadElement`, task selector, app callback | copied UI | Remove plugin-name coupling and replay effects | rename registry source and dependencies | component lifecycle/object-URL tests | registry item rename fan-out | full source/generator scan |
| Serialization | draft behavior implicit | JSON/internal slice preserve; external/static omit | schema/codecs/static kit | A draft has document meaning but no publishable asset | docs and serializer tests | JSON/copy/export cases | Collaboration can receive an unbound slot | intended |
| Plite API | replacement descriptor internal | export existing `documentReplacement` | `plitejs` root | Consumers need exact equal-content replacement intent | root barrel, contract test, changeset | root partition type/test | Avoid general annotation API expansion | minimal promotion |
| Release | branch prose teaches superseded API | final API in existing changesets/changelog | Changeset and registry owners | Release text must describe final delta from `main` | edit existing source artifacts and regenerate | release/source checks | Intermediate branch names leaking | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Lock Plite authority | Plite core/history | Export `documentReplacement`; add a public contract for equal and non-equal `tx.value.replace`; prove `NodeKey` `set` plus `unset` in a named root preserves key and validates the final type | Current descriptor is internal and node mutation APIs already accept keys | Plate can import one typed descriptor and no new mutation primitive exists | `pnpm --filter plitejs test:partition:core`; `pnpm --filter plitejs test:entrypoint:root`; corresponding typechecks |
| 2. Replace the package model/API | Plate media | Rename directories/descriptors/key/types; implement strict slot schema, config validation, typed failure/task state, atomic `submit`, private key-based completion, cancel, cleanup, and history boundary; delete old methods/state | Slice 1 passes | No old upload API export or caller remains; all seven audit observations have focused package assertions | `pnpm --filter platejs test:partition:media`; `pnpm --filter platejs typecheck:partition:media` |
| 3. Make every ingress use admission | Plate DOM/React/DnD | Migrate clipboard, toolbar, slot picker, native drop, and DnD edge contract; preserve whole-batch order/counts and roots | Slice 2 target compiles | Every `File` ingress calls `submit`; no caller removes content before validation or splits first/rest | media-react and dnd-react test/typecheck partitions; source scan |
| 4. Rebuild copied presentation | Registry app owners | Rename `media-placeholder` source/item/component to `media-upload`; configure UploadThing transport/onError; render unbound/uploading/failed; preserve object URL lifetime; update static/media/DnD kits and dependencies | Slices 2–3 pass | Copied UI has no store-wide error effect, old plugin name, or first/rest path | focused Bun component tests; `pnpm --filter www build:registry`; registry source check |
| 5. Reconcile persistence, docs, and release | Plate Docs, behavior law, changeset, registry changelog, Best API repair | Update media EN/CN docs, document model, DnD docs, behavior matrices, API reference inputs, existing package changesets, and existing draft registry entry; run doctrine repair audit and update doctrine only if execution changes a reusable rule | Final public symbols exist | Current teaching shows only final API and state law; generated docs/registry outputs match | docs parity/typecheck, changelog generator check, review-ledger check, stale-name scan |
| 6. Prove the user paths and close | Verify Plate | Run package closure, managed clipboard case, playground picker/DnD/failure/undo, strict runtime errors, 5/5 Chrome interaction, and final source fingerprints | Final source and generated outputs settled | Exact observations pass on fresh source; external UploadThing remains explicitly mocked/unclaimed | commands and browser evidence below; `git diff --check`; `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Invalid clipboard input preserves the empty block | Current adapter removes before validation; `BlockInsertOptions` already owns `replaceEmpty` | Focused package test and existing `/blocks/clipboard-upload-proof` case | required in slice 2/6 |
| Slot picker validates one whole batch | Copied component currently splits first/rest and bypasses counts | Package slot-mode test plus copied picker component test | required in slice 2/4 |
| Named-root completion cannot mutate main-root sibling path | Current completion resolves key then passes only `current[1]` | Named-root deferred completion test asserting both roots and retained key | required in slice 2 |
| Configured media schema type wins over capability name | Current `replaceMedia` writes `media.name` | Override image schema type, complete upload, assert configured type and required URL | required in slice 2 |
| Invalid result remains retryable | Current completion can normalize to nothing and then clear the task | Missing/invalid URL tests assert failed task, unchanged slot, and one callback | required in slice 2 |
| Equal whole-document replacement revokes requests | Plite sets `document.replace`; current cleanup only watches changed document | Equal-content `tx.value.replace` test asserts abort and unbound replacement slot | required in slice 1/2 |
| Partial-batch history never restarts transport | Accepted review reproduced a restored slot without a task | Complete/pending mixed batch undo/redo test with request call count fixed | required in slice 2 |
| Moves preserve request authority; deletion and type/kind change revoke it | NodeKey is editor/root-wide; current task map already uses keys | Move within/across roots, remove, retag, and reused-path tests | required in slice 2 |
| Read-only is an admission boundary, not a view-lifetime cancellation | Transport is headless and committed before view changes | Test read-only rejection and completion after later view read-only toggle | required in slice 2 |
| Errors notify once across remount | Current global/error effects can toast again | Copied component remount test and exact callback count | required in slice 4 |
| Internal copy preserves draft intent without task | Slot schema is persisted; task map is local | JSON/internal slice copy test; new key has no task; external HTML omits slot | required in slice 2/5 |
| DnD placement is root-aware and ordered | Current callback supplies both key and rootless path but copied adapter chooses path | DnD edge unit test in named root and 5/5 Chrome file drop | required in slice 3/6 |
| Public types infer callbacks and reject mixed placement/slot options | Repository law requires callback inference | Compile-time contract in media partition; no explicit consumer callback annotations | required in slice 2 |
| Old public protocol is gone | Bounded scan lists all current symbols and consumers | `rg` stale-name scan after `pnpm brl` and registry build | required in slice 5 |

Execution proof commands:

```bash
pnpm --filter plitejs test:partition:core
pnpm --filter plitejs test:entrypoint:root
pnpm --filter plitejs typecheck:partition:core
pnpm --filter plitejs typecheck:entrypoint:root
pnpm --filter platejs test:partition:media
pnpm --filter platejs test:partition:media-react
pnpm --filter platejs test:partition:dnd-react
pnpm --filter platejs typecheck:partition:media
pnpm --filter platejs typecheck:partition:media-react
pnpm --filter platejs typecheck:partition:dnd-react
pnpm brl
pnpm --filter www build:registry
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium tests/browser/clipboard-upload.spec.ts
node tooling/scripts/review-ledger.mjs check
git diff --check
```

After the focused lanes pass, run the package-owned closure selected by Verify
Plate for changed `plitejs` root exports and `platejs` media/DnD entrypoints.
Run `pnpm --filter www typecheck` after generated registry and docs inputs
settle. Do not use it as a substitute for the focused behavioral tests.

Scale contract:

- applicability and source evidence: no Benchmark gate. The current owner in
  `BasePlaceholderPlugin.ts` has one controller/resource/progress store per
  active file and scans the active-task map on relevant commits. The target
  preserves that topology and removes one global error subscription.
- user operation, current owner, proposed owner: file admission and completion
  remain in one Plate media plugin; presentation remains in copied UI.
- independent scale variables: active files and active task subscribers remain
  the only repeated units. The target does not change their asymptotic work or
  introduce another cache, observer, projection, or scheduler.
- pre-acceptance baseline/candidate, budget, timing, and noise: not applicable
  because no scale-sensitive runtime decision is selected and no performance
  claim is made.
- deterministic correctness guard: one task per accepted file, one progress
  notification per accepted progress change, and at most one scan of active
  tasks per relevant commit.
- reopen condition: if implementation adds a second task index, scans document
  nodes per progress event, adds view subscriptions per file, or changes
  completion complexity, stop target acceptance and run Benchmark before
  proceeding.

Conditional evidence:

- High-risk scenarios: applies. Named roots, equal-content replacement,
  custom schema types, invalid results, mixed batch history, transaction abort,
  copied draft slots, remount, and DnD edge placement are explicit proof rows.
- External research: not applicable. The accepted source-backed review already
  compared the meaningful local models; this plan does not make an external
  parity claim.
- Issue/PR provenance: no public issue or PR is in scope. Preserve the accepted
  review ID and the historical issue-4803 undo/redo intent in the final plan
  outcome.
- Docs/registry/browser/release/behavior-law owners: all apply in slices 4–6.
- Performance pack: not applicable under the preserved runtime law above.
- Doctrine repair: applies as a final audit because reusable public API changes.
  Current doctrine already requires plugin-scoped typed APIs, exact `NodeKey`
  authority, hard cuts, and app-owned presentation, so no Vision or skill edit
  is expected. If execution changes a reusable rule, update the smallest Vision
  owner through Maintain Workflow, bump Plate Next doctrine, regenerate with
  `pnpm install`, and validate the versioned mirrors before closure.

Findings:

- The current implementation has the right broad lifetime owner but the wrong
  public protocol: single-file retry and batch insertion can disagree about
  validation, history, and placement.
- A dedicated persisted draft is justified. Removing it would force optional
  URLs and draft branches into four independent completed-media schemas.
- The wrong-root defect does not justify a new Plite API. The consumer discards
  a root-aware key that existing mutations already accept.
- Equal-content replacement is operation intent, not a document diff. The
  existing annotation is the exact authority and should be public.
- The global upload error store and React effects are a notification replay
  bug by design. A transition callback plus task-local failed state removes the
  ambiguity.
- DnD's `target?: Path` is the last rootless ingress boundary. Keeping it would
  leave the redesign knowingly incomplete.
- “Placeholder” is overloaded in this repository. Only the media upload noun
  is cut; Plite DOM coverage placeholders and `BlockPlaceholderPlugin` are
  unrelated contracts.

Decisions and tradeoffs:

- Keep a type-changing draft-to-media transition because it preserves strict
  completed schemas and gives unbound drafts an honest persisted shape.
- Keep a fixed four-kind map instead of a public custom asset registry. The
  current user jobs are the four installed media descriptors; generalization
  would add policy without evidence.
- Keep transport in application configuration and request lifetime in Plate.
  UploadThing remains an adapter, not a framework dependency.
- Use numeric `maxBytes` instead of parsed size strings. The config becomes
  unambiguous, validation errors stay user-facing, and malformed policy fails
  at setup.
- Let committed requests finish after a view becomes read-only. Read-only
  blocks new user action; it does not erase document authority already granted
  to a headless task.
- Omit unresolved drafts from external/static output while preserving them in
  Plate JSON and internal slices. A draft has editor meaning but no publishable
  asset.

Review fixes:

- Added the generated unbound-slot `update.insert` job so “one admission path”
  does not accidentally remove explicit draft authoring.
- Replaced a vague path-to-key DnD migration with a concrete before/after edge
  contract.
- Removed the proposed global error store and view-driven toast replay.
- Resolved read-only as an admission boundary rather than a task-lifetime owner.
- Reused existing branch changesets and registry event instead of creating
  release prose for APIs absent from `main`.
- Scoped the rename away from Plite DOM placeholders and block placeholder UI.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| A one-off Bun probe emitted too much setup output | 1 | Inspect the public mutation signatures and existing key-preservation tests instead | `nodes.set`/`unset` accept `NodeKey`; slice 1 adds the exact named-root conversion guard before implementation depends on it. |

Verification evidence:

- Plite exports `documentReplacement`; equal and non-equal replacement plus
  named-root key-preserving mutation have public contract coverage.
- `MediaUploadPlugin` owns strict draft schema, atomic admission, local task
  resources, cancellation, history/replacement behavior, result validation,
  schema-aware completion, and committed-editor transport start.
- Picker, clipboard, native-drop, DnD, copied UI, static output, docs,
  changesets, registry changelog, and doctrine consumers use the final API.
- Focused media upload tests pass 16/16; media-react passes 5/5; dnd-react
  passes 8/8 plus 42/42 and 1/1 routed suites; media, media-react, and
  dnd-react type partitions pass.
- Copied media upload, lifecycle, static, and toolbar suites pass separately:
  2/2, 1/1, 1/1, and 18/18.
- Managed Chromium paste/picker/undo passes 3/3, and the picker case passes
  five consecutive reruns. Exact Chrome's native picker reached the configured
  UploadThing transport on fresh source.
- The available Chrome CDP surface explicitly rejects attaching a local file
  payload to `Input.dispatchDragEvent`; exact native file-DnD 5/5 remains a
  recorded proof limit. Named-root DnD edge placement is covered at the package
  boundary.
- Release generation, final review-ledger reconciliation, stale-name scans,
  doctrine validation, Ultracite, and `git diff --check` form the closure lane.
- Full package lanes retain the unrelated failures recorded in the final
  artifact; no upload-owned failure remains.

Final handoff prepared:

- Ownership and target API: one `MediaUploadPlugin` owns admission and local
  tasks; strict media plugins own completed nodes; Plite exports replacement
  intent and keeps identity/history; copied UI owns presentation and provider
  configuration.
- Public breaks and adoption: rename every media placeholder upload symbol and
  registry item, delete `api.upload`, `api.cancelUpload`, `insertMedia`,
  `replaceMedia`, old config fields, the global error selector, and aliases.
- Runtime/package/docs/browser decisions: all are assigned to slices 1–6 with
  exact package partitions and routes.
- Scale decision: no Benchmark under the preserved one-task/one-scan topology;
  the reopen condition is explicit.
- Highest risk: skipped-history mapping for a mixed completed/pending batch.
  Prove it in slice 2 before touching copied UI.
- Execution order completed: Plite authority, package state machine, ingress
  adapters, copied UI, docs/releases/doctrine, fresh browser, and closure proof.
- User attention: no design or implementation choice remains. The exact native
  file-DnD replay is unclaimed because the available Chrome automation cannot
  attach a local file to a drag event.

Timeline:

- 2026-09-18T22:42:56.516Z: Plate Plan created.
- 2026-09-19: Accepted the corrected dedicated-draft direction, resolved the
  public contract and history law, and prepared execution handoff.
- 2026-09-19: Implemented the protocol, migrated every owner, repaired the
  committed-editor transport race found in exact Chrome, and completed focused
  proof and release reconciliation.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and focused closure are complete. |
| Where am I going? | No implementation step remains. |
| What is the goal? | One atomic, root-aware, persisted media-upload protocol with exact history and replacement authority. |
| What have I learned? | Transport start must use the committed editor supplied to `afterCommit`; a captured pre-publication view cannot resolve the newly inserted key. |
| What have I done? | Implemented and adopted the final API, state machine, root/history laws, UI, docs, release artifacts, and focused proof. |

Residual proof limits:

- The live UploadThing service is not claimed; local exact Chrome verifies that
  picker admission reaches the configured transport, whose endpoint returns the
  expected local 404 without production credentials.
- The available Chrome automation supports file choosers but rejects a local
  file payload for drag dispatch. Native file-DnD 5/5 remains unclaimed; package
  tests prove root-aware placement and managed Chromium proves the shared
  committed-editor upload start path.

Open risks:

- Live UploadThing completion remains unverified without production
  credentials; exact Chrome proves that accepted picker input reaches the
  configured transport.
- Repeated exact native file-DnD interaction remains unverified because the
  available Chrome automation cannot attach a local file to a drag event; the
  underlying placement and upload-start contracts pass at package and managed
  browser boundaries.
