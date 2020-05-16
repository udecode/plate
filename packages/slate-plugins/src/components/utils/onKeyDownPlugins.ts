import { OnKeyDown, SlatePlugin } from 'common/types';
import { Editor } from 'slate';

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
