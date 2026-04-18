import {
  type Descendant,
  type NodeOperation,
  type TextOperation,
  type TText,
  NodeApi,
  OperationApi,
  PathApi,
} from '@platejs/slate';
import { type OmitFirst, bindFirst } from '@udecode/utils';

import type { SlateEditor } from '../../editor';
import type { PluginConfig } from '../../plugin';

import { createTSlatePlugin } from '../../plugin';
import { pipeOnNodeChange } from '../../utils/pipeOnNodeChange';
import { pipeOnTextChange } from '../../utils/pipeOnTextChange';
import { init } from './transforms/init';
import { insertExitBreak } from './transforms/insertExitBreak';
import { liftBlock } from './transforms/liftBlock';
import { resetBlock } from './transforms/resetBlock';
import { setValue } from './transforms/setValue';

const NOOP_ON_NODE_CHANGE = () => {};
const NOOP_ON_TEXT_CHANGE = () => {};

export type SlateExtensionConfig = PluginConfig<
  'slateExtension',
  {
    onNodeChange: (options: {
      editor: SlateEditor;
      node: Descendant;
      operation: NodeOperation;
      prevNode: Descendant;
    }) => void;
    onTextChange: (options: {
      editor: SlateEditor;
      node: Descendant;
      operation: TextOperation;
      prevText: string;
      text: string;
    }) => void;
  },
  {
    redecorate: () => void;
  },
  {
    init: OmitFirst<typeof init>;
    insertExitBreak: OmitFirst<typeof insertExitBreak>;
    liftBlock: OmitFirst<typeof liftBlock>;
    resetBlock: OmitFirst<typeof resetBlock>;
    setValue: OmitFirst<typeof setValue>;
  }
>;

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createTSlatePlugin<SlateExtensionConfig>({
  api: {
    redecorate: () => {},
  },
  key: 'slateExtension',
  options: {
    onNodeChange: NOOP_ON_NODE_CHANGE,
    onTextChange: NOOP_ON_TEXT_CHANGE,
  },
}).extendEditorTransforms(({ editor, getOption, tf }) => {
  const apply = tf?.apply ?? editor.tf.apply;

  return {
    /**
     * Initialize the editor value, selection and normalization. Set `value` to
     * `null` to skip children initialization.
     */
    init: bindFirst(init, editor),
    insertExitBreak: bindFirst(insertExitBreak, editor),
    liftBlock: bindFirst(liftBlock, editor),
    resetBlock: bindFirst(resetBlock, editor),
    setValue: bindFirst(setValue, editor),
    apply(operation) {
      // Performance optimization: skip state capture if no handlers are registered
      const hasNodeHandlers =
        editor.meta.pluginCache.handlers.onNodeChange.length > 0 ||
        getOption('onNodeChange') !== NOOP_ON_NODE_CHANGE;
      const hasTextHandlers =
        editor.meta.pluginCache.handlers.onTextChange.length > 0 ||
        getOption('onTextChange') !== NOOP_ON_TEXT_CHANGE;

      if (!hasNodeHandlers && !hasTextHandlers) {
        apply(operation);
        return;
      }

      let prevNode: Descendant | undefined;
      let node: Descendant | undefined;
      let prevText: string | undefined;
      let text: string | undefined;
      let parentNode: Descendant | undefined;

      if (OperationApi.isNodeOperation(operation) && hasNodeHandlers) {
        // Get node states BEFORE applying the operation
        switch (operation.type) {
          case 'insert_node': {
            // Both are the new node being inserted
            prevNode = operation.node;
            node = operation.node;
            break;
          }

          case 'merge_node':
          case 'move_node':
          case 'set_node':
          case 'split_node': {
            // Get the node before the operation
            prevNode = NodeApi.get(editor, operation.path);
            break;
          }
          case 'remove_node': {
            // Both are the node being removed
            prevNode = operation.node;
            node = operation.node;
            break;
          }
        }
      } else if (OperationApi.isTextOperation(operation) && hasTextHandlers) {
        // Get parent node that contains the text
        const parentPath = PathApi.parent(operation.path);
        parentNode = NodeApi.get<Descendant>(editor, parentPath);

        // Get text node before operation
        const textNode = NodeApi.get<TText>(editor, operation.path)!;
        prevText = textNode.text;
      }

      // Apply the operation
      apply(operation);

      // Get AFTER state for operations where node changes
      if (OperationApi.isNodeOperation(operation) && hasNodeHandlers) {
        switch (operation.type) {
          case 'insert_node':
          case 'remove_node': {
            // Already set above, keep the same
            break;
          }

          case 'merge_node': {
            // Get the merged result (at previous path)
            const prevPath = PathApi.previous(operation.path);

            if (prevPath) {
              node = NodeApi.get(editor, prevPath);
            }

            break;
          }

          case 'move_node': {
            // Get node at new location
            node = NodeApi.get(editor, operation.newPath);
            break;
          }

          case 'set_node': {
            // Get the updated node
            node = NodeApi.get(editor, operation.path);
            break;
          }

          case 'split_node': {
            // Get the first part of the split
            node = NodeApi.get(editor, operation.path);
            break;
          }
        }

        // Ensure node is set (fallback to prevNode if needed)
        if (!node) {
          node = prevNode;
        }

        // Call handlers - both node and prevNode are guaranteed to be defined
        const eventIsHandled = pipeOnNodeChange(
          editor,
          node!,
          prevNode!,
          operation
        );

        if (!eventIsHandled) {
          const onNodeChange = getOption('onNodeChange');
          onNodeChange({ editor, node: node!, operation, prevNode: prevNode! });
        }
      }

      // Handle text operations
      if (OperationApi.isTextOperation(operation) && hasTextHandlers) {
        const textNodeAfter = NodeApi.get<TText>(editor, operation.path);
        if (textNodeAfter) {
          text = textNodeAfter.text;
        }

        const eventIsHandled = pipeOnTextChange(
          editor,
          parentNode!,
          text!,
          prevText!,
          operation
        );

        if (!eventIsHandled) {
          const onTextChange = getOption('onTextChange');
          onTextChange({
            editor,
            node: parentNode!,
            operation,
            prevText: prevText!,
            text: text!,
          });
        }
      }
    },
  };
});
