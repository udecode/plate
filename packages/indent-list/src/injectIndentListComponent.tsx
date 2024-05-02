import React from 'react';
import {
  getPluginOptions,
  InjectComponentProps,
  InjectComponentReturnType,
} from '@udecode/plate-common/server';
import { clsx } from 'clsx';

import {
  IndentListPlugin,
  KEY_LIST_START,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';
import { ULIST_STYLE_TYPES } from './types';

export const injectIndentListComponent = (
  injectProps: InjectComponentProps
): InjectComponentReturnType => {
  const { element } = injectProps;

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

    return function Component({ children, ...props }) {
      const { editor } = props;

      const { listStyleTypes = {} } = getPluginOptions<IndentListPlugin>(
        editor,
        KEY_LIST_STYLE_TYPE
      );

      let listOptions = listStyleTypes[listStyleType];

      let isOrdered = true;

      if (listOptions) {
        isOrdered = !!listOptions.isOrdered;
      } else {
        if (ULIST_STYLE_TYPES.includes(listStyleType as any)) {
          isOrdered = false;
        }
        listOptions = {} as any;
      }

      className = isOrdered
        ? clsx(className, 'slate-ol')
        : clsx(className, 'slate-ul');

      const List = isOrdered ? 'ol' : 'ul';

      const {
        markerComponent: Marker = () => null,
        liComponent: Li = (liProps) => <li>{liProps.children}</li>,
      } = listOptions;

      return (
        <List style={style} className={className} start={listStart}>
          <Marker {...props} />

          <Li {...props}>{children}</Li>
        </List>
      );
    };
  }
};
