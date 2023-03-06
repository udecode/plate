import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { pluginInjectProps } from './pluginInjectProps';

/**
 * Inject plugin props, editor.
 */
export const pipeInjectProps = <V extends Value>(
  editor: PlateEditor<V>,
  nodeProps: any
) => {
  editor.plugins.forEach((plugin) => {
    if (plugin.inject.props) {
      const props = pluginInjectProps(editor, plugin, nodeProps);

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
