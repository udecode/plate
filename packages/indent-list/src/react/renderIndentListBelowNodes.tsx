import React from 'react';

import type {
  NodeWrapperComponentProps,
  NodeWrapperComponentReturnType,
} from '@udecode/plate-common/react';

import { clsx } from 'clsx';

import { INDENT_LIST_KEYS } from '../lib';
import { ULIST_STYLE_TYPES } from '../lib/types';
import { type IndentListConfig, IndentListPlugin } from './IndentListPlugin';

export const renderIndentListBelowNodes = (
  injectProps: NodeWrapperComponentProps<IndentListConfig>
): NodeWrapperComponentReturnType => {
  const { element } = injectProps;

  const listStyleType = element[IndentListPlugin.key] as string;
  const listStart = element[INDENT_LIST_KEYS.listStart] as number;

  if (listStyleType) {
    let className = clsx(`slate-${IndentListPlugin.key}-${listStyleType}`);
    const style: React.CSSProperties = {
      listStyleType,
      margin: 0,
      padding: 0,
      position: 'relative',
    };

    return function Component({ children, ...props }) {
      const { editor } = props;

      const { listStyleTypes = {} } = editor.getOptions(IndentListPlugin);

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
        <List className={className} style={style} start={listStart}>
          <Marker {...props} />

          <Li {...props}>{children}</Li>
        </List>
      );
    };
  }
};
