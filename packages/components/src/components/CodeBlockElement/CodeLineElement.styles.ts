import { CodeLineElementStyleProps, CodeLineElementStyles } from '../types';

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
