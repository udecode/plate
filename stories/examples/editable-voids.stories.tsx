import React from 'react';
import {
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
  useBasicElementPlugins,
  useHistoryPlugin,
  useReactPlugin,
} from '@udecode/slate-plugins';
import { initialValueVoids } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { EDITABLE_VOID } from './editable-voids/defaults';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { useEditableVoidPlugin } from './editable-voids/useEditableVoidPlugin';

const id = 'Elements/Editable Voids';

export default {
  title: id,
};

const components = getSlatePluginsComponents({
  [EDITABLE_VOID]: EditableVoidElement,
});
const options = getSlatePluginsOptions();

export const Example = () => {
  const plugins = [
    useReactPlugin(),
    useHistoryPlugin(),
    ...useBasicElementPlugins(),
    useEditableVoidPlugin(),
  ];

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueVoids}
    />
  );
};
