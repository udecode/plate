export const previewMdValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const previewMdValue: any = (
  <fragment>
    <hh1>👀 Preview Markdown</hh1>
    <hp>
      Slate is flexible enough to add **decorations** that can format text based
      on its content. For example, this editor has **Markdown** preview
      decorations on it, to make it _dead_ simple to make an editor with
      built-in \`Markdown\` previewing.
    </hp>
    <hp>- List.</hp>
    <hp> Blockquote.</hp>
    <hp>---</hp>
    <hp>## Try it out!</hp>
    <hp>Try it out for yourself!</hp>
  </fragment>
);
`;

export const previewMdValueFile = {
  '/preview-markdown/previewMdValue.tsx': previewMdValueCode,
};
