import React from 'react';
import {
  createBasicElementPlugins,
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueVoids } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { createEditableVoidPlugin } from './editable-voids/createEditableVoidPlugin';
import { EDITABLE_VOID } from './editable-voids/defaults';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';

const id = 'Elements/Editable Voids';

export default {
  title: id,
};

const components = createSlatePluginsComponents({
  [EDITABLE_VOID]: EditableVoidElement,
});
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  ...createBasicElementPlugins(),
  createEditableVoidPlugin(),
];

export const Example = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueVoids}
  />
);
