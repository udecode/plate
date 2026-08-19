import React from 'react';

import { toPlatePlugin } from '@platejs/core/react';

import { BaseListPlugin, isOrderedList, ListType } from '../lib';

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  render: {
    belowNodes: (props) => {
      const { listStyle, listType } = props.element;

      if (!listType) return;

      return (props) => {
        const List = isOrderedList(props.element) ? 'ol' : 'ul';

        return (
          <List
            style={{
              listStyleType:
                listStyle ??
                (listType === ListType.Numbered ? 'decimal' : 'disc'),
              margin: 0,
              padding: 0,
              position: 'relative',
            }}
            start={
              listType === ListType.Numbered
                ? props.editor.plugin(ListPlugin).read.ordinal(props.element)
                : undefined
            }
          >
            <li>{props.children}</li>
          </List>
        );
      };
    },
  },
});
