import { withYjs, YjsEditor } from '@slate-yjs/core';
import { WithYjsOptions } from '@slate-yjs/core/dist/plugins/withYjs';
import { TEditor, TOperation, Value } from '@udecode/plate';
import * as Y from 'yjs';

export type TYjsEditor<V extends Value = Value> = TEditor<V> &
  Pick<
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
  EE extends E & TYjsEditor<V> = E & TYjsEditor<V>
>(
  editor: E,
  sharedRoot: Y.XmlText,
  options?: WithYjsOptions
) => (withYjs(editor as any, sharedRoot, options) as any) as EE;
