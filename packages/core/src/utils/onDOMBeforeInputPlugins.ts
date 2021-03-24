import { EditableProps } from 'slate-react/dist/components/editable';
import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link OnDOMBeforeInput}
 */
export const onDOMBeforeInputPlugins = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['onDOMBeforeInput'] => (event: Event) => {
  flatMapKey(plugins, 'onDOMBeforeInput').some(
    (onDOMBeforeInput) => onDOMBeforeInput(editor)(event) === false
  );
};
