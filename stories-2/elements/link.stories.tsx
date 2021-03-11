import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Link } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingPlugin,
  LinkPlugin,
  ParagraphPlugin,
  SlatePlugins,
  withInlineVoid,
  withLink,
} from '@udecode/slate-plugins';
import { HeadingToolbar, ToolbarLink } from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueLinks, options } from '../config/initialValues';

const id = 'Elements/Link';

export default {
  title: id,
  component: LinkPlugin,
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(), HeadingPlugin()];
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());

  const withPlugins = [
    withReact,
    withHistory,
    withLink({}, options),
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueLinks}
        withPlugins={withPlugins}
      >
        <HeadingToolbar>
          <ToolbarLink {...options} icon={<Link />} />
        </HeadingToolbar>
        <EditablePlugins
          plugins={plugins}
          editableProps={{
            placeholder: 'Enter some text...',
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
