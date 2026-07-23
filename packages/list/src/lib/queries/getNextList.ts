import {
  type Editor,
  type EditorCoreStateView,
  type Element,
  type NodeEntry,
  PathApi,
} from '@platejs/plite';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the next indent list. */
export const getNextList = <N extends Element = Element>(
  editor: Editor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>,
  state: Pick<EditorCoreStateView, 'nodes'> = editor.read
): NodeEntry<N> | undefined =>
  getSiblingList(
    editor,
    entry,
    {
      getNextEntry: ([, currPath]) => {
        const nextPath = PathApi.next(currPath);
        const nextNode = state.nodes.get<N>(nextPath)?.[0];

        if (!nextNode) return;

        return [nextNode, nextPath];
      },
      ...options,
      getPreviousEntry: undefined,
    },
    state
  );
