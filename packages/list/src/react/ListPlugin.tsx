import React from 'react';

import type { SlateRenderElementProps } from 'platejs/static';

import type { TListElement } from 'platejs';
import { toPlatePlugin } from 'platejs/react';

import { type BaseListConfig, BaseListPlugin, isOrderedList } from '../lib';

export type ListConfig = BaseListConfig;

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  render: {
    belowNodes: (props) => {
      if (!props.element.listStyleType) return;

      return (props) => <List {...(props as SlateRenderElementProps)} />;
    },
  },
});

function List(props: SlateRenderElementProps) {
  const { listStart, listStyleType } = props.element as TListElement;
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      style={{ listStyleType, margin: 0, padding: 0, position: 'relative' }}
      start={listStart}
    >
      <li>{props.children}</li>
    </List>
  );
}
