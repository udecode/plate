import { NodeStyleProps, NodeStyleSet } from '../../types';

export const getCodeLineElementStyles = ({
  className,
}: NodeStyleProps): NodeStyleSet => {
  return {
    root: [
      {
        // Insert css properties
      },
      className,
    ],
  };
};
