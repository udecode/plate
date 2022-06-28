import React from 'react';
import {
  createImagePlugin,
  createPlateUI,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { createSoftBreakPlugin } from '@udecode/plate-break/src/index';
import { serializeHtml, useEditorState } from '@udecode/plate-core/src/index';
import { createHighlightPlugin } from '@udecode/plate-highlight/src/index';
import { createLinkPlugin } from '@udecode/plate-link/src/index';
import {
  createListPlugin,
  createTodoListPlugin,
} from '@udecode/plate-list/src/index';
import { createMediaEmbedPlugin } from '@udecode/plate-media-embed/src/index';
import { createMentionPlugin } from '@udecode/plate-mention/src/index';
import { createExcalidrawPlugin } from '@udecode/plate-ui-excalidraw';
import { HighlightHTML } from '../docusaurus/src/live/utils/HighlightHTML';
import { basicNodesValue } from './basic-elements/basicElementsValue';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { deserializeHtmlValue } from './serializing-html/deserializeHtmlValue';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(),
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
    components: createPlateUI(),
  }
);

const Serialized = () => {
  const editor = useEditorState();
  const html = serializeHtml(editor, {
    nodes: basicNodesValue,
  });

  return <HighlightHTML code={html} />;
};

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={deserializeHtmlValue}
  >
    <Serialized />
  </Plate>
);
