import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { CursorOverlayProps } from './CursorOverlay';

export const getCursorOverlayStyles = (props: CursorOverlayProps) =>
  createStyles(
    { prefixClassNames: 'CursorOverlay', ...props },
    {
      selectionRect: [
        tw`absolute z-10 pointer-events-none`,
        css`
          opacity: 0.3;
        `,
      ],
      caret: [
        tw`absolute z-10 pointer-events-none`,
        css`
          width: 2px;
        `,
      ],
    }
  );
