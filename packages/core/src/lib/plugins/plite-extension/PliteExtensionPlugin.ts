import type {
  Descendant,
  Element,
  NodeOperation,
  TextOperation,
} from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import { bindFirst } from '@udecode/utils';

import type { BasePlateEditor } from '../../editor';
import type { AnyEditorPlugin, PluginConfig } from '../../plugin';

import { createEditorPlugin, getEditorPlugin } from '../../plugin';

type MetadataPropContext = Parameters<
  NonNullable<AnyEditorPlugin['node']['isMetadataProp']>
>[0];

export const isElementStateEmpty = (
  editor: BasePlateEditor,
  element: Element
): boolean => {
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

export type PliteExtensionConfig = PluginConfig<
  'pliteExtension',
  {
    onNodeChange:
      | ((options: {
          editor: BasePlateEditor;
          node: Descendant;
          operation: NodeOperation;
          prevNode: Descendant;
        }) => void)
      | null;
    onTextChange:
      | ((options: {
          editor: BasePlateEditor;
          node: Descendant;
          operation: TextOperation;
          prevText: string;
          text: string;
        }) => void)
      | null;
  },
  {
    redecorate: () => void;
  },
  {}
>;

/** Opinionated extension of Plite default behavior. */
const BasePliteExtensionPlugin = createEditorPlugin<PliteExtensionConfig>({
  api: {
    redecorate: () => {},
  },
  key: 'pliteExtension',
  options: {
    onNodeChange: null,
    onTextChange: null,
  },
}).extendEditorApi(({ editor }) => ({
  isElementStateEmpty: bindFirst(isElementStateEmpty, editor),
}));

export const PliteExtensionPlugin = Object.assign(BasePliteExtensionPlugin, {
  runtimePliteExtensionPipeline: true,
});
