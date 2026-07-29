import type { PliteDecorationSource, ReactEditor } from '@platejs/plite-react';

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

const verifyCursorOutputTypes = (editor: ReactEditor) => {
  const defaultSource: PliteDecorationSource<
    YjsRemoteCursorDecorationData<CursorData>
  > = useYjsRemoteCursorDecorationSource<CursorData>(editor);
  const customSource: PliteDecorationSource<LabelData> =
    useYjsRemoteCursorDecorationSource<CursorData, LabelData>(editor, {
      decorate: (cursor) => ({ label: String(cursor.clientId) }),
    });
  const [defaultPositions]: readonly [
    readonly YjsRemoteCursorOverlayPosition<
      CursorData,
      YjsRemoteCursorDecorationData<CursorData>
    >[],
    () => void,
  ] = useYjsRemoteCursorOverlayPositions<CursorData>(editor);
  const [customPositions]: readonly [
    readonly YjsRemoteCursorOverlayPosition<CursorData, LabelData>[],
    () => void,
  ] = useYjsRemoteCursorOverlayPositions<CursorData, LabelData>(editor, {
    data: (cursor) => ({ label: String(cursor.clientId) }),
  });

  // @ts-expect-error Custom decoration data requires a producer.
  useYjsRemoteCursorDecorationSource<CursorData, LabelData>(editor);
  // @ts-expect-error Custom overlay data requires a producer.
  useYjsRemoteCursorOverlayPositions<CursorData, LabelData>(editor);

  return {
    customPositions,
    customSource,
    defaultPositions,
    defaultSource,
  };
};

void verifyCursorOutputTypes;
