import React from 'react';
import { RemoveNodeButton, RemoveNodeButtonProps } from '@udecode/plate-button';
import tw, { css } from 'twin.macro';
import { DeleteIcon } from '../Icon/DeleteIcon';
import { plateButtonCss } from './PlateButton';

export const PlateRemoveNodeButton = ({
  css: _css,
  ...props
}: RemoveNodeButtonProps) => {
  return (
    <RemoveNodeButton
      css={[
        plateButtonCss,
        tw`py-1 px-0`,
        css`
          width: 24px;
          height: 24px;
        `,
        _css,
      ]}
      {...props}
    >
      <DeleteIcon />
    </RemoveNodeButton>
  );
};
