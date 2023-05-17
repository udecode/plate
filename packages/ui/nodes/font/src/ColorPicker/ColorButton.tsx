import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import { cn } from '@udecode/plate-styled-components';

type ColorButtonProps = {
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  selectedIcon: ReactNode;
  updateColor: (color: string) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ColorButton = ({
  name,
  value,
  isBrightColor,
  isSelected,
  selectedIcon,
  updateColor,
  className,
  ...props
}: ColorButtonProps) => {
  const content = (
    <button
      data-testid="ColorButton"
      type="button"
      name={name}
      aria-label={name}
      onClick={() => updateColor(value)}
      style={{ backgroundColor: value }}
      className={cn(
        'h-8 w-8 cursor-pointer rounded-full border-2 border-solid border-gray-300',
        'hover:shadow-[0px_0px_5px_1px_#9a9a9a] focus:shadow-[0px_0px_5px_1px_#676767]',
        !isBrightColor && 'border-transparent text-white',
        className
      )}
      {...props}
    >
      {isSelected ? selectedIcon : null}
    </button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};
