'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-common/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { AudioLinesIcon, FileUpIcon, Film, ImageIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import { ToolbarButton } from './toolbar';

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    icon: React.ReactNode;
  }
> = {
  [AudioPlugin.key]: {
    accept: ['audio/*'],
    icon: <AudioLinesIcon />,
  },
  [FilePlugin.key]: {
    accept: ['*'],
    icon: <FileUpIcon />,
  },
  [ImagePlugin.key]: {
    accept: ['image/*'],
    icon: <ImageIcon />,
  },
  [VideoPlugin.key]: {
    accept: ['video/*'],
    icon: <Film />,
  },
};

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType:
      | typeof AudioPlugin.key
      | typeof FilePlugin.key
      | typeof ImagePlugin.key
      | typeof VideoPlugin.key;
  }
>(({ nodeType, ...rest }, ref) => {
  const editor = useEditorRef();

  /** Open file picker */
  const { openFilePicker } = useFilePicker({
    accept: MEDIA_CONFIG[nodeType].accept,
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      (editor as any).tf.insert.media(updatedFiles);
    },
  });

  return (
    <ToolbarButton ref={ref} onClick={openFilePicker} {...rest}>
      {MEDIA_CONFIG[nodeType].icon}
    </ToolbarButton>
  );
});
