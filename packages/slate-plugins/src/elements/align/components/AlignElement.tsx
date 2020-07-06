import React from 'react';
import {
  ALIGN_CENTER,
  ALIGN_LEFT,
  ALIGN_RIGHT,
  AlignRenderElementProps,
} from '../types';

export const AlignElement = ({
  attributes,
  children,
  typeAlignLeft = ALIGN_LEFT,
  typeAlignCenter = ALIGN_CENTER,
  typeAlignRight = ALIGN_RIGHT,
}: AlignRenderElementProps) => {
  const textAlign: Record<string, 'left' | 'center' | 'right'> = {
    [typeAlignLeft]: 'left',
    [typeAlignCenter]: 'center',
    [typeAlignRight]: 'right',
  };

  return (
    <div
      {...attributes}
      style={{ textAlign: textAlign[attributes['data-slate-type']] }}
    >
      {children}
    </div>
  );
};
