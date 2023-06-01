import React from 'react';
import {
  createHighlightPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  Plate,
  serializeHtml,
  usePlateEditorState,
} from '@udecode/plate';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { HighlightHTML } from '@/plate/demo/serializing-html/HighlightHTML';
import { deserializeHtmlValue } from '@/plate/demo/values/deserializeHtmlValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
    createTablePlugin(),
    createTodoListPlugin(),
    createMediaEmbedPlugin(),
    createExcalidrawPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    createSoftBreakPlugin(softBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

function Serialized() {
  const editor = usePlateEditorState();
  const html = serializeHtml(editor, {
    nodes: editor.children,
  });

  return <HighlightHTML code={html} />;
}

export default function SerializingHtmlApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeHtmlValue}
    >
      <Serialized />
    </Plate>
  );
}
