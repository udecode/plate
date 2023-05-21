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

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { linkPlugin } from '@/plate/link/linkPlugin';
import { deserializeHtmlValue } from '@/plate/serializing-html/deserializeHtmlValue';
import { HighlightHTML } from '@/plate/serializing-html/HighlightHTML';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
