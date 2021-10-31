import React, { ReactNode } from 'react';
import { ColorButton } from './ColorButton';
import { getColorsStyles } from './Colors.styles';
import { ColorType } from './ColorType';

type ColorsProps = {
  color?: string;
  colors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (color: string) => void;
};

export const Colors = ({
  color,
  colors,
  selectedIcon,
  updateColor,
}: ColorsProps) => {
  const styles = getColorsStyles();

  return (
    <div css={styles.root.css}>
      {colors.map(({ name, value, isBrightColor }) => (
        <ColorButton
          key={name || value}
          name={name}
          value={value}
          isBrightColor={isBrightColor}
          isSelected={color === value}
          selectedIcon={selectedIcon}
          updateColor={updateColor}
        />
      ))}
    </div>
  );
};
