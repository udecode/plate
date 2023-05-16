import React from 'react';
import { Box } from '@udecode/plate-common';
import { ElementPopover } from '@udecode/plate-floating';
import {
  Caption,
  ELEMENT_MEDIA_EMBED,
  Media,
  MediaEmbed,
  useMediaStore,
} from '@udecode/plate-media';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import { mediaFloatingOptions } from '../mediaFloatingOptions';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { PlateFloatingMedia } from './PlateFloatingMedia';

export const MediaEmbedElement = (props: MediaEmbedElementProps) => {
  const { children, nodeProps, caption = {}, popoverProps = {} } = props;

  const { ...rootProps } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { provider } = useMediaStore().get.urlData();

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
      {...popoverProps}
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
            maxWidth={provider === 'twitter' ? 550 : '100%'}
            minWidth={provider === 'twitter' ? 300 : 100}
            renderHandleLeft={(htmlProps) => (
              <Box
                {...htmlProps}
                css={[styles.handleLeft?.css]}
                className={styles.handleLeft?.className}
              />
            )}
            renderHandleRight={(htmlProps) => (
              <Box
                {...htmlProps}
                css={styles.handleRight?.css}
                className={styles.handleRight?.className}
              />
            )}
          >
            <div
              css={styles.iframeWrapper?.css}
              className={styles.iframeWrapper?.className}
            >
              <MediaEmbed
                css={styles.iframe?.css}
                className={styles.iframe?.className}
                {...nodeProps}
              />
            </div>
          </Media.Resizable>

          {!caption.disabled && (
            <Caption.Root
              css={styles.figcaption?.css}
              className={styles.figcaption?.className}
            >
              <Caption.Textarea
                css={styles.caption?.css}
                className={styles.caption?.className}
                placeholder={caption.placeholder ?? 'Write a caption...'}
              />
            </Caption.Root>
          )}
        </figure>

        {children}
      </Media.Root>
    </ElementPopover>
  );
};
