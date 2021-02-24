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

const plugins = [ParagraphPlugin(options), HeadingPlugin(options)];

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueHugeDocument}
      withPlugins={withPlugins}
    >
      <EditablePlugins id={id} plugins={plugins} spellCheck autoFocus />
    </SlatePlugins>
  );
};
