'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { cn } from '@udecode/cn';
import { useEditorPlugin } from '@udecode/plate-core/react';
import { MediaFloatingPlugin } from '@udecode/plate-media/react';
import { focusEditor } from '@udecode/slate-react';
import { ImageUp, LinkIcon } from 'lucide-react';
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

export function ImageDropdownMenu({ children, ...props }: DropdownMenuProps) {
  /** Open file picker */
  const { editor, setOption } = useEditorPlugin(MediaFloatingPlugin);
  const { openFilePicker } = useFilePicker({
    accept: 'image/*',
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
          tooltip="Align"
        >
          <ImageUp />
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
              <ImageUp />
              <span className="text-sm">Upload from computer</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="url"
            onSelect={() => {
              focusEditor(editor);
              setOption('isOpen', true);
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
