import { createEditor } from 'slate';
import { TEditor, Value } from '../slate/types/TEditor';

export const createTEditor = <V extends Value>() =>
  (createEditor() as any) as TEditor<V>;
