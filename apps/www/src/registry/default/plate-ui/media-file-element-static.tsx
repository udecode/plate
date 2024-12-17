import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';
import type { TFileElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';
import { FileUp } from 'lucide-react';

export const MediaFileElementStatic = ({
  children,
  className,
  ...props
}: SlateElementProps) => {
  const { name, url } = props.element as TFileElement;

  return (
    <SlateElement
      className={cn(className, 'relative my-px rounded-sm')}
      {...props}
    >
      <a
        className="group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted"
        contentEditable={false}
        download={name}
        href={url}
        rel="noopener noreferrer"
        role="button"
        target="_blank"
      >
        <div className="flex items-center gap-1 p-1">
          <FileUp className="size-5" />

          <div>{name}</div>
        </div>

        {/* <Caption align="left">
              <CaptionTextarea
                className="text-left"
                readOnly={readOnly}
                placeholder="Write a caption..."
              />
            </Caption> */}
      </a>

      {children}
    </SlateElement>
  );
};
