import React, { useMemo } from 'react';
import { findNodePath, setNodes, Value } from '@udecode/plate-core';
import { TMediaEmbedElement } from '@udecode/plate-media-embed';
import { getRootProps } from '@udecode/plate-styled-components';
import { parseEmbedUrl } from './utils/parseEmbedUrl';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';
import { Tweet } from './Tweet';

export const MediaEmbedElement = <V extends Value>({
  tweetProps,
  getIframeProps,
  disableInput,
  ...props
}: MediaEmbedElementProps<V>) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const rootProps = getRootProps(props);
  const styles = getMediaEmbedElementStyles(props);

  const { url: elementUrl } = element;

  const embedUrlData = useMemo(() => parseEmbedUrl(elementUrl), [elementUrl]);
  const { provider, id, url } = embedUrlData;

  const iframeProps = useMemo(
    () => getIframeProps?.({ element, embedUrlData }),
    [element, embedUrlData, getIframeProps]
  );

  const isTwitter = provider === 'twitter' && id;

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
      {...rootProps}
    >
      <div contentEditable={false}>
        {isTwitter ? (
          <Tweet tweetId={id} loadingComponent="...loading" {...tweetProps} />
        ) : (
          <>
            <div
              css={styles.iframeWrapper?.css}
              className={styles.iframeWrapper?.className}
            >
              <iframe
                css={styles.iframe?.css}
                className={styles.iframe?.className}
                title="embed"
                src={url}
                frameBorder="0"
                allowFullScreen
                {...nodeProps}
                {...iframeProps}
              />
            </div>
            {!disableInput && (
              <MediaEmbedUrlInput
                data-testid="MediaEmbedUrlInput"
                css={styles.input?.css}
                className={styles.input?.className}
                url={url}
                onChange={(val: string) => {
                  const path = findNodePath(editor, element);
                  if (!path) return;

                  setNodes<TMediaEmbedElement>(
                    editor,
                    { url: val },
                    { at: path }
                  );
                }}
              />
            )}
          </>
        )}
      </div>
      {children}
    </div>
  );
};
