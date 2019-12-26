import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  HeadingToolbar,
  LinkPlugin,
  renderElementLink,
  ToolbarLink,
  withLink,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from '../config/initialValues';

export default {
  title: 'Plugins/LinkPlugin',
  component: LinkPlugin,
  subcomponents: {
    renderElementLink,
    LinkButton: ToolbarLink,
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
        <HeadingToolbar>
          <ToolbarLink />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
