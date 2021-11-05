import { AnyObject } from '@udecode/plate-core';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { StyledLeafProps } from '../StyledLeaf/StyledLeaf.types';

export const getRootProps = (
  props: StyledElementProps | StyledLeafProps | AnyObject
) => {
  const {
    editor,
    plugins,
    attributes,
    children,
    nodeProps,
    styles,
    classNames,
    prefixClassNames,
    element,
    leaf,
    text,
    ...rootProps
  } = props;

  return rootProps;
};
