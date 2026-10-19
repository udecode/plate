## Annotate Without Rewriting

Inspect each source image first. Use a deterministic local image editor, such
as Sharp with SVG overlays, to add only:

- numbered target outlines on the product surface;
- matching numbered explanations in one fixed side rail outside the product;
- short plain-English labels;
- a compact title when the frame needs context.

Keep labels to one sentence. Use product language, not implementation terms.
Keep the product screenshot untouched except for the thin outlines and number
markers. Never place explanation text over the product.

### Show What Changed

When the walkthrough explains a change inside an existing product, use color
alone to distinguish provenance:

- **Blue — NEW / CHANGED:** behavior or UI added or changed by the completed
  work.
- **Gray — existing context:** everything else needed to explain the flow. Do
  not say "already there" or "already existed" in the label.

Use one small two-color legend in the side rail. The legend is the only
provenance text; never repeat `NEW / CHANGED`, `existing context`, or equivalent
badges in notes. Classify the exact feature, not the whole screen. An existing
page with a new row gets gray context and a blue outline on the row. Never mark
the whole screen blue merely because the screenshot was captured after the work.

Match each side-rail note to its target with the same number and provenance
color. Put the number marker just outside the target outline so it never covers
product text. Use no arrows by default. Add one only when numbered outlines
cannot disambiguate nearby targets, and make it touch the target outline edge.
Keep outlines thin and product text readable.

Keep planned or unbuilt work out of completed-product screenshots. Name it in
caption prose outside the image when it matters.

Do not use these colors for severity, status, success, or failure. Product
colors remain product evidence. Annotation colors explain only whether the
called-out behavior changed.

Never add, remove, rewrite, beautify, or simulate product content. Compare the
annotated result with the original. If product text, values, layout, or state
changed, discard it and regenerate. The original is proof. The annotation is
explanation.

Never use generative image editing for walkthrough annotations. It can alter
the product evidence instead of merely explaining it.

