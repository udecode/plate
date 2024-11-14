'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { cn } from '@udecode/cn';
import { useEditorPlugin } from '@udecode/plate-core/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  AudioLinesIcon,
  FileUpIcon,
  FilmIcon,
  ImageIcon,
  LinkIcon,
} from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarSplitButton } from './toolbar';

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    icon: React.ReactNode;
    tooltip: string;
  }
> = {
  [AudioPlugin.key]: {
    accept: ['audio/*'],
    icon: <AudioLinesIcon />,
    tooltip: 'Audio',
  },
  [FilePlugin.key]: {
    accept: ['*'],
    icon: <FileUpIcon />,
    tooltip: 'File',
  },
  [ImagePlugin.key]: {
    accept: ['image/*'],
    icon: <ImageIcon />,
    tooltip: 'Image',
  },
  [VideoPlugin.key]: {
    accept: ['video/*'],
    icon: <FilmIcon />,
    tooltip: 'Video',
  },
};

export function MediaDropdownMenu({
  children,
  nodeType,
  ...props
}: DropdownMenuProps & { nodeType: string }) {
  const currentConfig = MEDIA_CONFIG[nodeType];

  const { api, editor } = useEditorPlugin(MediaEmbedPlugin);
  const { openFilePicker } = useFilePicker({
    accept: currentConfig.accept,
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      (editor as any).tf.insert.media(updatedFiles);
    },
  });

  const openState = useOpenState();

  return (
    <DropdownMenu {...openState} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarSplitButton
          onMainButtonClick={() => openFilePicker()}
          pressed={openState.open}
          tooltip={currentConfig.tooltip}
        >
          {currentConfig.icon}
        </ToolbarSplitButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn('min-w-0 data-[state=closed]:hidden')}
        align="start"
      >
        <DropdownMenuRadioGroup>
          <DropdownMenuRadioItem
            value="upload"
            onSelect={() => openFilePicker()}
            hideIcon
          >
            <div className="flex items-center gap-2">
              {currentConfig.icon}
              <span className="text-sm">Upload from computer</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="url"
            onSelect={() => {
              api.media_embed.openFloating(nodeType);
            }}
            hideIcon
          >
            <div className="flex items-center gap-2">
              <LinkIcon />
              <span className="text-sm">Insert via URL</span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
