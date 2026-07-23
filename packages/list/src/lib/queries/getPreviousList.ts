import {
  type Editor,
  type EditorCoreStateView,
  type Element,
  type NodeEntry,
  PathApi,
} from '@platejs/plite';

import { type GetSiblingListOptions, getSiblingList } from './getSiblingList';

/** Get the previous indent list node. */
export const getPreviousList = <N extends Element = Element>(
  editor: Editor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>,
  state: Pick<EditorCoreStateView, 'nodes'> = editor.read
): NodeEntry<N> | undefined =>
  getSiblingList(
    editor,
    entry,
    {
      getPreviousEntry: ([, currPath]) => {
        if (!PathApi.hasPrevious(currPath)) return;

        const prevPath = PathApi.previous(currPath);

        const prevNode = state.nodes.get<N>(prevPath)?.[0];

        if (!prevNode) return;

        return [prevNode, prevPath];
      },
      ...options,
      getNextEntry: undefined,
    },
    state
  );
