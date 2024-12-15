import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';
import type { TFileElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';
import { FileUp } from 'lucide-react';

export const MediaFileElementStatic = ({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) => {
  const { name } = element as TFileElement;

  return (
    <PlateElementStatic
      className={cn('relative my-px rounded-sm', className)}
      element={element}
      {...props}
    >
      <div
        className="group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted"
        role="button"
      >
        <div className="flex items-center gap-1 p-1">
          <FileUp className="size-5" />
          <div>{name}</div>
        </div>
      </div>
      {children}
    </PlateElementStatic>
  );
};
