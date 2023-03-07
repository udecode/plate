import {
  createPathRef,
  getNode,
  PlateEditor,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';
import { PathRef } from 'slate';
import { normalizeIndentListStart } from './normalizers/normalizeIndentListStart';
import { getNextIndentList } from './queries/getNextIndentList';
import { getPreviousIndentList } from './queries/getPreviousIndentList';
import {
  IndentListPlugin,
  KEY_LIST_STYLE_TYPE,
} from './createIndentListPlugin';
import { normalizeIndentList } from './normalizeIndentList';
import { ListStyleType } from './types';

export const withIndentList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<IndentListPlugin, V, E>
) => {
  const { apply } = editor;

  const { getSiblingIndentListOptions } = options;

  editor.normalizeNode = normalizeIndentList<Value>(editor, options);

  editor.apply = (operation) => {
    const { path } = operation as any;

    let nodeBefore: TElement | null = null;

    if (operation.type === 'set_node') {
      nodeBefore = getNode<TElement>(editor, path);
    }

    // If there is a previous indent list, the inserted indent list style type should be the same.
    // Only for lower-roman and upper-roman as it overlaps with lower-alpha and upper-alpha.
    if (operation.type === 'insert_node') {
      const listStyleType = operation.node[KEY_LIST_STYLE_TYPE];

      if (
        listStyleType &&
        ['lower-roman', 'upper-roman'].includes(listStyleType as ListStyleType)
      ) {
        const prevNodeEntry = getPreviousIndentList<TElement>(
          editor,
          [operation.node as TElement, path],
          {
            eqIndent: false,
            breakOnEqIndentNeqListStyleType: false,
            ...getSiblingIndentListOptions,
          }
        );

        if (prevNodeEntry) {
          const prevListStyleType = prevNodeEntry[0][KEY_LIST_STYLE_TYPE];

          if (
            prevListStyleType === ListStyleType.LowerAlpha &&
            listStyleType === ListStyleType.LowerRoman
          ) {
            operation.node[KEY_LIST_STYLE_TYPE] = ListStyleType.LowerAlpha;
          } else if (
            prevListStyleType === ListStyleType.UpperAlpha &&
            listStyleType === ListStyleType.UpperRoman
          ) {
            operation.node[KEY_LIST_STYLE_TYPE] = ListStyleType.UpperAlpha;
          }
        }
      }
    }

    // FIXME: delete first list
    let nextIndentListPathRef: PathRef | null = null;
    if (
      operation.type === 'merge_node' &&
      operation.properties[KEY_LIST_STYLE_TYPE]
    ) {
      const node = getNode<TElement>(editor, path);

      if (node) {
        const nextNodeEntryBefore = getNextIndentList<TElement>(
          editor,
          [node, path],
          getSiblingIndentListOptions
        );
        if (nextNodeEntryBefore) {
          nextIndentListPathRef = createPathRef(editor, nextNodeEntryBefore[1]);
        }
      }
    }

    apply(operation);

    if (operation.type === 'merge_node') {
      const { properties } = operation;

      if (properties[KEY_LIST_STYLE_TYPE]) {
        const node = getNode<TElement>(editor, path);
        if (!node) return;

        // const prevNodeEntry = getPreviousIndentList(
        //   editor,
        //   [node, path],
        //   getSiblingIndentListOptions
        // );
        // if (!prevNodeEntry) {
        // normalizeIndentListStart(
        //   editor,
        //   [node as any, path],
        //   getSiblingIndentListOptions
        // );
        //   return;
        // }
        // normalizeIndentListStart(
        //   editor,
        //   prevNodeEntry,
        //   getSiblingIndentListOptions
        // );

        normalizeIndentListStart<TElement>(
          editor,
          [node, path],
          getSiblingIndentListOptions
        );

        if (nextIndentListPathRef) {
          const nextPath = nextIndentListPathRef.unref();
          if (nextPath) {
            const nextNode = getNode<TElement>(editor, nextPath);
            if (nextNode) {
              normalizeIndentListStart<TElement>(
                editor,
                [nextNode, nextPath],
                getSiblingIndentListOptions
              );
            }
          }
        }
      }
    }

    if (nodeBefore) {
      if (operation.type === 'set_node') {
        const prevListStyleType = operation.properties[KEY_LIST_STYLE_TYPE];
        const listStyleType = operation.newProperties[KEY_LIST_STYLE_TYPE];

        // Remove list style type
        if (prevListStyleType && !listStyleType) {
          const node = getNode(editor, path);
          if (!node) return;

          const nextNodeEntry = getNextIndentList<TElement>(
            editor,
            [nodeBefore, path],
            getSiblingIndentListOptions
          );
          if (!nextNodeEntry) return;

          normalizeIndentListStart<TElement>(
            editor,
            nextNodeEntry,
            getSiblingIndentListOptions
          );
        }

        // Update list style type
        if (
          (prevListStyleType || listStyleType) &&
          prevListStyleType !== listStyleType
        ) {
          const node = getNode<TElement>(editor, path);
          if (!node) return;

          /**
           * Case:
           * - 1-<o>-1 <- toggle ol
           * - <1>-1-2 <- normalize
           * - 1-2-3
           */
          // const prevNodeEntry = getPreviousIndentList(
          //   editor,
          //   [node, path],
          //   getSiblingIndentListOptions
          // );
          // if (prevNodeEntry) {
          //   normalizeIndentListStart(
          //     editor,
          //     prevNodeEntry,
          //     getSiblingIndentListOptions
          //   );
          // }

          /**
           * Case:
           * - 1-<2>-3 <- toggle ul
           * - 1-o-<3> <- normalize
           * - 1-o-1
           */
          let nextNodeEntry = getNextIndentList<TElement>(
            editor,
            [nodeBefore, path],
            getSiblingIndentListOptions
          );
          if (nextNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              nextNodeEntry,
              getSiblingIndentListOptions
            );
          }
          nextNodeEntry = getNextIndentList<TElement>(
            editor,
            [node, path],
            getSiblingIndentListOptions
          );
          if (nextNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              nextNodeEntry,
              getSiblingIndentListOptions
            );
          }
        }

        const prevIndent = operation.properties[KEY_INDENT];
        const indent = operation.newProperties[KEY_INDENT];

        // Update indent
        if (prevIndent !== indent) {
          const node = getNode<TElement>(editor, path);
          if (!node) return;

          /**
           * Case:
           * - 1-<o>-1 <- indent
           * - <1>-1o-1 <- normalize node before
           * - 1-1o-2
           */
          let prevNodeEntry = getPreviousIndentList<TElement>(
            editor,
            [nodeBefore, path],
            {
              eqIndent: false,
              breakOnLowerIndent: false,
              breakOnEqIndentNeqListStyleType: false,
              ...getSiblingIndentListOptions,
            }
          );
          if (prevNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              prevNodeEntry,
              getSiblingIndentListOptions
            );
          }

          /**
           * Case:
           * - 11-<1>-11 <- indent
           * - <11>-11-12 <- normalize prev node after
           * - 11-12-13
           */
          prevNodeEntry = getPreviousIndentList<TElement>(
            editor,
            [node, path],
            {
              eqIndent: false,
              breakOnLowerIndent: false,
              breakOnEqIndentNeqListStyleType: false,
              ...getSiblingIndentListOptions,
            }
          );
          if (prevNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              prevNodeEntry,
              getSiblingIndentListOptions
            );
          }

          /**
           * Case:
           * - 11-<12>-13 <- outdent
           * - 11-2-<13> <- normalize next node before
           * - 11-2-11
           */
          let nextNodeEntry = getNextIndentList<TElement>(
            editor,
            [nodeBefore, path],
            {
              eqIndent: false,
              breakOnLowerIndent: false,
              breakOnEqIndentNeqListStyleType: false,
            }
          );
          if (nextNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              nextNodeEntry,
              getSiblingIndentListOptions
            );
          }

          /**
           * Case:
           * - 1-<1o>-2 <- outdent
           * - 1-o-<2> <- normalize next node after
           * - 1-o-1
           */
          nextNodeEntry = getNextIndentList<TElement>(editor, [node, path], {
            eqIndent: false,
            breakOnLowerIndent: false,
            breakOnEqIndentNeqListStyleType: false,
          });
          if (nextNodeEntry) {
            normalizeIndentListStart<TElement>(
              editor,
              nextNodeEntry,
              getSiblingIndentListOptions
            );
          }
        }
      }
    }
  };

  return editor;
};
