import { OnDOMBeforeInput, SlatePlugin } from 'common/types';
import { Editor } from 'slate';

export const onDOMBeforeInputPlugins = (
  editor: Editor,
  plugins: SlatePlugin[],
  onDOMBeforeInputList: OnDOMBeforeInput[]
) => (event: Event) => {
  onDOMBeforeInputList.forEach((onDOMBeforeInput) => {
    onDOMBeforeInput(event, editor);
  });

  plugins.forEach(({ onDOMBeforeInput }) => {
    onDOMBeforeInput?.(event, editor);
  });
};
