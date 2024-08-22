import {
  type QueryNodeOptions,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { BlockSelectable } from './components/BlockSelectable';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from './context-menu';
import { onKeyDownSelection } from './onKeyDownSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';
import { onCloseBlockSelection } from './utils';
import { withSelection } from './withSelection';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPlugin {
  disableContextMenu?: boolean;
  onKeyDownSelecting?: (e: KeyboardEvent) => void;
  query?: QueryNodeOptions;
  scrollContainerSelector?: string;
  sizes?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
}

export const createBlockSelectionPlugin =
  createPluginFactory<BlockSelectionPlugin>({
    handlers: {
      onChange: onCloseBlockSelection,
      onKeyDown: onKeyDownSelection,
      onMouseDown: (editor) => (e) => {
        if (e.button === 0 && blockContextMenuSelectors.isOpen(editor.id)) {
          e.preventDefault();
          blockContextMenuActions.hide();
        }
        if (e.button === 2) e.preventDefault();
      },
    },
    inject: {
      aboveComponent:
        () =>
        ({ children, element }) =>
          BlockSelectable({
            children,
            options: {
              element,
            },
          }),
    },
    key: KEY_BLOCK_SELECTION,
    options: {
      query: {
        maxLevel: 1,
      },
      sizes: {
        bottom: 4,
        left: 4,
        right: 4,
        top: 4,
      },
    },
    useHooks: useHooksBlockSelection,
    withOverrides: withSelection,
  });
