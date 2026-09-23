# Media caption clean break regression

Status: Rework required — behavior fixed and proved; API ownership remains open

## Outcome

Pressing Enter inside a media caption creates a clean schema-default block for
the caption suffix. The source media keeps its own alignment and sizing, while
the new paragraph does not inherit media element properties.

## Scope

- Reproduce the property leak in the shared media caption break command.
- Keep the generic block-reset property-preservation contract unchanged.
- Preserve caption text, text marks, selection, and the source media's props.
- Prove the model transition and physical Enter behavior on the copied editor.

## Acceptance

- A centered image split in the middle of its caption remains a centered image
  with the left caption text.
- The right caption text becomes a paragraph with no inherited `textAlign`,
  `width`, URL, or other media element property.
- The caret lands at the start of the new paragraph.
- The new paragraph visibly uses normal paragraph alignment.
- Focused media package checks and the exact Chromium interaction pass on final
  source.

## Diagnosis

The generic split correctly clones schema properties and `blocks.reset`
correctly preserves properties allowed on both source and target types. That
general rule let `textAlign` survive the media-to-paragraph reset. Media caption
exit is the narrower owner: it must discard the right media clone's element
properties before applying the default-block reset. The current caller-side
property census proves that behavior, but it duplicates reset mechanics and
contradicts the canonical block-reset owner established by the earlier media
caption plan.

## Evidence

- Before the fix, the focused media contract received `textAlign: 'center'` on
  the new paragraph.
- The media partition passes 64 tests across all five media variants; its lint
  partition passes.
- The exact Chromium suite passes all three media-caption cases on
  `/blocks/editor-ai`, including physical Enter, model props, caret placement,
  runtime errors, and rendered alignment.
- The final visual capture at `/tmp/plate-media-caption-clean-break.png` was
  inspected at 1280×720: the retained image caption is centered and the new
  paragraph begins at the editor's normal left edge.
- The media partition typecheck remains blocked by pre-existing input-rule
  errors in `createRuleFactory.ts` and its local `types.ts`; no reported error
  points to the media source or regression test.

## Implementation review

The media caption command owns the policy decision, while `blocks.reset` owns
the structural mutation. The durable target is a typed opt-out such as
`tx.blocks.reset({ at: rightPath, preserveProperties: false })`. Its default
must retain the existing cross-type preservation behavior for normal block
conversion and override rules. The clean mode removes source element
properties, applies the target default block's properties, and preserves
children, selection, and NodeKey atomically.

Do not generalize this to void nodes. All five media caption elements are
non-void isolating text blocks and already share the same command. True block
voids cannot contain an editable caption and already insert a fresh default
block through the Plite void-boundary path.

The Best API Review record is
`2026-09-21-media-caption-clean-reset-ownership`.

## Subsequent object/content review

The user's object-with-editable-children challenge reopened the reset-only
target. Review `2026-09-21-media-object-editable-content` supersedes it as the
whole next job: current model probes also expose empty-caption asset removal
and caption-only copy recreating the asset. Retain the behavior evidence above
and the canonical type-conversion owner, but settle the schema-owned
object/content contract before committing to a standalone reset option.
See [the current decision](../research/decisions/media-object-content.md).
