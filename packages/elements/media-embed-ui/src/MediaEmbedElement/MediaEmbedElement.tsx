import * as React from 'react';
import { setNodes } from '@udecode/plate-common';
import { TElement, useEditorRef } from '@udecode/plate-core';
import { MediaEmbedNodeData } from '@udecode/plate-media-embed';
import { ReactEditor } from 'slate-react';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

export const MediaEmbedElement = (props: MediaEmbedElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles: _styles,
    element,
    classNames,
    prefixClassNames,
    ...rootProps
  } = props;

  const editor = useEditorRef();
  const { url } = element;

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
            src={`${url}?title=0&byline=0&portrait=0`}
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
            const path = ReactEditor.findPath(editor, element);
            setNodes<TElement<MediaEmbedNodeData>>(
              editor,
              { url: val },
              { at: path }
            );
          }}
        />
      </div>
      {children}
    </div>
  );
};
