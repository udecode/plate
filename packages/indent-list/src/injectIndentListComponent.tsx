import React from 'react';
import {
  findNodePath,
  InjectComponentProps,
  InjectComponentReturnType,
  setNodes,
} from '@udecode/plate-common';
import { clsx } from 'clsx';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_START,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from './createIndentListPlugin';
import { ListStyleType } from './types';

export const injectIndentListComponent = (
  props: InjectComponentProps
): InjectComponentReturnType => {
  const { element } = props;

  const listStyleType = element[KEY_LIST_STYLE_TYPE] as string;
  const listStart = element[KEY_LIST_START] as number;

  const isTodo =
    element.hasOwnProperty(KEY_LIST_CHECKED) &&
    listStyleType === KEY_TODO_STYLE_TYPE;

  if (listStyleType && !isTodo) {
    let className = clsx(`slate-${KEY_LIST_STYLE_TYPE}-${listStyleType}`);
    const style: React.CSSProperties = {
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

      return function Ul({ children }) {
        return (
          <ul style={style} className={className}>
            <li>{children}</li>
          </ul>
        );
      };
    }

    className = clsx(className, 'slate-list-number');

    return function Ol({ children }) {
      return (
        <ol style={style} className={className} start={listStart}>
          <li>{children}</li>
        </ol>
      );
    };
  }

  if (isTodo) {
    const className = clsx('slate-list-todo');
    const checked = element[KEY_LIST_CHECKED] as boolean;
    const style: React.CSSProperties = {
      padding: 0,
      margin: 0,
    };
    return function Ol({ children, editor }) {
      return (
        <div className={className} style={style}>
          <input
            contentEditable={false}
            data-slate-void
            type="checkbox"
            style={{
              marginRight: 5,
              marginLeft: -17,
              paddingTop: -10,
            }}
            checked={checked}
            onChange={(v) => {
              const path = findNodePath(editor, element);
              setNodes(editor, { checked: v.target.checked }, { at: path });
            }}
          />
          <span>{children}</span>
        </div>
      );
    };
  }
};
