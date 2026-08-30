import type { Value } from '../../core';
import type {
  PliteDecorationSource,
  Editor as ReactViewEditor,
} from '../../react/core';
import { yjs } from '../core';
import { getEditorYjsTx } from '../core/editor-yjs';
import type {
  YjsRemoteCursorDecorationData,
  YjsRemoteCursorOverlayPosition,
} from './useYjs';
import {
  useYjsRemoteCursorDecorationSource,
  useYjsRemoteCursorOverlayPositions,
} from './useYjs';

type CursorData = {
  readonly name: string;
};

type LabelData = {
  readonly label: string;
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

const useVerifyCursorOutputTypes = (editor: CursorEditor) => {
  editor.update((tx) => {
    const yjsTx = getEditorYjsTx(tx);

    yjsTx.sendCursorData({ name: 'Ada' });
    // @ts-expect-error Cursor metadata is owned by the installed Yjs descriptor.
    yjsTx.sendCursorData({ color: 'red' });
  });

  const defaultSource: PliteDecorationSource<
    YjsRemoteCursorDecorationData<CursorData>
  > = useYjsRemoteCursorDecorationSource(editor);
  const customSource: PliteDecorationSource<LabelData> =
    useYjsRemoteCursorDecorationSource(editor, {
      decorate: (cursor) => ({ label: String(cursor.clientId) }),
    });
  const [defaultPositions]: readonly [
    ReadonlyArray<
      YjsRemoteCursorOverlayPosition<
        CursorData,
        YjsRemoteCursorDecorationData<CursorData>
      >
    >,
    () => void,
  ] = useYjsRemoteCursorOverlayPositions(editor);
  const [customPositions]: readonly [
    ReadonlyArray<YjsRemoteCursorOverlayPosition<CursorData, LabelData>>,
    () => void,
  ] = useYjsRemoteCursorOverlayPositions(editor, {
    data: (cursor) => ({ label: String(cursor.clientId) }),
  });

  // @ts-expect-error Default decoration data cannot become a custom result.
  const invalidSource: PliteDecorationSource<LabelData> =
    useYjsRemoteCursorDecorationSource(editor);
  // @ts-expect-error Default overlay data cannot become a custom result.
  const invalidPositions: ReadonlyArray<
    YjsRemoteCursorOverlayPosition<CursorData, LabelData>
  > = useYjsRemoteCursorOverlayPositions(editor)[0];

  return {
    customPositions,
    customSource,
    defaultPositions,
    defaultSource,
    invalidPositions,
    invalidSource,
  };
};

void useVerifyCursorOutputTypes;
