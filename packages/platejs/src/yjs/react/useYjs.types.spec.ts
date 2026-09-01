import type { Value } from '../../core';
import type {
  PliteWidgetGeometry,
  Editor as ReactViewEditor,
} from '../../react/core';
import { yjs } from '../core';
import { getEditorYjsTx } from '../core/editor-yjs';
import {
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from './useYjs';

type CursorData = {
  readonly name: string;
};

const CursorYjs = yjs({
  cursorData: {
    validate: (value): value is CursorData =>
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      typeof value.name === 'string',
  },
});

type CursorEditor = ReactViewEditor<Value, readonly [typeof CursorYjs]>;

const editableRef = { current: null as HTMLDivElement | null };

const useVerifyCursorOutputTypes = (editor: CursorEditor) => {
  editor.update((tx) => {
    const yjsTx = getEditorYjsTx(tx);

    yjsTx.sendCursorData({ name: 'Ada' });
    // @ts-expect-error Cursor metadata is owned by the installed Yjs descriptor.
    yjsTx.sendCursorData({ color: 'red' });
  });

  const cursor = useYjsRemoteCursor(editor, 101);
  const ids: readonly number[] = useYjsRemoteCursorIds(editor);
  const geometry: PliteWidgetGeometry | null = useYjsRemoteCursorGeometry(
    editor,
    101,
    { editableRef }
  );

  cursor?.data?.name;

  return {
    geometry,
    ids,
  };
};

void useVerifyCursorOutputTypes;
