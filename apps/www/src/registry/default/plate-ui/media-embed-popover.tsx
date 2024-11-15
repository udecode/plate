'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { focusEditor } from '@udecode/plate-common/react';
import { useEditorPlugin } from '@udecode/plate-core/react';
import { insertImage } from '@udecode/plate-media';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { useLastBlockDOMNode } from '@udecode/plate-utils/react';
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

export function MediaEmbedPopover({
  isOpen,
  mediaType,
  onOpenChange,
}: {
  isOpen: boolean;
  mediaType: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { editor } = useEditorPlugin(MediaEmbedPlugin);
  const [url, setUrl] = useState('');

  const anchorElement = useLastBlockDOMNode(editor, { enabled: isOpen });

  const embedMedia = useCallback(() => {
    insertImage(editor, url);
    focusEditor(editor);
    onOpenChange(false);
  }, [editor, url, onOpenChange]);

  const mediaConfig = useMemo(() => {
    if (!mediaType) return null;

    return MEDIA_CONFIG[mediaType];
  }, [mediaType]);

  if (!anchorElement) return null;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent className="w-auto p-1" align="center" side="bottom">
        <div className="flex w-[330px] flex-col">
          <div className="flex items-center">
            <div className="flex items-center pl-2 pr-1">
              {mediaConfig?.icon}
            </div>
            <Input
              variant="ghost"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') embedMedia();
              }}
              placeholder={mediaConfig?.placeholder}
              h="sm"
            />
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" variant="default" onClick={embedMedia}>
              Accept
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
