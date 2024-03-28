import React from 'react';
import {
  getPluginOptions,
  InjectComponentProps,
  InjectComponentReturnType,
} from '@udecode/plate-common';
import { clsx } from 'clsx';

import {
  IndentListPlugin,
  KEY_LIST_START,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';

export const injectIndentListComponent = (
  props: InjectComponentProps
): InjectComponentReturnType => {
  const { element } = props;

  const listStyleType = element[KEY_LIST_STYLE_TYPE] as string;
  const listStart = element[KEY_LIST_START] as number;

  if (listStyleType) {
    let className = clsx(`slate-${KEY_LIST_STYLE_TYPE}-${listStyleType}`);
    const style: React.CSSProperties = {
      padding: 0,
      margin: 0,
      listStyleType,
      position: 'relative',
    };

    return function Ul({ editor, children }) {
      const { listStyleTypes = {} } = getPluginOptions<IndentListPlugin>(
        editor,
        KEY_LIST_STYLE_TYPE
      );

      const targetList = listStyleTypes[listStyleType] ?? {};
      const isNumbered = targetList ? targetList.isNumbered : false;

      className = isNumbered
        ? clsx(className, 'slate-list-number')
        : clsx(className, 'slate-list-bullet');

      const {
        markerComponent = null,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        liComponent = ({ children }: any) => <li>{children}</li>,
      } = targetList;

      const Wrap = isNumbered ? 'ol' : 'ul';

      return (
        <Wrap style={style} className={className} start={listStart}>
          {markerComponent && markerComponent({ editor, element })}
          {liComponent({
            children,
            element,
          })}
        </Wrap>
      );
    };
  }
};
