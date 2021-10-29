import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import { getColorButtonStyles } from './ColorButton.styles';

type ColorButtonProps = {
  name?: string;
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  selectedIcon: ReactNode;
  updateColor: (color: string) => void;
};

export const ColorButton = ({
  name,
  value,
  isBrightColor,
  isSelected,
  selectedIcon,
  updateColor,
}: ColorButtonProps) => {
  const styles = getColorButtonStyles({ value, isBrightColor });

  const content = (
    <button
      type="button"
      aria-label={name}
      name={name}
      onClick={() => updateColor(value)}
      css={styles.root.css}
    >
      {isSelected ? selectedIcon : null}
    </button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};
