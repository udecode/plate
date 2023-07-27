/** @jsx jsx */

import { createPlateEditor, PlateEditor, Value } from '@udecode/plate-common';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { createMentionPlugin } from '../createMentionPlugin';

jsx;

export type CreateEditorOptions = {
  multipleMentionPlugins?: boolean;
  pluginOptions?: {
    key?: string;
    trigger?: string;
    triggerPreviousCharPattern?: RegExp;
  };
};

export const createEditorWithMentions = <V extends Value>(
  state: JSX.Element,
  {
    multipleMentionPlugins,
    pluginOptions: { trigger, key, triggerPreviousCharPattern } = {},
  }: CreateEditorOptions = {}
): PlateEditor<V> => {
  const plugins = [
    createParagraphPlugin(),
    createMentionPlugin({
      key,
      options: { trigger, triggerPreviousCharPattern },
    }),
  ];
  if (multipleMentionPlugins) {
    plugins.push(
      createMentionPlugin({ key: 'mention2', options: { trigger: '#' } })
    );
  }

  return createPlateEditor({
    editor: (<editor>{state}</editor>) as any,
    plugins,
  });
};
