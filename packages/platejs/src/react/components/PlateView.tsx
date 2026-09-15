import React, { useCallback } from 'react';

import {
  type EditorStaticProps,
  EditorStatic,
} from '../../static/components/PlateStatic';
import { writeStaticSelectionClipboardData } from '../../static/internal/writeStaticSelectionClipboardData';

export type EditorPreviewProps<E = EditorStaticProps['editor']> =
  EditorStaticProps<E>;

export const EditorPreview = <E,>(props: EditorPreviewProps<E>) => {
  const { editor, onCopy: onCopyProp } = props;
  const handleCopy = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      onCopyProp?.(event);

      if (
        !event.defaultPrevented &&
        writeStaticSelectionClipboardData(
          editor as EditorStaticProps['editor'],
          event.clipboardData,
          event.currentTarget
        )
      ) {
        event.preventDefault();
      }
    },
    [editor, onCopyProp]
  );

  return <EditorStatic {...props} onCopy={handleCopy} />;
};
