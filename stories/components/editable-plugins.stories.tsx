import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { EditablePlugins, SlatePlugins } from '@udecode/slate-plugins';
import { initialValuePlainText } from '../config/initialValues';

const id = 'Components/EditablePlugins';

export default {
  title: id,
  component: EditablePlugins,
};

export const Example = () => {
  return (
    <SlatePlugins id={id} initialValue={initialValuePlainText}>
      <EditablePlugins
        id={id}
        readOnly={boolean('readOnly', false)}
        placeholder={text('placeholder', 'Enter some plain text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </SlatePlugins>
  );
};
