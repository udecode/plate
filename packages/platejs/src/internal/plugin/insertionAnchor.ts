import {
  definePluginPoint,
  getPluginContributions,
  type Editor,
  type EditorCoreStateView,
  type Element,
  type NodeEntry,
} from '../../facade';

/**
 * Contribute the block an insert from a block lands after when that block
 * hides what follows it, such as a closed Details for its title.
 */
export const insertionAnchor =
  definePluginPoint<
    (
      state: Pick<EditorCoreStateView, 'getField' | 'key' | 'nodes' | 'view'>,
      entry: NodeEntry<Element>
    ) => NodeEntry<Element> | null
  >('insertion-anchor');

/** The block an insert from `entry` lands after: a contributed anchor, or `entry`. */
export const resolveInsertionAnchor = (
  editor: Editor,
  state: Pick<EditorCoreStateView, 'getField' | 'key' | 'nodes' | 'view'>,
  entry: NodeEntry<Element>
) => {
  for (const anchor of getPluginContributions(editor, insertionAnchor)) {
    const found = anchor(state, entry);

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
  state: Pick<
    EditorCoreStateView,
    'getField' | 'key' | 'nodes' | 'selection' | 'view'
  >
) => {
  const selection = state.selection();
  const caret = selection ? state.nodes.block() : undefined;

  if (!selection || !caret) return undefined;

  const anchor = resolveInsertionAnchor(editor, state, caret);

  return anchor === caret ? undefined : (state.key(anchor[1]) ?? undefined);
};
