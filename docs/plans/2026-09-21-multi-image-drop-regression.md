# Multi-image filesystem drop regression

Status: Complete

## Outcome

Dropping three filesystem images into the playground creates three completed
image nodes without a React DOM ownership error or abandoned upload drafts.

## Scope

- Reproduce the reported three-image filesystem drop in Chromium.
- Trace the `removeChild` exception to the exact detached DOM child and owner.
- Preserve upload task authority and failed-draft retry across the authored
  playground view.
- Prove all Files SDK operations, final model nodes, and browser runtime health.

## Acceptance

- Three dropped PNG files each complete the Files SDK presign, PUT, and complete
  sequence.
- The playground gains three image nodes and retains no upload drafts.
- A failed authored-view draft can retry through its existing slot.
- React does not throw `NotFoundError` while upload previews mount or unmount.
- Package lifecycle and Chromium regression checks pass on final source.

## Resolution

Upload progress chrome changed beneath the canonical void element without an
owned noneditable DOM boundary. Plite's integrity repair removed that chrome,
then React attempted to remove the already-detached node. One persistent
`contentEditable={false}` wrapper now owns all dynamic upload UI while the
canonical spacer remains a direct editor child.

The first completed upload also canceled its siblings in authored views, and a
failed draft could not retry through its slot. Tasks were keyed in the
admitting view, while cleanup and slot admission validated those keys in the
source editor's separate key space. Every key lookup now names its owning view,
and each task retains the view that admitted it.

## Evidence

- `BaseUploadPlugin.lifecycle.spec.ts` proves three drafts admitted through an
  authored markup view all complete and release their task resources, and a
  failed authored draft retries through the same slot.
- Chromium dispatches one native-style drop with three PNG `File` objects,
  observes all nine Files SDK operations, three added image nodes, zero upload
  drafts, zero cancel controls, and no page or console errors.
- The fresh-server Chromium upload and adjacent DnD suites pass all five tests.
- Upload package tests pass 26 checks across five files; upload and upload React
  typechecks, focused Ultracite, registry freshness, and `git diff --check`
  pass.
