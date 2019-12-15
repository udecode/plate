import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  PasteHtmlPlugin,
  renderElementPasteHtml,
  renderLeafPasteHtml,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValuePasteHtml } from '../config/initialValues';

export default {
  title: 'Plugins|PasteHtmlPlugin',
};

export const PasteHtml = () => {
  const plugins = [];
  const renderElement = [];
  const renderLeaf = [];
  if (boolean('PasteHtmlPlugin', true, 'plugins'))
    plugins.push(PasteHtmlPlugin());
  else {
    if (boolean('renderElementPasteHtml', false, 'renderElement'))
      renderElement.push(renderElementPasteHtml);
    if (boolean('renderLeafPasteHtml', false, 'renderLeaf'))
      renderLeaf.push(renderLeafPasteHtml);
  }

  const [value, setValue] = useState(initialValuePasteHtml);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Paste in some HTML..."
      />
    </Slate>
  );
};
