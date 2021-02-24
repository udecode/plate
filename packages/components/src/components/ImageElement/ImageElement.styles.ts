import {
  ImageElementStyleProps,
  ImageElementStyles,
} from './ImageElement.types';

export const getImageElementStyles = ({
  className,
  focused,
  selected,
}: ImageElementStyleProps): ImageElementStyles => {
  return {
    root: [
      {
        // Insert css properties
      },
      className,
    ],
    img: {
      display: 'block',
      maxWidth: '100%',
      maxHeight: '20em',
      padding: '10px 0',
      boxShadow: focused && selected ? '0 0 0 3px #B4D5FF' : 'none',
    },
  };
};
