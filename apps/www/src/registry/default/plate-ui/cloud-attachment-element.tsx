'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  type TCloudAttachmentElement,
  useCloudAttachmentElementState,
} from '@udecode/plate-cloud';
import {
  PlateElement,
  type PlateElementProps,
} from '@udecode/plate-common/react';

import { Icons } from '@/components/icons';

import { StatusBar } from './cloud-status-bar';

export interface CloudAttachmentElementProps
  extends PlateElementProps<TCloudAttachmentElement> {}

export function CloudAttachmentElement({
  className,
  ...props
}: CloudAttachmentElementProps) {
  const { children, element } = props;

  const { focused, selected, upload } = useCloudAttachmentElementState({
    element,
  });

  return (
    <PlateElement
      className={cn(
        'relative my-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-border bg-background p-4',
        focused && selected && 'border-blue-400 shadow-[0_0_1px_3px_#60a5fa]',
        className
      )}
      draggable
      {...props}
    >
      <div className="shrink-0 text-muted-foreground" contentEditable={false}>
        <Icons.attachment height={24} width={24} />
      </div>
      <div className="grow" contentEditable={false}>
        <div className="text-base">{element.filename}</div>
        <StatusBar upload={upload}>
          <div className="text-sm text-muted-foreground">
            {element.bytes} bytes
          </div>
        </StatusBar>
      </div>
      <div
        className="ml-4 size-8 shrink-0 duration-200"
        contentEditable={false}
      >
        {upload.status === 'success' && (
          <a href={element.url} rel="noreferrer" target="_blank">
            <Icons.downloadCloud
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              height={24}
              width={24}
            />
          </a>
        )}
      </div>
      {children}
    </PlateElement>
  );
}
