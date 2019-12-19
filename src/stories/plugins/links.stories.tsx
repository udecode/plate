import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  LinkButton,
  LinkPlugin,
  renderElementLink,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from '../config/initialValues';

export default {
  title: 'Plugins/LinkPlugin',
};

export const Links = () => {
  const plugins: any[] = [];
  const renderElement: any = [];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());
  if (boolean('renderElementLink', false))
    renderElement.push(renderElementLink());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueLinks);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor([withLink, withReact, withHistory], plugins);

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

  const Editor = createReactEditor();

  return <Editor />;
};
