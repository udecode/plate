import { Editor } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { OnDOMBeforeInput } from '../types/SlatePlugin/OnDOMBeforeInput';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const onDOMBeforeInputPlugins = (
  editor: Editor,
  onDOMBeforeInputList: (OnDOMBeforeInput | undefined)[]
): EditableProps['onDOMBeforeInput'] => (event: Event) => {
  onDOMBeforeInputList.some(
    (onDOMBeforeInput) => onDOMBeforeInput?.(editor)(event) === false
  );
};
