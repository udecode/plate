import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  FormatPlugin,
  onDOMBeforeInputFormat,
  onKeyDownFormat,
  renderElementFormat,
  renderLeafFormat,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';
import { Toolbar } from './Toolbar';

export default {
  title: 'Plugins|FormatPlugin',
};

export const RichText = () => {
  const plugins = [];
  const renderElement = [];
  const renderLeaf = [];
  const onKeyDown = [];
  const onDOMBeforeInput = [];
  if (boolean('FormatPlugin', true, 'plugins')) plugins.push(FormatPlugin());
  else {
    if (boolean('renderElementFormat', false, 'renderElement'))
      renderElement.push(renderElementFormat);
    if (boolean('renderLeafFormat', false, 'renderLeaf'))
      renderLeaf.push(renderLeafFormat);
    if (boolean('onKeyDownFormat', false, 'onKeyDown'))
      onKeyDown.push(onKeyDownFormat);
    if (boolean('onDOMBeforeInputFormat', false, 'onDOMBeforeInput'))
      onDOMBeforeInput.push(onDOMBeforeInputFormat);
  }

  const [value, setValue] = useState(initialValueRichText);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar />
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={onKeyDown}
        onDOMBeforeInput={onDOMBeforeInput}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
