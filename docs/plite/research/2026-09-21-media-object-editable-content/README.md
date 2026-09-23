# Selectable media objects with editable content

Status: Complete — direction reviewed; product design and implementation open

Scope: Best API Review of the media object boundary in Plite, ProseMirror,
WordGard and Lexical. This is a bounded source comparison, not an
implementation plan or a full editor audit.

Question: What owns the distinction between selecting a media asset and
editing its caption, while preserving the asset when its caption is empty?

Requirements from the current user request and existing media behavior:

- Keep body node selection/deletion separate from caption text selection.
- Keep caption text in the canonical document, with normal marks, history,
  clipboard, and collaboration ownership.
- Do not treat an empty caption as an absent media asset.
- Do not let generic text splitting duplicate the media asset or leak its
  properties into a new paragraph.
- Compare a new node kind, orthogonal schema capabilities, stronger existing
  primitives, an explicit caption container, and independent editable roots.
- Reconcile the earlier clean-reset proposal and direct-child decision.

Stop rule: stop after the named comparators and current Plite owners establish
the materially different representations and a concrete local failure or
capability gap. No performance or browser-parity claim without its own proof.

Expected next owner: Task design/planning if cross-owner changes earn pursuit.
The review may instead retain the current representation and reject a new kind.

Exclusions: product changes, provider/upload transport, resizing design,
unrelated editor features, public publication, and a full external test run.

## Verdict

Pursue a schema-owned object capability with editable content. An object is
meaningful document content independently of its children. Selecting its body
selects the owner; selecting text inside its children edits that text. This is
an element behavior, not a second persisted node representation or a generic
`ObjectPlugin`.

The direct caption children remain the preferred representation for this one
region. Reopen the claim that the existing `isolating + keyboardSelectable`
combination completely expresses the object contract. The compiled reset API
is still the proper owner for type conversion, but `preserveProperties: false`
alone does not address the observed failures.

## Local observations

Run from the repository root:

```sh
bun test ./docs/plite/research/2026-09-21-media-object-editable-content/observations.test.ts
```

The three observation cases passed against current source. They deliberately
record current behavior, including defects; they are research probes rather
than desired-behavior regression tests.

1. An image with an empty caption reports `nodes.isEmpty(image) === true`.
   `blocks.insertAfter(paragraph, { at: [0], replaceEmpty: true })` removes that
   image. Its URL is meaningful content despite the empty caption. The
   production upload clipboard command also requests `replaceEmpty: true`,
   although this run did not drive that complete UI interaction.
2. A text block containing `abc` exposes offsets 0, 1, 2, and 3 to character
   traversal. Setting `atom: true` leaves only offset 0. Re-enabling atom on
   media is therefore not an adequate caption solution. The schema compiler
   also rejects preserved editable slice context for atoms.
3. Exporting the range for `apt` inside `caption` returns a closed image slice
   carrying the original URL. Inserting that exported slice into a fresh empty
   paragraph recreates the image. Caption text selection and owner selection
   do not have sufficiently distinct transfer semantics.

The authoritative result is [observations.txt](observations.txt); the review
record binds it to hashes of the inspected production inputs. No browser,
clipboard MIME, collaboration, performance, or external test execution is
claimed by these model observations.

### Last-pass refinement

[A focused follow-up probe](last-pass-observations.test.ts) holds editable
children and `keyboardSelectable` constant while changing only `isolating`.
Without isolation, selecting `apt` exports an open slice and inserts plain text
into a paragraph. With isolation, the same range exports a closed owner and
recreates that owner. This isolates the transfer defect to the current blanket
slice treatment of `isolating`; it does not prove that object semantics should
discard structural isolation.

The target therefore cannot be a macro that merely enables `atom`,
`isolating`, or the current media flag pair. `atom` remains the independent
fact that descendants are not traversable. An object role instead states that
the owner is meaningful independently of editable descendants and gives
generic operations a canonical semantic question. Whole-owner and descendant
transfer must still follow selection shape: a node selection carries the
owner, while an inner text range remains open child content. A separate public
`isContent` axis has no demonstrated non-object consumer in the current scope
and should not be added speculatively.

## External comparison

The repo registry records exact local commits and the read log names source
slices. Clones were reused without fetch or checkout changes; these are versioned
source observations, not claims that each clone is upstream's latest revision.

| Editor | Representation and ownership | Consequence for Plite |
| --- | --- | --- |
| ProseMirror | Content grammar, `atom`, `selectable`, and `isolating` are distinct. A node view's `contentDOM` delegates editable children to the editor. The basic image is a leaf; a captioned figure must be an application schema/view. Atom affects selection and commands; it does not itself make every descendant DOM node uneditable. | Reuse the distinction between object selection and editable content. A selectable non-leaf with `contentDOM` is the relevant direct-child mechanism; copying `atom: true` does not settle caption laws. |
| WordGard | Its own editor substrate has leaf Image/Figure and a distinct CaptionedFigure textblock. The latter keeps inline caption children and explicitly renders non-atomically. It does not opt into selectable or isolating behavior. Default body selection requires selectable plus atom; generic middle splitting retains the figure tag and URI. | Direct children are viable, but this implementation does not solve Plate's combined body-selection and caption-exit requirements. The split claim is source-derived, not an executed WordGard test. |
| Lexical | The playground ImageNode is a DecoratorNode with a separate nested caption editor. Its current source also implements experimental named slots on ElementNode or DecoratorNode in one EditorState; PullQuote is a concrete consumer with quote/attribution regions. | Atomic host plus editable content is a real capability. Separate caption editors add ownership work; named slots address genuinely separate regions and are unnecessary by default for one direct caption. Neither automatically determines Plate's Enter behavior. |

Official web sources checked alongside local source:

- [ProseMirror maintainer clarification of atom](https://discuss.prosemirror.net/t/cursor-movement-on-node-with-atom-true/1252).
- [Lexical named slots](https://lexical.dev/docs/concepts/named-slots), explicitly experimental.

## Direction and alternatives

The proposed public spelling is illustrative, not an accepted API:

```ts
schema.element.textBlock({
  object: true,
  properties: mediaElementProperties,
});
```

Keep the existing document shape: `{ type: 'image', url, children: [...] }`.
Plite owns object/content facts, selection, traversal, safe structural edits,
and selection-aware slices. Plate owns the product policy that Enter exits a
caption with its suffix in a clean default block. Rendering owns the explicit
noneditable asset body and editable caption; buttons and resize controls must
retain their own event behavior.

The design must test whether `object` replaces the current `atom` concept and
derives the media selection defaults, rather than layering an extra synonym
over all existing booleans. Keep independent `selectable`, read-only and
isolation jobs where real consumers need them; Date explicitly opts out of
node selection. Do not mechanically make every isolating element an object.

| Lane | Decision |
| --- | --- |
| Keep the current flags and add only clean reset | Insufficient: does not address replacement or caption-slice behavior. |
| Turn media back into a void/atom | Reject: closes traversal into content the user wants editable. |
| Add `void: 'editable'` | Reject: bundles noneditable child semantics with editable children and obscures which operations own the boundary. |
| Add only an intrinsic-content fact and retain current selection/boundary capabilities | Strong minimum implementation candidate. It fixes semantic emptiness only when replacement consumes it correctly; clipboard and split behavior still need an explicit object/content contract. Compare this representation during design. |
| Schema-owned object behavior with ordinary children | Pursue: supplies one canonical semantic fact to the affected owners. The exact public bundle remains a design question. |
| Caption wrapper | Reject as the default for the current one-inline-region job. Plite can assign editable-region semantics to the existing owner's child content. Reconsider only for independent grammar, block styling, identity, or multiple regions. |
| Separate editors or named roots/slots | Reject as the default media representation. Retain existing named-root machinery for independently addressed content; multiple independent regions can justify a different decision. |

Do not define object semantics as unconditionally forbidding every explicit
structural operation. Guard generic user editing from accidentally duplicating,
merging or discarding the asset, while keeping intentional duplicate, delete,
and supported conversion commands explicit. Caption exit should use a neutral
structural operation that creates target-default output without treating an
intermediate media clone as the user job. Its exact split/extract/reset API is
not settled by this review.

## Reconciliation and proof limits

- Retain the July 23 direct-children decision and distinct node/text selections.
  Reopen its completeness across intrinsic content, clipboard, and splitting.
- Retain August 26's schema-default mutation owner and default preservation
  semantics for ordinary block conversions.
- Supersede September 21's clean-reset-only recommendation as the next whole
  job. The earlier image/caption visual evidence remains limited to that patch.
- Correct the earlier broad void claim: `applyInsertBreak` returns for a
  NodeSelection. `block-void-break` inserts a fresh block for a collapsed text
  selection targeting a block void; it does not prove every selected-object
  Enter transition.

Before implementation, Task must settle start/middle/end caption Enter,
multi-block paste, partial/full/cross-boundary text selections, body controls,
object deletion/replacement, empty captions, undo and collaboration mapping.
Compare direct-child and any stronger region candidate through the real
operation and DOM owners. Runtime architecture and hot-path claims require
the appropriate measured probe; this assessment does not certify a runtime
design or performance result.

Research closed after four external editor families and three local probes.
Two bounded independent readers inspected Lexical and WordGard;
the lead inspected Plite and ProseMirror and reviewed decisive returned source.
External tests were read, not run. No product source changed. The initial
traversal probe used an invalid hyphenated Plate plugin name; changing the
research fixture to the required camelCase name resolved that runner failure.
No user attention is required for the assessment. Next research shard: none;
the evidence is sufficient to justify bounded design.

Next owner: `$task design plan object elements with editable children`.
