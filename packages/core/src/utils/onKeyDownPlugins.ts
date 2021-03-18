import { Editor } from 'slate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { OnKeyDown } from '../types/SlatePlugin/OnKeyDown';

/**
 * @see {@link OnKeyDown}
 */
export const onKeyDownPlugins = (
  editor: Editor,
  onKeyDownList: (OnKeyDown | null | undefined)[]
): EditableProps['onKeyDown'] => (event) => {
  onKeyDownList.some((onKeyDown) => onKeyDown?.(editor)(event) === false);
};
