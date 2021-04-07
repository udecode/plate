import 'tippy.js/dist/tippy.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragIndicator } from '@styled-icons/material/DragIndicator';
import {
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  StyledElement,
  withDraggables,
  withProps,
} from '@udecode/slate-plugins';
import { Plugins } from '../examples/playground.stories';

const id = 'Widgets/Drag & Drop';

export default {
  title: id,
};

let components = createSlatePluginsComponents({
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
    styles: {
      root: {
        margin: 0,
        lineHeight: '1.5',
      },
    },
  }),
});

components = withDraggables(components, {
  pluginKeys: [
    ELEMENT_PARAGRAPH,
    ELEMENT_BLOCKQUOTE,
    ELEMENT_TODO_LI,
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
    ELEMENT_IMAGE,
    ELEMENT_LINK,
    ELEMENT_OL,
    ELEMENT_UL,
    ELEMENT_TABLE,
    ELEMENT_MEDIA_EMBED,
    ELEMENT_CODE_BLOCK,
  ],
  rootPluginKeys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
  dragIcon: (
    <DragIndicator
      style={{
        width: 18,
        height: 18,
        color: 'rgba(55, 53, 47, 0.3)',
      }}
    />
  ),
  styles: {
    blockAndGutter: {
      padding: '4px 0',
    },
    blockToolbarWrapper: {
      height: '1.5em',
    },
  },
});

const options = createSlatePluginsOptions();

export const Example = () => (
  <DndProvider backend={HTML5Backend}>
    <Plugins components={components} options={options} />
  </DndProvider>
);
