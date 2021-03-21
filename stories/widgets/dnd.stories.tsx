import 'tippy.js/dist/tippy.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragIndicator } from '@styled-icons/material/DragIndicator';
import {
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
  getSlatePluginsOptions,
} from '@udecode/slate-plugins';
import {
  getComponent,
  getSlatePluginsComponents,
  StyledElement,
} from '@udecode/slate-plugins-components';
import { getSelectableElement } from '@udecode/slate-plugins-dnd';
import { Plugins } from '../examples/playground.stories';

const id = 'Widgets/Drag & Drop';

export default {
  title: id,
};

const components = getSlatePluginsComponents({
  [ELEMENT_PARAGRAPH]: getComponent(StyledElement, {
    styles: {
      root: {
        margin: 0,
        lineHeight: '1.5',
      },
    },
  }),
});

Object.keys(components).forEach((key) => {
  if (
    [
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
    ].includes(key)
  ) {
    const rootKeys = [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL];

    components[key] = getSelectableElement({
      component: components[key],
      level: rootKeys.includes(key) ? 1 : undefined,
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
  }
});

export const Example = () => (
  <DndProvider backend={HTML5Backend}>
    <Plugins components={components} options={getSlatePluginsOptions()} />
  </DndProvider>
);
