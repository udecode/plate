import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  LinkButton,
  LinkPlugin,
  renderElementLink,
  withLink,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from '../config/initialValues';

export default {
  title: 'Plugins/LinkPlugin',
  component: LinkPlugin,
  subcomponents: {
    LinkButton,
  },
};

export const Links = () => {
  const plugins: any[] = [];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueLinks);

    const editor = useMemo(
      () => withLink(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <StyledToolbar>
          <LinkButton />
        </StyledToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
