import React from 'react';

import type {
  RenderStaticNodeWrapper,
  RenderStaticNodeWrapperFunction,
  RenderStaticNodeWrapperProps,
} from '@udecode/plate';

import { clsx } from 'clsx';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../lib';
import { ULIST_STYLE_TYPES } from '../lib/types';

export const renderIndentListBelowNodes: RenderStaticNodeWrapper = (
  injectProps: RenderStaticNodeWrapperProps<BaseIndentListConfig>
): RenderStaticNodeWrapperFunction => {
  const { element } = injectProps;

  const listStyleType = element[BaseIndentListPlugin.key] as string;
  const listStart = element[INDENT_LIST_KEYS.listStart] as number;

  if (listStyleType) {
    let className = clsx(`slate-${BaseIndentListPlugin.key}-${listStyleType}`);
    const style: React.CSSProperties = {
      listStyleType,
      margin: 0,
      padding: 0,
      position: 'relative',
    };

    return ({ children, ...props }) => {
      const { editor } = props;

      const { listStyleTypes = {} } = editor.getOptions(BaseIndentListPlugin);

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

      const { liComponent: Li, markerComponent: Marker = () => null } =
        listOptions;

      return (
        <List className={className} style={style} start={listStart}>
          <Marker {...props} />
          {/* FIX: cursor position issue */}
          {Li ? <Li {...props}>{children}</Li> : <li>{children}</li>}
        </List>
      );
    };
  }
};
