import React, { ReactNode } from 'react';
import { css } from 'styled-components';
import { Color } from './Color';
import { ColorType } from './defaults';

type ColorsProps = {
  color?: string;
  colors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

export const Colors = ({
  color,
  colors,
  selectedIcon,
  updateColor,
}: ColorsProps) => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 0.25rem;
      `}
    >
      {colors.map(({ name, value, isBrightColor }) => (
        <Color
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
