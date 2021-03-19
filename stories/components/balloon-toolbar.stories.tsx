import React from 'react';
import {
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicMarkPlugins,
  useHistoryPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import {
  BalloonToolbar,
  getSlatePluginsComponents,
} from '@udecode/slate-plugins-components';
import {
  editableProps,
  initialValueBalloonToolbar,
} from '../config/initialValues';
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
