import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { getOverrideProps } from './getOverrideProps';

export const injectOverrideProps = <T,>(
  editor: PlateEditor,
  {
    plugins,
    props,
  }: {
    props: any;
    plugins: PlatePlugin[];
  }
): T => {
  plugins.forEach((plugin) => {
    if (plugin.overrideProps) {
      const newProps = getOverrideProps(editor, plugin);

      if (newProps) {
        props = {
          ...props,
          ...newProps,
        };
      }
    }
  });

  return { ...props, editor, plugins };
};
