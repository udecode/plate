import React from 'react';
import {
  BalloonToolbar,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicMarkPlugins,
  useHistoryPlugin,
  useReactPlugin,
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

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicMarkPlugins(),
  ];

  return (
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
};
