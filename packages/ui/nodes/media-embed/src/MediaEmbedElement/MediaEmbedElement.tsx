import React from 'react';
import { findNodePath, setNodes, Value } from '@udecode/plate-core';
import { TMediaEmbedElement } from '@udecode/plate-media-embed';
import { getRootProps } from '@udecode/plate-styled-components';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

export const MediaEmbedElement = <V extends Value>(
  props: MediaEmbedElementProps<V>
) => {
  const { attributes, children, nodeProps, element, editor } = props;

  const rootProps = getRootProps(props);

  const { url } = element;
  const querySeparator = url.includes('?') ? '' : '?';

  const styles = getMediaEmbedElementStyles(props);

  return (
    <div
      {...attributes}
      css={styles.root.css}
      className={styles.root.className}
      {...rootProps}
    >
      <div contentEditable={false}>
        <div
          css={styles.iframeWrapper?.css}
          className={styles.iframeWrapper?.className}
        >
          <iframe
            css={styles.iframe?.css}
            className={styles.iframe?.className}
            title="embed"
            src={`${url}${querySeparator}&title=0&byline=0&portrait=0`}
            frameBorder="0"
            {...nodeProps}
          />
        </div>

        <MediaEmbedUrlInput
          data-testid="MediaEmbedUrlInput"
          css={styles.input?.css}
          className={styles.input?.className}
          url={url}
          onChange={(val: string) => {
            const path = findNodePath(editor, element);
            if (!path) return;

            setNodes<TMediaEmbedElement>(editor, { url: val }, { at: path });
          }}
        />
      </div>
      {children}
    </div>
  );
};
