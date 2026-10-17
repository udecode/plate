import {
  definePluginPoint,
  getPluginContributions,
  SelectionApi,
  type Editor,
  type EditorCoreStateView,
  type Element,
  type NamedRootKey,
  type NodeEntry,
} from '../../facade';
import { inRoot } from '../utils/inRoot';

/**
 * Contribute the block an insert from a block lands after when that block
 * hides what follows it, such as a closed Details for its title. The entry's
 * path is in `root`, the main document when it is omitted.
 */
export const insertionAnchor =
  definePluginPoint<
    (
      state: Pick<EditorCoreStateView, 'key' | 'nodes'>,
      entry: NodeEntry<Element>,
      root?: NamedRootKey
    ) => NodeEntry<Element> | null
  >('insertion-anchor');

/** The block an insert from `entry` lands after: a contributed anchor, or `entry`. */
export const resolveInsertionAnchor = (
  editor: Editor,
  state: Pick<EditorCoreStateView, 'key' | 'nodes'>,
  entry: NodeEntry<Element>,
  root?: NamedRootKey
) => {
  for (const anchor of getPluginContributions(editor, insertionAnchor)) {
    const found = anchor(state, entry, root);

    if (found) return found;
  }

  return entry;
};

/**
 * The key an insert from the caret lands after when the caret's block names
 * another anchor, or undefined when the insert lands after the caret's block.
 */
export const getCaretAnchor = (
  editor: Editor,
  state: Pick<EditorCoreStateView, 'key' | 'nodes' | 'selection'>
) => {
  const selection = state.selection();
  const caret = selection ? state.nodes.block() : undefined;

  if (!selection || !caret) return undefined;

  const root = SelectionApi.root(selection);
  const anchor = resolveInsertionAnchor(editor, state, caret, root);

  return anchor === caret
    ? undefined
    : (state.key(inRoot(anchor[1], root)) ?? undefined);
};
