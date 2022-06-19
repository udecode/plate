import React, { useMemo } from 'react';
import { findNodePath, setNodes, Value } from '@udecode/plate-core';
import { TMediaEmbedElement } from '@udecode/plate-media-embed';
import { getRootProps } from '@udecode/plate-styled-components';
import { useReadOnly, useSelected } from 'slate-react';
import { parseEmbedUrl } from './utils/parseEmbedUrl';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';
import { Tweet } from './Tweet';

export const MediaEmbedElement = <V extends Value>({
  tweetProps,
  inputProps,
  getIframeProps,
  disableInput,
  disableUnknownProviders,
  ...props
}: MediaEmbedElementProps<V>) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const selected = useSelected();
  const readOnly = useReadOnly();

  const rootProps = getRootProps(props);

  const { url: elementUrl } = element;

  const embedUrlData = useMemo(() => parseEmbedUrl(elementUrl), [elementUrl]);
  const { provider, id, url } = embedUrlData;

  const styles = getMediaEmbedElementStyles({
    ...props,
    provider,
    selected,
    readOnly,
  });

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
      <div
        css={styles.iframeInputWrapper?.css}
        className={styles.iframeInputWrapper?.className}
        contentEditable={false}
        draggable
      >
        <div
          css={styles.iframeWrapper?.css}
          className={styles.iframeWrapper?.className}
        >
          {isTwitter ? (
            <Tweet tweetId={id} loadingComponent="...loading" {...tweetProps} />
          ) : (
            <iframe
              css={styles.iframe?.css}
              className={styles.iframe?.className}
              title="embed"
              src={!url && disableUnknownProviders ? undefined : url}
              frameBorder="0"
              allowFullScreen
              {...nodeProps}
              {...iframeProps}
            />
          )}
        </div>
        {!disableInput && !readOnly && selected && (
          <MediaEmbedUrlInput
            data-testid="MediaEmbedUrlInput"
            css={styles.input?.css}
            className={styles.input?.className}
            url={elementUrl}
            onChangeValue={(value: string) => {
              const path = findNodePath(editor, element);
              if (!path) return;

              setNodes<TMediaEmbedElement>(
                editor,
                { url: value },
                { at: path }
              );
            }}
            {...inputProps}
          />
        )}
      </div>
      {children}
    </div>
  );
};
