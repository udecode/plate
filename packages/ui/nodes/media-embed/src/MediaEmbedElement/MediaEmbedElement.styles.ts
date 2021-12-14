import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';

export const getMediaEmbedElementStyles = (props: MediaEmbedElementProps) =>
  createStyles(
    { prefixClassNames: 'MediaEmbedElement', ...props },
    {
      root: tw`relative`,
      iframeWrapper: [tw`relative`, tw`padding[75% 0 0 0]`],
      iframe: [tw`absolute top-0 left-0 w-full h-full`],
      input: [
        tw`w-full`,
        css`
          padding: 0.5em;
          font-size: 0.85em;
          border: 2px solid #ddd;
          background: #fafafa;
          margin-top: 5px;
        `,
      ],
    }
  );
