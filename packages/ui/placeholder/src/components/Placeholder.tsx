import React from 'react';
import {
  createNodeHOC,
  createNodesHOC,
  isCollapsed,
  isElementEmpty,
  usePlateEditorState,
  Value,
} from '@udecode/plate-core';
import { useFocused, useSelected } from 'slate-react';
import { getPlaceholderStyles } from './Placeholder.styles';
import { PlaceholderProps } from './Placeholder.types';

export const Placeholder = <V extends Value>(props: PlaceholderProps<V>) => {
  const {
    children,
    element,
    placeholder,
    hideOnBlur = true,
    nodeProps,
  } = props;

  const focused = useFocused();
  const selected = useSelected();
  const editor = usePlateEditorState();

  const isEmptyBlock = isElementEmpty(editor, element);

  const enabled =
    isEmptyBlock &&
    (!hideOnBlur ||
      (isCollapsed(editor.selection) && hideOnBlur && focused && selected));

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
