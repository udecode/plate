import { TEditor, Value } from '@udecode/slate-utils';
import { withReact } from 'slate-react';
import { TReactEditor } from '../../../slate-react-utils/src/slate/react-editor/TReactEditor';

export const withTReact = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
  EE extends E = E & TReactEditor<V>
>(
  editor: E
) => (withReact(editor as any) as any) as EE;
