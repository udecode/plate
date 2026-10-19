# Caret navigation robustness observation

On the source-backed Chrome editor at `/blocks/media-demo`, the text directly
after the image was selected and collapsed with `ArrowLeft` to `[3,0]@0`.
`ArrowUp` moved the native caret into the image's caption at `[2,0]@0` while
the image was not selected. A second `ArrowUp` selected the image, leaving no
native range and adding its selection ring. This agrees with the current
populated-caption browser test. During the review, the behavior law was
reconciled: `EDIT-CAPTION-NAV-005` specifies caption-first entry for populated
captions and `EDIT-CAPTION-NAV-006` specifies owner-first entry for hidden empty
captions.

The code makes that distinction by testing `NodeApi.string(owner).length > 0`
in the reverse vertical owner lookup. For populated captions, it then uses DOM
geometry to place the caret at the preceding paragraph's horizontal position.
Plate currently hides an empty caption when neither the caption nor asset is
active. The text-length check therefore tracks the current media presentation,
but it is an implicit assumption about what is visible. The public
`object: true` role itself has no such visibility contract. The host-direction
lookup in horizontal owner navigation also has no proof for an RTL child
inside an LTR editor; the current React case sets `dir=rtl` on the whole
Editable.

Final-source verification: Plite typecheck passed, 41 Plite React tests passed
across object selection, caret-engine and content-root navigation, and all 14
media caption Chromium cases passed. These cover image caption traversal,
empty file, audio and video captions, wrapped text and caption, owner
selection, and full-caption Delete. An earlier broad run timed out while the
docs preview showed `Loading...`; that case and the final full suite passed
after compilation. These checks do not establish mixed-direction behavior,
generic non-media object layouts, media embed reverse traversal, or other
browsers.
