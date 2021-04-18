import React from 'react';
import {
  SlatePlugins,
  useSlatePluginsActions,
  useStoreEditorEnabled,
} from '@udecode/slate-plugins';
import { initialValuePlainText } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Components/SlatePlugins';

export default {
  title: id,
  component: SlatePlugins,
};

export const Example = () => {
  const { setEnabled, resetEditor } = useSlatePluginsActions(id);
  const enabled = useStoreEditorEnabled(id);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setEnabled(!enabled);
        }}
      >
        {enabled ? 'Disable editor' : 'Enable editor'}
      </button>
      <button
        type="button"
        onClick={() => {
          resetEditor(id);
        }}
      >
        Reset editor
      </button>
      <p />
      <SlatePlugins
        id={id}
        editableProps={editableProps}
        // initialValue={initialValuePlainText}
      />
    </div>
  );
};
