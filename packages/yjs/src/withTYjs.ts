import { withYjs, YjsEditor } from '@slate-yjs/core';
import { TEditor, TOperation, Value } from '@udecode/plate-common';
import * as Y from 'yjs';

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing positions
  positionStorageOrigin?: unknown;
};

export type YjsEditorProps = Pick<
  YjsEditor,
  | 'sharedRoot'
  | 'localOrigin'
  | 'positionStorageOrigin'
  | 'applyRemoteEvents'
  | 'flushLocalChanges'
  | 'isLocalOrigin'
  | 'connect'
  | 'disconnect'
> & {
  storeLocalChange: (op: TOperation) => void;
};

export const withTYjs = <
  V extends Value,
  E extends TEditor<V>,
  EE extends E & YjsEditorProps = E & YjsEditorProps,
>(
  editor: E,
  sharedRoot: Y.XmlText,
  options?: WithYjsOptions
) => withYjs(editor as any, sharedRoot, options) as any as EE;
