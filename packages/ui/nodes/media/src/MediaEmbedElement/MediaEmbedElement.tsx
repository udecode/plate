import React, { useMemo } from 'react';
import {
  Box,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useElement,
} from '@udecode/plate-core';
import { ElementPopover } from '@udecode/plate-floating';
import { Caption, Media, TMediaElement } from '@udecode/plate-media';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import { parseMediaUrl } from '../../../../../media/src/media/parseMediaUrl';
import { ELEMENT_MEDIA_EMBED } from '../../../../../media/src/media-embed/createMediaEmbedPlugin';
import { mediaFloatingOptions } from '../mediaFloatingOptions';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { PlateFloatingMedia } from './PlateFloatingMedia';

export type MediaIframeProps = HTMLPropsAs<'iframe'> & {
  disableUnknownProviders?: boolean;
};

export const useMediaIframe = ({
  disableUnknownProviders,
  ...props
}: MediaIframeProps): HTMLPropsAs<'iframe'> => {
  const element = useElement<TMediaElement>();
  const { url: elementUrl } = element;

  const { url } = useMemo(() => parseMediaUrl(elementUrl), [elementUrl]);

  return {
    title: 'embed',
    frameBorder: '0',
    allowFullScreen: true,
    src: !url && disableUnknownProviders ? undefined : url,
    ...props,
  };
};

export const MediaEmbed = createComponentAs<MediaIframeProps>((props) => {
  const htmlProps = useMediaIframe(props);

  // const isTwitter = provider === 'twitter' && id;
  // {isTwitter ? (
  //             <Tweet tweetId={id} loadingComponent="...loading" {...tweetProps} />

  return createElementAs('iframe', htmlProps);
});

export const MediaEmbedElement = (props: MediaEmbedElementProps) => {
  const { children, nodeProps, element } = props;

  const { as, ...rootProps } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { url: elementUrl } = element;

  const { provider } = useMemo(() => parseMediaUrl(elementUrl), [elementUrl]);

  const styles = getMediaEmbedElementStyles({
    ...props,
    provider,
    selected,
    focused,
    readOnly,
  });

  return (
    <ElementPopover
      content={<PlateFloatingMedia pluginKey={ELEMENT_MEDIA_EMBED} />}
      floatingOptions={mediaFloatingOptions}
    >
      <Media.Root {...rootProps} css={styles.root.css}>
        <figure
          css={styles.figure?.css}
          className="group"
          contentEditable={false}
        >
          <Media.Resizable
            // @ts-ignore
            css={styles.resizable?.css}
            className={styles.resizable?.className}
            handleComponent={{
              left: (
                <Box
                  css={[styles.handleLeft?.css]}
                  className={styles.handleLeft?.className}
                />
              ),
              right: (
                <Box
                  css={styles.handleRight?.css}
                  className={styles.handleRight?.className}
                />
              ),
            }}
          >
            <div
              css={styles.iframeWrapper?.css}
              className={styles.iframeWrapper?.className}
              draggable
            >
              <MediaEmbed
                css={styles.iframe?.css}
                className={styles.iframe?.className}
                {...nodeProps}
              />
            </div>
          </Media.Resizable>

          <Caption.Root
            css={styles.figcaption?.css}
            className={styles.figcaption?.className}
          >
            <Caption.Textarea
              css={styles.caption?.css}
              className={styles.caption?.className}
              placeholder="Write a caption..."
            />
          </Caption.Root>
        </figure>

        {children}
      </Media.Root>
    </ElementPopover>
  );
};
