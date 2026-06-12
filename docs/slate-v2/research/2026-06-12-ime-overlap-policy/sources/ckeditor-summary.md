# CKEditor 5 Summary

CKEditor 5 supports the same broad invariant: active IME composition is fragile
native/browser state and renderer work should avoid breaking it.

The renderer documentation says it tries not to break text composition and
selection indexing. During active composition, non-Android rendering is skipped
so buffered changes wait until after composition ends
(`../ckeditor5/packages/ckeditor5-engine/src/view/renderer.ts:204-222`).

The renderer also warns that DOM text updates while composing may break
composition and avoids certain text-node rewrites while composing on Android
(`../ckeditor5/packages/ckeditor5-engine/src/view/renderer.ts:884-910`).

Slate pressure:

This is supporting evidence for composition protection and renderer caution.
It is not enough by itself to define Slate's overlap-cancellation policy.

