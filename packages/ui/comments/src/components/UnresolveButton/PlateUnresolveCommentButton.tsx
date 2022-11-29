import React from 'react';
import { IconButton } from '@mui/material';
import { Unarchive } from '@styled-icons/material';
import { css } from 'styled-components';
import tw from 'twin.macro';
import {
  UnresolveCommentButton,
  UnresolveCommentButtonProps,
} from './UnresolveCommentButton';

export const unresolveCommentButtonCss = css`
  ${tw`p-1 w-8 h-8`};
`;

export const unresolveCommentIconCss = css`
  ${tw`text-black`};
`;

export const PlateUnresolveCommentButton = (
  props: UnresolveCommentButtonProps
) => {
  return (
    <IconButton>
      <UnresolveCommentButton {...props}>
        <Unarchive size={22} />
      </UnresolveCommentButton>
    </IconButton>
  );
};
