import type {
  Descendant,
  Element,
  NodeOperation,
  Text,
  TextOperation,
} from '@platejs/slate';
import { NodeApi, OperationApi, PathApi } from '@platejs/slate';
import { type OmitFirst, bindFirst } from '@udecode/utils';

import type { SlateEditor } from '../../editor';
import type { AnyEditorPlugin, PluginConfig } from '../../plugin';

import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { createTSlatePlugin, getEditorPlugin } from '../../plugin';
import { pipeOnNodeChange } from '../../utils/pipeOnNodeChange';
import { pipeOnTextChange } from '../../utils/pipeOnTextChange';
import { init } from './transforms/init';
import { insertExitBreak } from './transforms/insertExitBreak';
import { liftBlock } from './transforms/liftBlock';
import { resetBlock } from './transforms/resetBlock';
import { setValue } from './transforms/setValue';

const NOOP_ON_NODE_CHANGE = () => {};
const NOOP_ON_TEXT_CHANGE = () => {};

type MetadataPropContext = Parameters<
  NonNullable<AnyEditorPlugin['node']['isMetadataProp']>
>[0];

const getEditorDescendant = <N extends Descendant = Descendant>(
  editor: SlateEditor,
  path: number[]
): N | undefined => editor.api.node<N>(path)?.[0];

export const isElementStateEmpty = (editor: SlateEditor, element: Element) => {
  const props = NodeApi.extractProps(element);

  return Object.entries(props).every(([key, value]) => {
    if (key === 'type') return true;

    return editor.meta.pluginCache.node.isMetadataProp.some((pluginKey) => {
      const plugin = editor.plugins[pluginKey];

      const context: MetadataPropContext = {
        ...getEditorPlugin(editor, plugin),
        key,
        node: element,
        value,
      };

      return plugin.node.isMetadataProp?.(context);
    });
  });
};

export type SlateExtensionTransforms = {
  init: OmitFirst<typeof init>;
  insertExitBreak: OmitFirst<typeof insertExitBreak>;
  liftBlock: OmitFirst<typeof liftBlock>;
  resetBlock: OmitFirst<typeof resetBlock>;
  setValue: OmitFirst<typeof setValue>;
};

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
  {}
>;

/** Opinionated extension of slate default behavior. */
const BaseSlateExtensionPlugin = createTSlatePlugin<SlateExtensionConfig>({
  api: {
    redecorate: () => {},
  },
  key: 'slateExtension',
  options: {
    onNodeChange: NOOP_ON_NODE_CHANGE,
    onTextChange: NOOP_ON_TEXT_CHANGE,
  },
}).extendEditorApi(({ editor }) => ({
  isElementStateEmpty: bindFirst(isElementStateEmpty, editor),
}));

export const SlateExtensionPlugin = withLegacyTransformOverride(
  BaseSlateExtensionPlugin,
  ({ editor, getOption, tf }) => {
    const { apply } = tf;

    return {
      tf: {
        /**
         * Initialize the editor value, selection and normalization. Set `value`
         * to `null` to skip children initialization.
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
            const nodeOperation = operation as NodeOperation;

            // Get node states BEFORE applying the operation
            switch (nodeOperation.type) {
              case 'insert_node': {
                // Both are the new node being inserted
                prevNode = nodeOperation.node;
                node = nodeOperation.node;
                break;
              }

              case 'merge_node':
              case 'move_node':
              case 'set_node':
              case 'split_node': {
                // Get the node before the operation
                prevNode = getEditorDescendant(editor, nodeOperation.path);
                break;
              }
              case 'remove_node': {
                // Both are the node being removed
                prevNode = nodeOperation.node;
                node = nodeOperation.node;
                break;
              }
            }
          } else if (
            OperationApi.isTextOperation(operation) &&
            hasTextHandlers
          ) {
            const textOperation = operation as TextOperation;

            // Get parent node that contains the text
            const parentPath = PathApi.parent(textOperation.path);
            parentNode = getEditorDescendant(editor, parentPath);

            // Get text node before operation
            const textNode = getEditorDescendant<Text>(
              editor,
              textOperation.path
            )!;
            prevText = textNode.text;
          }

          // Apply the operation
          apply(operation);

          // Get AFTER state for operations where node changes
          if (OperationApi.isNodeOperation(operation) && hasNodeHandlers) {
            const nodeOperation = operation as NodeOperation;

            switch (nodeOperation.type) {
              case 'insert_node':
              case 'remove_node': {
                // Already set above, keep the same
                break;
              }

              case 'merge_node': {
                // Get the merged result (at previous path)
                const prevPath = PathApi.hasPrevious(nodeOperation.path)
                  ? PathApi.previous(nodeOperation.path)
                  : undefined;

                if (prevPath) {
                  node = getEditorDescendant(editor, prevPath);
                }

                break;
              }

              case 'move_node': {
                // Get node at new location
                node = getEditorDescendant(editor, nodeOperation.newPath);
                break;
              }

              case 'set_node': {
                // Get the updated node
                node = getEditorDescendant(editor, nodeOperation.path);
                break;
              }

              case 'split_node': {
                // Get the first part of the split
                node = getEditorDescendant(editor, nodeOperation.path);
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
              nodeOperation
            );

            if (!eventIsHandled) {
              const onNodeChange = getOption('onNodeChange');
              onNodeChange({
                editor,
                node: node!,
                operation: nodeOperation,
                prevNode: prevNode!,
              });
            }
          }

          // Handle text operations
          if (OperationApi.isTextOperation(operation) && hasTextHandlers) {
            const textOperation = operation as TextOperation;

            const textNodeAfter = getEditorDescendant<Text>(
              editor,
              textOperation.path
            );
            if (textNodeAfter) {
              text = textNodeAfter.text;
            }

            const eventIsHandled = pipeOnTextChange(
              editor,
              parentNode!,
              text!,
              prevText!,
              textOperation
            );

            if (!eventIsHandled) {
              const onTextChange = getOption('onTextChange');
              onTextChange({
                editor,
                node: parentNode!,
                operation: textOperation,
                prevText: prevText!,
                text: text!,
              });
            }
          }
        },
      },
    };
  }
);
