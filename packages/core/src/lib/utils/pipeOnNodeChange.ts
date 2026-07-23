import type { EditorNodeChangeContext } from '@platejs/plite';

import type { BaseEditor } from '../editor/BaseEditor';
import type { AnyBasePlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';

type OnNodeChangeContext = Parameters<
  NonNullable<NonNullable<AnyBasePlugin['handlers']>['onNodeChange']>
>[0];

export const pipeOnNodeChange = (
  editor: BaseEditor,
  change: EditorNodeChangeContext<BaseEditor>
) => {
  return getPlateRuntime(editor).pluginCache.handlers.onNodeChange.some(
    (key) => {
      const plugin = editor.getPlugin({ key });

      // Skip if plugin not found or readOnly
      if (!plugin || editor.read.view.isReadOnly()) {
        return false;
      }

      const handler = plugin.handlers?.onNodeChange;
      if (!handler) {
        return false;
      }

      // The custom event handler may return a boolean to specify whether the event
      // shall be treated as being handled or not.
      const context: OnNodeChangeContext = {
        ...getEditorPlugin(editor, plugin),
        ...change,
        editor,
        plugin,
        root: change.root === 'main' ? undefined : change.root,
      };
      const shouldTreatEventAsHandled = handler(context);

      if (shouldTreatEventAsHandled != null) {
        return shouldTreatEventAsHandled;
      }

      return false;
    }
  );
};
