import {
  type SlateEditor,
  type SlatePlugin,
  type StaticComponents,
  PlateStaticElement,
  getBelowNodesChildren,
  getEditorPlugin,
  getRenderStaticNodeProps,
} from '@udecode/plate-common';

import { renderComponentToHtml } from './utils/renderComponentToHtml';

export const staticElementToHtml = (
  editor: SlateEditor,
  {
    ReactDOMServer,
    components,
    props: nodeProps,
  }: {
    ReactDOMServer: any;
    components: StaticComponents;
    props: any;
    preserveClassNames?: string[];
  }
): string => {
  if (!nodeProps.element.type) {
    return renderComponentToHtml(ReactDOMServer, PlateStaticElement, nodeProps);
  }

  const plugin = editor.pluginList.find(
    (plugin: SlatePlugin) => nodeProps.element.type === plugin.node.type
  );

  if (!plugin) {
    return renderComponentToHtml(ReactDOMServer, PlateStaticElement, nodeProps);
  }

  const Component = components[plugin.key];

  // Apply below nodes to children for example indent list plugin
  nodeProps.children = getBelowNodesChildren(
    editor,
    nodeProps,
    plugin,
    nodeProps.children
  );

  // console.log(plugin ? (getEditorPlugin(editor, plugin) as any) : {}, 'fj');

  const html = renderComponentToHtml(
    ReactDOMServer,
    Component,
    // inject plugin props for example link plugin and table plugin
    getRenderStaticNodeProps({
      editor,
      plugin,
      props: {
        ...nodeProps,
        plugin,
        ...(plugin ? getEditorPlugin(editor, plugin) : {}),
      },
    })
  );

  return (
    html ?? renderComponentToHtml(ReactDOMServer, PlateStaticElement, nodeProps)
  );
};
