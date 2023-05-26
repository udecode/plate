import React from 'react';
import { queryNode } from '@udecode/plate';
import {
  createNodeHOC,
  createNodesHOC,
  findNodePath,
  isCollapsed,
  isElementEmpty,
  QueryNodeOptions,
  usePlateEditorState,
} from '@udecode/plate-common';
import { cn, PlateElementProps } from '@udecode/plate-tailwind';
import { useFocused, useSelected } from 'slate-react';

export interface PlaceholderProps extends PlateElementProps {
  placeholder: string;
  hideOnBlur?: boolean;
  query?: QueryNodeOptions;
}

export const Placeholder = (props: PlaceholderProps) => {
  const {
    children,
    element,
    placeholder,
    hideOnBlur = true,
    query,
    nodeProps,
  } = props;

  const focused = useFocused();
  const selected = useSelected();
  const editor = usePlateEditorState();

  const isEmptyBlock = isElementEmpty(editor, element);

  const enabled =
    isEmptyBlock &&
    (!query || queryNode([element, findNodePath(editor, element)!], query)) &&
    (!hideOnBlur ||
      (isCollapsed(editor.selection) && hideOnBlur && focused && selected));

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        className: cn(
          enabled &&
            'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]'
        ),
        placeholder,
      },
    });
  });
};

export const withPlaceholder = createNodeHOC(Placeholder);
export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);
