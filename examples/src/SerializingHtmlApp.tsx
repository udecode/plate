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
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { linkPlugin } from './link/linkPlugin';
import { deserializeHtmlValue } from './serializing-html/deserializeHtmlValue';
import { HighlightHTML } from './serializing-html/HighlightHTML';
import { softBreakPlugin } from './soft-break/softBreakPlugin';

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
