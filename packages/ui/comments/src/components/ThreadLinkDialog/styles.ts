import { css } from 'styled-components';
import tw from 'twin.macro';

export const threadLinkDialogCloseButtonCss = css`
  ${tw`h-8 p-2 w-8`}

  svg {
    ${tw`h-4 relative w-4`};
    top: -6px;
  }
`;
