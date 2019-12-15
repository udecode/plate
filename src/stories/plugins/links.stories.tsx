import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  LinkButton,
  LinkPlugin,
  renderElementLink,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from '../config/initialValues';

export default {
  title: 'Plugins|LinkPlugin',
};

export const Links = () => {
  const plugins = [];
  const renderElement = [];
  if (boolean('LinkPlugin', true, 'plugins')) plugins.push(LinkPlugin());
  else if (boolean('renderElementLink', false, 'renderElement'))
    renderElement.push(renderElementLink);

  const [value, setValue] = useState(initialValueLinks);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <StyledToolbar>
        <LinkButton />
      </StyledToolbar>
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        placeholder="Enter some text..."
      />
    </Slate>
  );
};
