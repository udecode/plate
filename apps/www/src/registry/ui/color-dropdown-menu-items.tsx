'use client';

import * as React from 'react';

import type { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';

import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type TColor = {
  isBrightColor: boolean;
  name: string;
  value: string;
};

type ColorDropdownMenuItemProps = {
  isBrightColor: boolean;
  isSelected: boolean;
  value: string;
  updateColor: (color: string) => void;
  name?: string;
} & DropdownMenuItemProps;

export function ColorDropdownMenuItem({
  className,
  isBrightColor,
  isSelected,
  name,
  updateColor,
  value,
  ...props
}: ColorDropdownMenuItemProps) {
  const content = (
    <DropdownMenuItem
      className={cn(
        buttonVariants({
          size: 'icon',
          variant: 'outline',
        }),
        'my-1 flex size-6 items-center justify-center rounded-full border border-solid border-muted p-0 transition-all hover:scale-125',
        !isBrightColor && 'border-transparent',
        isSelected && 'border-2 border-primary',
        className
      )}
      style={{ backgroundColor: value }}
      onSelect={(e) => {
        e.preventDefault();
        updateColor(value);
      }}
      {...props}
    />
  );

  return name ? (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>
      <TooltipContent className="mb-1 capitalize">{name}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

type ColorDropdownMenuItemsProps = {
  colors: TColor[];
  updateColor: (color: string) => void;
  color?: string;
} & React.ComponentProps<'div'>;

export function ColorDropdownMenuItems({
  className,
  color,
  colors,
  updateColor,
  ...props
}: ColorDropdownMenuItemsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(10,1fr)] place-items-center gap-x-1',
        className
      )}
      {...props}
    >
      <TooltipProvider>
        {colors.map(({ isBrightColor, name, value }) => (
          <ColorDropdownMenuItem
            name={name}
            key={name ?? value}
            value={value}
            isBrightColor={isBrightColor}
            isSelected={color === value}
            updateColor={updateColor}
          />
        ))}
        {props.children}
      </TooltipProvider>
    </div>
  );
}
