import React from 'react';
import { useRemoveNodeButton } from '@udecode/plate-common';
import { useColumnState, useDebouncePopoverOpen } from '@udecode/plate-layout';
import { useReadOnly } from 'slate-react';

import { Icons, iconVariants } from '@/components/icons';

import { Button } from './button';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Separator } from './separator';

export interface LayoutToolbarPopoverProps {}

export function LayoutToolbarPopover({
  children,
}: React.PropsWithChildren<LayoutToolbarPopoverProps>) {
  const readOnly = useReadOnly();

  const {
    element,
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  } = useColumnState();

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
        <div className="box-content flex h-9 items-center gap-1">
          <Button
            variant="ghost"
            size="sms"
            // tooltip="doubleColumn"
            onClick={setDoubleColumn}
          >
            <Icons.doubleColumn />
          </Button>
          <Button
            variant="ghost"
            size="sms"
            // tooltip="threeColumn"
            onClick={setThreeColumn}
          >
            <Icons.threeColumn />
          </Button>
          <Button
            variant="ghost"
            size="sms"
            // tooltip="rightSideDoubleColumn"
            onClick={setRightSideDoubleColumn}
          >
            <Icons.rightSideDoubleColumn />
          </Button>
          <Button
            variant="ghost"
            size="sms"
            // tooltip="plugins.layout.leftSideDoubleColumn"
            onClick={setLeftSideDoubleColumn}
          >
            <Icons.leftSideDoubleColumn />
          </Button>
          <Button
            variant="ghost"
            size="sms"
            // tooltip="plugins.layout.doubleSideDoubleColumn"
            onClick={setDoubleSideDoubleColumn}
          >
            <Icons.doubleSideDoubleColumn />
          </Button>

          <Separator orientation="vertical" className="my-1" />
          <Button variant="ghost" size="sms" {...buttonProps}>
            <Icons.delete className={iconVariants({ variant: 'toolbar' })} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
