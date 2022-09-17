import { css } from 'styled-components';
import tw from 'twin.macro';

export const menuButtonCss = css`
  ${tw`p-1 w-8 h-8`};

  & .mdc-icon-button__ripple::before,
  & .mdc-icon-button__ripple::after {
    border-radius: initial;
  }

  svg {
    position: relative;
    top: -3px;
  }
`;
