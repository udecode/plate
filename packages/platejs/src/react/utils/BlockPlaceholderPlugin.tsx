import type { Element, NodeKey, Path } from '../../facade';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import type { DefinitionOf } from '../../lib/plugin/PluginDefinition';
import { ElementStatePlugin } from '../../lib/plugins/element-state/ElementStatePlugin';
import { PLUGINS } from '../../utils';
import type { Editor } from '../editor/Editor';
import {
  type RootEditor,
  useEditorFocused,
  useEditorReadOnly,
  useEditorRuntimeState,
  useEditorViewState,
} from '../plite-react';
import { definePlugin } from '../plugin/definePlugin';
import { useEditorPluginStore } from '../stores';

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

const areBlockPlaceholderTargetsEqual = (
  left: BlockPlaceholderTarget | null,
  right: BlockPlaceholderTarget | null
) =>
  left === right ||
  (!!left &&
    !!right &&
    left.nodeKey === right.nodeKey &&
    left.placeholder === right.placeholder &&
    left.className === right.className);

const getBlockPlaceholderTarget = (
  editor: Editor,
  viewEditor: RootEditor,
  state: Readonly<BlockPlaceholderPluginState>,
  view: Readonly<{
    composing: boolean;
    focused: boolean;
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

  const isPristineEmptyEditor =
    children.length === 1 &&
    viewEditor.read.nodes.isEmpty(firstNode) &&
    editor.plugin(ElementStatePlugin).api.isEmpty(firstNode);
  const placeholderPlugin = Object.keys(state.placeholders).find((name) => {
    const descriptor = getCompiledPlatePlugin(editor, name);

    return descriptor
      ? editor.plugin(descriptor).schema.type === node.type
      : false;
  });

  if (
    isPristineEmptyEditor ||
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
        composing: useEditorViewState(viewEditor, () =>
          viewEditor.api.dom.isComposing()
        ),
        focused: useEditorFocused(),
        readOnly: useEditorReadOnly(),
      };
      const target = useEditorRuntimeState(
        viewEditor,
        () => getBlockPlaceholderTarget(editor, viewEditor, pluginState, view),
        { equalityFn: areBlockPlaceholderTargetsEqual }
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
