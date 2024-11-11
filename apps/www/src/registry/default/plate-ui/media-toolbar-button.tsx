'use client';

import React from 'react';

import type { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';

import { withRef } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-common/react';
import { ImageIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ImagePlugin.key | typeof MediaEmbedPlugin.key;
  }
>(({ nodeType, ...rest }, ref) => {
  const editor = useEditorRef();

  /** Open file picker */
  const { openFilePicker } = useFilePicker({
    accept: ['image/*'],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      (editor as any).tf.insert.media(updatedFiles);
    },
  });

  return (
    <ToolbarButton ref={ref} onClick={openFilePicker} {...rest}>
      <ImageIcon />
    </ToolbarButton>
  );
});
