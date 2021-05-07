import React from 'react';
import {
  BalloonToolbar,
  createBasicMarkPlugins,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueBalloonToolbar } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { BallonToolbarMarks } from '../config/Toolbars';

const id = 'Components/BalloonToolbar';

export default {
  title: id,
  component: BalloonToolbar,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicMarkPlugins(),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueBalloonToolbar}
  >
    <BallonToolbarMarks />
  </SlatePlugins>
);
