import { PlateEditor } from '../types/PlateEditor';
import { getInjectProps } from './getInjectProps';

/**
 * Inject plugin props, editor.
 */
export const pipeInjectProps = <T,>(editor: PlateEditor, nodeProps: any): T => {
  editor.plugins.forEach((plugin) => {
    if (plugin.inject.props) {
      const props = getInjectProps(editor, { plugin, nodeProps });

      if (props) {
        nodeProps = {
          ...nodeProps,
          ...props,
        };
      }
    }
  });

  return { ...nodeProps, editor };
};
