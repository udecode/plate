import type { SlateEditor, WithOverride } from '@udecode/plate-common';

import * as Y from 'yjs';

import type { YjsConfig } from './YjsPlugin';

import { type PlateYjsEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { withTYjs } from './withTYjs';

export const withPlateYjs: WithOverride<YjsConfig> = ({
  editor: e,
  getOptions,
}) => {
  const editor = e as unknown as PlateYjsEditorProps & SlateEditor;

  // not reactive
  const { cursorOptions, disableCursors, provider, yjsOptions } = getOptions();

  const sharedType = provider.document.get(
    'content',
    Y.XmlText
  ) as any as Y.XmlText;

  if (disableCursors) {
    return withTYHistory(
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      })
    );
  }

  return withTYHistory(
    withTCursors(
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      }),
      provider.awareness!,
      cursorOptions
    )
  );
};
