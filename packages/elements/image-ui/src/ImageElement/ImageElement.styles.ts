import { createStyles } from '@udecode/slate-plugins-styled-components';
import tw from 'twin.macro';
import { ImageElementStyleProps } from './ImageElement.types';

export const getImageElementStyles = (props: ImageElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'ImageElement', ...props },
    {
      root: [{}],
      img: [
        tw`block max-w-full py-2.5 px-0`,
        tw`maxHeight[20em]`,
        props.focused && props.selected && tw`boxShadow[0 0 0 3px #B4D5FF]`,
      ],
    }
  );
