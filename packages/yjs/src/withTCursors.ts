import type { PlateEditor } from '@udecode/plate-common';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { Awareness } from 'y-protocols/awareness';

import {
  type CursorEditor,
  type WithCursorsOptions,
  withCursors,
} from '@slate-yjs/core';

import type { YjsEditorProps } from './withTYjs';

export type PlateYjsEditorProps = Pick<
  CursorEditor,
  | 'awareness'
  | 'cursorDataField'
  | 'selectionStateField'
  | 'sendCursorData'
  | 'sendCursorPosition'
> &
  YjsEditorProps;

export const withTCursors = <TCursorData extends Record<string, unknown>>(
  editor: PlateEditor,
  awareness: Awareness,
  options?: WithCursorsOptions<TCursorData>
) =>
  withCursors(editor as any, awareness, options) as PlateEditor &
    PlateYjsEditorProps &
    YjsEditorProps;
