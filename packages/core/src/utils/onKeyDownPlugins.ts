import { Editor } from 'slate';
import { OnKeyDown } from '../types/OnKeyDown';

/**
 * @see {@link OnKeyDown}
 */
export const onKeyDownPlugins = (
  editor: Editor,
  onKeyDownList: (OnKeyDown | null | undefined)[]
) => (event: any) => {
  onKeyDownList.some((onKeyDown) => onKeyDown?.(event, editor) === false);
};
