import React from 'react';
import { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import Tippy from '@tippyjs/react';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type ColorButtonProps = {
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  updateColor: (color: string) => void;
  name?: string;
} & DropdownMenuItemProps;

export function ColorButton({
  name,
  value,
  isBrightColor,
  isSelected,
  updateColor,
  className,
  ...props
}: ColorButtonProps) {
  const content = (
    <DropdownMenuItem
      className={cn(
        buttonVariants({
          variant: 'outline',
          isMenu: true,
        }),
        'h-6 w-6 border border-solid border-muted p-0',
        !isBrightColor && 'border-transparent text-white',
        className
      )}
      style={{ backgroundColor: value }}
      onSelect={(e) => {
        e.preventDefault();
        updateColor(value);
      }}
      {...props}
    >
      {isSelected ? <Icons.check /> : null}
    </DropdownMenuItem>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
}
