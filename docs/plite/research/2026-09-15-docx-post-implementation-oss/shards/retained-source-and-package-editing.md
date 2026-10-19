# Retained source and package editing

Read-only source and GitHub history reassessment for the `documents` Best API
Review on 2026-09-15. All repositories were inspected from local clones at the
revisions in `source-manifest.json`. GitHub issue and pull-request pages supplied
failure history and intent, not implementation proof.

## What the strongest engines actually own

| Engine          | Canonical authority                                 | Preservation mechanism                                                            | Important limit                                                                                                |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| OpenDoc         | normalized document plus source envelope            | retained opaque parts, compatibility report, semantic/preserve/exact export modes | regenerated body references can leave preserved parts unreachable                                              |
| Scriptor        | CRDT semantic model plus process-local source parts | whole-part passthrough, raw run atoms, dirty header/comment rewriting             | persisted CRDT snapshots exclude source parts; its measured `document.xml` whitelist still loses many elements |
| Folio           | typed DOCX model projected through ProseMirror      | original package, selective paragraph patching, guarded full repack               | safety requires a large invalidation matrix and fallback path                                                  |
| EigenPal 2.x    | canonical typed/generic OOXML package tree          | edits map back to minimal tree operations; unknown nodes remain in the tree       | this architecture makes DOCX, not a general rich-text schema, the product model                                |
| docx-cli        | OOXML AST plus generic OPC package                  | the `Document` facade owns the loaded ZIP and writes selected views               | designed for bounded command surgery, not arbitrary Plate editing                                              |
| docx-redline-js | package-entry map plus surgical revision operations | cloned working entries, revision token, validation delta and rollback             | custom ZIP ingress has no expanded-byte or ratio ceiling                                                       |
| Open XML SDK    | typed OOXML DOM plus package graph                  | unknown elements remain lazy raw XML or generic nodes; package owns parts         | SDK substrate does not define a browser rich-text conversion job                                               |
| python-docx     | typed known parts plus generic OPC parts            | every reachable part is loaded and re-written through the package graph           | semantic support remains intentionally narrower than Word                                                      |

The common law is not “keep a ZIP.” The common law is that preservation state
has identity and a lifetime, and that an edit either maps to the retained source
or invalidates the affected source unit.

## Evidence that changed the Plate decision

OpenDoc implements the cleanest detached shape for Plate's current architecture.
Its import artifact contains a normalized document, resources, a compatibility
report and an opaque source envelope. Export distinguishes semantic,
preserve-when-safe and exact-if-unchanged behavior. A mismatched envelope is
diagnosed instead of silently trusted. This directly disproves the prior claim
that an explicit retained source necessarily creates competing document truth.

Scriptor supplies the strongest persistence warning. `from_docx_bytes` retains
the original parts, but its CRDT snapshot does not. Reconstructing from the
snapshot produces a minimal package until callers reattach the immutable source
parts. Its own corpus documentation also separates whole-part fidelity from
inside-part fidelity: regenerated `document.xml` still loses unmodeled elements
unless a raw span or typed node owns them. An opaque source token without
provenance would repeat that failure in Plate.

Folio supplies the strongest edit-aware implementation. It overlays changed
paragraph XML on the original archive when change tracking proves that the edit
is local and falls back to a full repack for structural changes, untracked
changes, new relationships, unsafe paths, invalid models, orphan comment ranges
and other cases the splice cannot explain. Its September repair for preserving
every unmodeled package part and its formatting-provenance repair show why the
invalidation table is core architecture rather than cleanup.

EigenPal demonstrates the maximum-fidelity replacement: one typed/generic
OOXML tree, one package transaction owner and a ProseMirror projection whose
reverse path emits minimal tree operations or refuses. That is coherent because
the product is a DOCX-native editor. Adopting it in Plate would replace the
cross-format Plate document with Word's package vocabulary and duplicate math,
emoji, media, table, comments and custom-node ownership.

The surgical tools confirm a useful proof technique. docx-cli mutates a loaded
package in place and docx-redline-js clones package entries, validates only
introduced errors, and rolls back atomic failures. Their package inventories
make unrelated part changes directly observable. Neither supplies a general
mapping from arbitrary Plate edits to original OOXML.

## GitHub failure history

- EigenPal issue 56 documented a no-op semantic/ProseMirror save that dropped
  page and line breaks. The project closed it after moving 2.x to OOXML-tree
  authority.
- EigenPal issue 70 documented header image parts multiplying on every no-op
  save. It was fixed by the same 2.x architecture, demonstrating that retaining
  originals without ownership-aware reuse can also grow and corrupt packages.
- EigenPal issue 113 remains open and reports merge-field and formatting damage;
  a maintainer says 2.x should avoid it, but the attached report is not current
  2.x proof.
- Folio PR 697 replaced a preservation allowlist that dropped embeddings,
  macros and unknown parts. Folio PR 795 then repaired authored formatting
  provenance. Issue 806 separately showed comment edits disappearing at the
  React state boundary despite correct package machinery.
- OpenDoc PR 98 introduced its opaque retained-parts side table and explicitly
  excluded invalidated digital signatures. It also states that body-referenced
  opaque parts can survive as bytes while becoming orphaned.

These failures are not reasons to reject preservation. They show the dimensions
that the Plate design and proof must name independently: package admission,
part reachability, source identity, owned-part invalidation, semantic reopen,
review behavior, UI persistence and resource cost.

## Plate comparison

Plate's adopted API already gets several hard laws right:

- one successful import document or explicit failure;
- one immutable model capture for projection-aware export;
- structured diagnostics and bounded ZIP/XML work;
- a digest-bound private authored envelope;
- installed Plate codecs as the semantic schema owner;
- Word clipboard policy in `WordPastePlugin`.

The missing capability appears in Plate's own first-party flow. Import replaces
the complete model document and discards the source package. Export later
generates a new package from static HTML. The docs accurately disclose omitted
headers, footers, notes, fields, drawings and imported media, but a user who
imports a Word file, edits one paragraph and exports it still loses unrelated
Word content. Honest diagnostics do not satisfy preservation.

## Design candidates

### A. Keep conversion only

Keep the current API and document that Word export always creates a new
semantic package. This remains the right default and a valid explicit product
choice. It is insufficient for the existing import, edit, export workflow.

### B. Explicit retained-source artifact

Selected direction. An opted-in import returns an opaque artifact bound to the
admitted source package, imported semantic baseline, schema and review/comment
correspondence. Export accepts that artifact explicitly. It can return original
bytes for a proven unchanged matching review projection, preserve source units
whose provenance remains valid, and fall back to semantic generation with
diagnostics elsewhere.

Proposed shape for the next design owner, not an accepted final spelling:

```ts
const imported = await importDocx(model, file, {
  retention: "preserve-when-safe",
});

if (imported.ok) {
  model.update.value.replace(imported.document);
}

const exported = await exportToDocx(model, {
  projection: "review",
  source: imported.ok ? imported.source : undefined,
});
```

The type design should avoid making `source` look available when retention was
not requested. The plan must compare overloads, a discriminated success arm,
and a separate explicit source result without adding a generic document
framework.

### C. Hide source in editor state

Rejected. It gives generic editor persistence a large format-specific payload,
allows wrong-document pairing, and makes disposal and reattachment invisible.

### D. Add `DocxSession`

Rejected for the current job. A session is coherent when it owns native DOCX
commands and the OOXML model. Plate already owns editing, transactions,
selection and persistence; a second facade would mirror them.

### E. Replace Plate with an OOXML tree

Rejected. It wins Word fidelity by changing the product into a Word editor.

### F. Patch XML surgically for every edit

Rejected as the general export path. It is valuable inside candidate B for
mapped edits and as a proof oracle. Arbitrary custom Plate nodes and configured
static serializers require semantic generation when no source mapping exists.

## Required design and proof laws

1. Source retention is opt-in and bounded by the existing package admission
   policy before any bytes become durable state.
2. The source artifact is immutable, opaque, disposable and tied to one import
   identity, schema fingerprint and semantic baseline.
3. Exact source reuse requires a matching unchanged review projection and
   matching comments/resources; accepted or proposed projections are semantic
   transformations.
4. Preserve-when-safe names preservation dimensions. Whole-part retention,
   relationship reachability and inside-part XML preservation are separate.
5. Every edit maps to a source unit or invalidates it. Unexplained structural
   changes fall back or fail; they never reuse stale source XML.
6. Digital signatures, unsafe relationships and other invalidated package
   claims are dropped with diagnostics.
7. Current Plate diagnostics remain the only public compatibility owner.
8. Proof compares an allowlist of changed package entries, semantic and review
   reopen results, browser workflow, native office readability, memory and
   complete-operation time. A no-op package diff or semantic equality alone is
   insufficient.

## Verdict

`Pursue` a Task design plan for explicit retained-source preservation. This
supersedes only the prior blanket deferral. It does not reopen the adopted
semantic import/export contract, Word paste ownership, projection law, package
limits, diagnostics owner or feature-package boundaries.
