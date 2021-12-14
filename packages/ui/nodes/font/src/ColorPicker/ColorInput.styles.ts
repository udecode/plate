import { ChangeEvent } from 'react';
import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

export type ColorInputStyles = {
  /**
   * Input.
   */
  input?: CSSProp;
};

export interface ColorInputProps extends StyledProps<ColorInputStyles> {
  value?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const getColorInputStyles = (props?: ColorInputProps) =>
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
          width: 0;
          height: 0;
          padding: 0;
          margin: 0;
          border: 0;
          overflow: hidden;
        `,
      ],
    }
  );
