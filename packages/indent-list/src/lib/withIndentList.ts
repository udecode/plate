import {
  type NodeEntry,
  type OverrideEditor,
  type Path,
  type TElement,
  type TNode,
  PathApi,
} from '@udecode/plate';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from './BaseIndentListPlugin';
import {
  withDeleteBackwardIndentList,
  withInsertBreakIndentList,
} from './normalizers';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';
import { getNextIndentList } from './queries/getNextIndentList';
import { getPreviousIndentList } from './queries/getPreviousIndentList';
import { ListStyleType } from './types';
import { withNormalizeIndentList } from './withNormalizeIndentList';

export const withIndentList: OverrideEditor<BaseIndentListConfig> = (ctx) => {
  const {
    editor,
    getOptions,
    tf: { apply },
  } = ctx;

  return {
    transforms: {
      ...withNormalizeIndentList(ctx).transforms,
      ...withDeleteBackwardIndentList(ctx).transforms,
      ...withInsertBreakIndentList(ctx).transforms,
      apply(operation) {
        const { getSiblingIndentListOptions } = getOptions();

        /**
         * If there is a previous indent list, the inserted indent list style
         * type should be the same. Only for lower-roman and upper-roman as it
         * overlaps with lower-alpha and upper-alpha.
         */
        if (operation.type === 'insert_node') {
          const listStyleType = operation.node[BaseIndentListPlugin.key];

          if (
            listStyleType &&
            ['lower-roman', 'upper-roman'].includes(
              listStyleType as ListStyleType
            )
          ) {
            const prevNodeEntry = getPreviousIndentList<TElement>(
              editor,
              [operation.node as TElement, operation.path],
              {
                breakOnEqIndentNeqListStyleType: false,
                eqIndent: false,
                ...getSiblingIndentListOptions,
              }
            );

            if (prevNodeEntry) {
              const prevListStyleType =
                prevNodeEntry[0][BaseIndentListPlugin.key];

              if (
                prevListStyleType === ListStyleType.LowerAlpha &&
                listStyleType === ListStyleType.LowerRoman
              ) {
                operation.node[BaseIndentListPlugin.key] =
                  ListStyleType.LowerAlpha;
              } else if (
                prevListStyleType === ListStyleType.UpperAlpha &&
                listStyleType === ListStyleType.UpperRoman
              ) {
                operation.node[BaseIndentListPlugin.key] =
                  ListStyleType.UpperAlpha;
              }
            }
          }
        }

        /**
         * When inserting a line break, normalize listStart if the node has a
         * listRestart property.
         */
        if (
          operation.type === 'split_node' &&
          (operation.properties as any)[BaseIndentListPlugin.key] &&
          (operation.properties as any)[INDENT_LIST_KEYS.listRestart]
        ) {
          const listReStart = (operation.properties as any)[
            INDENT_LIST_KEYS.listRestart
          ];

          (operation.properties as any)[INDENT_LIST_KEYS.listStart] =
            listReStart + 1;
          (operation.properties as any)[INDENT_LIST_KEYS.listRestart] =
            undefined;
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

        const isIndentListItem = (node: TNode) =>
          BaseIndentListPlugin.key in node;

        affectedPaths.forEach((affectedPath) => {
          let entry = editor.api.node(affectedPath);
          if (!entry) return;

          /**
           * Even if the affected node isn't a list item, the subsequent node
           * might be, in which case we want to normalize that node instead.
           */
          if (!isIndentListItem(entry[0])) {
            entry = editor.api.node(PathApi.next(affectedPath));
          }

          // Normalize the entire list from the affected node onwards
          while (entry && isIndentListItem(entry[0])) {
            const normalized = normalizeIndentListStart<TElement>(
              editor,
              entry as NodeEntry<TElement>,
              getSiblingIndentListOptions
            );

            /**
             * Break early since the subsequent list items will already have
             * been normalized by the `apply` that modified the current node.
             */
            if (normalized) break;

            entry = getNextIndentList<TElement>(
              editor,
              entry as NodeEntry<TElement>,
              {
                ...getSiblingIndentListOptions,
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
