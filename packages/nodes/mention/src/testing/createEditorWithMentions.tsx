/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src';
import { createMentionPlugin } from '../createMentionPlugin';

jsx;

export type CreateEditorOptions = {
  multipleMentionPlugins?: boolean;
  pluginOptions?: {
    key?: string;
    trigger?: string;
  };
};

export const createEditorWithMentions = (
  state: JSX.Element,
  {
    multipleMentionPlugins,
    pluginOptions: { trigger, key } = {},
  }: CreateEditorOptions = {}
): PlateEditor => {
  const plugins = [
    createParagraphPlugin(),
    createMentionPlugin({ key, options: { trigger } }),
  ];
  if (multipleMentionPlugins) {
    plugins.push(
      createMentionPlugin({ key: 'mention2', options: { trigger: '#' } })
    );
  }

  return createPlateUIEditor({
    editor: (<editor>{state}</editor>) as any,
    plugins,
  });
};
