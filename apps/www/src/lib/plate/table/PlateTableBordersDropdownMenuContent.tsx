import React, { forwardRef, SVGProps } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  BorderBottomIcon,
  BorderLeftIcon,
  BorderNoneIcon,
  BorderOuterIcon,
  BorderRightIcon,
  BorderTopIcon,
  useTableBordersDropdownMenuContentState,
} from '@udecode/plate-table';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function Check({ checked }: { checked?: boolean }) {
  return checked ? (
    <CheckIcon className="block" />
  ) : (
    <div className="h-4 w-4" />
  );
}

export const PlateTableBordersDropdownMenuContent = forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>((props, ref) => {
  const {
    getOnSelectTableBorder,
    hasOuterBorders,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      ref={ref}
      className={cn('min-w-[220px]')}
      side="right"
      align="start"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuItem onSelect={getOnSelectTableBorder('bottom')}>
        <Icons.check checked={hasBottomBorder} />
        <BorderBottomIcon />
        <div>Bottom Border</div>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={getOnSelectTableBorder('top')}>
        <Icons.check checked={hasTopBorder} />
        <BorderTopIcon />
        <div>Top Border</div>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={getOnSelectTableBorder('left')}>
        <Icons.check checked={hasLeftBorder} />
        <BorderLeftIcon />
        <div>Left Border</div>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={getOnSelectTableBorder('right')}>
        <Icons.check checked={hasRightBorder} />
        <BorderRightIcon />
        <div>Right Border</div>
      </DropdownMenuItem>

      <Separator />

      <DropdownMenuItem onSelect={getOnSelectTableBorder('none')}>
        <Icons.check checked={hasNoBorders} />
        <BorderNoneIcon />
        <div>No Border</div>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={getOnSelectTableBorder('outer')}>
        <Icons.check checked={hasOuterBorders} />
        <BorderOuterIcon />
        <div>Outside Borders</div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
});
