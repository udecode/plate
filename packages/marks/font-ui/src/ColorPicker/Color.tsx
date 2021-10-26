import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import { getColorStyles } from './Color.styles';

type ColorProps = {
  name?: string;
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

export const Color = ({
  name,
  value,
  isBrightColor,
  isSelected,
  selectedIcon,
  updateColor,
}: ColorProps) => {
  const styles = getColorStyles({ value, isBrightColor });

  const content = (
    <button
      type="button"
      aria-label={name}
      onClick={(ev) => updateColor(ev, value)}
      css={styles.root.css}
    >
      {isSelected ? selectedIcon : null}
    </button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};
