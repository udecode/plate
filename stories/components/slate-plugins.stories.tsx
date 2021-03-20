import React from 'react';
import { SlatePlugins } from '@udecode/slate-plugins';
import { initialValuePlainText } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

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
