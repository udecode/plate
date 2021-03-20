import { NodeStyleProps, NodeStyleSet } from '../StyledNode/StyledNode.types';

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
