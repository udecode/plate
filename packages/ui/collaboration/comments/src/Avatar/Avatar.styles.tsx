import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';

export const createAvatarStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadCommentProfileImage',
      ...props,
    },
    {
      root: css`
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-align: left;
        color: black;
        font-size: 14px;
        direction: ltr;
        cursor: default;
        -webkit-user-select: text;
        white-space: nowrap;
        width: 32px;
        aspect-ratio: auto 32 / 32;
        height: 32px;
        object-fit: cover;
        left: 0 !important;
        display: block;
        position: relative;
        border-radius: 50%;
        margin-left: 2px;
        margin-top: 2px;
      `,
    }
  );

export const createAvatarHolderStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadAvatarHolder',
      ...props,
    },
    {
      root: css`
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-align: left;
        color: black;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: 14px;
        direction: ltr;
        cursor: default;
        -webkit-user-select: text;
        white-space: nowrap;
        height: 38px;
        margin-top: 2px;
        max-width: 36px;
        width: 36px;
      `,
    }
  );
