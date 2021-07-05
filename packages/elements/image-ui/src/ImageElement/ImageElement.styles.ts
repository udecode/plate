import { createStyles } from '@udecode/slate-plugins-ui';
import { ImageElementStyleProps } from './ImageElement.types';

export const getImageElementStyles = (props: ImageElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'ImageElement', ...props },
    {
      root: [
        {
          // Insert css properties
        },
      ],
      img: {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '20em',
        padding: '10px 0',
        boxShadow:
          props.focused && props.selected ? '0 0 0 3px #B4D5FF' : 'none',
      },
    }
  );
