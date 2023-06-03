import React from 'react';
import { ELEMENT_H1, ELEMENT_PARAGRAPH } from '@udecode/plate';
import { createNodeHOC, createNodesHOC } from '@udecode/plate-common';

import { PlaceholderProps, usePlaceholderState } from '@/lib/@/usePlaceholder';
import { cn } from '@/lib/utils';

export const Placeholder = (props: PlaceholderProps) => {
  const { children, placeholder, nodeProps } = props;

  const { enabled } = usePlaceholderState(props);

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

export const withPlaceHolders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
      query: {
        maxLevel: 1,
      },
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
