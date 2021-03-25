import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapByKey } from './flatMapByKey';

/**
 * @see {@link OnKeyDown}
 */
export const pipeOnKeyDown = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['onKeyDown'] => (event) => {
  flatMapByKey(plugins, 'onKeyDown').some(
    (onKeyDown) => onKeyDown(editor)(event) === false
  );
};
