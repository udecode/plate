import {
  type EditorExtensionInput,
  type EditorTransformMiddlewareArgs,
  type EditorUpdateTransaction,
  type Path,
  type TextUnit,
  type Value,
  defineEditorExtension,
} from '@platejs/plite';
import {
  type Descendant,
  type BasePlateEditor,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  nanoid,
  PathApi,
  TextApi,
} from 'platejs';

import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from './BaseSuggestionPlugin';
import { findSuggestionProps } from './queries';
import { addMarkSuggestion } from './transforms/addMarkSuggestion';
import { deleteFragmentSuggestion } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestion } from './transforms/deleteSuggestion';
import { insertFragmentSuggestion } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { removeMarkSuggestion } from './transforms/removeMarkSuggestion';
import { removeNodesSuggestion } from './transforms/removeNodesSuggestion';
import { getInlineSuggestionData, getSuggestionKeyId } from './utils/index';
import { getSuggestionApi } from './utils/getSuggestionApi';

type SuggestionExtensionOptions = Pick<
  Parameters<
    NonNullable<BaseSuggestionConfig['api']['suggestion']['withoutSuggestions']>
  >[0],
  never
> & {
  editor: BasePlateEditor;
  getOptions: () => BaseSuggestionConfig['options'];
};

type InsertFragmentNext = (overrides?: {
  fragment?: Descendant[];
  options?: EditorTransformMiddlewareArgs<Value>['insertFragment']['options'];
}) => boolean;

const setLineBreakSuggestion = (
  tx: EditorUpdateTransaction,
  editor: BasePlateEditor,
  id: string,
  createdAt: number,
  path: Path
) => {
  tx.nodes.set(
    {
      [KEYS.suggestion]: {
        id,
        createdAt,
        isLineBreak: true,
        type: 'insert',
        userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
      },
    },
    { at: path }
  );
};

const isTextUnit = (unit: unknown): unit is TextUnit =>
  unit === 'character' ||
  unit === 'word' ||
  unit === 'line' ||
  unit === 'block';

const toTextUnit = (unit: unknown): TextUnit => {
  if (isTextUnit(unit)) return unit;

  const optionUnit =
    unit && typeof unit === 'object' && 'unit' in unit
      ? (unit as { unit?: unknown }).unit
      : undefined;

  if (isTextUnit(optionUnit)) return optionUnit;

  return 'character';
};

export const createSuggestionExtension = ({
  editor,
  getOptions,
}: SuggestionExtensionOptions): EditorExtensionInput =>
  defineEditorExtension({
    name: 'plate:suggestion',
    normalizers: {
      node({ entry, next, tx }) {
        getSuggestionApi(editor).withoutSuggestions(() => {
          const [node, path] = entry;
          const nodeRecord = node as Record<string, unknown>;

          const inlineSuggestion =
            (ElementApi.isElement(node) && editor.api.isInline(node)) ||
            TextApi.isText(node);

          if (
            nodeRecord[KEYS.suggestion] &&
            inlineSuggestion &&
            !getSuggestionKeyId(node)
          ) {
            tx.nodes.unset([KEYS.suggestion, 'suggestionData'], { at: path });

            return;
          }

          if (
            nodeRecord[KEYS.suggestion] &&
            inlineSuggestion &&
            !getInlineSuggestionData(node)?.userId
          ) {
            if (getInlineSuggestionData(node)?.type === 'remove') {
              tx.nodes.unset([KEYS.suggestion, getSuggestionKeyId(node)!], {
                at: path,
              });
            } else {
              tx.nodes.remove({ at: path });
            }

            return;
          }

          next();
        });
      },
    },
    transforms: {
      addMark({ key, next, value }) {
        if (getOptions().isSuggesting && editor.api.isExpanded()) {
          addMarkSuggestion(editor, key, value);

          return true;
        }

        return next();
      },
      deleteBackward({ next, tx, unit }) {
        const resolvedUnit = toTextUnit(unit);
        const selection = editor.selection!;
        let pointTarget = editor.api.before(selection, {
          unit: resolvedUnit,
        });

        if (!pointTarget && resolvedUnit === 'line') {
          pointTarget = {
            offset: 0,
            path: selection.anchor.path,
          };
        }

        if (getOptions().isSuggesting) {
          const node = editor.api.above<TSuggestionElement>();

          if (node?.[0][KEYS.suggestion] && !node?.[0].suggestion.isLineBreak) {
            return next({ unit: resolvedUnit });
          }

          if (!pointTarget) return true;

          if (
            resolvedUnit === 'line' &&
            PathApi.equals(selection.anchor.path, pointTarget.path)
          ) {
            deleteFragmentSuggestion(editor, {
              at: { anchor: selection.anchor, focus: pointTarget },
              reverse: true,
              tx,
            });

            return true;
          }

          deleteSuggestion(
            editor,
            { anchor: selection.anchor, focus: pointTarget },
            { reverse: true, tx }
          );

          return true;
        }

        if (pointTarget) {
          const isCrossBlock = editor.api.isAt({
            at: { anchor: selection.anchor, focus: pointTarget },
            blocks: true,
          });

          if (isCrossBlock) {
            tx.nodes.unset([KEYS.suggestion], {
              at: pointTarget,
            });
          }
        }

        return next({ unit: resolvedUnit });
      },
      deleteForward({ next, tx, unit }) {
        const resolvedUnit = toTextUnit(unit);

        if (getOptions().isSuggesting) {
          const selection = editor.selection!;
          let pointTarget = editor.api.after(selection, {
            unit: resolvedUnit,
          });

          if (!pointTarget && resolvedUnit === 'line') {
            const [textNode] = editor.api.node(selection.focus.path) ?? [];

            if (TextApi.isText(textNode)) {
              pointTarget = {
                offset: textNode.text.length,
                path: selection.focus.path,
              };
            }
          }

          if (!pointTarget) return true;

          if (
            resolvedUnit === 'line' &&
            PathApi.equals(selection.focus.path, pointTarget.path)
          ) {
            deleteFragmentSuggestion(editor, {
              at: { anchor: selection.focus, focus: pointTarget },
              tx,
            });

            return true;
          }

          deleteSuggestion(
            editor,
            {
              anchor: selection.anchor,
              focus: pointTarget,
            },
            { tx }
          );

          return true;
        }

        return next({ unit: resolvedUnit });
      },
      deleteFragment({ next, tx }) {
        if (getOptions().isSuggesting) {
          deleteFragmentSuggestion(editor, { reverse: true, tx });

          return true;
        }

        return next();
      },
      insertBreak({ next, tx }) {
        if (getOptions().isSuggesting) {
          const [node, path] = editor.api.above()!;

          if (path.length > 1 || node.type !== editor.getType(KEYS.p)) {
            insertTextSuggestion(editor, '\n', tx);

            return true;
          }

          const { id, createdAt } = findSuggestionProps(editor, {
            at: editor.selection!,
            type: 'insert',
          });

          next();
          tx.withoutNormalizing(() => {
            setLineBreakSuggestion(tx, editor, id, createdAt, path);
          });

          return true;
        }

        return next();
      },
      insertFragment({ fragment, next, options }) {
        if (getOptions().isSuggesting) {
          insertFragmentSuggestion(editor, fragment, {
            insertFragment: (nextFragment) =>
              next({
                fragment: nextFragment,
                options,
              } as Parameters<InsertFragmentNext>[0]),
          });

          return true;
        }

        return next();
      },
      insertNodes({ next, nodes, options }) {
        if (getOptions().isSuggesting) {
          const nodesArray = Array.isArray(nodes) ? nodes : [nodes];

          if (nodesArray.some((node) => node.type === 'slash_input')) {
            getSuggestionApi(editor).withoutSuggestions(() => {
              next({ nodes, options });
            });

            return true;
          }

          const suggestionNodes = nodesArray.map((node) => ({
            ...node,
            [KEYS.suggestion]: {
              id: nanoid(),
              createdAt: Date.now(),
              type: 'insert',
              userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
            },
          }));

          return next({ nodes: suggestionNodes, options });
        }

        return next();
      },
      insertText({ next, options, text, tx }) {
        if (getOptions().isSuggesting) {
          const node = editor.api.above<TSuggestionElement>();

          if (node?.[0][KEYS.suggestion] && !node?.[0].suggestion.isLineBreak) {
            return next({ options, text });
          }

          insertTextSuggestion(editor, text, tx);

          return true;
        }

        return next();
      },
      removeMark({ key, next }) {
        if (getOptions().isSuggesting && editor.api.isExpanded()) {
          removeMarkSuggestion(editor, key);

          return true;
        }

        return next();
      },
      removeNodes({ next, options }) {
        if (getOptions().isSuggesting) {
          const nodes = [...editor.api.nodes(options)];

          if (nodes.some(([node]) => node.type === 'slash_input')) {
            getSuggestionApi(editor).withoutSuggestions(() => {
              next({ options });
            });

            return true;
          }

          removeNodesSuggestion(editor, nodes);

          return true;
        }

        return next();
      },
    },
  });
