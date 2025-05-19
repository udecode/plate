'use client';

import * as React from 'react';

import { ParagraphPlugin } from '@udecode/plate/react';
import {
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
} from '@udecode/plate/react';

import { cn } from '@/lib/utils';

export function BlockPlaceholder(props: PlaceholderProps) {
  const { attributes, children, placeholder } = props;

  const { enabled } = usePlaceholderState(props);

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      attributes: {
        ...attributes,
        className: cn(
          attributes.className,
          enabled &&
            'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]'
        ),
        placeholder,
      },
    });
  });
}

export const withPlaceholder = createNodeHOC(BlockPlaceholder);

const withPlaceholdersPrimitive = createNodesHOC(BlockPlaceholder);

export const withPlaceholders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    {
      key: ParagraphPlugin.key,
      hideOnBlur: true,
      placeholder: 'Type a paragraph',
      query: {
        maxLevel: 1,
      },
    },
    {
      key: 'h1',
      hideOnBlur: false,
      placeholder: 'Untitled',
    },
  ]);
