import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * @see {@link OnKeyDown}
 */
export const pipeOnKeyDown = (
  editor: SPEditor,
  plugins: SlatePlugin[] = []
): EditableProps['onKeyDown'] => {
  const onKeyDowns = plugins.flatMap(
    (plugin) => plugin.onKeyDown?.(editor) ?? []
  );

  return (event) => {
    onKeyDowns.some((onKeyDown) => onKeyDown(event) === false);
  };
};
