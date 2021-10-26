import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import { css } from 'styled-components';
import tw from 'twin.macro';

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
  const content = (
    <button
      type="button"
      aria-label={name}
      onClick={(ev) => updateColor(ev, value)}
      css={[
        tw`cursor-pointer h-8 w-8 border-0 rounded-full`,
        css`
          background-color: ${value};

          :hover {
            box-shadow: 0px 0px 5px 1px #9a9a9a;
          }
          :focus {
            box-shadow: 0px 0px 5px 1px #676767;
          }
        `,
        tw`border-2 border-gray-300 border-solid`,
        !isBrightColor && tw`border-transparent text-white`,
      ]}
    >
      {isSelected ? selectedIcon : null}
    </button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};
