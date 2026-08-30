import * as Y from 'yjs';

import type { Range } from '../../core';
import { normalizeRootKey } from '../../core';
import {
  createYjsAwarenessSelection,
  readYjsAwarenessSelection,
  yjsAwarenessSelectionsEqual,
} from './awareness';
import { getYjsLength, getYjsNodeIf } from './document';
import type { YjsEditor } from './editor-types';
import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';
import type {
  YjsAwarenessLike,
  YjsAwarenessState,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from './types';

type YjsAwarenessAdapterOptions<TCursorData extends YjsRemoteCursorData> = {
  readonly awareness?: YjsAwarenessLike;
  readonly awarenessDataField: string;
  readonly awarenessSelectionField: string;
  readonly canSendSelection: () => boolean;
  readonly clientId: number | string;
  readonly doc: Y.Doc;
  readonly editor: YjsEditor;
  readonly isConnected: () => boolean;
  readonly rootFor: (root: string) => Y.XmlElement | null;
  readonly validateCursorData: (value: unknown) => value is TCursorData;
};

export type YjsAwarenessAdapter<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clearSelection: () => void;
  readonly currentSelection: () => Range | null;
  readonly remoteCursor: (
    clientId: number
  ) => YjsRemoteCursor<TCursorData> | null;
  readonly remoteCursors: () => ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  readonly sendCursorData: (data: TCursorData | null) => void;
  readonly sendSelection: (
    range?: Range | null,
    data?: TCursorData | null
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
    writeIndex += 1;
  }

  clientIds.length = writeIndex;

  if (clientIds.length > 1) {
    clientIds.sort((a, b) => a - b);
  }

  return clientIds;
};

const readRemoteCursorRecordData = <TCursorData extends YjsRemoteCursorData>(
  state: YjsAwarenessState,
  field: string,
  validate: (value: unknown) => value is TCursorData
): TCursorData | undefined => {
  const data = state[field];

  return isRecord(data) && validate(data) ? data : undefined;
};

export const createYjsAwarenessAdapter = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>({
  awareness,
  awarenessDataField,
  awarenessSelectionField,
  canSendSelection,
  clientId,
  doc,
  editor,
  isConnected,
  rootFor,
  validateCursorData,
}: YjsAwarenessAdapterOptions<TCursorData>): YjsAwarenessAdapter<TCursorData> => {
  const currentSelection = (): Range | null => editor.read.selection();

  const getLocalAwarenessClientId = (): number =>
    awareness?.doc?.clientID ??
    awareness?.clientID ??
    (typeof clientId === 'number' ? clientId : doc.clientID);

  const isValidYjsSelectionPoint = (point: Range['anchor']): boolean => {
    const root = rootFor(normalizeRootKey(point.root));

    if (root === null) return false;

    const node = getYjsNodeIf(root, point.path);

    return (
      node instanceof Y.XmlText &&
      point.offset >= 0 &&
      point.offset <= getYjsLength(node)
    );
  };

  const sanitizeYjsSelection = (range: Range): Range | null => {
    if (
      normalizeRootKey(range.anchor.root) !== normalizeRootKey(range.focus.root)
    ) {
      return null;
    }

    return isValidYjsSelectionPoint(range.anchor) &&
      isValidYjsSelectionPoint(range.focus)
      ? range
      : null;
  };

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

  const readRemoteCursor = (
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
      awarenessDataField,
      validateCursorData
    );

    const cursor: {
      data?: TCursorData;
      clientId: number;
      selection: Range | null;
    } = {
      clientId: remoteClientId,
      selection: readYjsAwarenessSelection(
        rootFor,
        state[awarenessSelectionField]
      ),
    };

    if (data !== undefined) {
      cursor.data = data;
    }

    return cursor;
  };

  const remoteCursor = (
    remoteClientId: number
  ): YjsRemoteCursor<TCursorData> | null => {
    if (awareness === undefined || !isConnected()) {
      return null;
    }

    return readRemoteCursor(remoteClientId, getLocalAwarenessClientId());
  };

  const remoteCursors = (): ReadonlyArray<YjsRemoteCursor<TCursorData>> => {
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

      const cursor = readRemoteCursor(remoteClientId, localClientId);

      if (cursor !== null) {
        cursors[writeIndex] = cursor;
        writeIndex += 1;
      }
      index += 1;
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

  const sendCursorData = (data: TCursorData | null): void => {
    if (data !== null && !validateCursorData(data)) {
      throw new Error('Yjs cursor data does not match its configured schema.');
    }
    setLocalStateFieldIfChanged(awarenessDataField, data);
  };

  const sendSelection = (
    range: Range | null | undefined = currentSelection(),
    data?: TCursorData | null
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
    const rootKey =
      nextRange === null ? 'main' : normalizeRootKey(nextRange.anchor.root);
    const root = rootFor(rootKey);
    const nextSelection =
      nextRange === null || root === null
        ? null
        : createYjsAwarenessSelection(root, rootKey, nextRange);
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
