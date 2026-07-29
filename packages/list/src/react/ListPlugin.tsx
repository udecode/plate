import React from 'react';

import { toPlatePlugin } from '@platejs/core/react';
import type { TListElement } from '@platejs/utils';

import { BaseListPlugin, isOrderedList } from '../lib';

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  render: {
    belowNodes: (props) => {
      if (!props.element.listStyleType) return;

      return (props) => {
        const { listStart, listStyleType } = props.element as TListElement;
        const List = isOrderedList(props.element) ? 'ol' : 'ul';

        return (
          <List
            style={{
              listStyleType,
              margin: 0,
              padding: 0,
              position: 'relative',
            }}
            start={listStart}
          >
            <li>{props.children}</li>
          </List>
        );
      };
    },
  },
});
