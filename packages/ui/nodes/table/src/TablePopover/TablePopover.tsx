import React from 'react';
import { useElement } from '@udecode/plate-core';
import { ElementPopover, PopoverProps } from '@udecode/plate-floating';
import { PlateRemoveNodeButton } from '@udecode/plate-ui-button';
import { floatingButtonCss, floatingRootCss } from '@udecode/plate-ui-toolbar';

export const TablePopover = ({ children, ...props }: PopoverProps) => {
  const element = useElement();

  return (
    <ElementPopover
      content={
        <PlateRemoveNodeButton
          element={element}
          css={floatingButtonCss}
          contentEditable={false}
        />
      }
      css={floatingRootCss}
      {...props}
    >
      {children}
    </ElementPopover>
  );
};
