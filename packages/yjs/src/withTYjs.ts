import type { PlateEditor, TOperation } from '@udecode/plate-common';
import type * as Y from 'yjs';

import { type YjsEditor, withYjs } from '@slate-yjs/core';

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing positions
  positionStorageOrigin?: unknown;
};

export type YjsEditorProps = {
  storeLocalChange: (op: TOperation) => void;
} & Pick<
  YjsEditor,
  | 'applyRemoteEvents'
  | 'connect'
  | 'disconnect'
  | 'flushLocalChanges'
  | 'isLocalOrigin'
  | 'localOrigin'
  | 'positionStorageOrigin'
  | 'sharedRoot'
>;

export const withTYjs = (
  editor: PlateEditor,
  sharedRoot: Y.XmlText,
  options?: WithYjsOptions
) =>
  withYjs(editor as any, sharedRoot, options) as PlateEditor & YjsEditorProps;
