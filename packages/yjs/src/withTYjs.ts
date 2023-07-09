import { YjsEditor, withYjs } from '@slate-yjs/core';
// eslint-disable-next-line import/no-unresolved
import { WithYjsOptions } from '@slate-yjs/core/dist/plugins/withYjs';
import { TEditor, TOperation, Value } from '@udecode/plate-common';
import * as Y from 'yjs';

export type YjsEditorProps<V extends Value = Value> = Pick<
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
  EE extends E & YjsEditorProps<V> = E & YjsEditorProps<V>
>(
  editor: E,
  sharedRoot: Y.XmlText,
  options?: WithYjsOptions
) => withYjs(editor as any, sharedRoot, options) as any as EE;
