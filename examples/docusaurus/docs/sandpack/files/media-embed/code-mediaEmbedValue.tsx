export const mediaEmbedValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const mediaEmbedValue: any = (
  <fragment>
    <hh2>🎥 Media Embed</hh2>
    <hp>
      In addition to simple image nodes, you can actually create complex
      embedded nodes. For example, this one contains an input element that lets
      you change the video being rendered!
    </hp>
    <hmediaembed url="https://www.youtube.com/watch?v=4duqI8WyfqE">
      <htext />
    </hmediaembed>
    <hp>It also supports tweets:</hp>
    <hmediaembed url="https://twitter.com/reactjs/status/1508838714180612100">
      <htext />
    </hmediaembed>
  </fragment>
);
`;

export const mediaEmbedValueFile = {
  '/media-embed/mediaEmbedValue.tsx': mediaEmbedValueCode,
};
