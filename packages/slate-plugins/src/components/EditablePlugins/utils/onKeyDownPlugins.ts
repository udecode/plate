import { Editor } from 'slate';
import { OnKeyDown, SlatePlugin } from '../../../common';

export const onKeyDownPlugins = (
  editor: Editor,
  plugins: SlatePlugin[],
  onKeyDownList: OnKeyDown[]
) => (event: any) => {
  onKeyDownList.forEach((onKeyDown) => {
    onKeyDown(event, editor);
  });

  plugins.forEach(({ onKeyDown }) => {
    onKeyDown?.(event, editor);
  });
};
