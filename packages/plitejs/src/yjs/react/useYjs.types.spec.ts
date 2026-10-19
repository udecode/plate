import * as Y from 'yjs';

import type { Value } from '../../index';
import type { Editor as ReactViewEditor } from '../../react';
import type { RangeGeometry } from '../../react/range-geometry';
import { yjs, type YjsAwarenessLike } from '../core';
import {
  useYjsAdmissionStatus,
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from './useYjs';

type CursorData = {
  readonly name: string;
};

const doc = new Y.Doc();
const awareness = {
  doc,
  getLocalState: () => null,
  getStates: () => new Map(),
  off: () => {},
  on: () => {},
  setLocalStateField: () => {},
} satisfies YjsAwarenessLike;
const CursorYjs = yjs({
  awareness,
  cursorData: {
    validate: (value): value is CursorData =>
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      typeof value.name === 'string',
  },
  doc,
  initialReady: true,
  seed: true,
});

type CursorEditor = ReactViewEditor<Value, readonly [typeof CursorYjs]>;

const editableRef = { current: null as HTMLDivElement | null };

const useVerifyCursorOutputTypes = (editor: CursorEditor) => {
  editor.api.yjs.setCursorData({ name: 'Ada' });
  editor.api.yjs.syncSelection();
  // @ts-expect-error Cursor metadata is owned by the installed Yjs descriptor.
  editor.api.yjs.setCursorData({ color: 'red' });

  const status = useYjsAdmissionStatus(editor);
  const cursor = useYjsRemoteCursor(editor, 101);
  const ids: readonly number[] = useYjsRemoteCursorIds(editor);
  const geometry: RangeGeometry | null = useYjsRemoteCursorGeometry(
    editor,
    101,
    { editableRef }
  );

  cursor?.data?.name;
  status.state;

  return { geometry, ids };
};

const DocumentOnlyYjs = yjs({
  doc: new Y.Doc(),
  initialReady: true,
  seed: true,
});
type DocumentOnlyEditor = ReactViewEditor<
  Value,
  readonly [typeof DocumentOnlyYjs]
>;

const useVerifyCapabilityNegatives = (
  documentOnlyEditor: DocumentOnlyEditor
) => {
  // @ts-expect-error Presence hooks require an awareness-capable descriptor.
  useYjsRemoteCursor(documentOnlyEditor, 1);
  // @ts-expect-error Presence methods are absent without awareness.
  documentOnlyEditor.api.yjs.syncSelection();
};

void useVerifyCursorOutputTypes;
void useVerifyCapabilityNegatives;
