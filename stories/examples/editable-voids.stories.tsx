import React from 'react';
import {
  getBasicElementPlugins,
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValueVoids } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { EDITABLE_VOID } from './editable-voids/defaults';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { getEditableVoidPlugin } from './editable-voids/getEditableVoidPlugin';

const id = 'Elements/Editable Voids';

export default {
  title: id,
};

const components = getSlatePluginsComponents({
  [EDITABLE_VOID]: EditableVoidElement,
});
const options = getSlatePluginsOptions();
const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  ...getBasicElementPlugins(),
  getEditableVoidPlugin(),
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
