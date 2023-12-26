import React from 'react';
import { PlateElement } from '@udecode/plate-common';
import { useExcalidrawElement } from '@udecode/plate-excalidraw';

import { withRef } from '@/lib/utils';

export const ExcalidrawElement = withRef<typeof PlateElement>(
  ({ nodeProps, ...props }) => {
    const { children, element } = props;

    const { Excalidraw, excalidrawProps } = useExcalidrawElement({
      element,
    });

    return (
      <PlateElement {...props}>
        <div contentEditable={false}>
          <div className="h-[600px]">
            {Excalidraw && (
              <Excalidraw {...nodeProps} {...(excalidrawProps as any)} />
            )}
          </div>
        </div>
        {children}
      </PlateElement>
    );
  }
);
