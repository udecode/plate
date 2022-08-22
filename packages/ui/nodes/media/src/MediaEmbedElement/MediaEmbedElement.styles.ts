import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { getCaptionCss, getResizableCss } from '../ImageElement/index';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';

export const getMediaEmbedElementStyles = (
  props: MediaEmbedElementProps & {
    selected: boolean;
    focused: boolean;
    readOnly: boolean;
    isHoveringDelete?: boolean;
    visibleToolbar?: boolean;
    provider?: string;
  }
) => {
  const { selected, readOnly, provider, focused } = props;

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

  const resizable = getResizableCss({
    align: 'center',
    focused,
    selected,
  });

  return createStyles(
    { prefixClassNames: 'MediaEmbedElement', ...props },
    {
      root: tw`relative py-2.5`,
      figure: [
        tw`m-0 relative w-full`,
        provider === 'twitter' &&
          css`
            .twitter-tweet {
              margin: 0 auto !important;
              padding: 2px;
              box-shadow: ${boxShadow};
            }
          `,
      ],
      iframeWrapper: css`
        padding-bottom: ${providerPadding};
      `,
      iframe: [
        tw`absolute top-0 left-0 w-full h-full`,
        css`
          border-radius: 3px;
          box-shadow: ${boxShadow};
        `,
      ],

      ...getCaptionCss({
        align: 'center',
        caption: {
          align: 'center',
        },
      }),
      ...resizable,
      handleRight: [
        ...resizable.handleRight,
        provider === 'twitter' && tw`-mr-4`,
      ],
    }
  );
};
