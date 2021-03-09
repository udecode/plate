import React from 'react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueHugeDocument, options } from '../config/initialValues';

const id = 'Examples/Huge Document';

export default {
  title: id,
};

export const Example = () => {
  const plugins = [ParagraphPlugin(options), HeadingPlugin(options)];

  const withPlugins = [withReact, withHistory] as const;

  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueHugeDocument}
      withPlugins={withPlugins}
    >
      <EditablePlugins
        plugins={plugins}
        editableProps={{
          placeholder: 'Enter some text...',
          spellCheck: true,
          autoFocus: true,
        }}
      />
    </SlatePlugins>
  );
};
