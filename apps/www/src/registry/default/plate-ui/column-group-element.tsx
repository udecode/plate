import React from 'react';
import { cn, withRef } from '@udecode/cn';
import {
  PlateElement,
  useElement,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import {
  ELEMENT_COLUMN,
  TColumnElement,
  useColumnState,
  useDebouncePopoverOpen,
} from '@udecode/plate-layout';
import { useReadOnly } from 'slate-react';

import { Icons } from '@/components/icons';

import { Button } from './button';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Separator } from './separator';

export const ColumnGroupElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }, ref) => {
    return (
      <PlateElement ref={ref} className={cn(className, 'my-2')} {...props}>
        <ColumnFloatingToolbar>
          <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
        </ColumnFloatingToolbar>
      </PlateElement>
    );
  }
);

export function ColumnFloatingToolbar({ children }: React.PropsWithChildren) {
  const readOnly = useReadOnly();

  const {
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  } = useColumnState();

  const element = useElement<TColumnElement>(ELEMENT_COLUMN);

  const { props: buttonProps } = useRemoveNodeButton({ element });

  const isOpen = useDebouncePopoverOpen();

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={10}
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="box-content flex h-9 items-center gap-1 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          <Button variant="ghost" size="sms" onClick={setDoubleColumn}>
            <Icons.doubleColumn />
          </Button>
          <Button variant="ghost" size="sms" onClick={setThreeColumn}>
            <Icons.threeColumn />
          </Button>
          <Button variant="ghost" size="sms" onClick={setRightSideDoubleColumn}>
            <Icons.rightSideDoubleColumn />
          </Button>
          <Button variant="ghost" size="sms" onClick={setLeftSideDoubleColumn}>
            <Icons.leftSideDoubleColumn />
          </Button>
          <Button
            variant="ghost"
            size="sms"
            onClick={setDoubleSideDoubleColumn}
          >
            <Icons.doubleSideDoubleColumn />
          </Button>

          <Separator orientation="vertical" className="my-1" />
          <Button variant="ghost" size="sms" {...buttonProps}>
            <Icons.delete />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
