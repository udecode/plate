import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Link } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  LinkPlugin,
  ParagraphPlugin,
  pipe,
  renderElementLink,
  SlateDocument,
  ToolbarLink,
  withInlineVoid,
  withLink,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks, options } from '../config/initialValues';

export default {
  title: 'Elements/Link',
  component: LinkPlugin,
  subcomponents: {
    renderElementLink,
    LinkButton: ToolbarLink,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(options));

  const withPlugins = [
    withReact,
    withHistory,
    withLink(options),
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueLinks);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <HeadingToolbar>
          <ToolbarLink {...options} icon={<Link />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
