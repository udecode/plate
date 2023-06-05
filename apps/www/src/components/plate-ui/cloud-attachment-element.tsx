import React from 'react';
import {
  TCloudAttachmentElement,
  useCloudAttachmentElementState,
} from '@udecode/plate-cloud';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import { StatusBar } from './cloud-status-bar';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface CloudAttachmentElementProps
  extends PlateElementProps<Value, TCloudAttachmentElement> {}

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
        <Icons.attachment width={24} height={24} />
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
        className="ml-4 h-8 w-8 shrink-0 duration-200"
        contentEditable={false}
      >
        {upload.status === 'success' && (
          <a href={element.url} target="_blank" rel="noreferrer">
            <Icons.downloadCloud
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              width={24}
              height={24}
            />
          </a>
        )}
      </div>
      {children}
    </PlateElement>
  );
}
