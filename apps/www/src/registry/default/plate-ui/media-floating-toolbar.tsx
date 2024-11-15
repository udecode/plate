'use client';

import React, { useMemo } from 'react';

import { useEditorPlugin, useEditorSelector } from '@udecode/plate-core/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
  useMediaFloatingToolbar,
} from '@udecode/plate-media/react';
import { toDOMNode } from '@udecode/slate-react';
import { getAncestorNode } from '@udecode/slate-utils';
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Separator } from './separator';

const MEDIA_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    placeholder: string;
  }
> = {
  [AudioPlugin.key]: {
    icon: <AudioLinesIcon className="size-4" />,
    placeholder: 'https://example.com/audio.mp3',
  },
  [FilePlugin.key]: {
    icon: <FileUpIcon className="size-4" />,
    placeholder: 'https://example.com/file.pdf',
  },
  [ImagePlugin.key]: {
    icon: <ImageIcon className="size-4" />,
    placeholder: 'https://example.com/image.jpg',
  },
  [VideoPlugin.key]: {
    icon: <FilmIcon className="size-4" />,
    placeholder: 'https://example.com/video.mp4',
  },
};

export function MediaFloatingToolbar() {
  const { setOption, useOption } = useEditorPlugin(MediaEmbedPlugin);

  const mediaType = useOption('mediaType');
  const isOpen = useOption('isFloatingOpen');

  const anchorElement = useEditorSelector(
    (editor) => {
      if (!isOpen) return null;

      const enter = getAncestorNode(editor);

      if (!enter) return null;

      return toDOMNode(editor, enter[0]);
    },
    [isOpen]
  );

  const mediaConfig = useMemo(() => {
    if (!mediaType) return null;

    return MEDIA_CONFIG[mediaType];
  }, [mediaType]);

  const { acceptProps, cancelProps, inputProps } = useMediaFloatingToolbar();

  if (!anchorElement) return null;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => setOption('isFloatingOpen', open)}
      modal={false}
    >
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent className="w-auto p-1" align="center" side="bottom">
        <div className="flex w-[330px] flex-col">
          <div className="flex items-center">
            <div className="flex items-center pl-2 pr-1">
              {mediaConfig?.icon}
            </div>
            <Input
              variant="ghost"
              {...inputProps}
              placeholder={mediaConfig?.placeholder}
              h="sm"
            />
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="secondary" {...cancelProps}>
              Cancel
            </Button>
            <Button size="sm" variant="default" {...acceptProps}>
              Accept
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
