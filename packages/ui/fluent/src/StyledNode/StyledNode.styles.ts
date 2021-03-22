import { NodeStyleProps, NodeStyleSet } from './StyledNode.types';

export const getStyledNodeStyles = ({
  className,
}: NodeStyleProps): NodeStyleSet => {
  return {
    root: [
      className,
      {
        // Insert css properties
      },
    ],
  };
};
