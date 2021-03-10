import { NodeStyleProps, NodeStyleSet } from '../../types';

export const getStyledComponentStyles = ({
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
