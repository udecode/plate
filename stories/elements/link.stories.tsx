import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Link } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingToolbar,
  LinkPlugin,
  ParagraphPlugin,
  pipe,
  renderElementLink,
  ToolbarLink,
  withLink,
} from '@udecode/slate-plugins/src';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks, nodeTypes } from '../config/initialValues';

export default {
  title: 'Elements/Link',
  component: LinkPlugin,
  subcomponents: {
    renderElementLink,
    LinkButton: ToolbarLink,
  },
};

const withPlugins = [withReact, withHistory, withLink(nodeTypes)] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueLinks);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarLink {...nodeTypes} icon={<Link />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
