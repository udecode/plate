import React from 'react';
import { useElement } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import { BorderAllIcon, TTableElement } from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';
import { PlateTableBordersDropdownMenuContent } from './PlateTableBordersDropdownMenuContent';

import { buttonVariants } from '@/plate/button/PlateButton';
import { RemoveNodeButton } from '@/plate/button/RemoveNodeButton';
import { floatingStyles } from '@/plate/toolbar/floatingStyles';

export function PlateTablePopover({ children, ...props }: PopoverProps) {
  const element = useElement<TTableElement>();

  return (
    <ElementPopover
      content={
        <div className="min-w-[140px] px-1 py-1.5">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="w-full justify-start"
                aria-label="Borders"
              >
                <BorderAllIcon />
                <div>Borders</div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <PlateTableBordersDropdownMenuContent />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div>
            <RemoveNodeButton
              element={element}
              className={cn(
                buttonVariants({ variant: 'menu' }),
                'w-40 justify-start'
              )}
              contentEditable={false}
            >
              <div>Delete</div>
            </RemoveNodeButton>
          </div>
        </div>
      }
      className={floatingStyles.rootVariants()}
      {...props}
    >
      {children}
    </ElementPopover>
  );
}
