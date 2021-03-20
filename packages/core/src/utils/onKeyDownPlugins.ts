import { Editor } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link OnKeyDown}
 */
export const onKeyDownPlugins = (
  editor: Editor,
  plugins: SlatePlugin[]
): EditableProps['onKeyDown'] => (event) => {
  flatMapKey(plugins, 'onKeyDown').some(
    (onKeyDown) => onKeyDown(editor)(event) === false
  );
};
