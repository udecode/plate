---
review_scopes:
  - uploads
review_basis:
  - 2026-09-19-uploads-official-files-sdk
work_kind: design
---

# Official Files SDK integration

Status: Complete

Objective:
Design one official Files SDK-backed `platejs/upload` plugin replacing
`MediaUploadPlugin` and its generic transport API. Settle the contract, durable
URLs, editor lifetime, isolated imports, copied installation, adoption and proof.
This is an uploads decision; media, clipboard, history and DnD are affected
consumers, not newly reviewed features.

Flow mode:
Task design and adoption plan; product implementation is subsequent execution.

Goal plan:
docs/plans/2026-09-19-official-files-sdk-integration.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- performance-observability, embedded design probe

Mode:
Standard. Reuse source-bound SDK research, resolve remaining contracts and run
a disposable owner comparison. No product/dependency changes or publication.

Completion threshold:
One resolved target, complete adoption/proof ownership, passing bounded design
probe and plan/history validation. Design completion does not mean adoption.

Verification surface:
Current upload/media source, upstream SDK 2.6.0, consumer/export inventory,
disposable probe, source fingerprints, ledger and plan validation. Production
verification is specified separately below.

Constraints:
- The user's explicit preference for one official SDK supersedes the earlier
  replaceable-transport recommendation. Do not recreate that abstraction.
- Preserve atomic admission, committed-editor start, keyed root authority and
  history law from the accepted dedicated-draft design.
- No storage in core, SDK forwarding facade, compatibility alias, automatic
  remote deletion, requests during rendering or SDK React hook task ownership.
- Integrate the MIT dependency normally; do not transplant upstream code.

Boundaries:
Plate Files owns admission and draft/task completion. Files SDK owns byte
transfer/providers. The application owns its gateway, access policy and durable
asset URLs. Media owns completed schemas and URL normalization. Copied UI owns
presentation/activation; Plite's existing commits, roots, keys, replacement and
history need no API changes. Resumable upload, quotas, an asset browser, orphan
collection and migration of stored UploadThing bytes are outside scope.

Output budget strategy:
Named source owners and bounded searches; one plan plus executable evidence.

Blocked condition:
None for design. Shipping the copied gateway is gated on correct denial status
from an installed SDK release (or an explicitly accepted application-owned
response boundary). Provider credentials and application authorization are
deployment prerequisites, not reasons to invent live-provider verification.

## Public contract

**Replace the transport abstraction with the real Files client.** One optional
feature has `BaseUploadPlugin` in `platejs/upload` and its ordinary React adapter,
`UploadPlugin`, in `platejs/upload/react`. Do not re-export or mirror the SDK.

Proposed application code:

```tsx
import { createFilesClient } from 'files-sdk/client';
import { UploadPlugin } from 'platejs/upload/react';

const endpoint = `/api/files?documentId=${encodeURIComponent(documentId)}`;
const client = createFilesClient({ endpoint });

const plugin = UploadPlugin.configure({
  initialState: {
    client,
    getUrl: ({ key }) => {
      const url = new URL(endpoint, appOrigin);
      url.searchParams.set('op', 'download');
      url.searchParams.set('key', key);
      return url.href;
    },
  },
});

editor.plugin(UploadPlugin).update.submit(files, { after: blockKey });
editor.plugin(UploadPlugin).update.submit(files, { slot: draftKey });
editor.plugin(UploadPlugin).api.cancel(draftKey);
```

`appOrigin` is application configuration, not a browser-global read during SSR.
Create client/configuration once for the editor's document lifetime through the
existing setup pattern. `getUrl` receives an inferred upstream `UploadOutcome`
and returns a synchronous durable absolute URL. It only chooses an address:
no uploading, signing, progress mapping or retries. A CDN application supplies
its own durable mapping. URLSearchParams preserves opaque keys correctly.

Proposed state contract:

```ts
import type { FilesClient, UploadOutcome } from 'files-sdk/client';

type UploadPluginState = {
  client: FilesClient | null;
  getUrl: ((file: UploadOutcome) => string) | null;
  maxFiles: number;
  rules: UploadRules;
  onError: ((failure: UploadFailure) => void) | null;
  tasks: Partial<Record<NodeKey, UploadTask>>;
};
```

Both configuration fields default to null so unconfigured editors can load
authored slots. Submission checks configuration before mutation/I/O and returns
a handled configuration failure when incomplete. Recheck at submission because
state can change. This is the actual FilesClient, not a custom subset protocol
or `createUploadPlugin` factory.

Retain useful contracts as `UploadKind`, `UploadRule`, `UploadRules`,
`UploadAdmissionError`, `UploadFailure`, `UploadTask`, `UploadTaskState`,
`UploadSubmitOptions` and the inferred element/definition types. Export only
contracts needed by public signatures/consumers; delete transport/result types.

- `submit(File[] | FileList, options)` remains synchronous and atomic, with
  mutually exclusive slot versus block-placement options. It reports command
  handling, not remote completion. Typed transactions use
  `tx.plugin(UploadPlugin).submit(...)`. Optional cross-feature callers use the
  name with an installed guard, without importing the descriptor at runtime.
- Privately call `client.upload(file, { signal, onProgress })` once per admitted
  file. Plate owns those options; File supplies MIME and server policy owns
  limits/expiry. No mirrored options bag without a current caller requirement.
- Retain task `file`, `getSnapshot` and `subscribe`. Use upstream
  `AggregateProgress` directly, initialized at zero; compare its fields before
  publishing. UI converts `fraction` to percent. Do not keep a percent store or
  mistake byte-transfer completion for successful gateway completion.
- Failures discriminate admission, configuration, upload and result. Missing
  client/resolver/destination plugin is configuration failure. Upload retains
  the actual error as `unknown`, not a duplicate SDK error vocabulary. Result
  distinguishes invalid URL and thrown resolver, retaining UploadOutcome.
  Notify once at the owner transition, never from a remounting error effect.
- Preserve original File names. Move existing optional `createImageBitmap`
  measurement from copied transport into private image completion, feature
  detect it, close in `finally`, ignore decode failure and recheck authority
  after awaiting. No extensible metadata/result callback is needed.

## Document and lifetime

Capability identity becomes `files`; explicitly keep schema type `upload`.
The compiler supports `element.type ?? plugin.name`
(`packages/platejs/src/internal/plugin/compilePlateModel.ts:968`). The strict
authored `{ type: 'upload', kind, children }` describes a real draft state,
not a compatibility alias. Custom schema overrides remain supported. Completed
media retains its URL schema. The stable URL already identifies the asset:
no duplicate storage key, expiring URL, progress, error or resource in JSON.

1. Validate the complete batch, target eligibility, configuration and installed
   destination kinds before mutation. Remove automatic installation/imports of
   all four media descriptors; use optional named lookup and fail admission if
   a needed destination is absent. Current kind/count/size rules remain client
   UX policy, never a security boundary.
2. Capture client, resolver, original File and prepared keys at admission.
   Later state changes affect later submissions. Retain the one private task
   map and per-task store, without a second scheduler/cache/retry manager.
3. Start from `afterCommit` using its committed editor. Rejected/rolled-back
   transactions start nothing. Separate per-file SDK calls preserve per-key
   cancellation; SDK bulk concurrency does not cap those calls. Preserve the
   existing simultaneous launch policy and document it honestly.
4. Check task token, AbortSignal and live keyed draft kind on progress, failure
   and completion. Recheck after URL resolution/image decode and inside the
   skipped-history update. Normalize through the installed media capability,
   set its schema type/properties and unset kind at the same root-aware key.
   An ignored abort or reused path never grants a late promise write authority.
5. Movement preserves authority; removal, retagging, cancel, cleanup and whole
   document replacement revoke it, even equal replacement. Cancel leaves an
   idle slot. Retry uses the same submit operation and replaces its local task.
6. Undo/redo never restarts network work. Failed live tasks keep the local File
   for explicit retry; reload/copy/history restoration without a task yields an
   idle slot requiring a file. Collaborators see authored intent, not resources.
7. Preserve drafts in JSON/internal slices and omit them from external HTML,
   Markdown and static output. Existing complete media renders without Files.
   Node deletion/undo/cancel never invokes SDK delete: objects can be shared.

Removing implicit media installation can change a whole document schema even
when the draft type is preserved. Compose the same destination schemas
explicitly in migrated kits, compare compiled fingerprints, and route genuine
envelope changes through existing document migrations. Do not silently accept
an old fingerprint or invent a upload rename migration.

## Copied gateway and durable delivery

Copy a Node-runtime Next recipe using upstream `createFilesRouter`
(`files-sdk/api`), `createRouteHandler` (`files-sdk/next`) and private R2 storage
(`files-sdk/r2`); document the equivalent S3 configuration. No Plate server facade.

- Set a stable `FILES_API_SECRET` and positive `maxUploadSize`. Use `files(req)`
  to authenticate the session and check current document access on every
  request. Check **write** access there for `PUT op=proxy`, including after a
  prior presign, because proxy PUT bypasses `authorize` and trusts its token.
  Pass `signal: req.signal` into the Files instance.
- Set `operations: ['upload', 'download']`, with application `authorize`.
  These are `FilesOperation` authorization names: wire `presign` and `complete`
  both request `upload`. In `authorize`, check current write access for upload,
  read access for download, and reject `operation === 'upload'` with a supplied
  `key` to disallow explicit-key PUT while allowing keyless presign/complete.
  Returning void permits; throw to deny. The operations list is a hard verb
  gate, **not** user authorization. Origin checks provide CSRF protection,
  not authentication. Typecheck this exact recipe against the published SDK.
- Published Files SDK 2.6.0 bundles `FilesError` separately across its root and
  `files-sdk/api` entrypoints. Throwing the public class from app policy denies
  access but serializes as `500 Provider`, not the intended 401/403. Resolve
  the upstream cross-entrypoint error identity in an installed release and
  prove denial statuses end to end before publishing the gateway. An explicit
  application-owned response boundary is a fallback only if the upstream fix
  cannot land; do not hide 500 or call it correct authorization behavior.
- Key prefixes use a stable document/tenant asset namespace and its ACL,
  not the current viewer's personal prefix. Outcomes strip the authorized
  prefix; all authorized collaborators must resolve the same key scope. A
  document-scoped URL is durable within that document's access policy. Copying
  media to another document requires app policy to rehome the object or grant
  the destination document access to the original asset; Plate does not
  silently duplicate remote bytes or delete the source.
- Persist the absolute gateway GET download URL. It authorizes and redirects
  with private/no-store headers to a short-lived storage URL. Do not persist
  `client.url()` output by default. A redirected storage URL remains usable
  until its signing TTL expires (default 300 seconds), even if app access is
  revoked; immediate revocation requires proxy download and its bandwidth
  cost. Neither browser media src requests nor the SDK's proxy upload PUT
  inherit `FilesClient.headers`. Use same-origin cookies for both private
  delivery and proxy upload, or establish an explicit browser-compatible
  policy for bearer-only applications; a POST-only bearer token is insufficient.
- Opt approved media into inline delivery; arbitrary files stay attachments.
  Decide inline from server-validated asset metadata with a narrow MIME
  allowlist. `Files.head` may only repeat the client's declared content type;
  it is not proof of safe bytes. If the application cannot validate a type,
  serve it as attachment or on an isolated media origin. Never blanket-enable
  HTML/SVG inline on the app origin. Redirects delegate
  Range to storage; proxy mode handles single-range 206/416. Prove actual
  audio/video seeking before claiming it. Measure any added metadata HEAD cost
  on the selected deployment path.
- Bounded R2 presigning falls back to application PUT. This costs app bandwidth
  and must fit host body/time limits. S3 can enforce direct POST size policies.
  Do not remove limits merely to advertise direct R2 uploads.
- Completion HEAD-checks size; it does not establish content-byte safety or all
  advertised MIME guarantees. Content-type/validation plugins can enforce body
  rules but force proxy upload, and strict sniffing excludes some audio/video
  and ZIP formats. Teach the actual declared-type policy; scanning/quarantine
  belongs to applications with that requirement.
- Use the AWS SDK Node engine and install client-s3, s3-request-presigner,
  s3-presigned-post and lib-storage peers. The fetch engine buffers streams.
  Abort is best effort; completed objects can remain after cancellation or
  failed completion. Reference-aware cleanup with grace periods is app-owned.

No current www login/ACL owner was found. The copied server must fail closed
until its access function and credentials are configured, with a useful setup
error. It must not silently enable public billable uploads. Installed demo
tests use an isolated local gateway; provisioning hosted credentials or a
public demo policy is deployment work. Existing UploadThing URLs remain
ordinary content; removing its integration does not migrate stored bytes.

## Decision ledger

| Surface | Target and owner | Adoption / proof | Risk | Verdict |
| --- | --- | --- | --- | --- |
| Provider protocol | Real FilesClient; app supplies durable URL policy | Delete transport/result and copied UploadThing adapter; inference + actual SDK probe | Deliberate SDK coupling | Replace |
| Package | Optional files/files-react owner, no core/media reachability | Manifest, DAG, runtime and declaration absent-peer proof | Type imports can still leak peers | Move |
| Editor lifetime | Existing keyed draft/task authority | Existing contracts plus matched probe: four cohorts and 16 guards pass | Retained task/commit cost; final production rerun required | Keep |
| Media dependencies | Optional installed-name lookup | Missing-destination whole-batch rejection; image-only and custom-schema proof | String lookup itself throws when absent | Cut hard dependencies |
| Authored model | Keep dedicated upload draft and completed URL schemas | Copy/history/static tests and fingerprint comparison | Expiring address persistence | Keep |
| Gateway | Direct copied upstream router | Auth, scope, size, Range tests and separate provider proof | R2 proxy and cleanup limits | Replace |
| UI activation | UploadKit separate from MediaKit | Registry clean install, media-only/static/DnD and ingress proof | Accidental peer dependency from copied imports | Split activation |

Public CDN URLs remain the simpler deliberate app policy when all media may be
public. They cannot satisfy private-document access or revocation and do not
justify a second Plate plugin. Reject a second adapter plugin, core promotion,
SDK method forwarding, generic
jobs, per-media pending unions and a persistent asset-reference framework.
None earns an independent current job. The draft/task owner survives because
React and a storage client cannot own committed document identity/history.

## Adoption inventory

| Boundary | Source owners and action |
| --- | --- |
| Package/API | Move `features/media/lib/media-upload` and `react/features/media/media-upload` to files ownership; retain MIME helper privately. Update `utils/plate-keys.ts`, media barrels, package manifest, tsdown configs and `tooling/entrypoints/entrypoint-dag.mjs`; generate partition scripts/tsconfigs/aliases. Add files-sdk optional peer and use exact 2.6.0 only for characterization until the error-status release gate is resolved. No root/media re-export. |
| Schema | Update `check-plate-schema-adoption.mjs`, optional generated editor contracts and persisted capability mapping. Preserve authored type/content; compare complete compiled schemas. |
| Copied ingress | `files.tsx`, `media-toolbar-button.tsx`, `dnd.tsx`, package clipboard/native-drop ownership, lifetime probe baseline DnD and editor inference contract. Colocate the upload renderer with `UploadKit`; do not retain a separate media-upload item. Keep named lookup guards in standalone DnD to avoid importing Files and pulling its peer. Slash has no upload action; do not add one. URL insertion remains media-owned. |
| Kit composition | Extract UploadKit from `media.tsx`; explicitly compose in `plugins.ts`, demo and multiple-editor consumers. `media-static.tsx` currently installs the uploader for null rendering: move that configuration to copied UploadStaticKit using BaseUploadPlugin with its null renderer, and compose it in `plugins-static.ts`. No new package descriptor/static entrypoint. Keep ordinary MediaStaticKit free of Files imports. A document with draft nodes explicitly needs its draft schema; completed-media-only static use does not. |
| Server | Replace registry `lib/uploadthing.ts` and `app/api/uploadthing/route.ts` with original Files setup and `/api/files` route; remove UploadThing deps. Scope SDK/provider peers to files server install items. |
| Registry | Replace media-uploadthing/media-uploadthing-api/uploadthing items. Update registry-features/components/lib/editor/examples/blocks graphs, media-demo, editor-plugins, static and fixed-toolbar consumers. Generate public/r, public/rd, indexes, docs payloads and manifests. Never manually edit templates. |
| Peripheral consumers | Settings dialog, command menu, docs icons, registry-pro metadata, clipboard proof route, UploadThing mocks in media-upload and table-node-selection tests. Reconcile only actual affected behavior. |
| Teaching/release | EN/CN media/DnD/installation/feature-kit/document-model docs; direct Files guide/API configuration; api-reference config/manifest; changeset and registry changelog. Current docs describe only the target state. |
| Doctrine/history | Repair affected source rules via Best API doctrine method, update smallest Vision owner, append Plate Next version, regenerate mirrors. Update editor protocol/parity evidence links, upload decision and bound execution outcome; preserve immutable reviews/versions/attestations. |

## Execution slices and proof

1. Implement the Files package and remove the generic protocol. Prove callback
   inference, whole-batch admission, roots, replacement, cleanup, retry/history,
   destination availability/schema overrides and the final production probe.
2. Migrate copied UI/kit activation and all actual entry points. Preserve
   preview object-URL lifetime, no remount restart and static omission. Update
   configuration failures and direct upstream progress presentation.
3. Resolve the published SDK error-status gate, then replace copied server/install
   wiring. Prove the gateway's explicit policy and 401/403 denials through a
   local actual installed SDK/gateway round trip and clean installed consumers.
4. Finish docs, exports, generated registry/schema/API artifacts, release and
   doctrine adoption. Migrate callers before deleting old exports; no shims.
5. Review final ownership, run required closure gates, record provider/native
   limitations and append a separately bound implementation outcome.

| Claim | Required production observation |
| --- | --- |
| Exact public typing | Inferred getUrl UploadOutcome/onError; real FilesClient accepted; async getUrl and conflicting slot/placement rejected; no annotation-based inference workaround |
| SDK behavior | Actual client with deterministic HTTP: presign/transfer/complete once, progress/failure/abort; stable absolute URL with encoded key; no app-authored transport |
| Lifetime correctness | Retain rejection-before-mutation, no start on rollback, committed editor, main/named roots, movement, removed/retagged slots, equal replacement, disposal, late callbacks, image bitmap cleanup, partial completion undo/redo and remount coverage |
| Durable delivery | Reload same address after signed expiry, another authorized collaborator, denied access and scope isolation; cross-document copy/rehome policy; redirect revocation window; trusted inline metadata; safe disposition and real media Range/seek behavior |
| Optional boundaries | Packed core/react/media imports and declarations without SDK; files with supported SDK; no AWS/server/Node code in browser closure; static completed-media consumer without SDK |
| Copied distribution | Both Base/Radix clean installations; Files-enabled and media-only kits; standalone DnD no missing-plugin exception; generated registry consistency; useful unconfigured setup |
| User interactions | Source-bound playground picker, file paste/drop, follow-up typing, cancel/retry/remount; exact native Chrome separately from managed Chromium or synthetic DnD |
| Server guarantees | Authenticate every request including proxy PUT after write revocation; `['upload','download']` and explicit-key rejection; exact recipe typecheck; 401/403 from installed SDK; same-origin cookie delivery without inherited client headers; stable secret across processes; overflow with/without Content-Length; request abort into Files |
| Live storage | Isolated R2 and S3 only when configured: progress, size limit, completion, stable download/range, abort and cleanup. An unrun provider case stays unclaimed. |

Retain meaningful tests when moving owners. Add only missing public-boundary
regressions above; do not test that an obsolete name is absent.

### Testing method adapted from Files SDK

Reuse the upstream **test layers**, not its test code or entire provider suite.
Its `test/files-api.test.ts` uses a memory adapter, fixed signing secret/time,
and real `Request`/`Response` objects to exercise the router as an HTTP
boundary. `test/files-client.test.ts` joins the real client to that router with
injected fetch/upload transport, then checks the complete
presign/transfer/complete round trip, progress, failures and aborts.
`test/files-client-edge.test.ts` tests XHR and fetch transport behavior
separately. `test/r2.test.ts` uses a fake S3 service, while `test/s3.test.ts`
uses SDK client mocks. `test/live-helper.ts` keeps credentialed provider tests
opt-in. `test/build-output.test.ts` inspects built entrypoint import graphs.

Apply those layers to **our** integration boundaries:

1. Test the copied `/api/files` policy via installed public SDK entrypoints,
   an in-memory adapter, fixed secret/time and real HTTP requests. Assert
   keyless upload, complete, scoped durable GET, explicit-key denial, revoked
   proxy-token denial **before bytes are stored**, size/origin/Range responses
   and exact 401/403 status. Do not depend on SDK private token helpers.
2. Join the real `FilesClient` to that copied route using deterministic
   transport injection. Assert one transfer/completion, original File,
   progress-to-task mapping, abort and error delivery through Plate's public
   submit/task surface. Keep a separate browser run for XHR, cookies, picker,
   paste and drop; injected fetch cannot prove browser credential behavior.
3. Test the actual built/published package across `files-sdk`,
   `files-sdk/api`, `files-sdk/client` and `files-sdk/next` in a clean install,
   then typecheck the copied recipe. Upstream router tests import source and
   its internal `FilesError`, so they cannot catch the 2.6.0 split-bundle
   500-on-denial defect. Assert the installed public error class maps to
   401/403, alongside Plate's absent-peer and server/client import boundaries.
4. Exercise the chosen R2/S3 configuration with a local fake service or
   provider mocks for repeatable signing/proxy/size behavior. Keep real
   credentialed R2/S3 checks isolated and opt-in, with separate receipts;
   neither mocks nor SDK's own test suite certify the deployed provider.

Run upstream's narrow relevant suites as dependency characterization when
changing the pinned SDK version. They are context, not a replacement for
copied-route, Plate-lifetime, clean-install or real-provider proof. Implement
only the named regressions our integration can introduce; avoid cloning
upstream's broad adapter matrix.
The [source-to-proof mapping](artifacts/official-files-sdk-integration/testing-methodology-evidence.md)
records the exact upstream test owners and the installed-package blind spot.

Existing exact commands (from repository scripts; execution, not design claims):

```sh
pnpm --filter platejs test:partition:media
pnpm --filter platejs test:partition:media-react
pnpm --filter platejs test:partition:dnd-react
pnpm --filter platejs typecheck:partition:media
pnpm --filter platejs typecheck:partition:media-react
pnpm --filter platejs typecheck:partition:dnd-react
pnpm --filter platejs typecheck
bun test ./apps/www/src/registry/components/editor/upload.spec.tsx
bun test ./apps/www/src/registry/components/editor/upload.lifecycle.spec.tsx
bun test ./apps/www/src/registry/components/editor/media-static.spec.tsx
pnpm --filter www test:www-browser:chromium tests/browser/clipboard-upload.spec.ts
pnpm brl
pnpm entrypoint:turbo:generate
pnpm entrypoint:turbo:check
pnpm --filter www editor:generate
pnpm --filter www editor:check
pnpm --filter www api-reference
pnpm --filter www check:docs
pnpm --filter www build:registry
pnpm --filter www test:create-install editor-basic editor-ai
pnpm --filter www typecheck
node tooling/scripts/check-plate-schema-adoption.mjs
node tooling/scripts/generate-ui-changelog-entries.mjs --check
pnpm plite:release:boundaries
pnpm plite:release:packages
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/runtime-entrypoints.test.ts
node .agents/rules/plate-next/scripts/version.mjs validate
```

Generate files/files-react partition commands from the DAG and run their actual
type/test membership as well; those commands do not exist before implementation.
Run copied suites separately to avoid existing Bun mock leakage and managed
browser suites serially. Bind source/build identity; do not transfer prior
passes. Add proposed `apps/www/src/registry/lib/files.spec.ts` for the copied
gateway's actual access/size/URL contracts and run it with Bun; it does not
exist yet. It must assert correct 401/403 responses, not merely no object
write. No live storage credential is needed for those local gateway tests.

## Scale contract — performance-observability

Retained task stores, commit subscription and per-task notifications make this
a scale-sensitive target, not a zero-runtime exemption. An embedded Benchmark
probe compares current production lifetime against a disposable actual-SDK
path injected at its existing transport boundary. The injection is a prototype
technique, never the intended retained API. Fake I/O isolates owner overhead;
it proves neither provider throughput nor browser paint.

Frozen contract: normal 20 blocks/1 file; large 1,000/3; stress 10,000/20;
pathological 1,000/100 active files. One warmup, five interleaved matched
samples; median/max and observed noise, no p99. Candidate overhead must stay
within baseline + max(50 ms, 50%). Count starts, SDK calls, active tasks and
notifications; guard no pre-commit start, abort and no late mutation/resource
after removal/replacement. Evidence includes source hashes and host identity.

The production rerun must use actual UploadPlugin with identical cohorts/budget
and refreshed source identity. No queue/cache/telemetry is justified by this
probe. Detector/privacy work is N/A: no production detector is proposed.
Rendering, image decode and live storage remain separate proof obligations.

Probe result: **pass**. The
[frozen contract](artifacts/official-files-sdk-integration/probe-contract.json)
and [final receipt](artifacts/official-files-sdk-integration/probe-run-2026-09-19T10-09-48-348Z-summary.json)
retain identities, raw samples, counters and noise. Baseline/candidate medians
in milliseconds: normal 7.46/4.57; large 16.49/14.19; stress 338.00/334.54;
pathological 168.65/175.74. All four meet the frozen overhead/noise rule;
this is not a speedup claim or an absolute editor latency certification.
One stress pair exceeds its pair budget; the frozen rule permits one and makes
two inconclusive. The raw failure is retained. See the
[probe analysis](artifacts/official-files-sdk-integration/probe-results.md).
Sixteen guards pass. Each candidate upload has exactly one presign, PUT and
complete call, one completion update, no restart from ten unrelated edits and
no retained task subscription after settlement. Counters describe observed
task resources/probe subscriptions, not every internal editor subscription.

Rerun command:

```sh
node docs/plans/artifacts/official-files-sdk-integration/probe-run.mjs
```

During execution, adapt only the candidate construction/submission to actual
UploadPlugin and the upstream progress shape; preserve the frozen baseline
snapshot, fixtures, budget, counters and guards. Replace the recorded temporary
SDK path with the exact project-installed peer path, bind its version/hashes,
and rerun the same command. The design prototype deliberately converts fraction
to the current numeric progress boundary; production must eliminate that bridge.
Image decode, browser XHR and real gateway/provider work are outside this probe.
The existing owner still scans active tasks on document commits and copies its
task map on additions/removals; bursts can therefore do quadratic aggregate
task work. This plan accepts the measured bounded integration, not an unlimited
scale guarantee. It does not introduce a scheduler to conceal that existing cost.

Two setup failures are retained: a Bun preload returned no onLoad object, then
a harness wrapper discarded update.value. The harness was repaired to return
the loaded source and preserve the update function's properties via Proxy.
No product code or guard was weakened. Both subsequent packets passed; the
final packet captures the source/dependency identities used for acceptance.

## Evidence and readiness

Current source: BaseMediaUploadPlugin and its upload/typed/schema tests,
BaseMediaPlugin, BaseImagePlugin, React adapter, copied media/media-upload/DnD,
registry install graph, package exports/DAG/compiler and behavior/vision owners.
Two independent bounded workers investigated server delivery and adoption;
their findings above include static peer leakage, schema fingerprints, the
absence of slash uploads, PUT authorization and R2 proxy behavior.

External evidence: `../files-sdk`, commit
`e87f630c17d5fa3e5f84adb3d81fc540c4b17348`, package 2.6.0, MIT. Decisive
SDK sources: client types/files-client/progress/transport; api/index;
internal/files-router handler/upload/download/keys; router-core/web;
r2/index, s3/core, content-type/index and validation/index. Reuse the bound
[official review](artifacts/upload-draft-asset-protocol/files-sdk-official-review.md)
and [provider evidence](artifacts/upload-draft-asset-protocol/files-sdk-review.md).
The [published-gateway characterization](artifacts/official-files-sdk-integration/gateway-policy.spec.ts)
and its [observation log](artifacts/official-files-sdk-integration/gateway-policy.observation.log)
pass four diagnostic cases against installed 2.6.0. They prove the wrong
operation list, proxy authorization bypass, missing bearer header on proxy PUT,
and broken denial status. Passing these observations is **not** a gateway
acceptance result; the production test must expect 401/403 after SDK repair.
Rerun with `FILES_SDK_PACKAGE_ROOT` pointing at a clean installed `files-sdk`
package; the diagnostic deliberately asserts the current 2.6.0 defect.

The earlier [draft implementation](2026-09-19-upload-draft-asset-protocol.md)
has historical proof but lacks a reconciled source-bound execution outcome.
Do not retrospectively certify it; recheck the laws used by this integration.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Scope and authority | yes | Official SDK, one optional feature, design-only boundary |
| Current owners and hard cut | yes | Live source, API and decision ledger |
| Scale applicability | yes | Explicit retained machinery and embedded contract |

Work Checklist:
- [x] Resolve public call shape, deletion alternatives and owners.
- [x] Resolve durable addresses, local/persisted state and editor lifetime.
- [x] Resolve source-backed server constraints and application responsibilities.
- [x] Map adoption, production proof and execution order.
- [x] Complete the bounded design probe and reconcile its result.
- [x] Validate the final plan and prepare its bound design outcome.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve API, adoption and proof | Contract, adoption inventory and passing design probe |
| Pre-acceptance scale proof | yes | Frozen matched comparison | Four cohorts and 16 guards pass; final receipt above |
| Production rerun | yes | Same cohorts/budget against final owner | Exact rerun command and candidate-adaptation boundary above |
| Independent bounded research | yes | Consume findings | Server and adoption findings incorporated |
| P1 autoreview | no | N/A on next, no PR | Source-based design review only |
| Goal plan check | yes | Run check-complete | Source-bound plan validation before outcome recording |

Verification evidence:
Source research and adoption mapping complete. The disposable probe passes;
existing upload/schema/React contracts pass 27/27 with 93 assertions across
three files; see [correctness receipt](artifacts/official-files-sdk-integration/probe-correctness.json).
The four published-gateway characterization cases pass, but they expose a
shipping gate on error status and do not prove browser cookies or live storage.
Final planning validation uses:

```sh
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-official-files-sdk-integration.md
git diff --check -- docs/plans/2026-09-19-official-files-sdk-integration.md docs/research/decisions/uploads-ownership.md
node tooling/scripts/review-ledger.mjs render
node tooling/scripts/review-ledger.mjs check
```

The initial bound design outcome is
`2026-09-19-uploads-files-sdk-design`. This final audit changes the plan and
requires a new append-only, source-bound outcome; preserve the original record,
reconcile the new ID in the uploads decision, then render and check the ledger.
This receipt closes design, not product adoption or real-provider/native-browser proof.

Final handoff prepared:
Task owns the five execution slices above, including required generation,
doctrine repair and source-bound proof. This turn stops at the completed design.

Open risks:
- Published SDK 2.6.0 misclassifies app-thrown `FilesError` denials as 500;
  shipping requires a proven fixed installed release or an explicitly accepted
  application-owned response boundary. Recheck the installed version/source.
- Proxy tokens remain usable until expiry unless `files(req)` checks current
  write permission. Client bearer headers do not reach proxy PUT or media GET.
- Signed download redirects retain their own expiry window; document-scoped
  assets need an explicit destination policy for cross-document copies.
- R2 proxy bandwidth and host body/time limits can constrain demo limits.
- Credentials/access policy require app setup; completion cannot certify byte
  safety or remote rollback. Live provider and native file-DnD remain unproven.
- The bounded headless probe passes; final production source, browser XHR,
  image decoding and live gateway/provider paths still require their own proof.
- Historical broad typecheck/schema failures cannot become passes by inference.
