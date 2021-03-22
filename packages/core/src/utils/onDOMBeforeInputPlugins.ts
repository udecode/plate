import { Editor } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const onDOMBeforeInputPlugins = (
  editor: Editor,
  plugins: SlatePlugin[]
): EditableProps['onDOMBeforeInput'] => (event: Event) => {
  flatMapKey(plugins, 'onDOMBeforeInput').some(
    (onDOMBeforeInput) => onDOMBeforeInput(editor)(event) === false
  );
};
