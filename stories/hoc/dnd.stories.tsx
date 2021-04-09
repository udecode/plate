import 'tippy.js/dist/tippy.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createSlatePluginsComponents,
  createSlatePluginsOptions,
} from '@udecode/slate-plugins';
import { withStyledDraggables } from '../config/withStyledDraggables';
import { withStyledPlaceHolders } from '../config/withStyledPlaceHolders';
import { Plugins } from '../examples/playground.stories';

const id = 'HOC/Drag & Drop';

export default {
  title: id,
};

let components = createSlatePluginsComponents();

components = withStyledPlaceHolders(components);
components = withStyledDraggables(components);

const options = createSlatePluginsOptions();

export const Example = () => (
  <DndProvider backend={HTML5Backend}>
    <Plugins components={components} options={options} />
  </DndProvider>
);
