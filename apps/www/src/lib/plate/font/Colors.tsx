import React from 'react';
import { cn } from '@udecode/plate-tailwind';
import { ColorButton } from './ColorButton';
import { TColor } from './TColor';

type ColorsProps = {
  color?: string;
  colors: TColor[];
  updateColor: (color: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function Colors({
  color,
  colors,
  updateColor,
  className,
  ...props
}: ColorsProps) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(10,1fr)] gap-1', className)}
      {...props}
    >
      {colors.map(({ name, value, isBrightColor }) => (
        <ColorButton
          key={name ?? value}
          name={name}
          value={value}
          isBrightColor={isBrightColor}
          isSelected={color === value}
          updateColor={updateColor}
        />
      ))}
    </div>
  );
}
