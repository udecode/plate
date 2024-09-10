import type { ExtendConfig } from '@udecode/plate-common';

import {
  type PlateRenderElementProps,
  toTPlatePlugin,
} from '@udecode/plate-common/react';

import {
  type IndentListConfig as BaseIndentListConfig,
  IndentListPlugin as BaseIndentListPlugin,
} from '../lib';
import { onKeyDownIndentList } from './onKeyDownIndentList';
import { renderIndentListBelowNodes } from './renderIndentListBelowNodes';

export type IndentListConfig = ExtendConfig<
  BaseIndentListConfig,
  {
    listStyleTypes?: Record<
      string,
      {
        isOrdered?: boolean;
        liComponent?: React.FC<PlateRenderElementProps>;
        markerComponent?: React.FC<Omit<PlateRenderElementProps, 'children'>>;
        type: string;
      }
    >;
  }
>;

/** Enables support for indented lists with React-specific features. */
export const IndentListPlugin = toTPlatePlugin<IndentListConfig>(
  BaseIndentListPlugin,
  {
    handlers: {
      onKeyDown: onKeyDownIndentList,
    },
    render: {
      belowNodes: renderIndentListBelowNodes,
    },
  }
);
