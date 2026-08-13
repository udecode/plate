import React from 'react';

import { toPlatePlugin } from '@platejs/core/react';

import { BaseListPlugin, isOrderedList } from '../lib';

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  render: {
    belowNodes: (props) => {
      const { listStart, listStyleType } = props.element;

      if (!listStyleType) return;

      return (props) => {
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
