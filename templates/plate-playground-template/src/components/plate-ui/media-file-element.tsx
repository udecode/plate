'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { withHOC } from '@udecode/plate-common/react';
import { useMediaState } from '@udecode/plate-media/react';
import { ResizableProvider } from '@udecode/plate-resizable';
import { FileUp } from 'lucide-react';
import { useReadOnly } from 'slate-react';

import { Caption, CaptionTextarea } from './caption';
import { PlateElement } from './plate-element';

export const MediaFileElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const readOnly = useReadOnly();

      const { name, unsafeUrl } = useMediaState();

      const onDownload = () => {
        window.open(unsafeUrl);
      };

      return (
        <PlateElement
          ref={ref}
          className={cn('relative my-px rounded-sm', className)}
          {...props}
        >
          <div
            className="hover:bg-muted group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px]"
            onClick={onDownload}
            contentEditable={false}
            role="button"
          >
            <div className="flex items-center gap-1 p-1">
              <FileUp className="size-5" />

              <div>{name}</div>

              {/* TODO: add size */}
              {/* <div className="text-muted-foreground">{element.size}</div> */}
            </div>

            <Caption align="left">
              <CaptionTextarea
                className="text-left"
                readOnly={readOnly}
                placeholder="Write a caption..."
              />
            </Caption>
          </div>
          {children}
        </PlateElement>
      );
    }
  )
);
