import type { TEditor, TOperation, Value } from '@udecode/plate-common/server';
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

export const withTYjs = <
  V extends Value,
  E extends TEditor<V>,
  EE extends E & YjsEditorProps = E & YjsEditorProps,
>(
  editor: E,
  sharedRoot: Y.XmlText,
  options?: WithYjsOptions
) => withYjs(editor as any, sharedRoot, options) as any as EE;
