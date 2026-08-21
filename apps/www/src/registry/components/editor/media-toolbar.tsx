'use client';

import type { MediaPlugin } from '@platejs/media/react';
import { cva } from 'class-variance-authority';
import { Link, Trash2Icon } from 'lucide-react';
import {
  useEditor,
  useElement,
  useEditorReadOnly,
  useFocusedLast,
} from 'platejs/react';
import * as React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { CaptionButton } from './caption';

const inputVariants = cva(
  'flex h-[28px] w-full rounded-md border-none bg-transparent px-1.5 py-1 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-transparent md:text-sm'
);

function MediaToolbarContent({ plugin }: { plugin: MediaPlugin }) {
  const editor = useEditor();
  const element = useElement(plugin);
  const [isEditing, setIsEditing] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const reset = () => {
    setUrl('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex w-[330px] flex-col">
        <div className="flex items-center">
          <div className="flex items-center pr-1 pl-2 text-muted-foreground">
            <Link className="size-4" />
          </div>

          <input
            className={inputVariants()}
            value={url}
            placeholder="Paste the embed link..."
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();

                if (
                  url !== element.url &&
                  !editor.plugin(plugin).update.setUrl({ element, url })
                ) {
                  return;
                }

                reset();
                editor.api.dom.focus();
              }
              if (event.key === 'Escape') {
                reset();
                editor.api.dom.focus();
              }
            }}
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div className="box-content flex items-center">
      <Button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        onClick={() => {
          const sourceUrl =
            'sourceUrl' in element && typeof element.sourceUrl === 'string'
              ? element.sourceUrl
              : undefined;

          setUrl(sourceUrl ?? element.url);
          setIsEditing(true);
        }}
      >
        Edit link
      </Button>

      <CaptionButton size="sm" variant="ghost">
        Caption
      </CaptionButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          editor.update.nodes.remove({ at: element });
          editor.api.dom.focus();
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

export function MediaToolbar({
  children,
  disabled = false,
  plugin,
  selected,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  plugin: MediaPlugin;
  selected: boolean;
}) {
  const isFocusedLast = useFocusedLast();
  const readOnly = useEditorReadOnly();
  const open = isFocusedLast && !readOnly && selected && !disabled;

  return (
    <Popover open={open} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {open ? <MediaToolbarContent plugin={plugin} /> : null}
      </PopoverContent>
    </Popover>
  );
}
