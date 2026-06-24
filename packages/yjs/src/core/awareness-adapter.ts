import type { Editor, Range } from '@platejs/plite';
import * as Y from 'yjs';

import {
  createYjsAwarenessSelection,
  readYjsAwarenessSelection,
  yjsAwarenessSelectionsEqual,
} from './awareness';
import { getYjsLength, getYjsNodeIf } from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';
import type {
  YjsAwarenessLike,
  YjsAwarenessState,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from './types';

type YjsAwarenessAdapterOptions = {
  readonly awareness?: YjsAwarenessLike;
  readonly awarenessDataField: string;
  readonly awarenessSelectionField: string;
  readonly canSendSelection: () => boolean;
  readonly clientId: number | string;
  readonly doc: Y.Doc;
  readonly editor: Editor;
  readonly isConnected: () => boolean;
  readonly root: Y.XmlElement;
};

export type YjsAwarenessAdapter = {
  readonly clearSelection: () => void;
  readonly currentSelection: () => Range | null;
  readonly remoteCursor: <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >(
    clientId: number
  ) => YjsRemoteCursor<TCursorData> | null;
  readonly remoteCursors: <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >() => readonly YjsRemoteCursor<TCursorData>[];
  readonly sendCursorData: (data: YjsRemoteCursorData | null) => void;
  readonly sendSelection: (
    range?: Range | null,
    data?: YjsRemoteCursorData | null
  ) => void;
};

const getSortedAwarenessClientIds = (
  awareness: YjsAwarenessLike,
  localClientId: number
): readonly number[] => {
  const states = awareness.getStates();
  const clientIds = new Array<number>(states.size);
  let writeIndex = 0;

  for (const clientId of states.keys()) {
    if (clientId === localClientId) {
      continue;
    }

    clientIds[writeIndex] = clientId;
    writeIndex++;
  }

  clientIds.length = writeIndex;

  if (clientIds.length > 1) {
    clientIds.sort((a, b) => a - b);
  }

  return clientIds;
};

const readRemoteCursorRecordData = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  state: YjsAwarenessState,
  field: string
): TCursorData | undefined => {
  const data = state[field];

  return isRecord(data) ? (data as TCursorData) : undefined;
};

export const createYjsAwarenessAdapter = ({
  awareness,
  awarenessDataField,
  awarenessSelectionField,
  canSendSelection,
  clientId,
  doc,
  editor,
  isConnected,
  root,
}: YjsAwarenessAdapterOptions): YjsAwarenessAdapter => {
  const currentSelection = (): Range | null =>
    editor.read((state) => state.selection.get());

  const getLocalAwarenessClientId = (): number =>
    awareness?.doc?.clientID ??
    awareness?.clientID ??
    (typeof clientId === 'number' ? clientId : doc.clientID);

  const isValidYjsSelectionPoint = (point: Range['anchor']): boolean => {
    const node = getYjsNodeIf(root, point.path);

    return (
      node instanceof Y.XmlText &&
      point.offset >= 0 &&
      point.offset <= getYjsLength(node)
    );
  };

  const sanitizeYjsSelection = (range: Range): Range | null =>
    isValidYjsSelectionPoint(range.anchor) &&
    isValidYjsSelectionPoint(range.focus)
      ? range
      : null;

  const clearSelection = (): void => {
    if (awareness === undefined) {
      return;
    }

    const localState = awareness.getLocalState();

    if (
      localState !== null &&
      awarenessSelectionField in localState &&
      localState[awarenessSelectionField] !== null
    ) {
      awareness.setLocalStateField(awarenessSelectionField, null);
    }
  };

  const readRemoteCursor = <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >(
    remoteClientId: number,
    localClientId: number
  ): YjsRemoteCursor<TCursorData> | null => {
    if (awareness === undefined || remoteClientId === localClientId) {
      return null;
    }

    const state = awareness.getStates().get(remoteClientId);

    if (state === undefined) {
      return null;
    }

    const data = readRemoteCursorRecordData<TCursorData>(
      state,
      awarenessDataField
    );

    const cursor: {
      data?: TCursorData;
      clientId: number;
      selection: Range | null;
    } = {
      clientId: remoteClientId,
      selection: readYjsAwarenessSelection(
        root,
        state[awarenessSelectionField]
      ),
    };

    if (data !== undefined) {
      cursor.data = data;
    }

    return cursor;
  };

  const remoteCursor = <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >(
    remoteClientId: number
  ): YjsRemoteCursor<TCursorData> | null => {
    if (awareness === undefined || !isConnected()) {
      return null;
    }

    return readRemoteCursor<TCursorData>(
      remoteClientId,
      getLocalAwarenessClientId()
    );
  };

  const remoteCursors = <
    TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  >(): readonly YjsRemoteCursor<TCursorData>[] => {
    if (awareness === undefined || !isConnected()) {
      return [];
    }

    const localClientId = getLocalAwarenessClientId();
    const remoteClientIds = getSortedAwarenessClientIds(
      awareness,
      localClientId
    );
    const cursors = new Array<YjsRemoteCursor<TCursorData>>(
      remoteClientIds.length
    );
    let writeIndex = 0;
    let index = 0;

    while (index < remoteClientIds.length) {
      const remoteClientId = remoteClientIds[index];

      if (typeof remoteClientId !== 'number') {
        throw new Error(
          'Cannot read remote cursors from a sparse client id array.'
        );
      }

      const cursor = readRemoteCursor<TCursorData>(
        remoteClientId,
        localClientId
      );

      if (cursor !== null) {
        cursors[writeIndex] = cursor;
        writeIndex++;
      }
      index++;
    }

    cursors.length = writeIndex;

    return cursors;
  };

  const setLocalStateFieldIfChanged = (field: string, value: unknown): void => {
    if (awareness === undefined) {
      return;
    }

    const localState = awareness.getLocalState();

    if (
      localState !== null &&
      field in localState &&
      areJsonLikeValuesEqual(localState[field], value)
    ) {
      return;
    }

    awareness.setLocalStateField(field, value);
  };

  const sendCursorData = (data: YjsRemoteCursorData | null): void => {
    setLocalStateFieldIfChanged(awarenessDataField, data);
  };

  const sendSelection = (
    range: Range | null | undefined = currentSelection(),
    data?: YjsRemoteCursorData | null
  ): void => {
    if (awareness === undefined || !canSendSelection()) {
      return;
    }

    if (data !== undefined) {
      sendCursorData(data);
    }

    const nextRange =
      range === null || range === undefined
        ? null
        : sanitizeYjsSelection(range);
    const nextSelection =
      nextRange === null ? null : createYjsAwarenessSelection(root, nextRange);
    const currentAwarenessSelection =
      awareness.getLocalState()?.[awarenessSelectionField];

    if (
      !yjsAwarenessSelectionsEqual(currentAwarenessSelection, nextSelection)
    ) {
      awareness.setLocalStateField(awarenessSelectionField, nextSelection);
    }
  };

  return {
    clearSelection,
    currentSelection,
    remoteCursor,
    remoteCursors,
    sendCursorData,
    sendSelection,
  };
};
