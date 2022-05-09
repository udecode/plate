import React, { CSSProperties } from 'react';
import { InjectComponent } from '@udecode/plate-core';
import clsx from 'clsx';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from './createIndentListPlugin';
import { ListStyleType } from './types';

export const injectIndentListComponent: InjectComponent = (props) => {
  const { element } = props;

  const listStyleType = element[KEY_LIST_STYLE_TYPE] as string;
  const listStart = element[KEY_LIST_START] as number;

  if (listStyleType) {
    let className = clsx(`slate-${KEY_LIST_STYLE_TYPE}-${listStyleType}`);
    const style: CSSProperties = {
      padding: 0,
      margin: 0,
      listStyleType,
    };

    if (
      [ListStyleType.Disc, ListStyleType.Circle, ListStyleType.Square].includes(
        listStyleType as ListStyleType
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
      <ol style={style} className={className} start={listStart}>
        <li>{children}</li>
      </ol>
    );
  }
};
