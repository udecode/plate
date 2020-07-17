import { BlockquoteElementStyleProps, BlockquoteElementStyles } from '../types';

export const getBlockquoteElementStyles = ({
  className,
}: BlockquoteElementStyleProps): BlockquoteElementStyles => {
  return {
    root: [
      {
        // Insert css properties
        borderLeft: '2px solid #ddd',
        padding: '10px 20px 10px 16px',
        color: '#aaa',
        margin: '8px 0',
      },
      className,
    ],
  };
};
