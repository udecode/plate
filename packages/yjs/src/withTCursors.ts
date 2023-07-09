import { CursorEditor, WithCursorsOptions, withCursors } from '@slate-yjs/core';
import { Value } from '@udecode/plate-common';
import { Awareness } from 'y-protocols/awareness';

import { YjsEditorProps } from './withTYjs';

export type TCursorEditor<V extends Value = Value> = YjsEditorProps<V> &
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
  E extends TCursorEditor<V>,
  EE extends E & TCursorEditor<V> = E & TCursorEditor<V>
>(
  editor: E,
  awareness: Awareness,
  options?: WithCursorsOptions<TCursorData>
) => withCursors(editor as any, awareness, options) as any as EE;
