'use client';

import * as React from 'react';

import type { TFileElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { useMediaState } from '@platejs/media/react';
import { ResizableProvider } from '@platejs/resizable';
import { FileUp } from 'lucide-react';
import { PlateElement, withHOC } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';

export const FileElement = withHOC(
  ResizableProvider,
  function FileElement(props: PlateElementProps<TFileElement>) {
    const { name, selected, unsafeUrl } = useMediaState();
    const captionFocused = useCaptionFocused(props.path);

    return (
      <PlateElement className="my-px rounded-sm" {...props}>
        <figure className="group relative m-0 [&>figcaption]:text-left">
          <div contentEditable={false}>
            <a
              className={cn(
                'flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted'
              )}
              download={name}
              href={unsafeUrl}
              rel="noopener noreferrer"
              role="button"
              target="_blank"
            >
              <div className={cn('flex items-center gap-1 p-1')}>
                <FileUp className="size-5" />
                <div>{name}</div>
              </div>
            </a>
          </div>
          <Caption
            active={selected || captionFocused}
            align="left"
            element={props.element}
            slots={props.slots}
          >
            {props.children}
          </Caption>
        </figure>
      </PlateElement>
    );
  }
);
