import React from 'react';
import Tippy from '@tippyjs/react';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { Button, ButtonProps } from '@/components/ui/button';

type ColorButtonProps = {
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  updateColor: (color: string) => void;
} & ButtonProps;

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
    <Button
      name={name}
      aria-label={name}
      style={{ backgroundColor: value }}
      className={cn(
        'h-6 w-6 border border-solid border-muted p-0',
        !isBrightColor && 'border-transparent text-white',
        className
      )}
      onClick={() => updateColor(value)}
      {...props}
    >
      {isSelected ? <Icons.check /> : null}
    </Button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
}
