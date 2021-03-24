import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapByKey } from './flatMapByKey';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const pipeOnDOMBeforeInput = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['onDOMBeforeInput'] => (event: Event) => {
  flatMapByKey(plugins, 'onDOMBeforeInput').some(
    (onDOMBeforeInput) => onDOMBeforeInput(editor)(event) === false
  );
};
