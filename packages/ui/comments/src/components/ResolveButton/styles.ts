import { css } from 'styled-components';

export const resolveButtonCss = css`
  padding: 3px;
  width: 30px;
  height: 30px;

  & .mdc-icon-button__ripple::before,
  & .mdc-icon-button__ripple::after {
    border-radius: initial;
  }

  svg {
    position: relative;
    top: -3px;
  }
`;

export const resolveButtonIconCss = css`
  color: #2196f3;
`;
