import type {
  EditorStateField,
  StateFieldDescriptor,
} from '../interfaces/editor';
import { registerStateField } from './public-state';

/**
 * Creates an editor-scoped state field from a keyed descriptor.
 *
 * State fields register when their extension is installed and are read through
 * the editor state API.
 */
export const defineStateField = <TValue>(
  descriptor: StateFieldDescriptor<TValue>
): EditorStateField<TValue> => {
  const field = {
    ...descriptor,
    name: `state-field:${descriptor.key}`,
    options: descriptor,
    setup({ editor }) {
      registerStateField(editor, field);
    },
  } satisfies EditorStateField<TValue>;

  return field;
};
