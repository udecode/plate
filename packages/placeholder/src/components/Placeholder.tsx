import React, { useMemo } from 'react';
import { createNodeHOC, createNodesHOC } from '@udecode/plate-common';
import { Node } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { getPlaceholderStyles } from './Placeholder.styles';
import { PlaceholderProps } from './Placeholder.types';

export const Placeholder = (props: PlaceholderProps) => {
  const {
    children,
    element,
    placeholder,
    hideOnBlur = true,
    nodeProps,
  } = props;

  const focused = useFocused();
  const selected = useSelected();

  const enabled = useMemo(() => {
    const string = Node.string(element);

    return (
      (!hideOnBlur && !string) || (hideOnBlur && focused && selected && !string)
    );
  }, [element, hideOnBlur, focused, selected]);

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        styles: getPlaceholderStyles({ enabled, ...props }),
        placeholder,
      },
    });
  });
};

export const withPlaceholder = createNodeHOC(Placeholder);
export const withPlaceholders = createNodesHOC(Placeholder);
