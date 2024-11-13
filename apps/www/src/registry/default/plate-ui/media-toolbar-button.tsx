'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { useEditorRef } from '@udecode/plate-core/react';
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
  const editor = useEditorRef();
  const { openFilePicker } = useFilePicker({
    accept: 'image/*',
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      (editor as any).tf.insert.media(updatedFiles);
    },
  });

  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarSplitButton
          onMainButtonClick={() => openFilePicker()}
          pressed={openState.open}
          tooltip="Align"
        >
          <ImageUp />
        </ToolbarSplitButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
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
            onSelect={() => console.log('url')}
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
