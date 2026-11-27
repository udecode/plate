import React from 'react';

import type { Element, NodeKey, Path } from '../../facade';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import type { DefinitionOf } from '../../lib/plugin/PluginDefinition';
import { ElementStatePlugin } from '../../lib/plugins/element-state/ElementStatePlugin';
import { PLUGINS } from '../../utils';
import type { Editor } from '../editor/Editor';
import { PlateEditorPlaceholderContext } from '../internal/plate-context';
import type { PliteReactEditor } from '../internal/plite-types';
import { useEditorFocused, useEditorReadOnly } from '../plite-react';
import { definePlugin } from '../plugin/definePlugin';
import { useEditorPluginStore } from '../stores';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

export type BlockPlaceholderQueryContext = {
  editor: Editor;
  node: Element;
  path: Path;
  type: string;
};

export type BlockPlaceholderPluginState = {
  className: string | null;
  placeholders: Record<string, string>;
  query: (context: BlockPlaceholderQueryContext) => boolean;
};

type BlockPlaceholderTarget = Readonly<{
  className?: string;
  nodeKey: NodeKey;
  placeholder: string;
}>;

const getBlockPlaceholderTarget = (
  editor: Editor,
  viewEditor: PliteReactEditor,
  state: Readonly<BlockPlaceholderPluginState>,
  view: Readonly<{
    composing: boolean;
    focused: boolean;
    hasEditorPlaceholder: boolean;
    readOnly: boolean;
  }>
): BlockPlaceholderTarget | null => {
  if (
    view.readOnly ||
    view.composing ||
    !view.focused ||
    !viewEditor.read.selection() ||
    viewEditor.read.selection.isExpanded()
  ) {
    return null;
  }

  const entry = viewEditor.read.nodes.block();

  if (!entry) return null;

  const [node, path] = entry;
  const children = viewEditor.read.children();
  const firstNode = children[0];

  if (!firstNode) return null;

  const isEditorPlaceholderState =
    children.length === 1 &&
    viewEditor.read.nodes.isEmpty(firstNode) &&
    (view.hasEditorPlaceholder ||
      editor.plugin(ElementStatePlugin).api.isEmpty(firstNode));
  const placeholderPlugin = Object.keys(state.placeholders).find((name) => {
    const descriptor = getCompiledPlatePlugin(editor, name);
    const pluginSchema = descriptor
      ? editor.plugin(descriptor).schema
      : undefined;

    return pluginSchema && 'type' in pluginSchema
      ? pluginSchema.type === node.type
      : false;
  });

  if (
    isEditorPlaceholderState ||
    !placeholderPlugin ||
    !state.query({ editor, node, path, type: node.type }) ||
    !viewEditor.read.nodes.isEmpty(node)
  ) {
    return null;
  }

  const nodeKey = viewEditor.key(path);

  return nodeKey
    ? {
        className: state.className ?? undefined,
        nodeKey,
        placeholder: state.placeholders[placeholderPlugin],
      }
    : null;
};

export const BlockPlaceholderPlugin = definePlugin(PLUGINS.blockPlaceholder, {
  initialState: (): BlockPlaceholderPluginState => ({
    className: null,
    placeholders: {},
    query: ({ path }) => path.length === 1,
  }),
  editOnly: true,
  render: {
    useViewElementAttributes({ editor, plugin, view: viewEditor }) {
      const pluginState = useEditorPluginStore(
        editor,
        plugin,
        (state) => state
      );
      const view = {
        composing: useEditorSelector(
          viewEditor,
          () => viewEditor.api.dom.isComposing(),
          { dependsOn: 'composing' }
        ),
        focused: useEditorFocused(),
        hasEditorPlaceholder: React.use(PlateEditorPlaceholderContext),
        readOnly: useEditorReadOnly(),
      };
      const target = useEditorSelector(
        viewEditor,
        () => getBlockPlaceholderTarget(editor, viewEditor, pluginState, view),
        { dependsOn: ['document', 'selection', 'state'] }
      );

      return target
        ? [
            {
              attributes: {
                className: target.className,
                placeholder: target.placeholder,
              },
              key: target.nodeKey,
            },
          ]
        : [];
    },
  },
});

export type BlockPlaceholderDefinition = DefinitionOf<
  typeof BlockPlaceholderPlugin
>;
