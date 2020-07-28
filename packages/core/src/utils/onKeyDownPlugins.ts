import { Editor } from 'slate';
import { OnKeyDown, SlatePlugin } from '../types';

/**
 * Run `onKeyDownList` then `onKeyDown` of each plugin.
 * Stop if one handler returns false.
 */
export const onKeyDownPlugins = (
  editor: Editor,
  plugins: SlatePlugin[],
  onKeyDownList: OnKeyDown[]
) => (event: any) => {
  const onKeyDowns: OnKeyDown[] = [...onKeyDownList];

  plugins.forEach(({ onKeyDown }) => {
    if (onKeyDown) onKeyDowns.push(onKeyDown);
  });

  onKeyDowns.some((onKeyDown) => onKeyDown(event, editor) === false);
};
