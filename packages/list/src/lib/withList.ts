import {
  type NodeEntry,
  type OverrideEditor,
  type Path,
  type TElement,
  type TNode,
  KEYS,
  PathApi,
} from '@udecode/plate';

import type { BaseListConfig } from './BaseListPlugin';

import { withInsertBreakList } from './normalizers';
import { normalizeListStart } from './normalizers/normalizeListStart';
import { getNextList } from './queries/getNextList';
import { getPreviousList } from './queries/getPreviousList';
import { outdentList } from './transforms';
import { ListStyleType } from './types';
import { withNormalizeList } from './withNormalizeList';

export const withList: OverrideEditor<BaseListConfig> = (ctx) => {
  const {
    editor,
    getOptions,
    tf: { apply, resetBlock },
  } = ctx;

  return {
    transforms: {
      resetBlock(options) {
        if (editor.api.block(options)?.[0]?.[KEYS.listType]) {
          outdentList(editor);
          return;
        }

        return resetBlock(options);
      },
      ...withNormalizeList(ctx).transforms,
      // ...withDeleteBackwardList(ctx).transforms,
      ...withInsertBreakList(ctx).transforms,
      apply(operation) {
        const { getSiblingListOptions } = getOptions();

        /**
         * If there is a previous indent list, the inserted indent list style
         * type should be the same. Only for lower-roman and upper-roman as it
         * overlaps with lower-alpha and upper-alpha.
         */
        if (operation.type === 'insert_node') {
          const listStyleType = operation.node[KEYS.listType];

          if (
            listStyleType &&
            ['lower-roman', 'upper-roman'].includes(
              listStyleType as ListStyleType
            )
          ) {
            const prevNodeEntry = getPreviousList<TElement>(
              editor,
              [operation.node as TElement, operation.path],
              {
                breakOnEqIndentNeqListStyleType: false,
                eqIndent: false,
                ...getSiblingListOptions,
              }
            );

            if (prevNodeEntry) {
              const prevListStyleType = prevNodeEntry[0][KEYS.listType];

              if (
                prevListStyleType === ListStyleType.LowerAlpha &&
                listStyleType === ListStyleType.LowerRoman
              ) {
                operation.node[KEYS.listType] = ListStyleType.LowerAlpha;
              } else if (
                prevListStyleType === ListStyleType.UpperAlpha &&
                listStyleType === ListStyleType.UpperRoman
              ) {
                operation.node[KEYS.listType] = ListStyleType.UpperAlpha;
              }
            }
          }
        }

        /**
         * When inserting a line break, remove listRestart and listRestartPolite
         * from the new list item.
         */
        if (
          operation.type === 'split_node' &&
          (operation.properties as any)[KEYS.listType]
        ) {
          (operation.properties as any)[KEYS.listRestart] = undefined;
          (operation.properties as any)[KEYS.listRestartPolite] = undefined;
        }

        apply(operation);

        // Normalize all list items affected by the operation
        const affectedPaths: Path[] = [];

        switch (operation.type) {
          case 'insert_node':
          case 'remove_node':
          case 'set_node': {
            affectedPaths.push(operation.path);
            break;
          }
          case 'merge_node': {
            affectedPaths.push(PathApi.previous(operation.path)!);
            break;
          }
          case 'move_node': {
            affectedPaths.push(operation.path, operation.newPath);
            break;
          }
          case 'split_node': {
            affectedPaths.push(operation.path, PathApi.next(operation.path));
            break;
          }
        }

        const isListItem = (node: TNode) => KEYS.listType in node;

        affectedPaths.forEach((affectedPath) => {
          let entry = editor.api.node(affectedPath);
          if (!entry) return;

          /**
           * Even if the affected node isn't a list item, the subsequent node
           * might be, in which case we want to normalize that node instead.
           */
          if (!isListItem(entry[0])) {
            entry = editor.api.node(PathApi.next(affectedPath));
          }

          // Normalize the entire list from the affected node onwards
          while (entry && isListItem(entry[0])) {
            const normalized = normalizeListStart<TElement>(
              editor,
              entry as NodeEntry<TElement>,
              getSiblingListOptions
            );

            /**
             * Break early since the subsequent list items will already have
             * been normalized by the `apply` that modified the current node.
             */
            if (normalized) break;

            entry = getNextList<TElement>(
              editor,
              entry as NodeEntry<TElement>,
              {
                ...getSiblingListOptions,
                breakOnEqIndentNeqListStyleType: false,
                breakOnLowerIndent: false,
                eqIndent: false,
              }
            );
          }
        });
      },
    },
  };
};
