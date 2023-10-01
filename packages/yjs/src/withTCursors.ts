import { CursorEditor, withCursors, WithCursorsOptions } from '@slate-yjs/core';
import { TEditor, Value } from '@udecode/plate-common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Awareness } from 'y-protocols/awareness';

import { YjsEditorProps } from './withTYjs';

export type CursorEditorProps = YjsEditorProps &
  Pick<
    CursorEditor,
    | 'awareness'
    | 'cursorDataField'
    | 'selectionStateField'
    | 'sendCursorPosition'
    | 'sendCursorData'
  >;

export const withTCursors = <
  TCursorData extends Record<string, unknown>,
  V extends Value,
  E extends TEditor<V> & YjsEditorProps,
  EE extends E & CursorEditorProps = E & CursorEditorProps,
>(
  editor: E,
  awareness: Awareness,
  options?: WithCursorsOptions<TCursorData>
) => withCursors(editor as any, awareness, options) as any as EE;
