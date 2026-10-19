# Docx Image Cleaner Coverage Pass

## Goal

Add a narrow, high-value non-React coverage pass for `@platejs/docx` focused on the image and RTF cleaner helpers:

- `cleanDocxImageElements.ts`
- `getRtfImageHex.ts`
- `getRtfImagesMap.ts`
- `getRtfImagesByType.ts`
- `getRtfImageMimeType.ts`

## Constraints

- Fast-lane only.
- No `/react`.
- No broad package sweep.
- Prefer pure helper specs, plus one honest DOM contract spec for image replacement.

## Slice

1. Add pure helper specs for mime, hex, grouped image extraction, and map precedence.
2. Add a DOM cleaner spec for:
   - external URL fallback via `alt`
   - local file replacement from RTF image data
   - unknown image removal
   - VML image replacement path
3. Run targeted tests, profile, fast-budget gate, then package build/typecheck/lint.

## Notes

- Existing `docx` coverage is still thin around RTF image parsing.
- `getVShapes.spec.ts` currently contains a fake placeholder assertion, but this slice does not need to widen into that file unless the new tests expose a real dependency gap.
- During execution, the new map tests exposed a real bug: `getRtfImagesByType(..., '\\shp')` was also matching `\\shppict` blocks because the helper split on raw substrings instead of exact RTF control words.
