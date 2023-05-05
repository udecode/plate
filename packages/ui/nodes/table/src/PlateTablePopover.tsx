import React from 'react';
import { useElement } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import { BorderAllIcon, TTableElement } from '@udecode/plate-table';
import {
  cssMenuItemButton,
  PlateButton,
  RemoveNodeButton,
} from '@udecode/plate-ui-button';
import { floatingRootCss } from '@udecode/plate-ui-toolbar';
import tw from 'twin.macro';
import { PlateTableBordersDropdownMenuContent } from './PlateTableBordersDropdownMenuContent';

export const PlateTablePopover = ({ children, ...props }: PopoverProps) => {
  const element = useElement<TTableElement>();

  return (
    <ElementPopover
      content={
        <div css={tw`min-w-[140px] px-1 py-1.5`}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <PlateButton
                type="button"
                tw="justify-start w-full"
                aria-label="Borders"
              >
                <BorderAllIcon />
                <div>Borders</div>
              </PlateButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <PlateTableBordersDropdownMenuContent />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div>
            <RemoveNodeButton
              element={element}
              css={[cssMenuItemButton, tw`justify-start w-40`]}
              contentEditable={false}
            >
              <div>Delete</div>
            </RemoveNodeButton>
          </div>
        </div>
      }
      css={floatingRootCss}
      {...props}
    >
      {children}
    </ElementPopover>
  );
};
