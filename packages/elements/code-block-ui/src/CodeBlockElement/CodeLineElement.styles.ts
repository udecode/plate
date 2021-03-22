import { NodeStyleProps, NodeStyleSet } from '@udecode/slate-plugins-ui-fluent';

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
