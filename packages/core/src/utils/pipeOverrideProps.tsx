import { PlateEditor } from '../types/PlateEditor';
import { getOverrideProps } from './getOverrideProps';

export const pipeOverrideProps = <T,>(editor: PlateEditor, props: any): T => {
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideProps) {
      const newProps = getOverrideProps(editor, { plugin, props });

      if (newProps) {
        props = {
          ...props,
          ...newProps,
        };
      }
    }
  });

  return { ...props, editor };
};
