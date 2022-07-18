import { CursorEditor, withCursors, WithCursorsOptions } from '@slate-yjs/core';
import { Value } from '@udecode/plate';
import { Awareness } from 'y-protocols/awareness';
import { TYjsEditor } from './withTYjs';

export type TCursorEditor<V extends Value = Value> = TYjsEditor<V> &
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
) => (withCursors(editor as any, awareness, options) as any) as EE;
