import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createHighlightPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createNodeIdPlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  Plate,
  serializeHtml,
  usePlateEditorState,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createExcalidrawPlugin } from '@udecode/plate-ui-excalidraw';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { linkPlugin } from './link/linkPlugin';
import { deserializeHtmlValue } from './serializing-html/deserializeHtmlValue';
import { HighlightHTML } from './serializing-html/HighlightHTML';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

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
    createNodeIdPlugin(),
    createDndPlugin({ options: { enableScroller: true } }),
  ],
  {
    components: withStyledDraggables(plateUI),
  }
);

const Serialized = () => {
  const editor = usePlateEditorState();
  const html = serializeHtml(editor, {
    nodes: editor.children,
    dndWrapper: (props) => <DndProvider backend={HTML5Backend} {...props} />,
  });

  return <HighlightHTML code={html} />;
};

export default () => (
  <DndProvider backend={HTML5Backend}>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeHtmlValue}
    >
      <Serialized />
    </Plate>
  </DndProvider>
);
