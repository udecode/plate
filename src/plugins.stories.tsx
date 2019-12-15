import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  FormatPlugin,
  MentionPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { Toolbar } from 'stories/plugins/Toolbar';
import { initialValueRichText } from './stories/config/initialValues';

export default {
  title: 'Plugins|Playground',
};

export const AllPlugins = () => {
  const plugins = [];
  const renderElement: any = [];
  const renderLeaf: any = [];
  const onKeyDown: any = [];
  const onDOMBeforeInput: any = [];
  if (boolean('FormatPlugin', true, 'plugins')) plugins.push(FormatPlugin());
  if (boolean('MentionPlugin', true, 'plugins')) plugins.push(MentionPlugin());

  // if (boolean('renderElementFormat', false, 'renderElement'))
  //   renderElement.push(renderElementFormat);
  // if (boolean('renderLeafFormat', false, 'renderLeaf'))
  //   renderLeaf.push(renderLeafFormat);
  // if (boolean('onKeyDownFormat', false, 'onKeyDown'))
  //   onKeyDown.push(onKeyDownFormat);
  // if (boolean('onDOMBeforeInputFormat', false, 'onDOMBeforeInput'))
  //   onDOMBeforeInput.push(onDOMBeforeInputFormat);

  const [value, setValue] = useState(initialValueRichText);

  const editor = useCreateEditor([withReact, withHistory]);

  return (
    <>
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
          placeholder="Enter some plain text..."
        />
      </Slate>
    </>
  );
};
