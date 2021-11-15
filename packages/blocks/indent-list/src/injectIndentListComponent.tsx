import React, { CSSProperties } from 'react';
import { InjectComponent } from '@udecode/plate-core';
import clsx from 'clsx';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from './createIndentListPlugin';
import { ListStyleType } from './types';

export const injectIndentListComponent: InjectComponent = (props) => {
  const { element } = props;

  if (element[KEY_LIST_STYLE_TYPE]) {
    let className = clsx(
      `slate-${KEY_LIST_STYLE_TYPE}-${element[KEY_LIST_STYLE_TYPE]}`
    );
    const style: CSSProperties = {
      padding: 0,
      margin: 0,
      listStyleType: element[KEY_LIST_STYLE_TYPE],
    };

    if (
      [ListStyleType.Disc, ListStyleType.Circle, ListStyleType.Square].includes(
        element[KEY_LIST_STYLE_TYPE]
      )
    ) {
      className = clsx(className, 'slate-list-bullet');

      return ({ children }) => (
        <ul style={style} className={className}>
          <li>{children}</li>
        </ul>
      );
    }

    className = clsx(className, 'slate-list-number');

    return ({ children }) => (
      <ol style={style} className={className} start={element[KEY_LIST_START]}>
        <li>{children}</li>
      </ol>
    );
  }
};
