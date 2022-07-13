import React from 'react';
import { Button } from '@udecode/plate-button';
import { HTMLPropsAs } from '@udecode/plate-core';
import { css } from 'styled-components';
import tw from 'twin.macro';

export interface PlateButtonProps extends HTMLPropsAs<'button'> {
  size?: number | string;
  px?: number | string;
  py?: number | string;
}

export const plateButtonCss = [
  tw`relative inline-flex justify-center items-center text-center max-w-full p-0`,
  tw`border-0 font-medium cursor-pointer`,
  tw`bg-white hover:bg-gray-100 active:bg-gray-200`,
  tw`px-2.5 py-1`,
  css`
    font-family: inherit;
    font-size: 14px;
    border-radius: 3px;

    color: inherit;

    :active {
      color: inherit;
    }

    :visited {
      color: inherit;
    }
  `,
];

export const PlateButton = ({
  size,
  px,
  py,
  css: _css,
  ...props
}: PlateButtonProps) => <Button css={plateButtonCss} {...props} />;
