import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

type ColorInputStyles = {
  /**
   * Input.
   */
  input?: CSSProp;
};

export interface ColorInputProps
  extends StyledElementProps<{}, ColorInputStyles> {}

export const getColorInputStyles = (
  props?: StyledElementProps<{}, ColorInputStyles>
) =>
  createStyles(
    { prefixClassNames: 'ColorInput', ...props },
    {
      root: [
        css`
          display: flex;
          flex-direction: column;
          align-items: center;
        `,
      ],
      input: [
        css`
          width: 0px;
          height: 0px;
          padding: 0px;
          margin: 0px;
          border: 0px;
          overflow: hidden;
        `,
      ],
    }
  );
