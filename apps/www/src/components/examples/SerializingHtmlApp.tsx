import React from 'react';
import { createSoftBreakPlugin } from '@udecode/plate-break';
import { Plate, usePlateEditorState } from '@udecode/plate-common';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createMentionPlugin } from '@udecode/plate-mention';
import { serializeHtml } from '@udecode/plate-serializer-html';
import { createTablePlugin } from '@udecode/plate-table';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { HighlightHTML } from '@/plate/demo/serializing-html/HighlightHTML';
import { deserializeHtmlValue } from '@/plate/demo/values/deserializeHtmlValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
