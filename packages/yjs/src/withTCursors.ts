import type { TEditor, Value } from '@udecode/plate-common/server';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { Awareness } from 'y-protocols/awareness';

import {
  type CursorEditor,
  type WithCursorsOptions,
  withCursors,
} from '@slate-yjs/core';

import type { YjsEditorProps } from './withTYjs';

export type CursorEditorProps = Pick<
  CursorEditor,
  | 'awareness'
  | 'cursorDataField'
  | 'selectionStateField'
  | 'sendCursorData'
  | 'sendCursorPosition'
> &
  YjsEditorProps;

export const withTCursors = <
  TCursorData extends Record<string, unknown>,
  V extends Value,
  E extends TEditor<V> & YjsEditorProps,
  EE extends CursorEditorProps & E = CursorEditorProps & E,
>(
  editor: E,
  awareness: Awareness,
  options?: WithCursorsOptions<TCursorData>
) => withCursors(editor as any, awareness, options) as any as EE;
