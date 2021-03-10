import { NodeStyleProps, NodeStyleSet } from '../../types';

export const getTableElementStyles = ({
  className,
}: NodeStyleProps): NodeStyleSet => {
  return {
    root: [
      {
        // Insert css properties
        margin: '10px 0',
        borderCollapse: 'collapse',
        width: '100%',
      },
      className,
    ],
  };
};
