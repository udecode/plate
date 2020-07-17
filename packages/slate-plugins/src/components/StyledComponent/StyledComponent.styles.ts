import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from './StyledComponent.types';

export const getStyledComponentStyles = ({
  className,
}: StyledComponentStyleProps): StyledComponentStyles => {
  return {
    root: [
      className,
      {
        // Insert css properties
      },
    ],
  };
};
