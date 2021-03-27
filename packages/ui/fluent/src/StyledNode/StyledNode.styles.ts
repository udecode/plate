import { ClassName, RootStyleSet } from './StyledNode.types';

export const getStyledNodeStyles = ({ className }: ClassName): RootStyleSet => {
  return {
    root: [
      className,
      {
        // Insert css properties
      },
    ],
  };
};
