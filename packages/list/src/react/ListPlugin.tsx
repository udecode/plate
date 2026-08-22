import { toPlatePlugin } from '@platejs/core/react';
import React from 'react';

import { BaseListPlugin, isOrderedList, ListType } from '../lib';

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  render: {
    belowNodes: (props) => {
      const { listStyle, listType } = props.element;

      if (!listType) return undefined;

      return (innerProps) => {
        const List = isOrderedList(innerProps.element) ? 'ol' : 'ul';

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
                ? innerProps.editor
                    .plugin(ListPlugin)
                    .read.ordinal(innerProps.element)
                : undefined
            }
          >
            <li>{innerProps.children}</li>
          </List>
        );
      };
    },
  },
});
