'use client';

import React from 'react';

import type { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';

import { cn } from '@udecode/cn';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';
import { DropdownMenuItem } from './dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

export type TColor = {
  isBrightColor: boolean;
  name: string;
  value: string;
};

type ColorDropdownMenuItemProps = {
  isBrightColor: boolean;
  isSelected: boolean;
  updateColor: (color: string) => void;
  value: string;
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
          isMenu: true,
          variant: 'outline',
        }),
        'flex size-6 items-center justify-center rounded-full border border-solid border-muted p-0 transition-all hover:scale-125',
        !isBrightColor && 'border-transparent text-white hover:!text-white',
        className
      )}
      style={{ backgroundColor: value }}
      onSelect={(e) => {
        e.preventDefault();
        updateColor(value);
      }}
      {...props}
    >
      {isSelected ? <Icons.check className="size-3" /> : null}
    </DropdownMenuItem>
  );

  return name ? (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>
      <TooltipContent className="mb-2 capitalize">{name}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

type ColorDropdownMenuItemsProps = {
  colors: TColor[];
  updateColor: (color: string) => void;
  color?: string;
} & React.HTMLAttributes<HTMLDivElement>;

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
        'grid grid-cols-[repeat(10,1fr)] place-items-center gap-1',
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
