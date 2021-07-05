import { createStyles } from '@udecode/slate-plugins-ui';
import { css } from 'twin.macro';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const getExcalidrawElementStyles = (props: ExcalidrawElementProps) =>
  createStyles(
    { prefixClassNames: 'ExcalidrawElement', ...props },
    {
      excalidrawWrapper: [
        css`
          height: 600px;
        `,
      ],
    }
  );
