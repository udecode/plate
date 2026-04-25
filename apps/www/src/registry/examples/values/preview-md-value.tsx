/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const previewMdValue: any = (
  <fragment>
    <hh2>👀 Preview Markdown</hh2>
    <hp>
      Slate is flexible enough to add **decorations** that can format text based
      on its content. For example, this editor has **Markdown** preview
      decorations on it, to make it _dead_ simple to make an editor with
      built-in `Markdown` previewing.
    </hp>
    <hp>- List item.</hp>
    <hp>&gt; Blockquote paragraph.</hp>
    <hp>&gt; &gt; Nested blockquote.</hp>
    <hp>&gt; - Quoted list item.</hp>
    <hp>---</hp>
    <hp>## Try it out!</hp>
    <hp>Try it out for yourself!</hp>
  </fragment>
);
