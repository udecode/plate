import { withReact } from 'slate-react';
import { TEditor, Value } from '../slate/editor/TEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';

export const withTReact = <V extends Value, E extends TEditor<V>>(editor: E) =>
  (withReact(editor as any) as any) as E & TReactEditor<V>;
