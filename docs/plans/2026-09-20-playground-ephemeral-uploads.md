---
review_scopes:
  - uploads
review_basis:
  - 2026-09-19-uploads-official-files-sdk
work_kind: implementation
---

# Playground ephemeral uploads

Status: Complete

Objective:
Let visitors exercise uploads in the deployed Plate playground without shared
storage cost, while keeping the copied upload kit on the real Files SDK gateway.

Goal plan:
`docs/plans/2026-09-20-playground-ephemeral-uploads.md`

Template:
`docs/plans/templates/task.md`

Task source:
- The user selected browser-local ephemeral uploads after comparing Files SDK
  memory/filesystem adapters with deployed serverless constraints.
- Uploaded bytes must stay in the visitor's browser and disappear when the
  playground session ends.

Completion threshold:
- The deployed playground can select a local image and render a completed media
  node without calling `/api/files`.
- The copied `UploadKit` and `/blocks/files-sdk-proof` retain the real Files SDK
  client and gateway behavior.
- `UploadPlugin` accepts the narrow upload capability it actually consumes.

Verification surface:
- `platejs/upload` source typecheck and focused contracts.
- Registry generation/typecheck for the changed example and kits.
- Chromium interaction proof on `/blocks/playground`, plus the existing real
  Files SDK browser proof.

Constraints:
- Branch `next`; Task Autoreview is unavailable by branch policy.
- Blob URLs are session resources, never durable document URLs.
- Do not weaken the default media URL policy or silently fall back from a
  misconfigured production gateway.

Boundaries:
- Package upload capability type, playground-only plugin descendants, browser
  proof, generated registry output and upload ledger closure.
- No deployment, provider mutation, publication or server storage redesign.

Timing:
N/A.

Blocked condition:
A browser or package failure that cannot be reproduced or repaired from the
current checkout.

Task state:
- current_phase: implementation
- next: implement the narrow client and playground-local overlay

Work Checklist:
- [x] Capture the requested outcome, authority, current owners and governing upload review.
- [x] Reject server memory/filesystem for deployed serverless docs and preserve the real copied gateway.
- [x] Narrow the plugin client contract and adopt the playground-only ephemeral implementation.
- [x] Prove the playground makes no gateway request and the copied Files SDK route still does.
- [x] Reconcile package, registry, generated output, review ledger and final evidence.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Ephemeral lifetime | Playground example | Per-editor object URLs, revoked on editor disposal | Server `memory()`/`fs()` are not shared or durable across deployed serverless requests | Chromium rendered the selected PNG from a session `blob:` URL |
| URL policy | Media destination descriptors | Playground descendants accept only URLs minted by their session | Globally allowing `blob:` would make ephemeral URLs look persistable | package typecheck and Chromium image proof |
| Production path | Copied `UploadKit` | Preserve `createFilesClient('/api/files')` | Silent local fallback would hide broken application configuration | Chromium retained the POST/PUT/POST gateway sequence |
| Client contract | `BaseUploadPlugin` | Structural single-file `UploadClient` using Files SDK call/outcome types | Requiring the full Files SDK client forces unrelated fake methods | package typecheck, typed contract and focused lifecycle tests |
| Completion owner | `BaseUploadPlugin` | Finish through the active editor view captured at admission | The base plugin editor cannot resolve authored-view node keys | authored-view package regression and playground browser proof |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package API | complete | Platejs typecheck and upload contracts | 88 typecheck partitions; 25 focused tests |
| Registry | complete | Build/check generated registry | 317 canonical payloads; fresh generation `02ce659c11d4ef5a9f1d055840217e30ec9256885d54c9080c608f737876c9c9` |
| Browser | complete | Playground ephemeral upload and existing gateway upload | 2 Chromium cases passed |
| Review history | complete | Record and reconcile execution | execution record and rendered ledger checks |

Verification evidence:

- `pnpm --filter platejs typecheck`: 88/88 tasks passed.
- `pnpm --filter platejs test -- BaseUploadPlugin`: 25 tests passed.
- Focused copied upload/DnD tests: 4 tests passed.
- `pnpm --filter www build:registry` and `--check`: generated 317
  canonical payloads and reported the generation fresh.
- `pnpm --filter www test:www-browser:chromium files-sdk.spec.ts`: both
  the copied real gateway and deployed playground cases passed. The real path
  retained POST/PUT/POST; the playground rendered a decoded `blob:` image,
  removed the live draft UI and made no `/api/files` request.
- Plate Next v225 validates with matching doctrine fingerprint and generated
  skill mirrors. Targeted Ultracite and diff hygiene checks pass.

Findings and remaining work:

- The first browser probe exposed a real completion bug: async upload work
  retained an authored-view key but tried to complete through the base plugin
  editor. Completion now uses the active update editor captured by the
  admission transaction.
- The app-wide TypeScript pass previously reached only the unrelated existing
  `HistoryPlugin.ts(23,14)` TS2589 diagnostic. A final 8 GB rerun produced no
  diagnostics after more than seven minutes and was terminated. The changed
  package's source-first typecheck and every focused registry/browser boundary
  pass.
- Blob URLs intentionally disappear when the editor session ends. The copied
  kit remains the durable Files SDK recipe for applications.

Final handoff:

- Outcome and owning fix: the deployed playground uses an editor-owned
  ephemeral `UploadClient`; `BaseUploadPlugin` owns the minimal capability and
  completes through the admitting editor view.
- Proof and limits: package, registry and Chromium boundaries pass; the broad
  app compiler limit is recorded above.
- Local / integrated / published state: implemented and generated locally;
  no deployment, commit or publication was requested.
- Next action or completion: complete.

Timeline:

- 2026-09-20 Plan created after source and deployed-lifetime inspection.
- 2026-09-20 Implemented the ephemeral playground client and narrow public
  capability, repaired authored-view completion, regenerated registry output,
  passed focused package/registry/browser proof, and advanced Plate Next
  doctrine to v225.

Open risks:

- Production storage policy remains an application concern; this playground
  path deliberately provides no persistence across refresh or sharing.
