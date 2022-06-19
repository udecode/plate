import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';

export const getMediaEmbedElementStyles = <V extends Value>(
  props: MediaEmbedElementProps<V> & {
    selected: boolean;
    readOnly: boolean;
    isHoveringDelete?: boolean;
    visibleToolbar?: boolean;
    provider?: string;
  }
) => {
  const { selected, readOnly, provider } = props;

  let boxShadow: string | undefined;

  if (!readOnly && selected) {
    boxShadow = `0 0 0 1px rgb(59 130 249)`;
  }

  const providersPadding = {
    youtube: '56.2061%',
    vimeo: '75%',
    youku: '56.25%',
    dailymotion: '56.0417%',
    coub: '51.25%',
  };
  const providerPadding: string =
    provider !== 'twitter'
      ? (provider && providersPadding[provider]) || '56.0417%'
      : undefined;

  return createStyles(
    { prefixClassNames: 'MediaEmbedElement', ...props },
    {
      root: tw`relative my-1`,
      iframeInputWrapper: tw`flex flex-col items-center justify-center cursor-text`,
      iframeWrapper: [
        tw`relative w-full`,
        provider === 'twitter'
          ? css`
              .twitter-tweet {
                margin: 0 auto !important;
                padding: 2px;
                box-shadow: ${boxShadow};
              }
            `
          : css`
              iframe {
                border-radius: 3px;
                box-shadow: ${boxShadow};
              }
            `,

        css`
          padding-bottom: ${providerPadding};
        `,
      ],
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
};
