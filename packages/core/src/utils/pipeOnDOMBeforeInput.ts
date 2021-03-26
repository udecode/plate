import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const pipeOnDOMBeforeInput = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['onDOMBeforeInput'] => {
  const onDOMBeforeInputs = plugins.flatMap(
    (plugin) => plugin.onDOMBeforeInput?.(editor) ?? []
  );

  return (event: Event) => {
    onDOMBeforeInputs.some(
      (onDOMBeforeInput) => onDOMBeforeInput(event) === false
    );
  };
};
