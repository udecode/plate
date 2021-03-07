import {
  CodeLineElementStyleProps,
  CodeLineElementStyles,
} from './CodeLineElement.types';

export const getCodeLineElementStyles = ({
  className,
}: CodeLineElementStyleProps): CodeLineElementStyles => {
  return {
    root: [
      {
        // Insert css properties
      },
      className,
    ],
  };
};
