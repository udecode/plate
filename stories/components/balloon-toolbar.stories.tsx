import React from 'react';
import {
  BalloonToolbar,
  getBasicMarkPlugins,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
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

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicMarkPlugins(),
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
