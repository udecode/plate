import React from 'react';

import {
  type InjectComponentProps,
  type InjectComponentReturnType,
  getPluginOptions,
} from '@udecode/plate-common';
import { clsx } from 'clsx';

import {
  type IndentListPluginOptions,
  KEY_LIST_START,
  KEY_LIST_STYLE_TYPE,
} from './IndentListPlugin';
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
      listStyleType,
      margin: 0,
      padding: 0,
      position: 'relative',
    };

    return function Component({ children, ...props }) {
      const { editor } = props;

      const { listStyleTypes = {} } = getPluginOptions<IndentListPluginOptions>(
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
        liComponent: Li = (liProps) => <li>{liProps.children}</li>,
        markerComponent: Marker = () => null,
      } = listOptions;

      return (
        <List className={className} start={listStart} style={style}>
          <Marker {...props} />

          <Li {...props}>{children}</Li>
        </List>
      );
    };
  }
};
