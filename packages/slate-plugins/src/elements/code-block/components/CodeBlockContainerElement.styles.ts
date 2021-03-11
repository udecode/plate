import {
  CodeBlockContainerElementStyleProps,
  CodeBlockContainerElementStyles,
} from '../types';

export const getCodeBlockContainerElementStyles = ({
  className,
}: CodeBlockContainerElementStyleProps): CodeBlockContainerElementStyles => {
  return {
    root: [
      {
        // Insert css properties
      },
      className,
    ],
  };
};
