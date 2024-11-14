'use client';

import React, { useMemo } from 'react';

import { cn } from '@udecode/cn';
import { useMediaFloatingToolbar } from '@udecode/plate';
import { useEditorPlugin } from '@udecode/plate-core/react';
import {
  type UseVirtualFloatingOptions,
  flip,
  offset,
} from '@udecode/plate-floating';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { popoverVariants } from './popover';
import { Separator } from './separator';

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(12),
    flip({
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
      padding: 12,
    }),
  ],
  placement: 'bottom-start',
};

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
  const { useOption } = useEditorPlugin(MediaEmbedPlugin);

  const mediaType = useOption('mediaType');

  const mediaConfig = useMemo(() => {
    if (!mediaType) return null;

    return MEDIA_CONFIG[mediaType];
  }, [mediaType]);

  const { acceptProps, cancelProps, inputProps, rootProps } =
    useMediaFloatingToolbar(floatingOptions);

  return (
    <div {...rootProps} className={cn(popoverVariants(), 'w-auto p-1')}>
      <div className="flex w-[330px] flex-col">
        <div className="flex items-center">
          <div className="flex items-center pl-2 pr-1">{mediaConfig?.icon}</div>
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
    </div>
  );
}
