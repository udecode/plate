import { css } from 'twin.macro';
import { GetStyles } from '../../types';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const getExcalidrawElementStyles: GetStyles<ExcalidrawElementProps> = (
  styles
) => ({
  excalidrawWrapper: [
    css`
      height: 600px;
    `,
    styles?.excalidrawWrapper,
  ],
});
