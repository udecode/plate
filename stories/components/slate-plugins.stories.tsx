import React from 'react';
import { SlatePlugins } from '@udecode/slate-plugins';
import { editableProps, initialValuePlainText } from '../config/initialValues';

const id = 'Components/SlatePlugins';

export default {
  title: id,
  component: SlatePlugins,
};

export const Example = () => (
  <SlatePlugins
    id={id}
    editableProps={editableProps}
    initialValue={initialValuePlainText}
  />
);
