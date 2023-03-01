import { withReact } from 'slate-react';
import { TEditor, Value } from '../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';

export const withTReact = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
  EE extends E = E & TReactEditor<V>
>(
  editor: E
) => (withReact(editor as any) as any) as EE;
