import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Link } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingToolbar,
  LinkPlugin,
  ParagraphPlugin,
  renderElementLink,
  ToolbarLink,
  withLink,
} from '../../../packages/slate-plugins/src';
import { initialValueLinks, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Inline/Link',
  component: LinkPlugin,
  subcomponents: {
    renderElementLink,
    LinkButton: ToolbarLink,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueLinks);

    const editor = useMemo(
      () => withLink(nodeTypes)(withHistory(withReact(createEditor()))),
      []
    );

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
