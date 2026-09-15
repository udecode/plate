---
title: Neutral editor public names
type: decision
status: accepted
updated: 2026-09-13
review_scope: editor-public-naming
review_history:
  - ../review-records/2026-09-12-editor-public-naming.json
  - ../review-records/2026-09-12-editor-public-naming-components.json
  - ../review-records/2026-09-12-editor-public-naming-editable-comparison.json
  - ../review-records/2026-09-13-editor-public-naming-closure-audit.json
source_refs:
  - ../../plans/2026-09-12-plate-public-docs-audit.md
  - ../../plans/2026-09-12-editor-public-naming-adoption.md
related:
  - plate-core-ownership.md
---

# Neutral editor public names

The user accepted this direction with “Ok go all.” The neutral top-level source
API, DOM/codec boundary, copied UI and public documentation are adopted. A
2026-09-13 hard cut also closes the nested public test contract, browser-test
protocols, public JSDoc and Plate's emitted declaration provenance. Prior
branded clipboard, authored HTML/DOCX, mention and media formats are not a
supported input domain; the adopted codecs have no compatibility fallback.
[The adoption plan](../../plans/2026-09-12-editor-public-naming-adoption.md)
owns the complete mapping and verification. The assessment below preserves the pre-adoption comparison and
its original source-only evidence limits. Immutable review records are unchanged.

**Pursue neutral public exports and one `data-editor-*` DOM vocabulary.**
Remove brand spelling at the canonical owner, then have Plate expose the same
contract. Do not preserve two naming dialects through Plate-only aliases or
dual DOM attributes. Package imports already identify the distribution.

## 2026-09-13 closure audit

The public boundary is closed: 67 source entrypoints expose 2,962 export
occurrences and 68 emitted entrypoints expose 2,958 occurrences without a
`Plate` or `Plite` identifier. All 3,024 resolved exported declarations are
neutral. No owned `data-plate-*` or `data-plite-*` attribute remains.
`@platejs/test/proof` exposes `editorSelection`, and all observable browser
protocol keys use `__EDITOR_*` with no compatibility aliases.

Plate's bundled declarations contain no `plitejs` module reference, resolve no
public symbol to the substrate declaration tree, and contain no public JSDoc
that teaches Plite. All 253 Plate documentation MDX/JSON files were checked;
the 27 matching lines occur only in the approved performance comparison, the
two migration sources, and their generated navigation metadata.
[The audit artifact](../../../.audit/plate-public-docs/public-api-and-plite-docs-audit.md)
records the complete dispositions and reproduction commands.

The declaration publication boundary bundles the substrate declarations under
Plate ownership. It does not create Plate aliases or a second type owner.

The strongest cut is to remove unnecessary public internal concepts before
renaming the useful ones. Use `Editor` when it distinguishes an editor-specific
job; use ordinary domain names such as `Selection`, `NodeKey`, `Decoration`,
`Plugin` and `definePlugin` when those already state the job. Replacing every
brand prefix with `Editor` would retain unnecessary conceptual noise.

This is a direction review, not a completed symbol-by-symbol design or an
implementation. The user explicitly asked whether the naming change merits
pursuit. Package names and internal implementation identifiers are not being
renamed by this decision.

## Current job and hard laws

Application authors should learn the Plate editor API without learning the
internal distribution's name. Autocomplete, inferred declarations, rendered
source, CSS hooks and documentation must agree on one public vocabulary.

Preserve callback inference, descriptor and facade identity, headless/static
entrypoint safety, native selection and DOM mapping, mounted-view isolation,
nested editors, Shadow DOM, portals, static/live rendering, exact clipboard
payloads and saved authored history. The brand spelling itself is not a
correctness or ownership law.

## Current versus proposed

The right column is a proposed direction; these imports do not all exist today.

| Current public name                            | Proposed target                                                                         | Owner                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `PliteDecoration`, `PliteDecorationAttributes` | `Decoration`, `DecorationAttributes`                                                    | Core declaration, directly reexported by Plate         |
| `usePliteHistory`                              | `useEditorHistory`                                                                      | React runtime hook, directly reexported by Plate       |
| React `PlateElement` and static `PliteElement` | `EditorElement` in each respective React/static entrypoint                              | Each component's current implementation owner          |
| `definePlatePlugin`                            | `definePlugin` from `platejs/react`; review corresponding headless constructor together | Plate plugin authoring owner                           |
| `data-plite-editor`                            | `data-editor`                                                                           | Runtime mount marker                                   |
| `data-plite-node`, `data-plite-node-key`       | `data-editor-node`, `data-editor-node-key`                                              | Runtime DOM producer and resolver                      |
| `data-plite-keep-selection-visible`            | `data-editor-keep-selection-visible`                                                    | Runtime behavior; controls emit the same marker        |
| `data-plite-inactive-selection`                | `data-editor-inactive-selection`                                                        | Runtime paint output; copied UI styles it              |
| `data-plate-authored`                          | `data-editor-authored`                                                                  | Authored HTML codec; encoder and decoder move together |

A representative proposed customization remains literal and direct:

```tsx
import { EditorElement, useEditorHistory } from "platejs/react";

// Inside a toolbar component bound to the existing editor view:
const { canUndo, undo } = useEditorHistory({ editor });

<button data-editor-keep-selection-visible disabled={!canUndo} onClick={undo}>
  Undo
</button>;
```

No attribute-name configuration object, public lookup registry, wrapper hook,
second provider or runtime state is required for the naming change.

## Component naming refinement

The follow-up comparison reaffirms `EditorRoot` and `EditorContent` over
`EditableRoot` and `EditableContent`. Stop the proposed rename: it introduces
an editability term without improving the distinction between the editor
instance, React composition scope and document surface. `Editor`, `EditorRoot`
and `EditorContent` are distinct identifiers. The content also supports
read-only presentation. Merging root and content would remove the independent
composition scope used by controls and custom content layouts; renaming the
root `EditorProvider` would conflate it with passive control binding.

This is a conventional naming pattern, not an industry-mandated pair.
[Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
uses `Root` and `Content`; [Base UI Dialog](https://base-ui.com/react/components/dialog)
uses `Root` and `Popup`; [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react)
uses `EditorContent`. These official pages were checked on 2026-09-12.
The conclusion is a naming judgment from current source and precedent;
no product code or runtime behavior changes in this follow-up.

The user's follow-up explicitly prefers `data-editor-authored` and requests
harsh honest feedback on keeping `<Plite>` / `<Plate>`. **Do not keep those
public component names. Prefer `EditorRoot` in each distribution's React
entrypoint.** The package path identifies the implementation; the name describes
the component's role. An application consumes one root component, while Plate's
internal composition can still use the runtime root privately.

This is the proposed Plate call site:

```tsx
import { EditorRoot } from "platejs/react";
import { Editor } from "@/components/editor/editor";

<EditorRoot editor={editor}>
  <Editor />
</EditorRoot>;
```

The same public noun in `plitejs/react` does not imply identical prop contracts
or force one implementation. The runtime owns view lifetime, selection and
decoration services; Plate retains its plugin presentation, callbacks and scope
integration where those serve current jobs. Do not export both branded and
neutral roots from Plate, and do not teach the private root composition.

Keeping `<Plate>` as a sole brand exception is readable but provides only
product identification already supplied by the import. It loses under the
user's explicit neutral-vocabulary requirement. `<Editor>` implies the visible
editor and overlaps the model type and copied complete composition. `EditorRoot`
states the parent composition role without renaming the existing useful model
or visible editor. `EditorProvider` remains justified for the independently
used passive scope: [toolbar overlays](../../../apps/www/src/registry/components/editor/toolbar-overlay.tsx:78)
bind an existing editor without creating another mounted editor view. Merging
it into the mounted root would change lifecycle; adding a mode to make one
component mean both jobs would obscure the normal path.

The strongest justified cut is the second public brand vocabulary. Deleting
the runtime root itself would lose the view work performed by
[Plite](../../../packages/plitejs/src/react/components/plite.tsx:200); deleting
Plate's integration is not justified merely to achieve the same public name.
No wrapper, provider, store or runtime layer is added by this target.

This refinement settles the preferred root component name and authored marker.
It reaffirms the prior direction and its data-preservation requirements. Other
export names remain outside this bounded component judgment. No rename has been
implemented and no runtime parity claim is made.

## Decisive evidence

- [React exports](../../../packages/platejs/src/react/core.tsx:40) publish
  `Plite*` names; the [core decoration declarations](../../../packages/plitejs/src/interfaces/decoration.ts:9)
  own those names. Correcting only Plate export labels leaves the source and
  declaration vocabulary split. Rename neutral declarations at their owner.
- [Static components](../../../packages/platejs/src/static/components/plite-nodes.tsx:78)
  are Plate-owned implementations with Plite-branded public names. Their
  [copied consumer](../../../apps/www/src/registry/components/editor/paragraph-static.tsx:2)
  demonstrates the actual user-facing import. No second implementation is
  needed to remove that brand.
- [History controls](../../../apps/www/src/registry/components/editor/history-toolbar-button.tsx:4)
  import the runtime hook through Plate. The rename must preserve its exact
  view binding rather than add another abstraction around undo/redo.
- [Mounted editor](../../../packages/platejs/src/react/components/Plate.tsx:51),
  [passive provider](../../../packages/platejs/src/react/components/EditorProvider.tsx:7),
  and [copied Editor composition](../../../apps/www/src/registry/components/editor/editor.tsx:95)
  have different jobs. Renaming `<Plate>` to `EditorProvider` collides with a
  provider that deliberately creates no model or mounted view; renaming it to
  `Editor` collides with the current copied composition. Settle the surviving
  primitive and composition names together. A mounted-root name such as
  `EditorRoot` is a candidate, not a reason to add a new owner.
- [Editable](../../../packages/plitejs/src/react/components/editable.tsx:485)
  emits root markers; [inactive-selection behavior](../../../packages/plitejs/src/react/inactive-selection.ts:11)
  reads application markers and emits paint attributes; the
  [copied editor skin](../../../apps/www/src/registry/components/editor/editor.tsx:65)
  consumes those outputs. DOM names are behavior contracts, not just branding.
- [Clipboard runtime](../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts:39)
  serializes fragment attributes and format keys into HTML. The
  [authored HTML codec](../../../packages/platejs/src/static/authoredHtml.ts:17)
  recognizes an exact branded envelope; at line 99 a mismatch bypasses
  authored decoding and proceeds to ordinary HTML content. Renaming these is
  an interchange-format change, with a separate data-preservation obligation.

## Alternatives

| Direction                                                                                        | Judgment                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep names; hide them in docs                                                                    | Loses. Types, examples and CSS still teach two distributions.                                                                                                                                                      |
| Plate-only neutral reexport aliases                                                              | Loses as the final design. Keeps two public vocabularies and recurring facade/declaration reconciliation. Rename the shared neutral source instead.                                                                |
| Replace every prefix with `Editor`                                                               | Too mechanical. Retains public internals and conceals provider/model/view collisions. Preserve precise domain nouns.                                                                                               |
| Delete unnecessary public helpers and internal-detail teaching, then rename the needed contracts | Strongest cut. Each retained export or attribute must have a current consumer job. The announcer marker is test-only in inspected source; private DOM identity fallbacks are not proven deletable.                 |
| One neutral runtime DOM vocabulary inherited by both distributions                               | Pursue. Removes brand-specific coordination while retaining one behavior implementation.                                                                                                                           |
| Remove all DOM attributes in favor of private bindings                                           | Loses as a blanket replacement. External controls, styles, DOM repair and clipboard HTML consume literal hooks; replacing them would require different machinery. Private-only markers can be assessed separately. |
| Configurable attribute prefix, dual emission or a new DOM registry                               | Reject. Adds coordination and potentially runtime work for a naming problem.                                                                                                                                       |
| Delete the runtime package or rewrite the rendering architecture                                 | Unsupported by this job. Public vocabulary can be neutral with the existing ownership and lifetime boundaries.                                                                                                     |

## DOM scope and data preservation

`data-editor-*` is a convention, not a globally exclusive namespace or proof of
ownership. The repository already uses `data-editor` in a decoration test and
`data-editor-count` in a demo. This does not disqualify the prefix, but the claim
that nobody uses it is not established. Runtime resolution must retain exact
registered-mount and nearest-editor checks; a matching attribute alone cannot
authorize a foreign node. Preserve existing root/view distinctions and all
Shadow DOM/portal behavior during adoption.

The [integrity observer](../../../packages/plitejs/src/dom/plugin/dom-integrity-observer.ts:126)
also treats a branded prefix as repair-relevant. Changing that to every
`data-editor-*` mutation would classify unrelated application attributes as
runtime work. The target should recognize its exact owned attributes, keeping
the list private to the existing DOM owner. This classification change needs
focused behavior proof during adoption; it adds no public registry or store.

The [announcer](../../../packages/plitejs/src/react/components/editor-announcement-live-region.tsx:94)
already exposes `role="status"`, `aria-live` and `aria-atomic`. Its branded
marker has no runtime consumer in the inspected package/app source. Remove
that marker and test accessible output rather than renaming it. Conversely,
[node-path lookup](../../../packages/plitejs/src/dom/plugin/dom-node-path.ts:83)
still uses path/key attributes when private bindings are unavailable; deleting
those requires separate evidence. Combining root-presence and root-key markers
is another design candidate, not an accepted deletion of their distinct facts.

Do not treat runtime DOM markers, serialized clipboard HTML, MIME names and
authored envelopes as interchangeable strings. Use neutral wire names at each
current encoder and decoder and update payload fixtures with them. The user
excluded prior branded formats from the supported input domain, so retaining a
fallback would create a second dialect without a current product requirement.

## Verdict, proof limits and next owner

**Pursue.** The material gain is one discoverable public vocabulary across
imports, inferred types, UI source, CSS and docs. The spelling change introduces
no runtime layer, cache, scheduler or changed lifetime, so no scale experiment
is needed to accept this direction. Any later proposal to replace DOM lookup or
remove a runtime owner must earn its own behavior and applicable scale proof.

Current evidence is source inspection plus one bounded independent DOM review.
Existing tests were located, not replayed. This does not prove browser parity,
data migration safety, packed-export completeness, or an exhaustive naming map.

Next: `$best-api design neutral public names across platejs and its runtime:
resolve Editor/model/provider/view and plugin naming collisions; define one
data-editor DOM contract and separate clipboard/authored format migrations`.
Best API is the first owner because the exact surviving React and plugin nouns
remain unsettled. Do not begin product implementation from this review alone.

This extends the earlier docs audit's naming debt into a source-level direction.
It does not supersede the distinct installed-capability ownership review or its
adoption. Reusable authoring doctrine still needs repair when an API target is
adopted; this assessment records that obligation without changing rules.

The immutable review record and all captured source hashes passed validation;
lookup reports matching evidence. Decision links and ledger structure also
passed. The global ledger freshness check was already failing before this
review and still fails on unrelated changing source inventory (`registry/blocks`
at baseline, `plitejs/authored` at closure). No unrelated inventory or proof
status was refreshed to make this review appear globally clean.
