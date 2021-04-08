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
  withDraggables,
} from '@udecode/slate-plugins';
import { withStyledPlaceHolders } from '../config/placeholders';
import { Plugins } from '../examples/playground.stories';

const id = 'HOC/Drag & Drop';

export default {
  title: id,
};

let components = createSlatePluginsComponents();

components = withStyledPlaceHolders(components);
components = withDraggables(components, [
  {
    keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
    level: 0,
  },
  {
    keys: [
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
    dragIcon: (
      <DragIndicator
        style={{
          width: 18,
          height: 18,
          color: 'rgba(55, 53, 47, 0.3)',
        }}
      />
    ),
  },
  {
    key: ELEMENT_H1,
    styles: {
      gutterLeft: {
        padding: '2em 0 4px',
        fontSize: '1.875em',
      },
      blockToolbarWrapper: {
        height: '1.3em',
      },
    },
  },
  {
    key: ELEMENT_H2,
    styles: {
      gutterLeft: {
        padding: '1.4em 0 1px',
        fontSize: '1.5em',
      },
      blockToolbarWrapper: {
        height: '1.3em',
      },
    },
  },
  {
    key: ELEMENT_H3,
    styles: {
      gutterLeft: {
        padding: '1em 0 1px',
        fontSize: '1.25em',
      },
      blockToolbarWrapper: {
        height: '1.3em',
      },
    },
  },
  {
    keys: [ELEMENT_H4, ELEMENT_H5, ELEMENT_H6],
    styles: {
      gutterLeft: {
        padding: '0.75em 0 0',
        fontSize: '1.1em',
      },
      blockToolbarWrapper: {
        height: '1.3em',
      },
    },
  },
  {
    keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
    styles: {
      gutterLeft: {
        padding: '4px 0 0',
      },
    },
  },
  {
    key: ELEMENT_BLOCKQUOTE,
    styles: {
      gutterLeft: {
        padding: '18px 0 0',
      },
    },
  },
  {
    key: ELEMENT_CODE_BLOCK,
    styles: {
      gutterLeft: {
        padding: '12px 0 0',
      },
    },
  },
]);

const options = createSlatePluginsOptions();

export const Example = () => (
  <DndProvider backend={HTML5Backend}>
    <Plugins components={components} options={options} />
  </DndProvider>
);
