import React, { useCallback } from 'react';

import {
  type EditorStaticProps,
  EditorStatic,
} from '../../static/components/PlateStatic';
import { getStaticDocumentView } from '../../static/internal/staticDocumentView';
import { writeStaticSelectionClipboardData } from '../../static/internal/writeStaticSelectionClipboardData';

export type EditorPreviewProps<E = EditorStaticProps['editor']> =
  EditorStaticProps<E>;

export const EditorPreview = <E,>(props: EditorPreviewProps<E>) => {
  const { document, editor, onCopy: onCopyProp } = props;
  // Copy reads the rendered document, which may be `document` rather than the
  // editor's own.
  const view = getStaticDocumentView(
    editor as EditorStaticProps['editor'],
    document
  );
  const handleCopy = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      onCopyProp?.(event);

      if (
        !event.defaultPrevented &&
        writeStaticSelectionClipboardData(
          view,
          event.clipboardData,
          event.currentTarget
        )
      ) {
        event.preventDefault();
      }
    },
    [view, onCopyProp]
  );

  return <EditorStatic {...props} onCopy={handleCopy} />;
};
